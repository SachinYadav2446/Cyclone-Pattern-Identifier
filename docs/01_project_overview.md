# 01 Project Overview

## CycloneAI · Project Overview

- **Track:** Advanced Data Science / Computer Vision, Spatio-Temporal Deep Learning & Geospatial AI
- **Domain:** Disaster Management / Satellite Meteorology / Operational Weather Forecasting
- **Duration:** 12 weeks
- **Team:** 1 (Solo Project)
- **Level:** Advanced

---

## Goal

Build an operational software platform that takes live multi-channel satellite data (INSAT-3D/3DR and GOES/Himawari thermal infrared and water vapor images) and environmental weather data to:

1. **Locate the Center:** Automatically detect the cyclone eye or center point, even in early-stage storms covered by clouds.
2. **Estimate Wind Speed & Category:** Calculate Maximum Sustained Wind Speed (in knots and km/h) and assign the official storm category (Depression to Super Cyclone) by automating the meteorological Dvorak method.
3. **Forecast Future Path & Landfall:** Predict where the cyclone will travel over the next 6, 12, 24, and 48 hours, drawing an expanding Cone of Uncertainty and calculating danger wind radii.
4. **Disaster Decision Support:** Provide district-level evacuation priority rankings, storm surge height estimates, explainable visual heatmaps, and automated one-click official weather advisory bulletins in PDF format.

---

## Inputs and Deliverables

### Foundational Grounding
- **Vernon Dvorak's Tropical Cyclone Intensity Analysis method:** Estimating storm strength from eye vs. cloud temperature contrast.
- **CenterNet:** Point-based keypoint detection for pinpointing the storm's center.
- **Convolutional LSTM (ConvLSTM) networks:** For sequence-based weather path prediction.
- **Grad-CAM attention heatmaps:** For model explainability.

### Datasets
- **MOSDAC (ISRO) & AWS Open Data:** Live and historical geostationary satellite scans (Thermal Infrared Band 13, Water Vapor Band 8, and Visible Band 2) updating every 15 minutes.
- **NOAA IBTrACS:** Historical gold-standard database of cyclone tracks, wind speeds, central pressures, and coordinates from 1990 to 2024.
- **ERA5 Weather Data:** Sea surface temperatures (SST) and atmospheric wind shear fields.

### Required Outputs
- Multi-spectral satellite ingestion and NetCDF/HDF5 preprocessing pipeline.
- Eye localization network (CenterNet keypoint detector).
- Deep Dvorak Multi-Channel Intensity Classifier (ConvNeXt-V2).
- Spatio-temporal Trajectory & Landfall Forecaster (ConvLSTM).
- Rapid Intensification (RI) warning model (XGBoost).
- FastAPI geospatial microservice, Celery/Redis asynchronous tensor processing queue, PostgreSQL + PostGIS database.
- React 19 + Mapbox GL JS / Deck.gl interactive GIS command center.
- Automated IMD-format PDF Advisory Bulletin Generator.

### Required Evaluation
- **Intensity Estimation:** Mean Absolute Error (MAE in knots) on wind speed; Quadratic Weighted Kappa on IMD category stages.
- **Eye Localization:** Distance error in kilometers between predicted eye center and IBTrACS ground truth.
- **Trajectory Prediction:** Track error in kilometers at 6h, 12h, 24h, 48h lead times compared against operational baselines.
- **Rapid Intensification (RI):** Precision, Recall, and F1-score on sudden intensification events (wind speed increasing by 30 knots or more in 24 hours).
- **Stack:** Python 3.11+, PyTorch, timm, xarray, netCDF4, rasterio, GDAL, Cartopy, FastAPI, Celery, Redis, React 19, Mapbox GL JS, Deck.gl, Tailwind CSS, PostgreSQL + PostGIS, Docker.

---

## Core Lifecycle

```
Live Multi-Spectral Satellite Rasters (.nc / .h5)
  └─▶ Calibration to Real Temperatures (Kelvin)
        └─▶ 4-Channel Stacking & Cropping (512x512)
              └─▶ Eye / Center Localization (CenterNet)
                    └─▶ Deep Dvorak Intensity Estimation & Category Classification (ConvNeXt-V2)
                          └─▶ Spatio-Temporal Sequence Modeling (ConvLSTM Trajectory Forecast)
                                └─▶ Rapid Intensification & Surge Risk Engine
                                      └─▶ Serving (FastAPI + PostGIS)
                                            └─▶ GIS Operational Command Center + Automated IMD Advisory Bulletin Generation
```

---

## MVP

INSAT-3D/GOES Thermal Infrared (Band 13) and Water Vapor (Band 8) channel ingestion, deep learning-based eye localization, ConvNeXt-based intensity estimation with wind speed error under 7.5 knots, 24-hour ConvLSTM track forecaster, interactive Mapbox GIS dashboard with cone-of-uncertainty rendering, Grad-CAM attention visualizer, and 1-click IMD Cyclone Advisory PDF bulletin export.

---

## Important Assumption

Exact channel calibrations, satellite sensor zenith angle corrections, and historical storm splits (stratified by basin: Bay of Bengal vs. Arabian Sea) must be documented from real MOSDAC/IBTrACS netCDF data rather than synthetic rasters.

---

## Product Boundary

CycloneAI is an operational decision-support and forecasting aid. It does not replace official meteorological duty officers, autonomously trigger public coastal evacuations, or command storm-mitigation infrastructure without human verification.
