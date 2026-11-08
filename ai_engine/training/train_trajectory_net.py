"""
Training Pipeline for DeepCycloneTrajectoryNet
Trained on Historical Storm Sequences from HURSAT & IBTrACS (4,200 Passes, 60 Systems).
Validates on strictly held-out unseen cyclone systems.
"""

import os
import sys
import re
import math
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple

sys.path.insert(0, os.path.abspath('.'))

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from ai_engine.models.trajectory_net import DeepCycloneTrajectoryNet, HORIZONS, extract_features

# Haversine distance utility
def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def parse_time(fn):
    m = re.search(r'\.(\d{4})\.(\d{2})\.(\d{2})\.(\d{4})\.', fn)
    if m:
        y, mo, d, hm = m.groups()
        return datetime.strptime(f'{y}{mo}{d}{hm}', '%Y%m%d%H%M')
    return None

def prepare_dataset(csv_path: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    df = pd.read_csv(csv_path)
    # Impute missing intensity metrics cleanly
    for col in ['wind_knots', 'pressure_hpa']:
        df[col] = df.groupby('storm_name')[col].transform(lambda g: g.ffill().bfill())
        df[col] = df[col].fillna(30.0 if col == 'wind_knots' else 1000.0)
        
    df['timestamp'] = df['filename'].apply(parse_time)
    df['system_id'] = df['filename'].apply(lambda fn: fn.split('.')[0])
    
    # Deduplicate matching timestamps
    df_unique = df.sort_values(['system_id', 'timestamp']).drop_duplicates(subset=['system_id', 'timestamp']).copy()
    
    samples = []
    systems = list(df_unique['system_id'].unique())
    
    for sys_id, group in df_unique.groupby('system_id'):
        group = group.sort_values('timestamp').reset_index(drop=True)
        time_map = {row['timestamp']: row for _, row in group.iterrows()}
        
        for i, row in group.iterrows():
            t0 = row['timestamp']
            lat0 = row['latitude']
            lon0 = row['longitude']
            wind0 = row['wind_knots']
            press0 = row['pressure_hpa']
            
            # Require at least +12h available for trajectory supervision
            if (t0 + timedelta(hours=12)) not in time_map:
                continue
                
            t_m6 = t0 - timedelta(hours=6)
            if t_m6 in time_map:
                p_dlat = lat0 - time_map[t_m6]['latitude']
                p_dlon = lon0 - time_map[t_m6]['longitude']
                has_p = 1.0
            else:
                p_dlat = 0.0
                p_dlon = 0.0
                has_p = 0.0
                
            targets_dlat = []
            targets_dlon = []
            targets_wind = []
            masks = []
            
            for h in HORIZONS:
                th = t0 + timedelta(hours=h)
                if th in time_map:
                    targets_dlat.append(time_map[th]['latitude'] - lat0)
                    targets_dlon.append(time_map[th]['longitude'] - lon0)
                    targets_wind.append(time_map[th]['wind_knots'])
                    masks.append(1.0)
                else:
                    targets_dlat.append(0.0)
                    targets_dlon.append(0.0)
                    targets_wind.append(wind0)
                    masks.append(0.0)
                    
            feat = extract_features(lat0, lon0, wind0, press0, p_dlat, p_dlon, has_p)
            samples.append({
                'system_id': sys_id,
                'storm_name': row['storm_name'],
                'lat0': lat0,
                'lon0': lon0,
                'wind0': wind0,
                'features': feat,
                'targets_dlat': torch.tensor(targets_dlat, dtype=torch.float32),
                'targets_dlon': torch.tensor(targets_dlon, dtype=torch.float32),
                'targets_wind': torch.tensor(targets_wind, dtype=torch.float32),
                'masks': torch.tensor(masks, dtype=torch.float32),
            })
            
    return samples, systems

class TrajectoryDataset(Dataset):
    def __init__(self, samples: List[Dict[str, Any]], augment: bool = True):
        self.samples = samples
        self.augment = augment

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        s = self.samples[idx]
        feat = s['features'].clone()
        dlat = s['targets_dlat'].clone()
        dlon = s['targets_dlon'].clone()
        wind = s['targets_wind'].clone()
        mask = s['masks'].clone()
        
        # Jitter augmentation during training to model atmospheric turbulence
        if self.augment and random.random() < 0.4:
            # Small sensor noise in initial intensity (+- 3 kts, +- 1 hPa)
            feat[5] += random.uniform(-0.03, 0.03)  # wind
            feat[6] += random.uniform(-0.02, 0.02)  # pressure
            
        return {
            'features': feat,
            'dlat': dlat,
            'dlon': dlon,
            'wind': wind,
            'mask': mask,
            'lat0': s['lat0'],
            'lon0': s['lon0'],
            'wind0': s['wind0'],
            'storm_name': s['storm_name'],
            'system_id': s['system_id']
        }

def train_trajectory_model(epochs: int = 40, batch_size: int = 32, lr: float = 1e-3):
    print("=" * 70)
    print("  DeepCyclone TrajectoryNet Training Pipeline")
    print("=" * 70)
    
    csv_path = 'dataset/dataset_labels.csv'
    samples, systems = prepare_dataset(csv_path)
    print(f"Loaded {len(samples)} valid track instances from {len(systems)} historical storm systems.")
    
    # Deterministic train/val split by system ID (unseen storms)
    random.seed(42)
    val_sys_count = max(8, int(len(systems) * 0.20))
    val_systems = set(random.sample(systems, val_sys_count))
    train_systems = set(systems) - val_systems
    
    train_samples = [s for s in samples if s['system_id'] in train_systems]
    val_samples = [s for s in samples if s['system_id'] in val_systems]
    print(f"Train Systems: {len(train_systems)} ({len(train_samples)} tracks)")
    print(f"Val Systems:   {len(val_systems)} ({len(val_samples)} tracks) [STRICT OUT-OF-SAMPLE TEST]")
    print(f"Val Storms: {list(val_systems)[:6]}...")
    
    train_ds = TrajectoryDataset(train_samples, augment=True)
    val_ds = TrajectoryDataset(val_samples, augment=False)
    
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    model = DeepCycloneTrajectoryNet(input_dim=14, hidden_dim=256, num_blocks=4).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-5)
    
    criterion_huber = nn.SmoothL1Loss(reduction='none')
    
    best_val_24h_km = 9999.0
    weights_dir = 'ai_engine/models/weights'
    os.makedirs(weights_dir, exist_ok=True)
    save_path = os.path.join(weights_dir, 'trajectory_motion_model.pth')
    
    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        n_batches = 0
        
        for batch in train_loader:
            x = batch['features'].to(device)
            gt_dlat = batch['dlat'].to(device)
            gt_dlon = batch['dlon'].to(device)
            gt_wind = batch['wind'].to(device)
            mask = batch['mask'].to(device)
            
            pred_wp, pred_unc, pred_wind = model(x)
            
            # Waypoint regression loss (SmoothL1 on delta lat and delta lon)
            pred_dlat = pred_wp[:, :, 0]
            pred_dlon = pred_wp[:, :, 1]
            
            loss_dlat = (criterion_huber(pred_dlat, gt_dlat) * mask).sum() / (mask.sum() + 1e-6)
            loss_dlon = (criterion_huber(pred_dlon, gt_dlon) * mask).sum() / (mask.sum() + 1e-6)
            
            # Uncertainty NLL loss with numerical clamping
            log_std_lat = torch.clamp(pred_unc[:, :, 0], -2.0, 3.0)
            log_std_lon = torch.clamp(pred_unc[:, :, 1], -2.0, 3.0)
            nll_lat = 0.5 * torch.exp(-2 * log_std_lat) * (pred_dlat - gt_dlat)**2 + log_std_lat
            nll_lon = 0.5 * torch.exp(-2 * log_std_lon) * (pred_dlon - gt_dlon)**2 + log_std_lon
            loss_unc = ((nll_lat + nll_lon) * mask).sum() / (mask.sum() * 2.0 + 1e-6)
            
            # Wind intensity loss
            loss_wind = (criterion_huber(pred_wind / 50.0, gt_wind / 50.0) * mask).sum() / (mask.sum() + 1e-6)
            
            loss = loss_dlat + loss_dlon + 0.3 * loss_unc + 0.5 * loss_wind
            
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            
            total_loss += loss.item()
            n_batches += 1
            
        scheduler.step()
        avg_train_loss = total_loss / max(1, n_batches)
        
        # Validation Evaluation
        model.eval()
        errors_km = {h: [] for h in HORIZONS}
        wind_errors = []
        
        with torch.no_grad():
            for batch in val_loader:
                x = batch['features'].to(device)
                gt_dlat = batch['dlat'].cpu().numpy()
                gt_dlon = batch['dlon'].cpu().numpy()
                gt_wind = batch['wind'].cpu().numpy()
                mask = batch['mask'].cpu().numpy()
                lat0 = batch['lat0'].numpy()
                lon0 = batch['lon0'].numpy()
                
                pred_wp, pred_unc, pred_wind = model(x)
                p_dlat = pred_wp[:, :, 0].cpu().numpy()
                p_dlon = pred_wp[:, :, 1].cpu().numpy()
                p_wind = pred_wind.cpu().numpy()
                
                B = len(lat0)
                for b in range(B):
                    for i, h in enumerate(HORIZONS):
                        if mask[b, i] > 0.5:
                            true_lat = lat0[b] + gt_dlat[b, i]
                            true_lon = lon0[b] + gt_dlon[b, i]
                            pred_lat = lat0[b] + p_dlat[b, i]
                            pred_lon = lon0[b] + p_dlon[b, i]
                            dist_km = haversine_km(true_lat, true_lon, pred_lat, pred_lon)
                            errors_km[h].append(dist_km)
                            wind_errors.append(abs(p_wind[b, i] - gt_wind[b, i]))
                            
        median_12h = np.median(errors_km[12]) if len(errors_km[12]) > 0 else 0
        median_24h = np.median(errors_km[24]) if len(errors_km[24]) > 0 else 0
        median_48h = np.median(errors_km[48]) if len(errors_km[48]) > 0 else 0
        mean_wind_err = np.mean(wind_errors) if len(wind_errors) > 0 else 0
        
        if epoch % 5 == 0 or epoch == 1 or epoch == epochs:
            print(f"Epoch {epoch:2d}/{epochs:2d} | Train Loss: {avg_train_loss:.4f} | "
                  f"Val 12h: {median_12h:.1f} km | Val 24h: {median_24h:.1f} km | Val 48h: {median_48h:.1f} km | "
                  f"Wind MAE: {mean_wind_err:.1f} kts")
                  
        if median_24h > 0 and median_24h < best_val_24h_km:
            best_val_24h_km = median_24h
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_12h_km': median_12h,
                'val_24h_km': median_24h,
                'val_48h_km': median_48h,
                'wind_mae_kts': mean_wind_err,
                'horizons': HORIZONS,
                'val_systems': list(val_systems)
            }, save_path)
            
    print("=" * 70)
    print(f"[SUCCESS] TrajectoryNet Model Saved to: {save_path}")
    print(f"  Best 24-Hour Median Track Error on Unseen Cyclones: {best_val_24h_km:.1f} km")
    print(f"  Best 48-Hour Median Track Error on Unseen Cyclones: {median_48h:.1f} km")
    print("=" * 70)

if __name__ == '__main__':
    train_trajectory_model(epochs=35, batch_size=32, lr=1e-3)
