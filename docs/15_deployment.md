# 15 Deployment

## Deployment Architecture

```
Meteorologists / NDRF / Public
  -> HTTPS / Cloudflare CDN
  -> React 19 GIS Frontend (Vite)
  -> FastAPI REST API Gateway
  -> Celery Worker Pool (PyTorch GPU / CPU Tasks)
      |-- MinIO (Satellite Rasters & Heatmaps)
      |-- PostgreSQL 16 + PostGIS 3.4 (Geospatial Tracks & Cones)
```

---

## Production Hardware
- **GPU Instance:** 1x Cloud GPU instance (NVIDIA T4 / A10G) for deep learning inference.
- **CPU Fallback:** Multi-core CPU instance optimized with ONNX Runtime quantization (INT8/FP16) ensuring sub-1.5s CPU inference in emergency fallback scenarios.
- **Storage:** MinIO S3-compatible object storage for caching satellite rasters and generated Grad-CAM overlays.

---

## Containerization
Modular multi-container architecture orchestrated via `docker-compose.yml` or Kubernetes manifests:
- `frontend`: Nginx serving optimized React 19 static build.
- `api_gateway`: FastAPI REST & WebSocket server.
- `ai_worker`: Celery worker running PyTorch inference.
- `db`: PostgreSQL 16 with PostGIS 3.4 extensions.
- `broker`: Redis 7 in-memory cache and task queue.
- `storage`: MinIO object store.
