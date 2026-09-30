# DeepCyclone Research & Training Notebooks

### 🚀 Primary Research Pipeline (Step 1 & Step 2)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/SachinYadav2446/Cyclone-Pattern-Identifier/blob/main/notebooks/DeepCyclone_Master_Pipeline.ipynb)

- **[`DeepCyclone_Master_Pipeline.ipynb`](DeepCyclone_Master_Pipeline.ipynb)**: **Streamlined research & training pipeline focused on Step 1 (Data Ingestion) and Step 2 (Eye Localization)**:
  1. **NOAA IBTrACS Ground Truth Foundation:** Ingests official North Indian Ocean dataset (`1990–2024`, 60,677 fixes), harmonizes wind observations (IMD 3-min conversion), applies official IMD classification, and creates temporal train/val/test splits.
  2. **Multi-Spectral Physics Calibration (Step 1):** Inverts Planck's radiation law ($DN \to \text{Radiance} \to \text{Kelvin}$) across 4 spectral bands (`TIR-1`, `TIR-2`, `WV`, `VIS`), loads real-world satellite passes, and constructs synchronized $(4, 512, 512)$ PyTorch tensors.
  3. **Sub-Pixel Eye Localization via CenterNet (Step 2):** Anchor-free 2D Gaussian keypoint heatmap regression + floating-point sub-pixel offset regression $(\delta y, \delta x)$, geostationary coordinate projection, Haversine error verification ($< 30\text{ km}$), 4-panel diagnostic visualization, and real cyclone inference.

---

### Focused Step Notebooks
- **[`01_ibtracs_data_pipeline.ipynb`](01_ibtracs_data_pipeline.ipynb)**: Standalone Step 1.1 ground truth data pipeline.
