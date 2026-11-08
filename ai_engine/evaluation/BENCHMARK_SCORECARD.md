# Cyclone Eye Localization — Official Benchmark Scorecard

- **Evaluated Images**: 841 held-out validation images (`dataset/val_labels.csv`)
- **Architecture**: CenterNet Dual-Path Dilated ASPP Keypoint Heatmap (ResNet-18 Backbone)
- **Training Supervision**: Morphology-Adaptive Gaussian Targets ($\sigma = 1.8$ to $4.5$) + Dynamic Translation Augmentation ($\pm 20\%$)
- **Evaluation Date**: 2026-11-08
- **Inference Speed**: ~85 ms / frame (CPU)

---

## Performance by Storm Intensity Tier

| Storm Intensity Tier | Validation Count | Median Error | Accuracy (< 50 km) | Accuracy (< 100 km) |
| :--- | :---: | :---: | :---: | :---: |
| **Intense Cyclones (VSCS/ESCS/SuCS, $\ge 64$ kts)** | 172 | **19.0 km** | **88.4%** | **97.7%** |
| **Severe Cyclones (SCS, 48–63 kts)** | 66 | **25.0 km** | **80.3%** | **87.9%** |
| **Cyclonic Storms (CS, 34–47 kts)** | 129 | **52.7 km** | **47.3%** | **80.6%** |
| **Depressions & Formative (< 34 kts, Premature/LLCC)** | 474 | **73.2 km** | **34.8%** | **68.1%** |
| **OVERALL (ALL 841 TEST PASSES)** | **841** | **48.3 km** | **51.2%** | **77.6%** |

---

## Comparison: Initial CenterNet vs. Adaptive ASPP CenterNet

| Performance Metric | Initial CenterNet (Fixed $\sigma = 1.8$) | Upgraded CenterNet (Adaptive $\sigma$ + ASPP) | Improvement |
| :--- | :---: | :---: | :---: |
| **Overall Median Distance Error** | 57.8 km | **48.3 km** | **-9.5 km error reduction** |
| **Synoptic Accuracy (< 100 km)** | 67.7% | **77.6%** | **+9.9% gain** |
| **Operational Accuracy (< 50 km)** | 44.7% | **51.2%** | **+6.5% gain** |
| **Intense Cyclones Accuracy (< 50 km)** | 84.9% | **88.4%** | **+3.5% gain (near 90%)** |
| **Severe Cyclones Accuracy (< 50 km)** | 78.8% | **80.3%** | **+1.5% gain** |
| **Depression Median Error** | 98.1 km | **73.2 km** | **-24.9 km error drop** |
