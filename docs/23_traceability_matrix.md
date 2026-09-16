# 23 Traceability Matrix

| Business Req | Feature | User Story | Technical ID | API Endpoint | Component | Output Artifact | Verification Test |
|---|---|---|---|---|---|---|---|
| **BR-001** | Multi-Spectral Ingestion | US-001 | TR-001, TR-002 | `POST /cyclone/ingest` | Ingestion | 4-Channel Tensor Cube | TEST-001 |
| **BR-002** | Center Localization | US-001 | TR-003 | `POST /cyclone/{id}/forecast` | AI Engine | Center Coordinates (Lat/Lon) | TEST-002 |
| **BR-003** | Intensity Estimation | US-001 | TR-004 | `POST /cyclone/{id}/forecast` | AI Engine | Wind Speed & Pressure | TEST-003 |
| **BR-004** | IMD Category Stage | US-001 | TR-004 | `POST /cyclone/{id}/forecast` | AI Engine | Category String (e.g. VSCS) | TEST-003 |
| **BR-005** | Trajectory & Cones | US-001 | TR-005, TR-008 | `POST /cyclone/{id}/forecast` | AI Engine | 6h–48h Track & Cone GeoJSON | TEST-006 |
| **BR-006** | Quadrant Wind Radii | US-004 | TR-007 | `POST /cyclone/{id}/forecast` | AI Engine | Directional Radii JSON | TEST-005 |
| **BR-007** | Rapid Intensification | US-001 | TR-006 | `POST /cyclone/{id}/forecast` | AI Engine | RI Probability Score (0–100%) | TEST-004 |
| **BR-008** | District Vulnerability | US-003 | TR-011 | `GET /cyclone/{id}/impact` | PostGIS | District Risk Rankings | TEST-008 |
| **BR-009** | Grad-CAM Explainability | US-002 | TR-009 | `GET /cyclone/{id}/xai` | AI Engine | Attention Overlay Image | TEST-007 |
| **BR-010** | GIS Command Center | US-001..05 | TR-012 | Web UI | Frontend | Interactive React UI | UI Inspection |
| **BR-011** | Official IMD Bulletin | US-005 | TR-013 | `POST /cyclone/{id}/bulletin` | AI Engine | Standardized Advisory PDF | TEST-008 |
| **BR-012** | Multi-Lingual Alerts | US-005 | TR-014 | `GET /cyclone/{id}/alerts` | API Gateway | Localized Text Alerts | UI Inspection |
| **BR-013** | Fast Inference API | US-001 | TR-014 | All Endpoints | AI Engine | Sub-4s Response | TEST-009 |
