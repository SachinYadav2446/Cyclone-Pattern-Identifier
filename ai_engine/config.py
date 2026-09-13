"""
Central Configuration for CycloneAI
Defines paths, scientific parameters, IMD cyclone categories, and temporal split boundaries.
"""

from pathlib import Path
from typing import Dict, Tuple

# Base Project Paths
BASE_DIR = Path(__file__).resolve().parent.parent
AI_ENGINE_DIR = BASE_DIR / "ai_engine"

DATA_DIR = AI_ENGINE_DIR / "data"
RAW_IBTRACS_DIR = DATA_DIR / "raw_ibtracs"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
SATELLITE_CROPS_DIR = DATA_DIR / "satellite_crops"

MODELS_DIR = AI_ENGINE_DIR / "models"
WEIGHTS_DIR = BASE_DIR / "weights"
REPORTS_DIR = BASE_DIR / "reports"
OUTPUTS_DIR = BASE_DIR / "outputs"

# Create directories if they do not exist
for p in [RAW_IBTRACS_DIR, PROCESSED_DATA_DIR, SATELLITE_CROPS_DIR, WEIGHTS_DIR, REPORTS_DIR, OUTPUTS_DIR]:
    p.mkdir(parents=True, exist_ok=True)

# Basin Configuration (North Indian Ocean)
BASIN_ID = "NI"  # NOAA IBTrACS basin code for North Indian Ocean
NORTH_INDIAN_OCEAN_BOUNDS = {
    "lat_min": 0.0,
    "lat_max": 32.0,
    "lon_min": 45.0,
    "lon_max": 102.0,
}

# Storm-Independent Temporal Split (Preventing Data Leakage)
TEMPORAL_SPLITS = {
    "train": {"start_year": 1990, "end_year": 2018},
    "val": {"start_year": 2019, "end_year": 2021},
    "test": {"start_year": 2022, "end_year": 2024},
}

# IMD (India Meteorological Department) Standard Cyclone Intensity Scale
# Wind speeds are in knots (10-minute sustained average standard)
IMD_CATEGORIES: Dict[str, Tuple[float, float, int]] = {
    "D": (17.0, 27.0, 0),        # Depression
    "DD": (28.0, 33.0, 1),       # Deep Depression
    "CS": (34.0, 47.0, 2),       # Cyclonic Storm
    "SCS": (48.0, 63.0, 3),      # Severe Cyclonic Storm
    "VSCS": (64.0, 89.0, 4),     # Very Severe Cyclonic Storm
    "ESCS": (90.0, 119.0, 5),    # Extremely Severe Cyclonic Storm
    "SuCS": (120.0, 300.0, 6),   # Super Cyclonic Storm
}

# Reverse mapping: index to category code and full descriptive name
CATEGORY_NAMES = {
    0: ("D", "Depression"),
    1: ("DD", "Deep Depression"),
    2: ("CS", "Cyclonic Storm"),
    3: ("SCS", "Severe Cyclonic Storm"),
    4: ("VSCS", "Very Severe Cyclonic Storm"),
    5: ("ESCS", "Extremely Severe Cyclonic Storm"),
    6: ("SuCS", "Super Cyclonic Storm"),
}

# Tensor / Satellite Image Specifications
TENSOR_CONFIG = {
    "image_size": (512, 512),
    "channels": ["TIR1", "TIR2", "WV", "VIS"],
    "num_channels": 4,
    "spatial_resolution_km": 4.0,
}

# Trajectory Forecasting Config (Lead Times in hours)
TRAJECTORY_CONFIG = {
    "input_sequence_length": 4,      # e.g., T-18h, T-12h, T-6h, T0
    "forecast_lead_steps": [6, 12, 24, 48],  # Future forecast hours (+6h, +12h, +24h, +48h)
}

# NOAA IBTrACS Download Endpoint
IBTRACS_NI_CSV_URL = (
    "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.NI.list.v04r00.csv"
)
