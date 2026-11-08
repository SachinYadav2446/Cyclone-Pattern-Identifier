"""
CenterNet Cyclone Eye Localization Network.
Fully Convolutional Keypoint Heatmap Architecture for Hurricane Center Estimation.
Features Dilated Atrous Multi-Scale Receptive Fields for detecting both:
1. Pinhole eyes in mature severe cyclonic systems
2. Broad rotation centers in formative curved-band depressions & invests
"""

import os
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision.models import resnet18
from torchvision import transforms
from PIL import Image
import numpy as np


class CenterNetFocalLoss(nn.Module):
    """
    Modified Focal Loss for CenterNet keypoint heatmaps (CornerNet / CenterNet paper).
    Downweights easy background negatives around ground truth Gaussian peaks.
    """
    def __init__(self, alpha=2.0, beta=4.0):
        super().__init__()
        self.alpha = alpha
        self.beta = beta

    def forward(self, pred, target):
        """
        pred: (B, 1, H, W) in range (0, 1)
        target: (B, 1, H, W) Gaussian target in range [0, 1]
        """
        eps = 1e-7
        pred = torch.clamp(pred, eps, 1.0 - eps)

        pos_mask = target.eq(1.0).float()
        neg_mask = target.lt(1.0).float()

        pos_loss = torch.log(pred) * torch.pow(1.0 - pred, self.alpha) * pos_mask
        neg_loss = torch.log(1.0 - pred) * torch.pow(pred, self.alpha) * torch.pow(1.0 - target, self.beta) * neg_mask

        num_pos = pos_mask.sum()
        pos_loss = pos_loss.sum()
        neg_loss = neg_loss.sum()

        if num_pos == 0:
            return -neg_loss
        return -(pos_loss + neg_loss) / num_pos


class DilatedASPPBlock(nn.Module):
    """
    Dual-Path Receptive Field Block:
    - Path 1: 1x1 conv preserves fine eyewall boundary coordinates
    - Path 2: Dilated 3x3 conv (dilation=2) follows macro curved feeder bands across 300+ km
    """
    def __init__(self, in_ch, out_ch):
        super().__init__()
        half = out_ch // 2
        self.branch_local = nn.Conv2d(in_ch, half, kernel_size=1)
        self.branch_macro = nn.Conv2d(in_ch, half, kernel_size=3, padding=2, dilation=2)
        self.fuse = nn.Sequential(
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True)
        )

    def forward(self, x):
        b1 = self.branch_local(x)
        b2 = self.branch_macro(x)
        return self.fuse(torch.cat([b1, b2], dim=1))


class CenterNetDecoder(nn.Module):
    """
    Deconvolutional Decoder with Multi-Scale Dilated Receptive Fields.
    Upsamples 8x8 feature map to 64x64 keypoint probability map.
    """
    def __init__(self):
        super().__init__()
        # Stage 1: 8x8 (512-ch) -> 16x16 (256-ch)
        self.deconv1 = nn.ConvTranspose2d(512, 256, kernel_size=4, stride=2, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(256)
        self.skip1 = nn.Conv2d(256, 256, kernel_size=1)  # from resnet layer3
        self.fuse1 = DilatedASPPBlock(256, 256)

        # Stage 2: 16x16 (256-ch) -> 32x32 (128-ch)
        self.deconv2 = nn.ConvTranspose2d(256, 128, kernel_size=4, stride=2, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(128)
        self.skip2 = nn.Conv2d(128, 128, kernel_size=1)  # from resnet layer2
        self.fuse2 = DilatedASPPBlock(128, 128)

        # Stage 3: 32x32 (128-ch) -> 64x64 (64-ch)
        self.deconv3 = nn.ConvTranspose2d(128, 64, kernel_size=4, stride=2, padding=1, bias=False)
        self.bn3 = nn.BatchNorm2d(64)
        self.fuse3 = nn.Sequential(
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True)
        )

        # CenterNet Keypoint Heatmap Head
        self.heatmap_head = nn.Sequential(
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 1, kernel_size=1),
            nn.Sigmoid()
        )

        # Sub-pixel continuous offset Head (dx, dy in grid units [-0.5, 0.5])
        self.offset_head = nn.Sequential(
            nn.Conv2d(64, 32, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 2, kernel_size=1),
            nn.Tanh()
        )

    def forward(self, c2, c3, c4):
        # c4: (B, 512, 8, 8), c3: (B, 256, 16, 16), c2: (B, 128, 32, 32)
        x = F.relu(self.bn1(self.deconv1(c4)))
        x = self.fuse1(x + self.skip1(c3))

        x = F.relu(self.bn2(self.deconv2(x)))
        x = self.fuse2(x + self.skip2(c2))

        x = F.relu(self.bn3(self.deconv3(x)))
        x = self.fuse3(x)

        heatmap = self.heatmap_head(x)
        offset = self.offset_head(x) * 0.5
        return heatmap, offset


class CenterNetCycloneModel(nn.Module):
    """
    Complete CenterNet Tropical Cyclone Localization Model.
    ResNet-18 Backbone + Multi-Scale Dilated Decoder + 2D Keypoint Heatmap.
    """
    def __init__(self, pretrained_backbone_path=None):
        super().__init__()
        base = resnet18(weights=None)
        self.conv1 = base.conv1
        self.bn1 = base.bn1
        self.relu = base.relu
        self.maxpool = base.maxpool
        self.layer1 = base.layer1
        self.layer2 = base.layer2
        self.layer3 = base.layer3
        self.layer4 = base.layer4

        self.decoder = CenterNetDecoder()

        if pretrained_backbone_path and os.path.exists(pretrained_backbone_path):
            self.load_pretrained_backbone(pretrained_backbone_path)

    def load_pretrained_backbone(self, path):
        try:
            ckpt = torch.load(path, map_location="cpu", weights_only=False)
            sd = ckpt.get("model_state_dict", ckpt)
            backbone_sd = {}
            for k, v in sd.items():
                if k.startswith("backbone."):
                    clean_k = k[len("backbone."):]
                    backbone_sd[clean_k] = v
            m, u = self.load_state_dict(backbone_sd, strict=False)
            print(f"Loaded pretrained backbone weights from {path} ({len(backbone_sd)} keys matched).")
        except Exception as e:
            print(f"Warning: Could not load backbone weights from {path}: {e}")

    def forward(self, x):
        # x: (B, 3, 256, 256)
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.maxpool(x)
        c1 = self.layer1(x)
        c2 = self.layer2(c1)   # (B, 128, 32, 32)
        c3 = self.layer3(c2)   # (B, 256, 16, 16)
        c4 = self.layer4(c3)   # (B, 512, 8, 8)

        heatmap, offset = self.decoder(c2, c3, c4)
        return heatmap, offset

    def predict_eye(self, x_tensor):
        """
        Inference utility:
        x_tensor: (1, 3, 256, 256)
        Returns:
            dict with eye_x_percent, eye_y_percent, peak_confidence, heatmap_numpy (64, 64)
        """
        self.eval()
        with torch.no_grad():
            heatmap, offset = self.forward(x_tensor)
            hm = heatmap[0, 0].cpu().numpy()  # (64, 64)
            off = offset[0].cpu().numpy()     # (2, 64, 64)

            # Find peak coordinate on 64x64 grid
            peak_flat_idx = np.argmax(hm)
            gy, gx = np.unravel_index(peak_flat_idx, (64, 64))
            conf = float(hm[gy, gx])

            # Apply sub-pixel offset
            dx = float(off[0, gy, gx])
            dy = float(off[1, gy, gx])

            # Convert 64x64 grid coords to percentage [0, 100]
            # Heatmap stride is 4 relative to 256x256 image
            x_img = (gx + 0.5 + dx) * 4.0
            y_img = (gy + 0.5 + dy) * 4.0

            x_pct = float(np.clip(x_img / 256.0 * 100.0, 0.0, 100.0))
            y_pct = float(np.clip(y_img / 256.0 * 100.0, 0.0, 100.0))

            return {
                "eye_x_percent": round(x_pct, 2),
                "eye_y_percent": round(y_pct, 2),
                "confidence": round(conf, 4),
                "heatmap": hm
            }
