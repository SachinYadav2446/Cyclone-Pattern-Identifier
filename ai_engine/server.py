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

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "DeepCyclone Live AI Telemetry Engine",
        "supported_satellites": ["INSAT-3D", "INSAT-3DR", "NOAA GOES-16"],
        "version": "2.0.0"
    }

@app.get("/api/v1/live/latest-analysis")
def get_latest_analysis(refresh: bool = False):
    """
    Returns live multi-spectral vortex detection, latitude/longitude center fixes,
    and convective cloud telemetry for the North Indian Ocean basin.
    """
    return vortex_analyzer.analyze_latest_pass(force_refresh=refresh)

@app.post("/api/v1/live/trigger-scan")
def trigger_live_scan(background_tasks: BackgroundTasks):
    """Force an immediate satellite downlink pull and re-analyze."""
    result = vortex_analyzer.analyze_latest_pass(force_refresh=True)
    return {"message": "Live satellite scan triggered successfully", "result": result}

if __name__ == "__main__":
    uvicorn.run("ai_engine.server:app", host="127.0.0.1", port=8000, reload=False)
