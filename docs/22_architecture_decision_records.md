# 22 Architecture Decision Records (ADRs)

- **ADR-001 — Multi-Spectral Channel Stacking Over Optical RGB:** Combine Thermal Infrared 1, Infrared 2, and Water Vapor channels to ensure 24/7 day-and-night operational forecasting without dependency on daylight.
- **ADR-002 — ConvLSTM Over Standard MLP/LSTM for Track:** Use Convolutional LSTM layers to retain spatial cloud distribution and rotational kinematics rather than flattening images into 1D vectors.
- **ADR-003 — PostGIS Over Non-Spatial Databases:** Use PostGIS to enable native, hardware-accelerated spatial queries (determining which coastal districts intersect the 34-knot wind radius).
- **ADR-004 — Celery/Redis Worker Queue for Rasters:** Offload heavy satellite NetCDF ingestion and tensor transformation to asynchronous background workers to maintain sub-100ms API response times.
- **ADR-005 — Grad-CAM for Physical Meteorological Verification:** Enforce visual explainability so meteorologists can confirm the AI is evaluating the central dense overcast and eyewall temperature contrast.
- **ADR-006 — Automated IMD Bulletin Generation:** Provide native PDF generation conforming to MoES/IMD standardized advisory templates to eliminate manual administrative overhead for duty officers.
