# 02 BRD: Business Requirements Document

## Problem

Tropical cyclones in the North Indian Ocean basin (Bay of Bengal and Arabian Sea) threaten over 7,500 km of Indian coastline, home to 350+ million vulnerable citizens. Current operational challenges include:

1. **Subjective Intensity Estimation:** The classical Dvorak Technique relies heavily on manual human interpretation of cloud patterns, leading to operational variability between duty meteorologists.
2. **Pre-Cyclone Tracking Ambiguity:** Early-stage depressions and sheared systems have ragged cloud tops without visible eyes, making low-level center localization difficult for standard numerical models.
3. **Rapid Intensification (RI) Blindspots:** Rapid escalation (wind speeds jumping by 30 knots or more in 24 hours) over warming oceanic pockets requires fast, multi-spectral thermal and environmental feature integration.
4. **Communication Friction to First Responders:** Converting complex weather model outputs into actionable district-level risk indices (storm surge, wind radii, evacuation urgency) takes hours of manual bulletin preparation.

---

## Personas

| Persona | Goal | Pain Point Solved |
| :--- | :--- | :--- |
| **Operational Meteorologist (IMD / MoES)** | Rapidly estimate storm intensity and track cones with physical interpretability. | Manual Dvorak analysis is slow and subjective; numerical weather updates take 6+ hours to compute. |
| **Disaster Management Officer (NDRF / SDMA)** | Identify exact landfall windows, storm surge heights, and evacuation priorities. | Raw wind charts do not translate directly into district-level population risk and shelter maps. |
| **Port / Maritime Authority** | Enforce fishing bans and route commercial shipping around gale-force danger radii. | Lack of real-time quadrant wind radii forecasts causes maritime safety risks. |
| **Public Safety / Relief Coordinator** | Disseminate simplified, multi-lingual warnings and emergency protocols to citizens. | Technical meteorological bulletins contain heavy jargon that confuses local communities. |

---

## Objectives

1. Automatically ingest and pre-process satellite image cubes within 90 seconds of data availability.
2. Localize cyclone circulation centers with an average distance error under 30 kilometers across all storm stages.
3. Classify cyclone intensity into official IMD categories with a wind speed error under 7.5 knots.
4. Predict 6h to 48h storm tracks with an average error under 110 kilometers at 24-hour lead time.
5. Predict Rapid Intensification (RI) probability with an F1-score of 0.75 or higher.
6. Render an interactive GIS command dashboard featuring multi-spectral satellite playback, wind particles, and dynamic cones of uncertainty.
7. Provide Grad-CAM spatial heatmaps explaining model focus on the eyewall and spiral rainbands.
8. Automatically generate downloadable, multi-lingual, official IMD-format advisory bulletins in PDF.

---

## Requirements Matrix

| ID | Requirement | Priority | Acceptance Criteria |
| :--- | :--- | :---: | :--- |
| **BR-001** | Multi-Spectral Ingestion | Must | Ingests satellite NetCDF/HDF5 files (Thermal IR, Water Vapor, Visible) and re-projects to a uniform grid. |
| **BR-002** | Center Localization | Must | Computes latitude and longitude of circulation center with distance error under 30 km. |
| **BR-003** | Intensity Estimation | Must | Outputs sustained wind speed in knots and central pressure in hPa with wind error under 7.5 knots against IBTrACS. |
| **BR-004** | IMD Category Classification | Must | Assigns official IMD stage (Depression to Super Cyclone) with high classification agreement. |
| **BR-005** | Spatio-Temporal Track Forecast | Must | Produces 6h, 12h, 24h, 48h track predictions with dynamic cone-of-uncertainty polygons. |
| **BR-006** | Quadrant Wind Radii | Must | Computes directional wind extent (34, 50, and 64 knots in NE, NW, SE, SW) in nautical miles. |
| **BR-007** | Rapid Intensification (RI) Alert | Must | Probability score (0 to 100 percent) for sudden strengthening in the next 24 hours. |
| **BR-008** | Storm Surge & Coastal Risk | Should | Estimates peak surge height in meters and inundation hazard per coastal district. |
| **BR-009** | Grad-CAM Explainability | Must | Renders spatial attention overlay showing thermal gradients driving intensity scores. |
| **BR-010** | Interactive GIS Dashboard | Must | React + Mapbox GL JS map with satellite scrubbers, vector winds, and telemetry panels. |
| **BR-011** | Automated IMD Bulletin Export | Must | 1-click PDF generation matching official IMD National Cyclone Warning Centre formats. |
| **BR-012** | Multi-Lingual Public Alerts | Should | Generates emergency broadcast text in English, Hindi, Odia, Bengali, Tamil, and Telugu. |
| **BR-013** | Fast Inference API | Must | Full pipeline inference (Eye + Intensity + Track + XAI) completes in under 4.0 seconds. |

---

## Non-Functional Requirements (NFRs)

- **Performance:** Under 4s per inference pass.
- **Reliability:** High availability during active cyclone season with fallback to climatological persistence.
- **Geospatial Standards Compliance:** OGC GeoJSON / PostGIS.
- **Security:** Role-based access control for administrative bulletin issuance.
- **Explainability:** All predictions verifiable via attention maps.

---

## Risks & Mitigations

- **Cloud-top sensor noise or missing scan lines during peak storms:** Mitigated by automated data quality masking.
- **Asymmetric wind shear distorting cloud patterns away from surface center:** Mitigated by multi-channel fusion including water vapor.
- **Limited historical sample size of Super Cyclonic Storms in North Indian Ocean:** Mitigated by physics-guided data augmentation and global transfer learning on Atlantic/Pacific hurricane datasets.
