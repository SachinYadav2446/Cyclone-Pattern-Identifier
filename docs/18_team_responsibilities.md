# 18 Team Responsibilities (Solo Contributor)

As a single contributor (solo project), all workstreams are owned end-to-end and sequenced to maintain high velocity across the 12-week lifecycle:

---

## 1. Data Science & Deep Learning
- Multi-spectral satellite pipeline (`xarray`, `GDAL`, `rasterio`, `netCDF4`).
- PyTorch model architectures:
  - CenterNet anchor-free eye locator (`eye_detector.py`).
  - ConvNeXt-V2 Deep Dvorak classifier (`deep_dvorak.py`).
  - ConvLSTM spatio-temporal sequence forecaster (`track_convlstm.py`).
  - Rapid Intensification gradient booster (`ri_xgboost.py`).
- Grad-CAM visualizer engine (`gradcam_engine.py`).
- Quantitative benchmark evaluation against official NOAA IBTrACS best-track ground truth.

---

## 2. Full-Stack & Systems Engineering
- FastAPI microservice development and Celery background task worker coordination.
- PostgreSQL 16 + PostGIS 3.4 spatial database design and complex polygon intersection queries.
- React 19 interactive frontend integration with Mapbox GL JS and Deck.gl WebGL particle systems.
- ReportLab automated IMD Cyclone Advisory Bulletin generator and Docker multi-container deployment.

---

## 3. Shared & Cross-Cutting
- Complete 26-section project documentation and technical specifications.
- Architecture Decision Records (ADRs) and security governance controls.
- Academic presentation, project defense preparation, and technical report drafting.
