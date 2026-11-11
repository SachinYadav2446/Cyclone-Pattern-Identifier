"""
Training script for CenterNet Cyclone Eye Localization Network.
Features Morphology-Adaptive Gaussian Targets (sigma):
- Mature storms (>= 48 kts): sigma = 1.8 (sharp pinhole eye)
- Developing storms (34 - 47 kts): sigma = 3.0 (curved band wrap)
- Premature / Depressions (< 34 kts): sigma = 4.5 (broad low-level circulation center / LLCC)
Trains with dynamic translation augmentations on the 4,156 HURSAT storm dataset.
"""

import os
import sys
import time
import math
import random

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import pandas as pd
import numpy as np
from PIL import Image

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms

from ai_engine.models.centernet_cyclone import CenterNetCycloneModel, CenterNetFocalLoss


def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


class CycloneCenterNetDataset(Dataset):
    def __init__(self, csv_path, root_dir="dataset", is_train=True, img_size=256, hm_size=64):
        self.root_dir = root_dir
        self.is_train = is_train
        self.img_size = img_size
        self.hm_size = hm_size
        self.stride = img_size // hm_size  # 4

        df = pd.read_csv(csv_path)
        df = df.dropna(subset=['eye_x_percent', 'eye_y_percent'])
        self.records = df.to_dict('records')

        self.color_jitter = transforms.ColorJitter(brightness=0.15, contrast=0.15)
        self.normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])

    def __len__(self):
        return len(self.records)

    def _draw_gaussian(self, hm, center_x, center_y, sigma):
        gx = np.arange(self.hm_size, dtype=np.float32)
        gy = np.arange(self.hm_size, dtype=np.float32)
        gx, gy = np.meshgrid(gx, gy)
        dist_sq = (gx - center_x) ** 2 + (gy - center_y) ** 2
        gaussian = np.exp(-dist_sq / (2.0 * sigma * sigma))
        ix = int(np.clip(round(center_x), 0, self.hm_size - 1))
        iy = int(np.clip(round(center_y), 0, self.hm_size - 1))
        gaussian[iy, ix] = 1.0
        return np.maximum(hm, gaussian)

    def __getitem__(self, idx):
        row = self.records[idx]
        img_rel = row['relative_path']
        img_path = os.path.join(self.root_dir, img_rel)

        try:
            pil_img = Image.open(img_path).convert('RGB')
        except Exception:
            pil_img = Image.new('RGB', (self.img_size, self.img_size), color=(0, 0, 0))

        pil_img = pil_img.resize((self.img_size, self.img_size), Image.Resampling.BILINEAR)
        x_pct = float(row['eye_x_percent'])
        y_pct = float(row['eye_y_percent'])
        wind = float(row.get('wind_knots', 0.0))

        # Adaptive Gaussian Radius based on storm morphology
        if wind >= 48.0:
            sigma = 1.8  # Mature closed eyewall
        elif wind >= 34.0:
            sigma = 3.0  # Tropical storm curved bands
        else:
            sigma = 4.5  # Premature / depression rotation center

        x_px = x_pct / 100.0 * self.img_size
        y_px = y_pct / 100.0 * self.img_size

        if self.is_train:
            # Extreme Multi-Quadrant Translation (Position-Agnostic Training):
            # Places the eye freely across the entire frame: left (10-25%), right (75-90%), top, bottom, and center.
            if random.random() < 0.85:
                target_x = random.uniform(26.0, self.img_size - 26.0)
                target_y = random.uniform(26.0, self.img_size - 26.0)
                dx = target_x - x_px
                dy = target_y - y_px
                pil_img = pil_img.transform(
                    (self.img_size, self.img_size),
                    Image.Transform.AFFINE,
                    (1, 0, -dx, 0, 1, -dy),
                    resample=Image.Resampling.BILINEAR
                )
                x_px, y_px = target_x, target_y

            # Random horizontal flip
            if random.random() < 0.5:
                pil_img = pil_img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
                x_px = self.img_size - x_px

            # Random vertical flip
            if random.random() < 0.3:
                pil_img = pil_img.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
                y_px = self.img_size - y_px

            # Random Color Jitter
            if random.random() < 0.5:
                pil_img = self.color_jitter(pil_img)

        img_arr = np.array(pil_img, dtype=np.float32) / 255.0
        img_tensor = torch.from_numpy(img_arr.transpose(2, 0, 1))
        img_tensor = self.normalize(img_tensor)

        hm_target = np.zeros((1, self.hm_size, self.hm_size), dtype=np.float32)
        cx = x_px / self.stride
        cy = y_px / self.stride
        hm_target[0] = self._draw_gaussian(hm_target[0], cx, cy, sigma)

        gx = int(np.clip(int(cx), 0, self.hm_size - 1))
        gy = int(np.clip(int(cy), 0, self.hm_size - 1))
        offset_target = np.zeros((2, self.hm_size, self.hm_size), dtype=np.float32)
        offset_mask = np.zeros((1, self.hm_size, self.hm_size), dtype=np.float32)
        
        offset_target[0, gy, gx] = float(cx - gx - 0.5)
        offset_target[1, gy, gx] = float(cy - gy - 0.5)
        offset_mask[0, gy, gx] = 1.0

        return {
            'image': img_tensor,
            'heatmap': torch.from_numpy(hm_target),
            'offset': torch.from_numpy(offset_target),
            'offset_mask': torch.from_numpy(offset_mask),
            'gt_x_pct': x_px / self.img_size * 100.0,
            'gt_y_pct': y_px / self.img_size * 100.0,
            'wind': wind,
            'lat': float(row.get('latitude', 15.0)),
            'lon': float(row.get('longitude', 85.0)),
            'storm_name': str(row.get('storm_name', 'Cyclone'))
        }


def train_centernet(
    train_csv="dataset/train_labels.csv",
    val_csv="dataset/val_labels.csv",
    pretrained_backbone="ai_engine/models/weights/best_cyclone_model.pth",
    output_weights="ai_engine/models/weights/centernet_cyclone_model.pth",
    epochs=10,
    batch_size=32,
    lr=6e-4
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"--- CenterNet Adaptive Keypoint Training on {device} ---")
    print(f"Train labels: {train_csv}")
    print(f"Val labels:   {val_csv}")

    train_ds = CycloneCenterNetDataset(train_csv, is_train=True)
    val_ds = CycloneCenterNetDataset(val_csv, is_train=False)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0)

    print(f"Train samples: {len(train_ds)} | Val samples: {len(val_ds)}")

    model = CenterNetCycloneModel(pretrained_backbone_path=pretrained_backbone)
    model.to(device)

    # Load warm-start weights if available
    save_path = output_weights
    if os.path.exists(save_path):
        try:
            ckpt = torch.load(save_path, map_location=device, weights_only=False)
            model.load_state_dict(ckpt.get('model_state_dict', ckpt))
            print(f"[OK] Warm-started CenterNet from: {save_path}")
        except Exception as e:
            print(f"Warm-start notice: {e}")

    # Freeze shallow feature extractors (conv1, layer1, layer2); unfreeze layer3, layer4 and decoder
    for param in model.conv1.parameters():
        param.requires_grad = False
    for param in model.bn1.parameters():
        param.requires_grad = False
    for param in model.layer1.parameters():
        param.requires_grad = False
    for param in model.layer2.parameters():
        param.requires_grad = False

    trainable_params = [p for p in model.parameters() if p.requires_grad]
    print(f"Trainable parameters: {sum(p.numel() for p in trainable_params):,}")

    optimizer = torch.optim.AdamW(trainable_params, lr=lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-5)
    focal_loss_fn = CenterNetFocalLoss()

    best_val_dist_pct = float('inf')
    best_stats = {}

    for epoch in range(1, epochs + 1):
        model.train()
        total_loss = 0.0
        t0 = time.time()

        for batch_idx, batch in enumerate(train_loader):
            images = batch['image'].to(device)
            target_hm = batch['heatmap'].to(device)
            target_off = batch['offset'].to(device)
            mask_off = batch['offset_mask'].to(device)

            optimizer.zero_grad()
            pred_hm, pred_off = model(images)

            hm_loss = focal_loss_fn(pred_hm, target_hm)

            off_diff = torch.abs(pred_off - target_off) * mask_off
            off_loss = off_diff.sum() / torch.clamp(mask_off.sum(), min=1.0)

            loss = hm_loss + 0.1 * off_loss
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        scheduler.step()
        train_time = time.time() - t0
        avg_train_loss = total_loss / len(train_loader)

        # Validation Step
        model.eval()
        val_km_errors = []
        val_mature_km = []
        val_dep_km = []

        with torch.no_grad():
            for batch in val_loader:
                images = batch['image'].to(device)
                pred_hm, pred_off = model(images)

                b_sz = images.size(0)
                hm_np = pred_hm.squeeze(1).cpu().numpy()
                off_np = pred_off.cpu().numpy()

                for b in range(b_sz):
                    hm_single = hm_np[b]
                    peak_idx = np.argmax(hm_single)
                    gy, gx = np.unravel_index(peak_idx, (64, 64))

                    dx = off_np[b, 0, gy, gx]
                    dy = off_np[b, 1, gy, gx]

                    pred_x_pct = ((gx + 0.5 + dx) * 4.0 / 256.0) * 100.0
                    pred_y_pct = ((gy + 0.5 + dy) * 4.0 / 256.0) * 100.0

                    gt_x_pct = float(batch['gt_x_pct'][b])
                    gt_y_pct = float(batch['gt_y_pct'][b])
                    wind_val = float(batch['wind'][b])

                    dist_pct = math.sqrt((pred_x_pct - gt_x_pct)**2 + (pred_y_pct - gt_y_pct)**2)
                    km_err = dist_pct * 10.0
                    val_km_errors.append(km_err)

                    if wind_val >= 48.0:
                        val_mature_km.append(km_err)
                    elif wind_val < 34.0:
                        val_dep_km.append(km_err)

        mean_km_err = float(np.mean(val_km_errors))
        median_km_err = float(np.median(val_km_errors))
        acc_50km = float(np.mean(np.array(val_km_errors) <= 50.0)) * 100.0
        acc_100km = float(np.mean(np.array(val_km_errors) <= 100.0)) * 100.0
        mature_med = float(np.median(val_mature_km)) if val_mature_km else 0.0
        dep_med = float(np.median(val_dep_km)) if val_dep_km else 0.0

        print(
            f"Epoch [{epoch:02d}/{epochs:02d}] ({train_time:.1f}s) | Loss: {avg_train_loss:.3f} | "
            f"Overall Med: {median_km_err:.1f}km (Acc@50: {acc_50km:.1f}%, Acc@100: {acc_100km:.1f}%) | "
            f"Mature Med: {mature_med:.1f}km | Dep Med: {dep_med:.1f}km"
        )

        if median_km_err < best_val_dist_pct:
            best_val_dist_pct = median_km_err
            os.makedirs(os.path.dirname(output_weights), exist_ok=True)
            checkpoint = {
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'median_dist_km': round(median_km_err, 1),
                'mean_km_err': round(mean_km_err, 1),
                'acc_50km': round(acc_50km, 2),
                'acc_100km': round(acc_100km, 2),
                'mature_median_km': round(mature_med, 1),
                'depression_median_km': round(dep_med, 1),
                'architecture': 'CenterNetCycloneModel (Dilated ASPP Decoder)'
            }
            torch.save(checkpoint, output_weights)
            best_stats = checkpoint
            print(f"  --> Saved new best CenterNet weights to {output_weights} (Overall Med: {median_km_err:.1f}km)")

    print("\n--- Training Finished ---")
    print(f"Best Model Median Error: {best_stats.get('median_dist_km')} km (Mean: {best_stats.get('mean_km_err')} km)")
    print(f"Mature Cyclones Median:  {best_stats.get('mature_median_km')} km")
    print(f"Depressions Median:      {best_stats.get('depression_median_km')} km")
    print(f"Accuracy @ 50km: {best_stats.get('acc_50km')}% | Accuracy @ 100km: {best_stats.get('acc_100km')}%")
    return best_stats


if __name__ == "__main__":
    train_centernet(epochs=10, batch_size=32, lr=4e-4)
