# 09 LLD: Low-Level Design

## 1. Directory Structure

```
cyclone-platform/
├── docs/                      # PRD, TRD, HLD, LLD, and meteorological validation docs
├── ai_engine/                 # Python PyTorch & Deep Learning Microservice
│   ├── ingestion/
│   │   ├── satellite_downloader.py # AWS S3 and MOSDAC automated scraper
│   │   ├── netcdf_processor.py     # Satellite radiance unpacking & calibration
│   │   └── tensor_builder.py       # Multi-channel tensor normalization & cropping
│   ├── models/
│   │   ├── eye_detector.py         # CenterNet keypoint center localization
│   │   ├── deep_dvorak.py          # ConvNeXt-V2 intensity and wind estimator
│   │   ├── track_convlstm.py       # Spatio-temporal ConvLSTM sequence model
│   │   └── ri_xgboost.py           # Rapid intensification tabular classifier
│   ├── xai/
│   │   └── gradcam_engine.py       # PyTorch layer gradient extractor for attention maps
│   ├── evaluation/
│   │   ├── track_error.py          # Mean Absolute Track Error calculator
│   │   ├── intensity_metrics.py    # Wind MAE and category classification metrics
│   │   └── ri_benchmark.py         # F1-score & accuracy for RI events
│   ├── reports/
│   │   └── bulletin_pdf.py         # ReportLab IMD-compliant PDF generator
│   ├── schemas/
│   │   └── telemetry.py            # Pydantic v2 schemas for API contracts
│   ├── main.py                     # FastAPI REST routes and Celery task hooks
│   └── tests/                      # Pytest test fixtures and validation scripts
├── backend/                   # Node/Express API Gateway & Auth
│   ├── routes/cyclone.js
│   ├── services/db.js              # PostGIS client connection
│   └── middleware/auth.js
├── frontend/                  # React 19 Interactive GIS Client
│   └── src/
│       ├── components/
│       │   ├── MapViewer.jsx       # Mapbox GL JS map with cone & track layers
│       │   ├── WindParticles.jsx   # Deck.gl animated wind particle overlay
│       │   ├── TelemetryCard.jsx   # Live intensity, MSW, and pressure gauges
│       │   ├── DoctorMode.jsx      # Side-by-side Grad-CAM inspector
│       │   ├── ImpactTable.jsx     # District vulnerability & evacuation matrix
│       │   └── BulletinModal.jsx   # PDF preview and multi-lingual alerts
│       └── services/api.js
└── docker-compose.yml
```

---

## 2. Low-Level Class & Component Architecture

```mermaid
classDiagram
    class SatelliteIngestionEngine {
        +fetch_latest_pass(basin: str) Path
        +extract_channels(h5_path: Path) dict
        +calibrate_dn_to_radiance(dn: np.ndarray, gain: float, offset: float) np.ndarray
        +radiance_to_kelvin(radiance: np.ndarray, nu: float) np.ndarray
        +build_input_tensor(channels: dict) Tensor
    }

    class CenterNetEyeDetector {
        -backbone: ConvNeXtBackbone
        -heatmap_head: Conv2d
        -offset_head: Conv2d
        -size_head: Conv2d
        +forward(x: Tensor) tuple[Tensor, Tensor, Tensor]
        +locate_eye(heatmap: Tensor, offset: Tensor) tuple[float, float]
        +pixel_to_latlon(px: float, py: float, bounds: list) tuple[float, float]
    }

    class DeepDvorakConvNeXt {
        -backbone: ConvNeXtV2Tiny
        -wind_regressor: Linear
        -pressure_regressor: Linear
        -imd_classifier: Linear
        +crop_eye_patch(full_tensor: Tensor, eye_latlon: tuple) Tensor
        +forward(patch: Tensor) dict
    }

    class SpatioTemporalConvLSTM {
        -convlstm_cells: list[ConvLSTMCell]
        -fc_decoder: Linear
        +forward(sequence_frames: Tensor) Tensor
        +generate_forecast_tracks(hidden_state: Tensor) list[dict]
        +compute_uncertainty_cone(tracks: list, sigma: list) Polygon
    }

    class RapidIntensificationXGB {
        -model: Booster
        +engineer_features(patch: Tensor, sst: float, shear: float) np.ndarray
        +predict_ri_probability(features: np.ndarray) float
    }

    class GradCAMEngine {
        -model: nn.Module
        -target_layer: nn.Conv2d
        -gradients: Tensor
        -activations: Tensor
        +hook_layers() void
        +generate_heatmap(input_tensor: Tensor, target_category: int) np.ndarray
        +overlay_saliency(original_ir: np.ndarray, heatmap: np.ndarray) np.ndarray
    }

    class SpatialRiskEngine {
        -db_conn: PostGISConnection
        +query_coastal_intersection(cone_geojson: dict) list[dict]
        +compute_surge_index(msw_knots: float, bathymetry: float) float
        +calculate_district_evacuation_priority(districts: list) list[dict]
    }

    class ReportLabBulletinBuilder {
        -template_path: str
        +compile_imd_bulletin(storm_data: dict, out_pdf_path: str) Path
    }

    SatelliteIngestionEngine ..> CenterNetEyeDetector : feeds tensor (4, 512, 512)
    CenterNetEyeDetector ..> DeepDvorakConvNeXt : supplies (lat, lon) anchor
    DeepDvorakConvNeXt ..> GradCAMEngine : attaches PyTorch hooks
    DeepDvorakConvNeXt ..> RapidIntensificationXGB : provides thermal delta-T
    CenterNetEyeDetector ..> SpatioTemporalConvLSTM : supplies sequence anchors
    SpatioTemporalConvLSTM ..> SpatialRiskEngine : outputs GeoJSON cones
    SpatialRiskEngine ..> ReportLabBulletinBuilder : injects district risk tables
    DeepDvorakConvNeXt ..> ReportLabBulletinBuilder : injects MSW & category
```

---

## 3. Deep Learning Tensor Processing Pipeline (LLD)

```mermaid
flowchart TD
    subgraph INGEST ["1. Raw Raster to Calibrated 4-Channel Cube"]
        H5["INSAT-3D L1B File (.h5)"] --> EXT["Extract TIR-1, TIR-2, WV, VIS"]
        EXT --> RAD["Radiance R = Gain * DN + Offset"]
        RAD --> KELVIN["Planck Inverse: T_B = (C2 * nu) / ln((C1 * nu^3 / R) + 1)"]
        KELVIN --> STACK["Stack & Normalize: [4, 512, 512] Float32<br/>Coverage: 0°-30°N, 50°-100°E"]
    end

    subgraph LOCATOR ["2. CenterNet Anchor-Free Keypoint Detection"]
        STACK --> BK1["ConvNeXt Stem + Stages 1-4 Downsampling (4x)"]
        BK1 --> FEAT1["Feature Map [256, 128, 128]"]
        FEAT1 --> H_HEAD["Heatmap Head 1x1 Conv -> [1, 128, 128]<br/>Sigmoid Peak -> Integer Center (px_int, py_int)"]
        FEAT1 --> O_HEAD["Offset Head 1x1 Conv -> [2, 128, 128]<br/>Sub-Pixel Correction (dx, dy)"]
        FEAT1 --> S_HEAD["Size Head 1x1 Conv -> [2, 128, 128]<br/>Radius of Maximum Winds (RMW)"]
        H_HEAD & O_HEAD --> COORDS["Sub-Pixel Center = (px_int + dx, py_int + dy) * 4<br/>Projected via pyproj -> (Latitude, Longitude)"]
    end

    subgraph INTENSITY ["3. Deep Dvorak ConvNeXt-V2 Multi-Task Network"]
        COORDS --> CROP["Bilinear Grid Sample Crop -> [4, 256, 256]<br/>Centered Exactly on Cyclone Eye"]
        CROP --> BK2["ConvNeXt-V2 Backbone<br/>(Extracts Thermal Eye-Eyewall Gradient delta-T)"]
        BK2 --> POOL["Global Average Pooling -> 1024-d Feature Vector"]
        POOL --> REG_HEAD["Regression Head (Linear Layer)<br/>-> Wind Speed (knots) & Central Pressure (hPa)"]
        POOL --> CLS_HEAD["Classification Head (Linear + Softmax)<br/>-> 7 IMD Categories (Depression to Super Cyclone)"]
    end

    subgraph TRAJECTORY ["4. Spatio-Temporal Sequence Forecaster"]
        SEQ["4 Sequential Satellite Frames (T-18h, T-12h, T-6h, T0)"] --> CLSTM["ConvLSTM Recurrent Cells (Hidden State h_t, Cell State c_t)<br/>Preserves 2D Spatial Swirl & Kinematic Velocity"]
        CLSTM --> TRACK_DEC["Decoder Linear Head<br/>-> Coordinates for +6h, +12h, +24h, +48h Lead Times"]
        TRACK_DEC --> CONE["Dynamic Cone Polygon Generation<br/>(Radius R_t derived from Historical Gaussian Error sigma_t)"]
    end

    subgraph RI_MODULE ["5. Rapid Intensification (RI) Predictor"]
        POOL --> SAT_FEATS["Satellite Feats: Eye Temp, Eyewall Min Temp, Symmetry"]
        ERA5["ERA5 Fields: Sea Surface Temp (>28°C), Wind Shear (<15 kts)"] --> SAT_FEATS
        SAT_FEATS --> XGB["XGBoost Classifier<br/>-> RI Probability (0-100%) | Flag if >= 70%"]
    end

    subgraph EXPLAIN ["6. Explainable AI (XAI) Grad-CAM Hook Layer"]
        REG_HEAD -. Backpropagation Gradients .-> BK2
        BK2 --> CAM["Compute Gradients w.r.t Final Conv Feature Maps<br/>Weighted Channel Sum -> 2D Heatmap Overlay"]
    end

    STACK --> LOCATOR
    LOCATOR --> INTENSITY
    LOCATOR --> TRAJECTORY
    INTENSITY --> RI_MODULE
    INTENSITY --> EXPLAIN
```

---

## 4. End-to-End Operational Sequence Flow

```mermaid
sequenceDiagram
    autonumber
    actor Met as Operational Meteorologist / IMD Duty Officer
    participant UI as React 19 GIS Command Center
    participant API as FastAPI Gateway
    participant Q as Redis Broker & Celery Queue
    participant AI as PyTorch Inference Worker
    participant DB as PostgreSQL 16 + PostGIS
    participant S3 as MinIO Object Store

    Met->>UI: Select Active Cyclone Pass (e.g. INSAT-3D 06:00 UTC)
    UI->>API: POST /api/v1/cyclone/{id}/forecast
    API->>Q: Enqueue Background Job `tasks.execute_forecast(cyclone_id, timestamp)`
    API-->>UI: 202 Accepted (job_id: "job-8921a")

    Q->>AI: Worker picks up task from queue
    AI->>S3: Stream L1B Multi-Spectral HDF5 Rasters
    AI->>AI: 1. Calibrate DN to Kelvin (Planck Law) -> Tensor [4, 512, 512]
    AI->>AI: 2. CenterNet: Detect Eye Center (Lat: 15.86°N, Lon: 75.07°E)
    AI->>AI: 3. Crop [4, 256, 256] -> ConvNeXt-V2 -> Wind: 85.4 kts, Cat: VSCS
    AI->>AI: 4. ConvLSTM: Sequence T-18h..T0 -> Predict 6h, 12h, 24h, 48h Tracks
    AI->>AI: 5. XGBoost RI Model -> RI Risk: 82% (High Risk)
    AI->>AI: 6. Grad-CAM Hooks -> Generate 2D Attention Heatmap

    AI->>DB: Execute PostGIS Intersection: ST_Intersects(predicted_cone, district_boundary)
    DB-->>AI: Matched 4 Coastal Districts (Population: 4.2M, Surge: 3.2m)
    AI->>DB: Upsert Track Points, Cone Polygons, and Telemetry Rows
    AI->>Q: Task Completed with Status: SUCCESS
    
    UI->>API: Poll GET /api/v1/cyclone/{id}/telemetry
    API->>DB: Fetch latest forecast run and GeoJSON layers
    API-->>UI: 200 OK (Full GeoJSON + Metrics Payload)
    UI->>UI: Render Animated Particle Winds (Deck.gl), Cones & Gauges

    Met->>UI: Click "Generate Official IMD Advisory Bulletin"
    UI->>API: POST /api/v1/cyclone/{id}/bulletin/pdf
    API->>AI: Invoke ReportLab Bulletin Renderer
    AI->>DB: Fetch active metrics, storm track table, and Grad-CAM PNG
    AI->>AI: Render MoES/IMD standardized multi-page PDF layout
    AI-->>API: Binary PDF Stream
    API-->>UI: Stream Download `IMD_Cyclone_Advisory_VSCS_06UTC.pdf`
```

---

## 5. Tensor Interface Contracts & Data Specifications

### CenterNet Input & Output Signatures
```python
# Input Tensor
input_tensor: torch.Tensor  # Shape: (B, 4, 512, 512), dtype=torch.float32
# Channels: [0: TIR-1 (Kelvin), 1: TIR-2 (Kelvin), 2: Water Vapor, 3: Visible]

# Output Tuples
heatmap: torch.Tensor       # Shape: (B, 1, 128, 128), range: [0.0, 1.0] (Sigmoid)
offset:  torch.Tensor       # Shape: (B, 2, 128, 128), range: [-0.5, 0.5] (dx, dy)
size:    torch.Tensor       # Shape: (B, 2, 128, 128), range: [0, max_rmw_pixels]
```

### Deep Dvorak ConvNeXt-V2 Signatures
```python
# Cropped Eye Patch Input
eye_patch: torch.Tensor     # Shape: (B, 4, 256, 256), centered on (center_x, center_y)

# Output Multi-Task Dictionary
output = {
    "msw_knots": torch.Tensor,       # Shape: (B, 1), Continuous wind speed estimate
    "pressure_hpa": torch.Tensor,    # Shape: (B, 1), Central pressure deficit estimate
    "category_logits": torch.Tensor, # Shape: (B, 7), Raw logits for 7 IMD categories
    "feature_embedding": torch.Tensor# Shape: (B, 1024), Dense latent storm representation
}
```

### ConvLSTM Sequence Input Signatures
```python
# 4-Frame Temporal History Input
sequence_tensor: torch.Tensor # Shape: (B, 4, 4, 256, 256)
# Dimensions: (Batch, Timesteps=4, Channels=4, Height=256, Width=256)

# Output Multi-Step Coordinates
predicted_track: torch.Tensor # Shape: (B, 4, 2)
# Predictions for lead times: [+6h, +12h, +24h, +48h] in (Lat, Lon)
```

