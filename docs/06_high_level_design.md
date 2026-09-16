# 06 HLD: High-Level Design

## 1. Executive System Architecture

The **CycloneAI / DeepCyclone** platform is designed as an asynchronous, event-driven, multi-tier geospatial deep learning platform. It couples near-real-time satellite observation ingestion with multi-model PyTorch inference, PostGIS spatial queries, and an interactive GIS decision-support command center.

```mermaid
flowchart TD
    %% Styling definitions
    classDef ext fill:#f8fafc,stroke:#64748b,stroke-width:2px,color:#0f172a;
    classDef ingest fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#78350f;
    classDef storage fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,color:#312e81;
    classDef ai fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#7f1d1d;
    classDef db fill:#dcfce7,stroke:#22c55e,stroke-width:2px,color:#14532d;
    classDef api fill:#f3e8ff,stroke:#a855f7,stroke-width:2px,color:#581c87;
    classDef ui fill:#ffedd5,stroke:#ea580c,stroke-width:2px,color:#7c2d12;

    subgraph EXT ["Tier 1: External Data Sources"]
        MOSDAC["ISRO MOSDAC / AWS S3<br/>(INSAT-3D/3DR Level-1B Rasters)"]:::ext
        NOAA["NOAA IBTrACS v04<br/>(Ground Truth Best Track Archive)"]:::ext
        ECMWF["ECMWF ERA5 Reanalysis<br/>(SST & Vertical Wind Shear)"]:::ext
    end

    subgraph INGEST_LAYER ["Tier 2: Ingestion & Preprocessing Pipeline"]
        SCRAPER["Automated Satellite Poller<br/>(15-min cron / Celery Beat)"]:::ingest
        CALIB["Radiance & Planck Calibrator<br/>(DN to Brightness Temp Kelvin)"]:::ingest
        NORM["Spatio-Temporal Standardizer<br/>(xarray / rasterio / GDAL)"]:::ingest
        MINIO[("MinIO / S3 Object Store<br/>Processed NetCDF & Tensor Cubes")]:::storage
    end

    subgraph AI_PIPELINE ["Tier 3: Modular AI Intelligence Engine (PyTorch)"]
        direction TB
        LOC["Module 1: CenterNet Eye Locator<br/>(Anchor-Free Center Heatmap & Offset)"]:::ai
        CROP["Sub-Patch Extractor<br/>(256x256 Storm-Centered Crop)"]:::ai
        INT["Module 2: ConvNeXt-V2 Deep Dvorak<br/>(Wind Speed Regression + IMD Softmax)"]:::ai
        TRACK["Module 3: ConvLSTM Spatio-Temporal Forecaster<br/>(T-18h to T0 Sequence to 6h-48h Track)"]:::ai
        RI["Module 4: XGBoost RI Classifier<br/>(SST, Shear, Delta-T to RI Prob %)"]:::ai
        RADII["Module 5: Quadrant Wind Radii Head<br/>(34, 50, 64-knot Directional Extents)"]:::ai
        XAI["Module 6: Grad-CAM Explainability Engine<br/>(Eyewall Attention Heatmap Overlay)"]:::ai
    end

    subgraph DB_LAYER ["Tier 4: Enterprise Spatial Database"]
        POSTGIS[("PostgreSQL 16 + PostGIS 3.4<br/>Tracks, Uncertainty Cones, Coastlines, Districts")]:::db
        REDIS[("Redis 7 In-Memory Broker<br/>Celery Task Queue & Cache")]:::storage
    end

    subgraph SERVING_LAYER ["Tier 5: API Gateway & Application Services"]
        FASTAPI["FastAPI REST & WebSocket Gateway<br/>(Pydantic v2 / OpenAPI 3.1)"]:::api
        CELERY["Celery Distributed Workers<br/>(Async Heavy GPU / CPU Tasks)"]:::api
        REPORTLAB["ReportLab Advisory Engine<br/>(Automated Official IMD PDF Generator)"]:::api
    end

    subgraph CLIENT_LAYER ["Tier 6: Presentation & Operational Clients"]
        DASHBOARD["React 19 GIS Command Center<br/>(Mapbox GL JS + Deck.gl Vector Winds)"]:::ui
        DOCTOR["Doctor Mode XAI Visualizer<br/>(Thermal Gradient & Grad-CAM Split Slider)"]:::ui
        EVAC["District Evacuation Decision Matrix<br/>(Surge Height & Shelter Matching)"]:::ui
        ALERTS["Multi-Lingual Public Advisory API<br/>(English, Hindi, Odia, Bengali, Tamil, Telugu)"]:::ui
    end

    %% Data flow connections
    MOSDAC & NOAA & ECMWF ==> SCRAPER
    SCRAPER --> CALIB --> NORM --> MINIO
    MINIO -.-> LOC
    LOC --> CROP
    CROP --> INT & RADII
    CROP --> TRACK
    INT & ECMWF --> RI
    INT --> XAI

    INT & TRACK & RI & RADII & XAI ==> POSTGIS
    FASTAPI <--> POSTGIS
    FASTAPI <--> REDIS
    REDIS <--> CELERY
    CELERY --> AI_PIPELINE

    FASTAPI ==> DASHBOARD
    FASTAPI ==> DOCTOR
    FASTAPI ==> EVAC
    FASTAPI ==> REPORTLAB
    REPORTLAB ==> ALERTS
```

---

## 2. End-to-End Ingestion & Processing Data Flow

```mermaid
flowchart LR
    subgraph S1 ["1. Ingestion"]
        A1["Raw HDF5 / NetCDF"] --> A2["Extract TIR-1, TIR-2, WV, VIS"]
    end
    subgraph S2 ["2. Calibration"]
        A2 --> B1["Apply Gain + Offset<br/>DN to Radiance"]
        B1 --> B2["Inverse Planck Law<br/>Radiance to Kelvin"]
    end
    subgraph S3 ["3. Tensor Pipeline"]
        B2 --> C1["512x512 Normalization<br/>(0°-30°N, 50°-100°E)"]
        C1 --> C2["Tensor Tensor (4, 512, 512)"]
    end
    subgraph S4 ["4. AI Model Inference"]
        C2 --> D1["CenterNet Eye Keypoint"]
        D1 --> D2["ConvNeXt Intensity"]
        D1 --> D3["ConvLSTM Trajectory"]
        D2 --> D4["XGBoost Rapid Intensification"]
        D2 --> D5["Grad-CAM Saliency"]
    end
    subgraph S5 ["5. Geospatial Analytics"]
        D3 --> E1["PostGIS Coastline Intersection"]
        E1 --> E2["Landfall Time & District Surge"]
        D3 --> E3["Dynamic Cone of Uncertainty"]
    end
    subgraph S6 ["6. Dissemination"]
        E2 & E3 --> F1["GeoJSON to Mapbox & Deck.gl"]
        E2 & D2 --> F2["1-Click Official IMD PDF"]
    end

    S1 --> S2 --> S3 --> S4 --> S5 --> S6
```

---

## 3. Subsystem Component Responsibilities

| Subsystem | Primary Technologies | Core Responsibilities |
|---|---|---|
| **External Ingestion** | AWS S3 SDK, MOSDAC Scraper, ECMWF API | Polls 15-minute geostationary satellite feeds, checks file integrity via SHA-256 checksums, ingests ERA5 environmental reanalysis variables (SST and Vertical Wind Shear). |
| **Calibration & Prep** | `xarray`, `netCDF4`, `rasterio`, `NumPy` | Converts raw integer Digital Numbers (DN) to spectral radiance using sensor gain/offset; converts thermal radiances to Brightness Temperature in Kelvin via Inverse Planck Function; stacks 4 spectral bands into a uniform `(4, 512, 512)` floating-point tensor. |
| **AI Inference Cluster** | `PyTorch 2.3+`, `timm`, `CUDA 12.x`, `XGBoost` | Performs anchor-free eye center localization (CenterNet); crops storm-centered `(4, 256, 256)` patch; predicts continuous Maximum Sustained Wind Speed (knots) and IMD category (ConvNeXt-V2); projects multi-step future track coordinates (ConvLSTM); classifies 24-hour Rapid Intensification probability (XGBoost); and computes backward gradients for Grad-CAM explainability. |
| **Spatial Database** | `PostgreSQL 16`, `PostGIS 3.4` | Persists historical tracks, real-time storm fixes, multi-timestep forecast coordinates, dynamic Cone of Uncertainty polygons, coastal bathymetry profiles, and district census demographics; executes sub-10ms spatial intersection queries (`ST_Intersects`, `ST_Distance`). |
| **Asynchronous Task Hub** | `Celery`, `Redis 7` | Decouples HTTP request/response loops from heavy matrix operations; coordinates ingestion, preprocessing, GPU inference, and report publishing queues without blocking client connections. |
| **API & Gateway** | `FastAPI`, `Pydantic v2`, `Uvicorn` | Exposes secure REST endpoints, validates payload schemas, streams live WebSocket telemetry, and coordinates microservice communication under strict sub-second SLA constraints. |
| **Interactive Client** | `React 19`, `Mapbox GL JS`, `Deck.gl`, `Tailwind CSS` | Renders interactive multi-layer GIS maps with animated wind particle vectors, cone polygons, live telemetry gauges, side-by-side Doctor Mode Grad-CAM overlays, and district evacuation risk tables. |
| **Dissemination Engine** | `ReportLab`, Multi-Lingual Text Templates | Compiles real-time model outputs into standardized official IMD National Cyclone Warning Centre advisory bulletins (PDF); translates emergency instructions into regional coastal languages (Hindi, Odia, Bengali, Tamil, Telugu). |

---

## 4. Non-Functional Requirements & Architectural Constraints

- **Sub-Second Latency:** Complete pipeline inference (Eye Detection + ConvNeXt Intensity + ConvLSTM Track + Grad-CAM) completes in under **4.0 seconds** on a single NVIDIA GPU instance (or under 1.5 seconds via ONNX Runtime).
- **High Availability & Fault Tolerance:** If primary infrared channels suffer corrupted scan lines, the preprocessing pipeline raises a data quality warning and falls back to secondary split-window channels (TIR-2) and climatological persistence extrapolation.
- **Zero-Execution Sandbox:** Ingested satellite raster files (`.h5`, `.nc`) are opened strictly using read-only numerical array parsers (`xarray`/`h5py`) without evaluating executable macros or embedded scripts.
- **Standardized Interoperability:** All spatial features (tracks, cones, gale radii) conform strictly to OGC GeoJSON standards and EPSG:4326 (WGS 84) coordinate reference systems for seamless interoperability with government GIS systems.

