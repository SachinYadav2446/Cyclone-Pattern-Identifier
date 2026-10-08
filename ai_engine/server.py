"""
DeepCyclone Live Inference FastAPI Server
Serves real-time satellite telemetry and AI vortex detection results to the frontend.
"""

from fastapi import FastAPI, BackgroundTasks
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
def get_latest_analysis(channel: str = "ir1", refresh: bool = False):
    """
    Returns live multi-spectral vortex detection, CenterNet eye localization (Feature 1),
    and Deep Dvorak ConvNeXt-V2 intensity estimation with quadrant wind radii (Feature 2)
    for the requested satellite channel (ir1, vis, wv, ctbt).
    """
    return vortex_analyzer.analyze_latest_pass(channel=channel, force_refresh=refresh)

@app.get("/api/v1/live/image-proxy/{channel}")
def get_channel_image_proxy(channel: str = "ir1"):
    """
    Proxies the latest live operational satellite image to prevent browser CORS/HTTPS blocks.
    """
    channel_key = channel.lower() if channel.lower() in vortex_analyzer.IMD_CHANNELS else "ir1"
    img_bytes = vortex_analyzer.get_cached_image_bytes(channel_key)
    if not img_bytes:
        try:
            _, img_bytes, _, _ = vortex_analyzer.fetch_live_image(channel_key)
        except Exception:
            # Fallback to local image if live uplink unreachable
            pass
    if img_bytes:
        return Response(content=img_bytes, media_type="image/jpeg")
    return {"status": "ERROR", "message": f"Channel image {channel_key} currently unavailable"}

@app.post("/api/v1/live/trigger-scan")
def trigger_live_scan(channel: str = "ir1"):
    """Force an immediate satellite downlink pull and re-analyze."""
    result = vortex_analyzer.analyze_latest_pass(channel=channel, force_refresh=True)
    return {"message": "Live satellite scan triggered successfully", "result": result}

from pydantic import BaseModel
from typing import Optional
import base64
from ai_engine.models.eye_detector import eye_detector, BENCHMARK_STORMS
from ai_engine.models.intensity_estimator import intensity_estimator, BENCHMARK_STORMS_INTENSITY
from ai_engine.models.trajectory_forecaster import trajectory_forecaster

class LocalizeEyeRequest(BaseModel):
    storm_id: Optional[str] = "fani"
    image_base64: Optional[str] = None

@app.post("/api/v1/models/localize-eye")
def localize_cyclone_eye(payload: LocalizeEyeRequest):
    """
    Sub-pixel CenterNet eye localization endpoint.
    Accepts preset storm ID (fani, amphan, biparjoy, remal, michael) or custom base64 image.
    """
    if payload.image_base64:
        try:
            raw_b64 = payload.image_base64
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",")[1]
            img_bytes = base64.b64decode(raw_b64)
            return eye_detector.localize_image_array(img_bytes)
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

@app.post("/api/v1/models/estimate-intensity")
def estimate_cyclone_intensity(payload: EstimateIntensityRequest):
    """
    Deep Dvorak ConvNeXt-V2 Intensity Estimation endpoint.
    Estimates MSW (knots & km/h), central minimum pressure, IMD category,
    Dvorak T-number, and quadrant wind radii.
    """
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
            return intensity_estimator.estimate_image_array(img_bytes, eye_x_pct=eye_x, eye_y_pct=eye_y)
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
    has_cyclone: Optional[bool] = True

@app.get("/api/v1/models/forecast-trajectory/{storm_id}")
def get_benchmark_trajectory(storm_id: str):
    """
    Returns ConvLSTM 48-hour trajectory waypoints, cone of uncertainty polygons,
    and coastal landfall projection for benchmark storms.
    """
    if storm_id.lower() in ("none", "calm", "clear", "quiescent"):
        return trajectory_forecaster.get_quiescent_track()
    return trajectory_forecaster.forecast_benchmark_storm(storm_id)

@app.post("/api/v1/models/forecast-trajectory")
def forecast_cyclone_trajectory(payload: ForecastTrajectoryRequest):
    """
    ConvLSTM Spatio-Temporal Trajectory Forecasting endpoint.
    Computes 48-hour forward track waypoints, expanding cone of uncertainty,
    and coastal landfall intersection from given coordinates and intensity.
    """
    if payload.has_cyclone is False:
        return trajectory_forecaster.get_quiescent_track()
    
    if payload.current_lat is not None and payload.current_lon is not None:
        wind = payload.msw_knots or 65.0
        pressure = payload.central_pressure_hpa or 980.0
        return trajectory_forecaster.forecast_dynamic_track(
            current_lat=payload.current_lat,
            current_lon=payload.current_lon,
            current_wind_kts=wind,
            current_pressure_hpa=pressure
        )
    return trajectory_forecaster.forecast_benchmark_storm(payload.storm_id or "fani")


import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("ai_engine.server:app", host="0.0.0.0", port=port, reload=False)
