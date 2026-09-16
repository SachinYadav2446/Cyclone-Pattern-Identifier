# 05 TRD: Technical Requirements Document

## Architecture Overview

- **Satellite Processing & AI Engine (Python / FastAPI / PyTorch):** Ingests raw multidimensional NetCDF satellite cubes, performs tensor preprocessing, executes deep learning models for eye localization, intensity estimation, and trajectory forecasting, and generates Grad-CAM heatmaps.
- **Asynchronous Task Queue (Celery + Redis):** Manages raster downloads, band alignment, and batch forecasting pipelines without blocking web clients.
- **Geospatial & Storage Layer (PostgreSQL + PostGIS & MinIO):** Stores vector storm tracks, cone polygons, coastal administrative boundaries, and raster cache.
- **Frontend Web Dashboard (React 19 + Mapbox GL JS + Deck.gl):** Interactive GIS client providing smooth map rendering and live telemetry.

---

## Technical Requirements Specifications

| ID | Technical Requirement | Implementation |
| :--- | :--- | :--- |
| **TR-001** | Multi-Spectral Satellite Ingestion | `xarray`, `netCDF4` ingestion of Thermal IR (Band 13), Water Vapor (Band 8), and Visible channels. |
| **TR-002** | Geospatial Re-projection & Cropping | `rasterio`, `GDAL`, `pyproj` centering on storm coordinates ($0^\circ\text{N} - 30^\circ\text{N}$, $50^\circ\text{E} - 100^\circ\text{E}$). |
| **TR-003** | Sub-Pixel Eye / Center Localization | Anchor-free keypoint detection network (CenterNet) trained on best-track center fixes. |
| **TR-004** | Multi-Channel Intensity Classification | 4-channel input ConvNeXt-V2 with auxiliary regression heads for sustained winds (knots) and pressure (hPa). |
| **TR-005** | Spatio-Temporal Trajectory Forecaster | ConvLSTM consuming sequence of 4 past 6-hour satellite frames ($T_{-18\text{h}}$ to $T_0$) predicting $T_{+6\text{h}}$ to $T_{+48\text{h}}$ coordinates. |
| **TR-006** | Rapid Intensification (RI) Classifier | XGBoost model trained on satellite thermal features, sea surface temperatures, and vertical wind shear. |
| **TR-007** | Asymmetric Wind Radii Model | Multi-output regression estimating 34, 50, and 64-knot quadrant nautical miles. |
| **TR-008** | Dynamic Cone of Uncertainty Engine | Statistical dispersion model generating GeoJSON polygon cones based on historical forecast error distributions. |
| **TR-009** | Grad-CAM Explainability Engine | PyTorch layer gradient extractor generating spatial attention heatmaps. |
| **TR-010** | Asynchronous Raster Pipeline | Celery workers coordinated via Redis broker for background raster cube ingestion. |
| **TR-011** | Spatial Database & GIS Queries | PostgreSQL 16 with PostGIS 3.4 extension for point-in-polygon district vulnerability queries. |
| **TR-012** | Interactive Vector & Particle GIS | React 19, Mapbox GL JS, Deck.gl `ParticleLayer` for wind animation. |
| **TR-013** | Automated PDF Bulletin Generator | ReportLab Python engine rendering standardized IMD advisory templates. |
| **TR-014** | Fast REST API Service | FastAPI with Pydantic v2 validation and OpenAPI documentation. |
