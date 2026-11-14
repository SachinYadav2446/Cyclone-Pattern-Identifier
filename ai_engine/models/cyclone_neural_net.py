"""
CycloneNeuralNet: Production Inference Service for trained DeepCyclone multi-task model.
Loads weights from ai_engine/models/weights/best_cyclone_model.pth and computes:
- Sub-pixel eye coordinates (eye_x_pct, eye_y_pct)
- Maximum Sustained Wind (kts)
- Central Pressure (hPa)
- IMD Category Classification
"""

import os
import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import resnet18
from PIL import Image
import numpy as np

CATEGORY_NAMES = [
    "Depression (D)",
    "Deep Depression (DD)",
    "Cyclonic Storm (CS)",
    "Severe Cyclonic Storm (SCS)",
    "Very Severe Cyclonic Storm (VSCS)",
    "Extremely Severe Cyclonic Storm (ESCS)",
    "Super Cyclonic Storm (SuCS)"
]

class DeepCycloneModel(nn.Module):
    def __init__(self):
        super().__init__()
        backbone = resnet18(weights=None)
        in_features = backbone.fc.in_features
        backbone.fc = nn.Identity()
        self.backbone = backbone
        
        self.eye_head = nn.Sequential(
            nn.Linear(in_features, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 2),
            nn.Sigmoid()
        )
        self.intensity_head = nn.Sequential(
            nn.Linear(in_features, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 2)
        )
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

class CycloneNeuralNet:
    def __init__(self, weights_path=None):
        if weights_path is None:
            weights_path = os.path.join(os.path.dirname(__file__), "weights", "best_cyclone_model.pth")
        
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.is_loaded = False
        
        self.transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        if os.environ.get("RENDER") or os.environ.get("LOW_MEMORY"):
            print("[INFO] CycloneNeuralNet: Cloud free tier detected -> using lightweight Dvorak ConvNeXt physics engine")
            return

        if os.path.exists(weights_path):
            try:
                model = DeepCycloneModel()
                ckpt = torch.load(weights_path, map_location=self.device, weights_only=False)
                state_dict = ckpt.get("model_state_dict", ckpt)
                model.load_state_dict(state_dict)
                model.to(self.device)
                model.eval()
                self.model = model
                self.is_loaded = True
                self.metrics = {
                    "val_loss": ckpt.get("val_loss"),
                    "eye_mae_pct": ckpt.get("eye_mae_pct"),
                    "eye_error_km": ckpt.get("eye_error_km"),
                    "wind_mae_kts": ckpt.get("wind_mae_kts"),
                    "cat_accuracy": ckpt.get("cat_accuracy")
                }
            except Exception as e:
                print(f"Warning: Failed to load cyclone neural net weights: {e}")

    def predict(self, pil_image: Image.Image):
        if not self.is_loaded or self.model is None:
            return None

        rgb = pil_image.convert("RGB")
        tensor = self.transform(rgb).unsqueeze(0).to(self.device)

        with torch.no_grad():
            eye_pct, intensity, cat_logits = self.model(tensor)
            
            x_pct = float(eye_pct[0, 0].item())
            y_pct = float(eye_pct[0, 1].item())
            
            wind_kts = max(20.0, float(intensity[0, 0].item()))
            pres_hpa = float(intensity[0, 1].item())
            if pres_hpa < 850.0 or pres_hpa > 1020.0:
                # Thermodynamic Atkinson-Holliday relationship fallback for pressure
                pres_hpa = round(1013.25 - ((wind_kts / 13.8) ** 1.33), 1)

            probs = torch.softmax(cat_logits, dim=1)
            cat_idx = int(torch.argmax(probs, dim=1).item())
            cat_conf = float(probs[0, cat_idx].item())
            category_name = CATEGORY_NAMES[cat_idx]

        return {
            "eye_x_percent": round(x_pct, 2),
            "eye_y_percent": round(y_pct, 2),
            "wind_knots": round(wind_kts, 1),
            "pressure_hpa": round(pres_hpa, 1),
            "category": category_name,
            "category_confidence": round(cat_conf, 3),
            "model_architecture": "ResNet-18 Multi-Task Neural Network"
        }

cyclone_neural_net = CycloneNeuralNet()
