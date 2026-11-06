"""
DeepCyclone PyTorch Multi-Task Neural Network Training Engine
Trains Unified ResNet-18 Backbone for:
1. Sub-pixel Eye Localization (Continuous Offset Regression)
2. MSW Sustained Wind (kts) & Central Pressure (hPa) Regression
3. IMD 7-Tier Intensity Category Classification
Evaluates on unseen validation storms and saves weights to ai_engine/models/weights/best_cyclone_model.pth.
"""

import os
import time
import pandas as pd
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from torchvision.models import resnet18, ResNet18_Weights

CATEGORY_MAP = {
    "Depression (D)": 0,
    "Deep Depression (DD)": 1,
    "Cyclonic Storm (CS)": 2,
    "Severe Cyclonic Storm (SCS)": 3,
    "Very Severe Cyclonic Storm (VSCS)": 4,
    "Extremely Severe Cyclonic Storm (ESCS)": 5,
    "Super Cyclonic Storm (SuCS)": 6
}

class CycloneDataset(Dataset):
    def __init__(self, csv_path, base_dir, transform=None):
        self.df = pd.read_csv(csv_path)
        self.base_dir = base_dir
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_path = os.path.join(self.base_dir, row["relative_path"])
        
        # Load grayscale image and convert to 3-channel RGB for ResNet
        img = Image.open(img_path).convert("RGB")
        
        if self.transform:
            img = self.transform(img)

        eye_coords = torch.tensor([row["eye_x_percent"], row["eye_y_percent"]], dtype=torch.float32)
        wind = float(row["wind_knots"]) if pd.notnull(row["wind_knots"]) else 45.0
        pres = float(row["pressure_hpa"]) if pd.notnull(row["pressure_hpa"]) else 990.0
        intensity = torch.tensor([wind, pres], dtype=torch.float32)
        
        cat_str = str(row["category"])
        cat_idx = CATEGORY_MAP.get(cat_str, 2)
        cat_label = torch.tensor(cat_idx, dtype=torch.long)

        return img, eye_coords, intensity, cat_label

class DeepCycloneModel(nn.Module):
    def __init__(self, pretrained=True):
        super().__init__()
        weights = ResNet18_Weights.DEFAULT if pretrained else None
        backbone = resnet18(weights=weights)
        in_features = backbone.fc.in_features
        backbone.fc = nn.Identity()
        self.backbone = backbone
        
        # Head 1: Eye localization (x_pct, y_pct in [0, 100])
        self.eye_head = nn.Sequential(
            nn.Linear(in_features, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 2),
            nn.Sigmoid()
        )
        
        # Head 2: Wind speed (kts) & Pressure (hPa)
        self.intensity_head = nn.Sequential(
            nn.Linear(in_features, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 2)
        )
        
        # Head 3: Category classification (7 classes)
        self.cat_head = nn.Sequential(
            nn.Linear(in_features, 64),
            nn.ReLU(),
            nn.Linear(64, 7)
        )

    def forward(self, x):
        feat = self.backbone(x)
        eye_pct = self.eye_head(feat) * 100.0
        intensity = self.intensity_head(feat)
        cat_logits = self.cat_head(feat)
        return eye_pct, intensity, cat_logits

def train():
    base_dir = os.path.join(os.getcwd(), "dataset")
    train_csv = os.path.join(base_dir, "train_labels.csv")
    val_csv = os.path.join(base_dir, "val_labels.csv")

    weights_dir = os.path.join(os.getcwd(), "ai_engine", "models", "weights")
    os.makedirs(weights_dir, exist_ok=True)
    best_weights_path = os.path.join(weights_dir, "best_cyclone_model.pth")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"--> Training on device: {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else f'{os.cpu_count()} CPU cores'})")

    # Data transforms: resize to 256x256 for rapid convergence
    train_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.5),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    train_dataset = CycloneDataset(train_csv, base_dir, transform=train_transform)
    val_dataset = CycloneDataset(val_csv, base_dir, transform=val_transform)

    batch_size = 32
    num_workers = 0  # Safe on Windows
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=num_workers)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=num_workers)

    print(f"--> Dataset Loaded: {len(train_dataset)} Train Samples | {len(val_dataset)} Validation Samples")

    model = DeepCycloneModel(pretrained=True).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=10, eta_min=1e-5)

    criterion_eye = nn.SmoothL1Loss()
    criterion_wind = nn.SmoothL1Loss()
    criterion_cat = nn.CrossEntropyLoss()

    best_val_loss = float("inf")
    epochs = 10

    print("\n" + "=" * 80)
    print(f"{'Epoch':^7} | {'Train Loss':^10} | {'Val Loss':^10} | {'Eye MAE %':^10} | {'Eye Err (km)':^12} | {'Wind MAE':^10} | {'Cat Acc %':^10}")
    print("=" * 80)

    for epoch in range(1, epochs + 1):
        t0 = time.time()
        model.train()
        train_loss_accum = 0.0

        for imgs, eyes, intensities, cats in train_loader:
            imgs, eyes, intensities, cats = imgs.to(device), eyes.to(device), intensities.to(device), cats.to(device)

            optimizer.zero_grad()
            pred_eyes, pred_intensities, pred_cats = model(imgs)

            l_eye = criterion_eye(pred_eyes, eyes)
            # Normalize wind/pressure scale: wind typically 20-140, pressure 900-1010
            l_wind = criterion_wind(pred_intensities[:, 0] / 50.0, intensities[:, 0] / 50.0)
            l_cat = criterion_cat(pred_cats, cats)

            loss = 1.0 * l_eye + 1.5 * l_wind + 0.8 * l_cat
            loss.backward()
            optimizer.step()

            train_loss_accum += loss.item() * len(imgs)

        train_loss = train_loss_accum / len(train_dataset)
        scheduler.step()

        # Validation loop
        model.eval()
        val_loss_accum = 0.0
        eye_diffs = []
        wind_diffs = []
        correct_cats = 0
        total_val = 0

        with torch.no_grad():
            for imgs, eyes, intensities, cats in val_loader:
                imgs, eyes, intensities, cats = imgs.to(device), eyes.to(device), intensities.to(device), cats.to(device)
                pred_eyes, pred_intensities, pred_cats = model(imgs)

                l_eye = criterion_eye(pred_eyes, eyes)
                l_wind = criterion_wind(pred_intensities[:, 0] / 50.0, intensities[:, 0] / 50.0)
                l_cat = criterion_cat(pred_cats, cats)
                loss = 1.0 * l_eye + 1.5 * l_wind + 0.8 * l_cat

                val_loss_accum += loss.item() * len(imgs)

                # Eye distance error (hypot in percentage)
                dx = pred_eyes[:, 0] - eyes[:, 0]
                dy = pred_eyes[:, 1] - eyes[:, 1]
                dist_pct = torch.hypot(dx, dy)
                eye_diffs.extend(dist_pct.cpu().numpy().tolist())

                # Wind MAE
                w_err = torch.abs(pred_intensities[:, 0] - intensities[:, 0])
                wind_diffs.extend(w_err.cpu().numpy().tolist())

                # Classification accuracy
                pred_classes = torch.argmax(pred_cats, dim=1)
                correct_cats += (pred_classes == cats).sum().item()
                total_val += len(cats)

        val_loss = val_loss_accum / len(val_dataset)
        avg_eye_mae = np.mean(eye_diffs)
        # 1% across 301-px grid (~2200 km swath) is approx 22 km
        avg_eye_km = avg_eye_mae * 0.22 * 100.0 / 3.01
        avg_wind_mae = np.mean(wind_diffs)
        cat_acc = (correct_cats / total_val) * 100.0

        elapsed = time.time() - t0

        is_best = val_loss < best_val_loss
        star = " * BEST" if is_best else ""
        if is_best:
            best_val_loss = val_loss
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "val_loss": val_loss,
                "eye_mae_pct": avg_eye_mae,
                "eye_error_km": avg_eye_km,
                "wind_mae_kts": avg_wind_mae,
                "cat_accuracy": cat_acc
            }, best_weights_path)

        print(f"[{epoch:02d}/{epochs:02d}] | {train_loss:^10.4f} | {val_loss:^10.4f} | {avg_eye_mae:^10.2f}% | {avg_eye_km:^10.1f} km | {avg_wind_mae:^8.1f} kts | {cat_acc:^8.1f}% | ({elapsed:.1f}s){star}")

    print("=" * 80)
    print(f"--> Training Complete! Saved Best Model Weights to:\n    {best_weights_path}\n")

if __name__ == "__main__":
    train()
