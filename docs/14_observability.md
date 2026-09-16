# 14 Observability

## Telemetry, Metrics & Health Probes

The platform implements comprehensive monitoring across data ingestion, model inference, database queries, and client serving.

---

## 1. Structured JSON Logs
All backend and AI workers emit machine-readable JSON logs:
- Satellite pass ID and timestamp.
- Ingestion and calibration latency.
- Detected eye center coordinates $(\text{Lat}, \text{Lon})$.
- Model inference latency per stage (CenterNet, ConvNeXt, ConvLSTM).
- Predicted wind speed, central pressure, and IMD category.
- REST API response codes and error traces.

---

## 2. Prometheus & Grafana Metrics
- **Ingestion Queue Depth:** Real-time Celery active and pending task counts.
- **GPU Resource Utilization:** VRAM allocation, temperature, and inference time per satellite pass.
- **Geospatial API Metrics:** Request rate, p95/p99 latency percentiles, and active WebSocket connections.
- **Model Drift Indicators:** Rolling 24-hour mean differences between real-time inference and subsequent best-track reanalysis.

---

## 3. Health Probes
- `/health`: Liveness probe verifying server availability.
- `/health/gpu`: Readiness probe checking CUDA GPU availability and PyTorch weight allocation in memory.
- `/health/db`: Connectivity check verifying PostgreSQL 16 + PostGIS connection pools.
