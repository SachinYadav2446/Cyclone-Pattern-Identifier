# 11 Security

## Security Design

### Controls & Governance

- **Role-Based Access Control (RBAC):** Three distinct access tiers:
  - `GUEST / PUBLIC`: View active storm tracks, public advisories, and multi-lingual emergency bulletins.
  - `DISASTER_OFFICER (NDRF / SDMA)`: Access district vulnerability rankings, evacuation priority matrices, and infrastructure maps.
  - `DUTY_METEOROLOGIST (IMD / ADMIN)`: Execute manual center overrides, trigger new AI training runs, and officially sign/publish National Advisory Bulletins.
- **FastAPI / Pydantic Input Validation:** Strict typing on all coordinates, bounding boxes, and timestamp formats.
- **HTTPS & Secure WebSockets:** End-to-end TLS 1.3 encryption for real-time telemetry feeds.
- **API Rate Limiting:** Rate limiting on raster rendering endpoints to prevent denial-of-service during active severe cyclone events.
- **Data Integrity Checks:** SHA-256 checksum verification on all ingested satellite files to prevent corrupted raster processing.
- **Zero Code Execution Sandbox:** Satellite files (.nc / .h5) are opened strictly using read-only array parsers (`xarray`/`h5py`) without executing any embedded macros or scripts.
