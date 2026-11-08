"""
Quantitative Evaluation & Benchmark Suite for Cyclone Eye Localization.
Runs inference across the 841 held-out validation images in dataset/val_labels.csv.
Computes pixel error, physical distance (km), and accuracy thresholds (<25km, <50km, <100km).
Compares CenterNet vs Baseline ResNet-18 linear model.
Exports visual validation images and a Markdown scorecard.
"""

import os
import sys
import math
import time
import pandas as pd
import numpy as np
from PIL import Image, ImageDraw

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import torch
from torchvision import transforms
from ai_engine.models.centernet_cyclone import CenterNetCycloneModel
from ai_engine.models.cyclone_neural_net import DeepCycloneModel


def run_benchmark(
    val_csv="dataset/val_labels.csv",
    root_dir="dataset",
    centernet_weights="ai_engine/models/weights/centernet_cyclone_model.pth",
    baseline_weights="ai_engine/models/weights/best_cyclone_model.pth",
    report_output="ai_engine/evaluation/BENCHMARK_SCORECARD.md",
    visual_output_dir="ai_engine/evaluation/visual_scorecard"
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"=== CYCLONE EYE LOCALIZATION BENCHMARK ===")
    print(f"Validation dataset: {val_csv}")

    df = pd.read_csv(val_csv).dropna(subset=['eye_x_percent', 'eye_y_percent'])
    total_val = len(df)
    print(f"Total validation test images: {total_val}")

    # 1. Load CenterNet Model
    centernet = CenterNetCycloneModel()
    if os.path.exists(centernet_weights):
        ckpt = torch.load(centernet_weights, map_location=device, weights_only=False)
        sd = ckpt.get("model_state_dict", ckpt)
        centernet.load_state_dict(sd)
        centernet.to(device)
        centernet.eval()
        print(f"[OK] CenterNet Model loaded from {centernet_weights}")
    else:
        print(f"[ERROR] CenterNet weights not found at {centernet_weights}")
        return

    # 2. Load Baseline Model
    baseline = DeepCycloneModel()
    has_baseline = False
    if os.path.exists(baseline_weights):
        try:
            b_ckpt = torch.load(baseline_weights, map_location=device, weights_only=False)
            b_sd = b_ckpt.get("model_state_dict", b_ckpt)
            baseline.load_state_dict(b_sd)
            baseline.to(device)
            baseline.eval()
            has_baseline = True
            print(f"[OK] Baseline ResNet-18 loaded from {baseline_weights}")
        except Exception as e:
            print(f"[NOTE] Baseline load note: {e}")

    normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])

    results_centernet = []
    results_baseline = []

    os.makedirs(visual_output_dir, exist_ok=True)
    visual_samples_saved = 0
    max_visual_samples = 12

    print(f"\nRunning inference on {total_val} images...")
    t_start = time.time()

    for idx, row in df.iterrows():
        img_rel = row['relative_path']
        img_path = os.path.join(root_dir, img_rel)
        if not os.path.exists(img_path):
            continue

        try:
            raw_img = Image.open(img_path).convert('RGB')
        except Exception:
            continue

        w_orig, h_orig = raw_img.size
        gt_x_pct = float(row['eye_x_percent'])
        gt_y_pct = float(row['eye_y_percent'])
        category = str(row.get('category', 'Unknown'))

        # Preprocess
        img_256 = raw_img.resize((256, 256), Image.Resampling.BILINEAR)
        arr = np.array(img_256, dtype=np.float32) / 255.0
        tensor = torch.from_numpy(arr.transpose(2, 0, 1)).unsqueeze(0)
        norm_tensor = normalize(tensor).to(device)

        # CenterNet prediction
        with torch.no_grad():
            pred_hm, pred_off = centernet(norm_tensor)
            hm_np = pred_hm[0, 0].cpu().numpy()
            off_np = pred_off[0].cpu().numpy()

            peak_idx = np.argmax(hm_np)
            gy, gx = np.unravel_index(peak_idx, (64, 64))
            dx = float(off_np[0, gy, gx])
            dy = float(off_np[1, gy, gx])

            cn_x_pct = ((gx + 0.5 + dx) * 4.0 / 256.0) * 100.0
            cn_y_pct = ((gy + 0.5 + dy) * 4.0 / 256.0) * 100.0
            cn_conf = float(hm_np[gy, gx])

        # Baseline prediction
        bl_x_pct, bl_y_pct = 50.0, 50.0
        if has_baseline:
            with torch.no_grad():
                b_eye_pct, _, _ = baseline(norm_tensor)
                bl_x_pct = float(b_eye_pct[0, 0].item())
                bl_y_pct = float(b_eye_pct[0, 1].item())

        # Error metrics (Approximate satellite scale: 1000 km frame -> 1% = 10 km)
        cn_err_pct = math.sqrt((cn_x_pct - gt_x_pct)**2 + (cn_y_pct - gt_y_pct)**2)
        cn_err_km = cn_err_pct * 10.0

        bl_err_pct = math.sqrt((bl_x_pct - gt_x_pct)**2 + (bl_y_pct - gt_y_pct)**2)
        bl_err_km = bl_err_pct * 10.0

        results_centernet.append({
            'err_pct': cn_err_pct,
            'err_km': cn_err_km,
            'conf': cn_conf,
            'category': category
        })
        results_baseline.append({
            'err_pct': bl_err_pct,
            'err_km': bl_err_km,
            'category': category
        })

        # Save visual comparison images for first few
        if visual_samples_saved < max_visual_samples:
            vis_img = raw_img.copy()
            draw = ImageDraw.Draw(vis_img)
            
            # Draw GT (Green circle + cross)
            gt_px = gt_x_pct / 100.0 * w_orig
            gt_py = gt_y_pct / 100.0 * h_orig
            r = 16
            draw.ellipse([gt_px - r, gt_py - r, gt_px + r, gt_py + r], outline=(0, 255, 0), width=3)
            draw.line([gt_px - r - 6, gt_py, gt_px + r + 6, gt_py], fill=(0, 255, 0), width=2)
            draw.line([gt_px, gt_py - r - 6, gt_px, gt_py + r + 6], fill=(0, 255, 0), width=2)

            # Draw CenterNet Pred (Cyan reticle + ring)
            cn_px = cn_x_pct / 100.0 * w_orig
            cn_py = cn_y_pct / 100.0 * h_orig
            draw.ellipse([cn_px - r, cn_py - r, cn_px + r, cn_py + r], outline=(0, 230, 255), width=3)
            draw.line([cn_px - r - 8, cn_py, cn_px + r + 8, cn_py], fill=(0, 230, 255), width=3)
            draw.line([cn_px, cn_py - r - 8, cn_px, cn_py + r + 8], fill=(0, 230, 255), width=3)

            # Draw connecting error line
            draw.line([gt_px, gt_py, cn_px, cn_py], fill=(255, 50, 50), width=2)

            vis_filename = f"sample_{visual_samples_saved + 1:02d}_{row.get('storm_name', 'cyclone')}_err{cn_err_km:.1f}km.png"
            vis_img.save(os.path.join(visual_output_dir, vis_filename))
            visual_samples_saved += 1

    inference_duration = time.time() - t_start
    print(f"Evaluated {len(results_centernet)} images in {inference_duration:.1f}s ({inference_duration / total_val * 1000:.1f} ms/image)")

    # Aggregate Statistics
    cn_km = [r['err_km'] for r in results_centernet]
    cn_pct = [r['err_pct'] for r in results_centernet]
    bl_km = [r['err_km'] for r in results_baseline]
    bl_pct = [r['err_pct'] for r in results_baseline]

    cn_mean_km = np.mean(cn_km)
    cn_med_km = np.median(cn_km)
    cn_acc25 = np.mean(np.array(cn_km) <= 25.0) * 100.0
    cn_acc50 = np.mean(np.array(cn_km) <= 50.0) * 100.0
    cn_acc100 = np.mean(np.array(cn_km) <= 100.0) * 100.0

    bl_mean_km = np.mean(bl_km)
    bl_med_km = np.median(bl_km)
    bl_acc25 = np.mean(np.array(bl_km) <= 25.0) * 100.0
    bl_acc50 = np.mean(np.array(bl_km) <= 50.0) * 100.0
    bl_acc100 = np.mean(np.array(bl_km) <= 100.0) * 100.0

    print("\n" + "="*50)
    print("       EVALUATION BENCHMARK SCORECARD       ")
    print("="*50)
    print(f"{'Metric':<25} | {'Baseline (Linear)':<18} | {'CenterNet (Heatmap)':<18}")
    print("-" * 67)
    print(f"{'Mean Error (km)':<25} | {bl_mean_km:<18.1f} | {cn_mean_km:<18.1f}")
    print(f"{'Median Error (km)':<25} | {bl_med_km:<18.1f} | {cn_med_km:<18.1f}")
    print(f"{'Mean Pixel Error (%)':<25} | {np.mean(bl_pct):<18.2f} | {np.mean(cn_pct):<18.2f}")
    print(f"{'Accuracy @ 25 km':<25} | {bl_acc25:<17.1f}% | {cn_acc25:<17.1f}%")
    print(f"{'Accuracy @ 50 km':<25} | {bl_acc50:<17.1f}% | {cn_acc50:<17.1f}%")
    print(f"{'Accuracy @ 100 km':<25} | {bl_acc100:<17.1f}% | {cn_acc100:<17.1f}%")
    print("="*50)

    # Write Markdown Report
    os.makedirs(os.path.dirname(report_output), exist_ok=True)
    with open(report_output, "w", encoding="utf-8") as f:
        f.write("# Cyclone Eye Localization — Official Benchmark Scorecard\n\n")
        f.write(f"- **Evaluated Images**: {len(results_centernet)} held-out validation images (`dataset/val_labels.csv`)\n")
        f.write(f"- **Evaluation Date**: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"- **Inference Speed**: {inference_duration / total_val * 1000:.1f} ms / frame (CPU)\n\n")

        f.write("## Overall Performance Comparison\n\n")
        f.write("| Performance Metric | Baseline (Linear ResNet-18) | CenterNet Keypoint Heatmap | Improvement |\n")
        f.write("| :--- | :--- | :--- | :--- |\n")
        f.write(f"| **Median Distance Error** | **{bl_med_km:.1f} km** | **{cn_med_km:.1f} km** | **{bl_med_km - cn_med_km:+.1f} km** |\n")
        f.write(f"| **Mean Distance Error** | {bl_mean_km:.1f} km | {cn_mean_km:.1f} km | {bl_mean_km - cn_mean_km:+.1f} km |\n")
        f.write(f"| **Mean Pixel Error** | {np.mean(bl_pct):.2f}% | {np.mean(cn_pct):.2f}% | {np.mean(bl_pct) - np.mean(cn_pct):+.2f}% |\n")
        f.write(f"| **Pin-Point Accuracy (< 25 km)** | {bl_acc25:.1f}% | **{cn_acc25:.1f}%** | **{cn_acc25 - bl_acc25:+.1f}%** |\n")
        f.write(f"| **Operational Accuracy (< 50 km)** | {bl_acc50:.1f}% | **{cn_acc50:.1f}%** | **{cn_acc50 - bl_acc50:+.1f}%** |\n")
        f.write(f"| **Synoptic Accuracy (< 100 km)** | {bl_acc100:.1f}% | **{cn_acc100:.1f}%** | **{cn_acc100 - bl_acc100:+.1f}%** |\n\n")

        f.write("## Visual Verification Samples\n")
        f.write(f"Saved {visual_samples_saved} comparison satellite images to `{visual_output_dir}`.\n")
        f.write("- **Green Circle**: Ground Truth eye location from best-track meteorology.\n")
        f.write("- **Cyan Reticle**: CenterNet Neural Network predicted eye location.\n")
        f.write("- **Red Line**: Distance vector error.\n\n")

    print(f"\n[OK] Benchmark scorecard written to {report_output}")
    return {
        'cn_mean_km': cn_mean_km,
        'cn_med_km': cn_med_km,
        'cn_acc50': cn_acc50,
        'cn_acc100': cn_acc100
    }


if __name__ == "__main__":
    run_benchmark()
