# 19 GitHub Repository Structure

```
cyclone-ai-platform/
├── docs/                      # PRD, TRD, HLD, LLD, and meteorological validation docs
├── ai_engine/                 # Python PyTorch & Deep Learning Microservice
│   ├── ingestion/             # satellite_downloader.py, netcdf_processor.py, tensor_builder.py
│   ├── models/                # eye_detector.py, deep_dvorak.py, track_convlstm.py, ri_xgboost.py
│   ├── xai/                   # gradcam_engine.py
│   ├── reports/               # bulletin_pdf.py (ReportLab engine)
│   ├── evaluation/            # track_error.py, intensity_metrics.py, ri_benchmark.py
│   └── tests/                 # Pytest unit and integration test fixtures
├── backend/                   # Node/Express Gateway & API Proxy
│   ├── routes/cyclone.js
│   └── services/postgis.js
├── frontend/                  # React 19 Interactive GIS Client
│   └── src/
│       ├── components/        # MapViewer.jsx, WindParticles.jsx, TelemetryCard.jsx, DoctorMode.jsx
│       └── services/api.js
├── data/reference_tracks/     # Sample IBTrACS historical tracks and test fixtures
├── .github/workflows/         # CI/CD test automation
├── docker-compose.yml
├── README.md
├── CONTRIBUTING.md
└── LICENSE
```
