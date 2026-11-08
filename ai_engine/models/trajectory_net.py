"""
DeepCyclone Atmospheric Trajectory Forecaster (TrajectoryNet)
Multi-Horizon Kinematic Waypoint, Uncertainty Cone & Intensity Decay Forecaster
Trained on 4,200+ HURSAT & IBTrACS Historical Cyclone Tracks.
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Any, List, Tuple, Optional
import numpy as np

HORIZONS = [6, 12, 18, 24, 36, 48]

class TrajectoryResidualBlock(nn.Module):
    def __init__(self, hidden_dim: int, dropout: float = 0.1):
        super().__init__()
        self.fc1 = nn.Linear(hidden_dim, hidden_dim)
        self.ln1 = nn.LayerNorm(hidden_dim)
        self.act1 = nn.SiLU()
        self.dropout = nn.Dropout(dropout)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.ln2 = nn.LayerNorm(hidden_dim)
        self.act2 = nn.SiLU()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        res = x
        x = self.act1(self.ln1(self.fc1(x)))
        x = self.dropout(x)
        x = self.act2(self.ln2(self.fc2(x)))
        return x + res

class DeepCycloneTrajectoryNet(nn.Module):
    def __init__(self, input_dim: int = 14, hidden_dim: int = 256, num_blocks: int = 4):
        super().__init__()
        self.input_proj = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.SiLU()
        )
        
        self.blocks = nn.ModuleList([
            TrajectoryResidualBlock(hidden_dim, dropout=0.1) for _ in range(num_blocks)
        ])
        
        # Heads:
        # 1. Delta lat/lon for 6 horizons [6, 12, 18, 24, 36, 48] -> 12 values
        self.waypoint_head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.SiLU(),
            nn.Linear(hidden_dim // 2, len(HORIZONS) * 2)
        )
        
        # 2. Uncertainty log-variance head (for cone of uncertainty) -> 12 values
        self.uncertainty_head = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.SiLU(),
            nn.Linear(hidden_dim // 2, len(HORIZONS) * 2)
        )
        
        # 3. Future Intensity head (predicted wind speed at 24h and 48h) -> 2 values
        self.intensity_head = nn.Sequential(
            nn.Linear(hidden_dim, 64),
            nn.SiLU(),
            nn.Linear(64, len(HORIZONS))
        )

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        x: [B, input_dim]
        Returns:
            waypoints: [B, 6, 2] (dlat, dlon at each horizon)
            uncertainty: [B, 6, 2] (log-std for lat, lon)
            future_winds: [B, 6] (predicted wind in knots at each horizon)
        """
        feat = self.input_proj(x)
        for b in self.blocks:
            feat = b(feat)
            
        wp = self.waypoint_head(feat).view(-1, len(HORIZONS), 2)
        unc = self.uncertainty_head(feat).view(-1, len(HORIZONS), 2)
        winds = self.intensity_head(feat)
        return wp, unc, winds

def extract_features(
    lat: float,
    lon: float,
    wind_kts: float,
    pressure_hpa: float,
    past_dlat: float = 0.0,
    past_dlon: float = 0.0,
    has_past: float = 0.0
) -> torch.Tensor:
    """
    Encodes atmospheric physical parameters into normalized feature tensor.
    """
    rad_lat = math.radians(lat)
    rad_lon = math.radians(lon)
    
    # Atmospheric physics invariants:
    coriolis = math.sin(rad_lat)
    beta_drift_proxy = math.cos(rad_lat)  # Variation of Coriolis with latitude
    sin_lon = math.sin(rad_lon)
    cos_lon = math.cos(rad_lon)
    
    norm_lat = lat / 50.0
    norm_wind = wind_kts / 150.0
    norm_press = (pressure_hpa - 950.0) / 60.0
    
    # Ocean basin one-hot proxies:
    is_bob = 1.0 if (lat >= 0 and 78.0 <= lon <= 100.0) else 0.0
    is_as = 1.0 if (lat >= 0 and 50.0 <= lon < 78.0) else 0.0
    is_wpac = 1.0 if (lat >= 0 and 100.0 < lon <= 180.0) else 0.0
    is_epac_atl = 1.0 if (lon < 0 or lon > 180.0) else 0.0
    is_sh = 1.0 if (lat < 0) else 0.0
    
    feats = [
        norm_lat,
        sin_lon,
        cos_lon,
        coriolis,
        beta_drift_proxy,
        norm_wind,
        norm_press,
        is_bob,
        is_as,
        is_wpac,
        is_epac_atl,
        is_sh,
        past_dlat / 2.0,
        past_dlon / 2.0
    ]
    return torch.tensor(feats, dtype=torch.float32)
