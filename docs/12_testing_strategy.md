# 12 Testing Strategy

## Test Suites & Quality Gates

The system enforces automated verification across unit, integration, and end-to-end meteorological benchmarks before allowing deployment or pull request merges.

| Test ID | Category | Scenario | Expected Outcome |
|---|---|---|---|
| **TEST-001** | Unit | Multi-spectral NetCDF file ingestion | 200 OK + Correct 4-channel tensor array dimensions $[4, 512, 512]$. |
| **TEST-002** | Unit | CenterNet eye localization on Cyclone Fani | Center error under 25 km compared against IBTrACS ground truth. |
| **TEST-003** | Unit | ConvNeXt intensity estimation on known storm | Estimated wind speed within $\pm 6\text{ knots}$ of official best track. |
| **TEST-004** | Unit | Rapid Intensification classifier test | True positive alert triggered for $30+\text{ knot}$ jump in 24h. |
| **TEST-005** | Unit | Quadrant wind radii boundary check | 64-knot radius is strictly smaller than or equal to 50-knot and 34-knot radii. |
| **TEST-006** | Integration | ConvLSTM 24h trajectory forecast | Track error under 110 km on held-out test cyclones. |
| **TEST-007** | Integration | Grad-CAM attention localization | Attention weights peak inside the eyewall/spiral rainband area. |
| **TEST-008** | E2E | Automated PDF bulletin generation | Generates valid, downloadable, multi-page IMD-standard PDF in under 1.5s. |
| **TEST-009** | Performance | Full pipeline inference latency | Sub-4.0 second execution from raw tensor ingestion to complete forecast payload. |
