from ai_engine.services.timelapse_service import timelapse_service
from ai_engine.models.atmospheric_service import get_point_atmospheric_data, get_all_stations_atmospheric_data
"""
DeepCyclone Live Inference FastAPI Server
Serves real-time satellite telemetry and AI vortex detection results to the frontend.
"""

from fastapi import FastAPI, BackgroundTasks, Response
from contextlib import asynccontextmanager
import asyncio
import io
from typing import Dict, Any
from ai_engine.services.bulletin_generator import generate_cyclone_bulletin_pdf
from ai_engine.services.notification_service import notification_service
from ai_engine.services.notification_store import notification_store
from ai_engine.services.wnc_forecaster import wnc_forecaster
from fastapi.middleware.cors import CORSMiddleware
from ai_engine.models.live_vortex_analyzer import vortex_analyzer
import uvicorn

# ---------------------------------------------------------------------------
# Background Satellite Pipeline Scheduler — runs every 30 minutes
# ---------------------------------------------------------------------------

SCAN_INTERVAL_SECONDS = 1800  # 30 minutes

async def _run_pipeline_scan():
    """
    Executes the full satellite fetch → CenterNet inference → Dvorak intensity
    pipeline and pushes the result as a new notification event.
    """
    try:
        result = notification_service.get_notifications(mode="live")
        event = notification_store.push_scan_result(result)
        if event:
            status = event.get("status_code", "UNKNOWN")
            ts = event.get("timestamp_utc", "")
            print(f"[VortexAI Scanner] {ts} | Pipeline scan complete -> {status}")
    except Exception as exc:
        print(f"[VortexAI Scanner] Pipeline scan error: {exc}")

async def _scheduled_scanner():
    """Runs immediately on startup, then every 30 min."""
    # First scan immediately so the feed isn't empty
    await _run_pipeline_scan()
    while True:
        await asyncio.sleep(SCAN_INTERVAL_SECONDS)
        await _run_pipeline_scan()

@asynccontextmanager
async def lifespan(app: FastAPI):
    scanner_task = asyncio.create_task(_scheduled_scanner())
    yield
    scanner_task.cancel()
    try:
        await scanner_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="DeepCyclone Real-Time Meteorological API",
    description="Autonomous Geostationary Cyclone Intelligence API for INSAT-3D/3DR & NOAA Feeds",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for local React frontend on port 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "service": "DeepCyclone Live AI Telemetry Engine",
        "docs_url": "/docs",
        "health_check": "/api/v1/health",
        "telemetry_endpoint": "/api/v1/live/latest-analysis"
    }

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "DeepCyclone Live AI Telemetry Engine",
        "supported_satellites": ["INSAT-3D", "INSAT-3DR", "NOAA GOES-16"],
        "version": "2.0.0"
    }

from fastapi.responses import Response

@app.get("/api/v1/live/latest-analysis")
def get_latest_analysis(channel: str = "ir1", refresh: bool = False, mode: str = "storm"):
    """
    Returns live multi-spectral vortex detection, CenterNet eye localization (Feature 1),
    and Deep Dvorak ConvNeXt-V2 intensity estimation with quadrant wind radii (Feature 2)
    for the requested satellite channel (ir1, vis, wv, ctbt) in active storm surveillance
    or live geostationary downlink mode.
    """
    return vortex_analyzer.analyze_latest_pass(channel=channel, force_refresh=refresh, mode=mode)

@app.get("/api/v1/live/image-proxy/{channel}")
def get_channel_image_proxy(channel: str = "ir1", mode: str = "live"):
    """
    Proxies the latest live operational satellite image to prevent browser CORS/HTTPS blocks.
    Supports both 'live' (IMD geostationary downlink) and 'storm' (synchronized multi-spectral cyclone pass).
    """
    channel_key = channel.lower() if channel.lower() in vortex_analyzer.IMD_CHANNELS else "ir1"
    img_bytes = vortex_analyzer.get_cached_image_bytes(channel_key, mode=mode)
    if not img_bytes:
        if mode == "storm":
            img_bytes = vortex_analyzer._load_local_channel_bytes(channel_key)
        else:
            try:
                _, img_bytes, _, _ = vortex_analyzer.fetch_live_image(channel_key)
            except Exception:
                pass
            
    # Reliable local fallback if downlink is delayed or offline
    if not img_bytes:
        img_bytes = vortex_analyzer._load_local_channel_bytes(channel_key)

    if img_bytes:
        media_type = "image/png" if img_bytes[:8] == b"\x89PNG\r\n\x1a\n" else "image/jpeg"
        return Response(
            content=img_bytes, 
            media_type=media_type,
            headers={
                "Cache-Control": "public, max-age=60",
                "Access-Control-Allow-Origin": "*"
            }
        )
    return Response(content=b"", status_code=404)


@app.get("/api/v1/live/atmospheric-point")
def get_atmospheric_point(lat: float = 19.35, lon: float = 85.69):
    """
    Returns real-time atmospheric sounding (Temperature, SST, Relative Humidity, 
    Pressure, Wind vector, and 5-Day Forecast) for any clicked coordinate (Zoom Earth style).
    """
    return get_point_atmospheric_data(lat=lat, lon=lon)

@app.get("/api/v1/live/atmospheric-stations")
def get_atmospheric_stations():
    """
    Returns real-time atmospheric readings (Temperature, Humidity, Wind, SST)
    for all meteorological reference stations across South Asia (Zoom Earth style).
    """
    return get_all_stations_atmospheric_data()

@app.post("/api/v1/live/trigger-scan")
def trigger_live_scan(channel: str = "ir1", mode: str = "storm"):
    """Force an immediate satellite downlink pull and re-analyze."""
    result = vortex_analyzer.analyze_latest_pass(channel=channel, force_refresh=True, mode=mode)
    return {"message": "Live satellite scan triggered successfully", "result": result}

from pydantic import BaseModel
from typing import Optional
import base64
from ai_engine.models.eye_detector import eye_detector, BENCHMARK_STORMS
from ai_engine.models.intensity_estimator import (
    intensity_estimator,
    BENCHMARK_STORMS_INTENSITY,
    classify_imd_category,
    calculate_quadrant_radii
)
from ai_engine.models.cyclone_neural_net import cyclone_neural_net
from ai_engine.models.trajectory_forecaster import trajectory_forecaster
from PIL import Image

class LocalizeEyeRequest(BaseModel):
    storm_id: Optional[str] = "fani"
    image_base64: Optional[str] = None
    filename: Optional[str] = None

@app.post("/api/v1/models/localize-eye")
def localize_cyclone_eye(payload: LocalizeEyeRequest):
    """
    Sub-pixel CenterNet & Deep Multi-Task ResNet-18 eye localization endpoint.
    Accepts preset storm ID (fani, amphan, biparjoy, remal, michael) or custom base64 image.
    """
    if payload.image_base64:
        try:
            raw_b64 = payload.image_base64
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",")[1]
            img_bytes = base64.b64decode(raw_b64)
            result = eye_detector.localize_image_array(img_bytes, filename=payload.filename)

            # Only invoke comparative regression net if meteorological cyclone is genuinely active
            if result.get("has_cyclone") is not False and cyclone_neural_net.is_loaded:
                try:
                    pil_img = Image.open(io.BytesIO(img_bytes))
                    nn_pred = cyclone_neural_net.predict(pil_img)
                    if nn_pred:
                        result["neural_net_comparison"] = {
                            "model": "DeepCyclone ResNet-18 (4,200 HURSAT Benchmark)",
                            "predicted_wind_knots": nn_pred.get("wind_knots"),
                            "predicted_pressure_hpa": nn_pred.get("pressure_hpa"),
                            "predicted_category": nn_pred.get("category"),
                            "confidence": nn_pred.get("category_confidence")
                        }
                except Exception as ex:
                    print(f"Cyclone neural net inference error: {ex}")

            return result
        except Exception as e:
            return {"status": "ERROR", "message": f"Failed to parse image: {str(e)}"}
    
    if payload.filename:
        matched = eye_detector._match_showcase_storm(payload.filename)
        if matched:
            if matched.get("is_calm"):
                return {"status": "QUIESCENT_OCEAN", "has_cyclone": False, "message": "Clear-sky marine pass."}
            return eye_detector.localize_benchmark_storm(matched.get("catalog_id", payload.storm_id or "fani"))
    
    return eye_detector.localize_benchmark_storm(payload.storm_id or "fani")

@app.get("/api/v1/models/localize-eye/{storm_id}")
def get_benchmark_eye_fix(storm_id: str):
    """Returns CenterNet keypoint localization for benchmark cyclones."""
    return eye_detector.localize_benchmark_storm(storm_id)

@app.get("/api/v1/models/benchmark-storms")
def get_benchmark_storms():
    """Lists available pre-calibrated benchmark cyclones for testing."""
    return {"storms": list(BENCHMARK_STORMS.keys())}

class EstimateIntensityRequest(BaseModel):
    storm_id: Optional[str] = "fani"
    image_base64: Optional[str] = None
    eye_x_pct: Optional[float] = None
    eye_y_pct: Optional[float] = None
    has_cyclone: Optional[bool] = None
    filename: Optional[str] = None

@app.post("/api/v1/models/estimate-intensity")
def estimate_cyclone_intensity(payload: EstimateIntensityRequest):
    """
    Deep Dvorak & DeepCyclone ResNet-18 Intensity Estimation endpoint.
    Estimates MSW (knots & km/h), central minimum pressure, IMD category,
    Dvorak T-number, and quadrant wind radii.
    """
    if payload.has_cyclone is False:
        return intensity_estimator.estimate_image_array(b"", has_cyclone=False)

    if payload.image_base64:
        try:
            raw_b64 = payload.image_base64
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",")[1]
            img_bytes = base64.b64decode(raw_b64)
            eye_x = payload.eye_x_pct
            eye_y = payload.eye_y_pct
            if eye_x is None or eye_y is None:
                eye_fix = eye_detector.localize_image_array(img_bytes)
                if eye_fix.get("has_cyclone") is False:
                    return intensity_estimator.estimate_image_array(img_bytes, has_cyclone=False)
                if eye_fix.get("status") == "SUCCESS":
                    eye_x = eye_fix["predicted_eye"]["pixel_x_percent"]
                    eye_y = eye_fix["predicted_eye"]["pixel_y_percent"]
            
            res = intensity_estimator.estimate_image_array(img_bytes, eye_x_pct=eye_x, eye_y_pct=eye_y, filename=payload.filename)

            if res.get("has_cyclone") is not False and cyclone_neural_net.is_loaded:
                try:
                    pil_img = Image.open(io.BytesIO(img_bytes))
                    nn_pred = cyclone_neural_net.predict(pil_img)
                    if nn_pred:
                        res["neural_prediction"] = nn_pred
                except Exception as ex:
                    print(f"Cyclone neural net intensity error: {ex}")

            return res
        except Exception as e:
            return {"status": "ERROR", "message": f"Failed to estimate intensity: {str(e)}"}
    
    if payload.filename:
        matched = eye_detector._match_showcase_storm(payload.filename)
        if matched:
            if matched.get("is_calm"):
                return intensity_estimator.estimate_image_array(b"", has_cyclone=False)
            return intensity_estimator.estimate_benchmark_storm(matched.get("catalog_id", payload.storm_id or "fani"))

    return intensity_estimator.estimate_benchmark_storm(payload.storm_id or "fani")

@app.get("/api/v1/models/estimate-intensity/{storm_id}")
def get_benchmark_intensity(storm_id: str):
    """Returns verified Deep Dvorak ConvNeXt-V2 intensity fix for benchmark cyclones."""
    return intensity_estimator.estimate_benchmark_storm(storm_id)

class ForecastTrajectoryRequest(BaseModel):
    storm_id: Optional[str] = "fani"
    current_lat: Optional[float] = None
    current_lon: Optional[float] = None
    msw_knots: Optional[float] = None
    central_pressure_hpa: Optional[float] = None
    core_delta_t_k: Optional[float] = 40.0
    has_cyclone: Optional[bool] = True
    pixel_x_pct: Optional[float] = None
    pixel_y_pct: Optional[float] = None
    filename: Optional[str] = None

@app.get("/api/v1/models/forecast-trajectory/{storm_id}")
def get_benchmark_trajectory(storm_id: str):
    """
    Returns ConvLSTM 48-hour trajectory waypoints, cone of uncertainty polygons,
    stochastic ensemble tracks, and coastal landfall projection for benchmark storms.
    """
    if storm_id.lower() in ("none", "calm", "clear", "quiescent"):
        return trajectory_forecaster.get_quiescent_track()
    return trajectory_forecaster.forecast_benchmark_storm(storm_id)

@app.post("/api/v1/models/forecast-trajectory")
def forecast_cyclone_trajectory(payload: ForecastTrajectoryRequest):
    """
    ConvLSTM Spatio-Temporal Trajectory Forecasting endpoint.
    Computes 48-hour forward track waypoints, expanding cone of uncertainty,
    stochastic ensemble tracks, and coastal landfall intersection from given coordinates and intensity.
    """
    if payload.has_cyclone is False:
        return trajectory_forecaster.get_quiescent_track()
    
    if (payload.current_lat is not None and payload.current_lon is not None) or payload.pixel_x_pct is not None or payload.filename is not None:
        lat = payload.current_lat if payload.current_lat is not None else 19.72
        lon = payload.current_lon if payload.current_lon is not None else 86.42
        wind = payload.msw_knots or 65.0
        pressure = payload.central_pressure_hpa or 980.0
        delta_t = payload.core_delta_t_k if payload.core_delta_t_k is not None else 40.0
        return trajectory_forecaster.forecast_dynamic_track(
            current_lat=lat,
            current_lon=lon,
            current_wind_kts=wind,
            current_pressure_hpa=pressure,
            core_delta_t_k=delta_t,
            pixel_x_pct=payload.pixel_x_pct,
            pixel_y_pct=payload.pixel_y_pct,
            filename=payload.filename
        )
    return trajectory_forecaster.forecast_benchmark_storm(payload.storm_id or "fani")


import os



# ---------------------------------------------------------------------------
# WeatherNext Cyclones (WN-C Nature 2026) Operational Ensemble Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/v1/forecast/wnc-ensemble/{storm_id}")
def get_wnc_benchmark_ensemble(storm_id: str):
    """
    Returns 50-member Functional Generative Network (FGN) ensemble forecast,
    probabilistic cones of uncertainty (68% and 95%), 4-quadrant asymmetric wind radii,
    and peer-reviewed Nature 2026 verification scorecard for benchmark storms.
    """
    return wnc_forecaster.forecast_benchmark_storm(storm_id)

class WNCForecastRequest(BaseModel):
    current_lat: float
    current_lon: float
    msw_knots: Optional[float] = 65.0
    central_pressure_hpa: Optional[float] = 980.0
    bearing_deg: Optional[float] = 25.0
    speed_kmh: Optional[float] = 16.0
    basin: Optional[str] = "Bay of Bengal"

@app.post("/api/v1/forecast/wnc-ensemble")
def forecast_wnc_dynamic_ensemble(payload: WNCForecastRequest):
    """
    Dynamic 50-member WN-C ensemble forecast from live coordinate fixes.
    """
    return wnc_forecaster.forecast_dynamic_coordinates(
        current_lat=payload.current_lat,
        current_lon=payload.current_lon,
        msw_kts=payload.msw_knots or 65.0,
        central_pressure_hpa=payload.central_pressure_hpa or 980.0,
        bearing_deg=payload.bearing_deg or 25.0,
        speed_kmh=payload.speed_kmh or 16.0,
        basin=payload.basin or "Bay of Bengal"
    )

@app.post("/api/v1/models/export-bulletin-pdf")
def export_bulletin_pdf(payload: Dict[str, Any]):
    buf = io.BytesIO()
    generate_cyclone_bulletin_pdf(payload, buf)
    pdf_bytes = buf.getvalue()
    storm = payload.get("storm_name", "CYCLONE").replace(" ", "_").upper()
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=VortexAI_Bulletin_{storm}.pdf"
        }
    )

class SubscribeEmailRequest(BaseModel):
    email: str
    frequency: Optional[str] = "daily"
    realtime_critical: Optional[bool] = True
    daily_digest: Optional[bool] = True
    pass_updates: Optional[bool] = False
    min_category: Optional[str] = "SCS"

class SendReportEmailRequest(BaseModel):
    recipient_email: str
    storm_data: Optional[Dict[str, Any]] = None

@app.get("/api/v1/notifications")
def get_basin_notifications(mode: Optional[str] = "live"):
    """Returns active real-time and synoptic notifications with unread counts."""
    return notification_service.get_notifications(mode=mode)

@app.post("/api/v1/notifications/{notif_id}/read")
def mark_notification_read(notif_id: str):
    """Marks an alert notification as read."""
    return notification_service.mark_as_read(notif_id)

@app.post("/api/v1/notifications/mark-all-read")
def mark_all_notifications_read():
    """Marks all alert notifications as read."""
    return notification_service.mark_all_read()

@app.get("/api/v1/notifications/feed")
def get_notification_feed(limit: int = 20):
    """
    Returns the history of notification events generated by the
    scheduled satellite pipeline scans (newest first).
    This is the real-time trigger-based feed — every entry was produced
    by an actual CenterNet + Dvorak inference run.
    """
    return notification_store.get_feed(limit=limit)

@app.post("/api/v1/notifications/feed/{event_id}/read")
def mark_feed_event_read(event_id: str):
    """Marks a feed event as read and decrements unread count."""
    notification_store.mark_read(event_id)
    return {"status": "SUCCESS", "event_id": event_id}

@app.post("/api/v1/notifications/feed/mark-all-read")
def mark_all_feed_read():
    """Marks all feed events as read."""
    notification_store.mark_all_read()
    return {"status": "SUCCESS"}

class PushWorkbenchNotificationRequest(BaseModel):
    storm_name: Optional[str] = "TROPICAL VORTEX"
    category: Optional[str] = "Cyclonic Storm"
    msw_knots: Optional[float] = 65.0
    pressure_hpa: Optional[float] = 980.0
    lat: Optional[float] = 18.25
    lon: Optional[float] = 85.80
    confidence: Optional[float] = 0.95
    channel: Optional[str] = "TIR-1 (10.8 µm)"
    has_cyclone: Optional[bool] = True

@app.post("/api/v1/notifications/push-detection")
def push_workbench_detection(payload: PushWorkbenchNotificationRequest):
    event = notification_store.push_workbench_detection(payload.dict())
    return {"status": "SUCCESS", "event": event, "unread_count": notification_store.unread_count}

@app.post("/api/v1/notifications/trigger-scan")
def trigger_notification_scan(mode: Optional[str] = "live"):
    """
    Manually triggers an immediate geostationary downlink fetch + AI inference
    and broadcasts a new event to the notification feed.
    """
    result = notification_service.get_notifications(mode=mode)
    event = notification_store.push_scan_result(result)
    return {
        "status": "SUCCESS",
        "event": event,
        "unread_count": notification_store.unread_count
    }

@app.get("/api/v1/notifications/unread-count")
def get_unread_count():
    """Lightweight endpoint polled by frontend bell badge every 60s."""
    return {
        "status": "SUCCESS",
        "unread_count": notification_store.unread_count,
        "feed_count": len(notification_store._events),
    }

@app.post("/api/v1/notifications/subscribe")
def subscribe_to_alerts(payload: SubscribeEmailRequest):
    """Subscribes an email to real-time or daily meteorological advisories."""
    return notification_service.subscribe_email(payload.dict())

@app.post("/api/v1/notifications/send-report-email")
def send_report_email(payload: SendReportEmailRequest):
    """Dispatches official PDF Advisory Bulletin and HTML briefing to target email."""
    return notification_service.send_report_email(
        recipient_email=payload.recipient_email,
        storm_data=payload.storm_data
    )



# ---------------------------------------------------------------------------
# Satellite Timelapse & 4D Geostationary Loop Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/v1/satellite/timelapse/sequences")
def get_timelapse_sequences():
    """Returns catalog of available 4D satellite timelapse loops."""
    return {"sequences": timelapse_service.get_available_sequences()}

@app.get("/api/v1/satellite/timelapse/{sequence_id}")
def get_timelapse_sequence_details(sequence_id: str, band: Optional[str] = "ir1", mode: Optional[str] = None, hours: Optional[int] = 48):
    """
    Returns timestamped multi-frame satellite loop with synchronized CenterNet
    eye coordinates, Deep Dvorak intensity metrics, and cloud-top thermometry.
    """
    return timelapse_service.get_sequence_details(sequence_id=sequence_id, band=band or "ir1", mode=mode, hours=hours or 48)



@app.get("/api/v1/satellite/timelapse-frame/{sequence_id}/{frame_idx}")
def get_timelapse_frame_image(sequence_id: str, frame_idx: int, band: Optional[str] = "ir1", palette: Optional[str] = "enhanced", mode: Optional[str] = None, hours: Optional[int] = 48):
    """
    Serves actual distinct satellite pass image bytes for the requested frame index,
    supporting Dvorak BD-curve false color enhancement or clean calibrated infrared.
    """
    img_bytes, media_type = timelapse_service.get_frame_image_bytes(
        sequence_id=sequence_id,
        frame_idx=frame_idx,
        band=band or "ir1",
        palette=palette or "enhanced",
        mode=mode,
        hours=hours or 48
    )
    return Response(
        content=img_bytes,
        media_type=media_type,
        headers={"Cache-Control": "public, max-age=3600"}
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("ai_engine.server:app", host="0.0.0.0", port=port, reload=False)
