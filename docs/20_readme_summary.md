# 20 README Summary

## CycloneAI: Tropical Cyclone Intelligence & Trajectory Forecasting Platform

### Problem
Tropical cyclones in the Bay of Bengal and Arabian Sea cause catastrophic coastal devastation. Current manual forecasting techniques (Dvorak) are subjective, while numerical weather models (NWP) suffer from multi-hour execution delays.

### Solution
An end-to-end AI platform that processes multi-spectral geostationary satellite imagery to automate circulation center localization, Dvorak intensity estimation, 48-hour spatio-temporal track forecasting with uncertainty cones, and 1-click official IMD advisory bulletin publishing.

---

### Quickstart

```bash
# 1. Start AI Engine & Database
docker-compose up -d postgres redis minio

# 2. Launch FastAPI Microservice
cd ai_engine
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 3. Launch React GIS Dashboard
cd ../frontend && npm install && npm run dev
```
