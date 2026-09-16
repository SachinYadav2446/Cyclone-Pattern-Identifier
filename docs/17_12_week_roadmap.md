# 17 12-Week Roadmap (Solo Developer Plan)

```mermaid
gantt
    title CycloneAI - 12-Week Solo Implementation Plan
    dateFormat YYYY-MM-DD
    section Month 1: Data & Eye Detection
    Satellite Ingestion & NetCDF Pipeline (AWS/MOSDAC) :2026-03-01, 7d
    IBTrACS Ground-Truth Alignment & Labeling          :2026-03-08, 7d
    CenterNet Keypoint Eye Localization Model         :2026-03-15, 7d
    PostgreSQL + PostGIS Geospatial Schema Setup       :2026-03-22, 7d
    section Month 2: Intensity & Track AI
    Deep Dvorak Intensity Classifier (ConvNeXt-V2)     :2026-03-29, 7d
    ConvLSTM Spatio-Temporal Trajectory Forecaster    :2026-04-05, 7d
    Rapid Intensification (RI) & Wind Radii Model     :2026-04-12, 7d
    Grad-CAM Explainability & Attention Heatmaps       :2026-04-19, 7d
    section Month 3: GIS Dashboard & Delivery
    React 19 + Mapbox GL JS GIS Command Center        :2026-04-26, 7d
    Deck.gl Wind Vectors & Dynamic Cones UI           :2026-05-03, 7d
    Automated IMD Advisory Bulletin PDF Engine        :2026-05-10, 7d
    Final Benchmarking, Validation & Presentation     :2026-05-17, 7d
```

---

## Phase Milestones
- **Weeks 1–4 (Data Engineering & Center Detection):** Download and calibrate INSAT-3D + NOAA IBTrACS data; build CenterNet eye keypoint detection model; configure PostGIS spatial tables.
- **Weeks 5–8 (Core AI & Modeling):** Train ConvNeXt-V2 Deep Dvorak intensity model; build ConvLSTM 48-hour trajectory sequence forecaster; train XGBoost RI model; integrate Grad-CAM explainability.
- **Weeks 9–12 (Full-Stack System & Dissemination):** Build React 19 + Mapbox GIS command center; implement Deck.gl wind particles; create ReportLab 1-click IMD bulletin export; complete benchmark validation and defense presentation.
