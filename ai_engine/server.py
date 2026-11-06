from ai_engine.models.atmospheric_service import get_point_atmospheric_data, get_all_stations_atmospheric_data
"""
DeepCyclone Live Inference FastAPI Server
Serves real-time satellite telemetry and AI vortex detection results to the frontend.
"""

from fastapi import FastAPI, BackgroundTasks, Response
import io
from typing import Dict, Any
from ai_engine.services.bulletin_generator import generate_cyclone_bulletin_pdf
from ai_engine.services.notification_service import notification_service
from fastapi.middleware.cors import CORSMiddleware
from ai_engine.models.live_vortex_analyzer import vortex_analyzer
import uvicorn

app = FastAPI(
    title="DeepCyclone Real-Time Meteorological API",
    description="Autonomous Geostationary Cyclone Intelligence API for INSAT-3D/3DR & NOAA Feeds",
    version="2.0.0"
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
            result = eye_detector.localize_image_array(img_bytes)

            if cyclone_neural_net.is_loaded:
                try:
                    pil_img = Image.open(io.BytesIO(img_bytes))
                    nn_pred = cyclone_neural_net.predict(pil_img)
                    if nn_pred:
                        result["neural_net_prediction"] = nn_pred
                        if result.get("status") == "SUCCESS" and result.get("predicted_eye"):
                            classic_x = result["predicted_eye"]["pixel_x_percent"]
                            classic_y = result["predicted_eye"]["pixel_y_percent"]
                            dist = ((classic_x - nn_pred["eye_x_percent"])**2 + (classic_y - nn_pred["eye_y_percent"])**2)**0.5
                            if dist > 7.0:
                                result["predicted_eye"]["pixel_x_percent"] = nn_pred["eye_x_percent"]
                                result["predicted_eye"]["pixel_y_percent"] = nn_pred["eye_y_percent"]
                                result["predicted_eye"]["sub_dx"] = 0.0
                                result["predicted_eye"]["sub_dy"] = 0.0
                                result["predicted_eye"]["detection_mode"] = "DeepCyclone ResNet-18 Multi-Task Neural Net (HURSAT-Trained)"
                                result["predicted_eye"]["neural_assisted"] = True
                        elif not result.get("has_cyclone") and nn_pred.get("wind_knots", 0) >= 30.0:
                            result["status"] = "SUCCESS"
                            result["has_cyclone"] = True
                            result["storm_name"] = "DETECTED TROPICAL CYCLONE"
                            result["category"] = nn_pred["category"]
                            result["predicted_eye"] = {
                                "pixel_x_percent": nn_pred["eye_x_percent"],
                                "pixel_y_percent": nn_pred["eye_y_percent"],
                                "sub_dx": 0.0,
                                "sub_dy": 0.0,
                                "diameter_km": 42.0,
                                "eyewall_thickness_km": 26.0,
                                "symmetry_score": 0.82,
                                "detection_mode": "DeepCyclone ResNet-18 Multi-Task Neural Net (HURSAT-Trained)",
                                "neural_assisted": True
                            }
                except Exception as ex:
                    print(f"Cyclone neural net inference error: {ex}")

            return result
        except Exception as e:
            return {"status": "ERROR", "message": f"Failed to parse image: {str(e)}"}
    
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
            
            res = intensity_estimator.estimate_image_array(img_bytes, eye_x_pct=eye_x, eye_y_pct=eye_y)

            if cyclone_neural_net.is_loaded:
                try:
                    pil_img = Image.open(io.BytesIO(img_bytes))
                    nn_pred = cyclone_neural_net.predict(pil_img)
                    if nn_pred:
                        res["neural_prediction"] = nn_pred
                        res["model_architecture"] = "DeepCyclone ResNet-18 Multi-Task (HURSAT-Trained)"
                        res["intensity_metrics"]["msw_knots"] = nn_pred["wind_knots"]
                        res["intensity_metrics"]["msw_kmh"] = round(nn_pred["wind_knots"] * 1.852, 1)
                        res["intensity_metrics"]["central_pressure_hpa"] = nn_pred["pressure_hpa"]
                        res["intensity_metrics"]["pressure_deficit_hpa"] = round(1010.0 - nn_pred["pressure_hpa"], 1)

                        cat_info = classify_imd_category(nn_pred["wind_knots"])
                        res["intensity_metrics"]["imd_category_code"] = cat_info["code"]
                        res["intensity_metrics"]["imd_category_name"] = cat_info["name"]
                        res["intensity_metrics"]["imd_severity"] = cat_info["severity"]
                        res["intensity_metrics"]["badge_color"] = cat_info["color"]
                        res["intensity_metrics"]["neural_confidence"] = nn_pred["category_confidence"]

                        res["quadrant_wind_radii"] = calculate_quadrant_radii(nn_pred["wind_knots"])
                except Exception as ex:
                    print(f"Cyclone neural net intensity error: {ex}")

            return res
        except Exception as e:
            return {"status": "ERROR", "message": f"Failed to estimate intensity: {str(e)}"}
    
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
    
    if payload.current_lat is not None and payload.current_lon is not None:
        wind = payload.msw_knots or 65.0
        pressure = payload.central_pressure_hpa or 980.0
        delta_t = payload.core_delta_t_k if payload.core_delta_t_k is not None else 40.0
        return trajectory_forecaster.forecast_dynamic_track(
            current_lat=payload.current_lat,
            current_lon=payload.current_lon,
            current_wind_kts=wind,
            current_pressure_hpa=pressure,
            core_delta_t_k=delta_t,
            pixel_x_pct=payload.pixel_x_pct,
            pixel_y_pct=payload.pixel_y_pct
        )
    return trajectory_forecaster.forecast_benchmark_storm(payload.storm_id or "fani")


import os


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
def get_basin_notifications():
    """Returns active real-time and synoptic notifications with unread counts."""
    return notification_service.get_notifications()

@app.post("/api/v1/notifications/{notif_id}/read")
def mark_notification_read(notif_id: str):
    """Marks an alert notification as read."""
    return notification_service.mark_as_read(notif_id)

@app.post("/api/v1/notifications/mark-all-read")
def mark_all_notifications_read():
    """Marks all alert notifications as read."""
    return notification_service.mark_all_read()

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


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("ai_engine.server:app", host="0.0.0.0", port=port, reload=False)
