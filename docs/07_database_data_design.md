# 07 Database Data Design

## Database / Data Design Strategy

PostgreSQL with the **PostGIS** spatial extension is the core relational store. Spatial indexing (`GIST`) is applied across all coordinate points, track lines, and cone polygons to ensure sub-millisecond query execution.

---

## Core Data Assets & Schema

```mermaid
erDiagram
    CYCLONES ||--o{ TRACK_POINTS : contains
    CYCLONES ||--o{ FORECAST_RUNS : generates
    FORECAST_RUNS ||--o{ PREDICTED_TRACKS : includes
    FORECAST_RUNS ||--o{ UNCERTAINTY_CONES : defines
    FORECAST_RUNS ||--o{ WIND_RADII : calculates
    FORECAST_RUNS ||--o{ GRADCAM_ARTIFACTS : produces
    FORECAST_RUNS ||--o{ DISTRICT_IMPACT_REPORTS : evaluates
    COASTAL_DISTRICTS ||--o{ DISTRICT_IMPACT_REPORTS : mapped_to

    CYCLONES {
        uuid id PK
        string cyclone_name
        string basin "Bay of Bengal / Arabian Sea"
        timestamp genesis_time
        timestamp dissipation_time
        string status "Active / Dissipated"
    }

    TRACK_POINTS {
        uuid id PK
        uuid cyclone_id FK
        timestamp observation_time
        geometry center_geom "Point (Lon, Lat)"
        float msw_knots
        float cpd_hpa
        string imd_category
        string satellite_source
    }

    FORECAST_RUNS {
        uuid id PK
        uuid cyclone_id FK
        timestamp run_timestamp
        float current_msw_knots
        float ri_probability
        string model_version
    }

    PREDICTED_TRACKS {
        uuid id PK
        uuid forecast_run_id FK
        integer lead_time_hours "6, 12, 24, 48"
        geometry predicted_geom "Point (Lon, Lat)"
        float predicted_msw_knots
        float predicted_cpd_hpa
        string predicted_category
    }

    UNCERTAINTY_CONES {
        uuid id PK
        uuid forecast_run_id FK
        geometry cone_polygon "Polygon Geometry"
        float confidence_level "0.67"
    }

    WIND_RADII {
        uuid id PK
        uuid forecast_run_id FK
        integer threshold_knots "34, 50, 64"
        float radius_ne_nm
        float radius_nw_nm
        float radius_se_nm
        float radius_sw_nm
    }

    DISTRICT_IMPACT_REPORTS {
        uuid id PK
        uuid forecast_run_id FK
        uuid district_id FK
        float expected_surge_meters
        float expected_rainfall_mm
        integer population_at_risk
        string alert_level "Red / Orange / Yellow"
        integer evacuation_priority_rank
    }

    COASTAL_DISTRICTS {
        uuid id PK
        string state_name
        string district_name
        geometry boundary_geom "MultiPolygon"
        integer census_population
        integer total_cyclone_shelters
    }
```
