# DeepCyclone Research & Training Notebooks

### 🚀 Primary Master Research & Training Pipeline (All Modules)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/SachinYadav2446/Cyclone-Pattern-Identifier/blob/main/notebooks/DeepCyclone_Master_Pipeline.ipynb)

- **[`DeepCyclone_Master_Pipeline.ipynb`](DeepCyclone_Master_Pipeline.ipynb)**: **Complete, end-to-end master research & training pipeline** covering all operational modules:
  1. **NOAA IBTrACS Ground Truth Foundation:** Ingests official North Indian Ocean dataset (`1990–2024`, 60,677 fixes), harmonizes wind observations (IMD 3-min conversion), applies official IMD classification, and creates temporal train/val/test splits.
  2. **Multi-Spectral Physics Calibration (Step 1):** Inverts Planck's radiation law ($DN \to \text{Radiance} \to \text{Kelvin}$) across 4 spectral bands (`TIR-1`, `TIR-2`, `WV`, `VIS`), loads real-world satellite passes, and constructs synchronized $(4, 512, 512)$ PyTorch tensors.
  3. **Sub-Pixel Eye Localization via CenterNet (Step 2):** Anchor-free 2D Gaussian keypoint heatmap regression + floating-point sub-pixel offset regression $(\delta y, \delta x)$, geostationary coordinate projection, Haversine error verification ($< 30\text{ km}$), and 4-panel diagnostic visualization.
  4. **Deep Dvorak Intensity Estimation (ConvNeXt-V2):** Multi-spectral convolutional network with physics-informed eyewall loss regressing wind speed (knots & km/h) and central pressure deficit (hPa).
  5. **Rapid Intensification (RI) Warning (XGBoost):** Gradient-boosted risk classifier trained on Sea Surface Temperature (SST) and Vertical Wind Shear for sudden $\ge 30\text{ kts}$ wind surges in 24 hours.
  6. **Spatio-Temporal Trajectory Forecaster (ConvLSTM):** Recurrent spatio-temporal dynamics model predicting $+6\text{h}, +12\text{h}, +24\text{h}, +48\text{h}$ track coordinates with dynamic expanding Cones of Uncertainty.
  7. **Explainable AI "Doctor Mode" (Grad-CAM):** Convective eyewall attention gradient audit verifying thermodynamic feature grounding.
  8. **NOAA Gold-Standard Benchmarking & Export:** Performance scorecard verification against official WMO/IMD targets and model serialization (`weights/deepcyclone_weights.pt`).
  9. **Live Operational Satellite Ingestion & End-to-End Inference:** Live multi-channel INSAT-3D/3DR geostationary pass downlink with automated multi-model inference and official signed advisory bulletin publishing.

---

### Focused Step Notebooks
- **[`01_ibtracs_data_pipeline.ipynb`](01_ibtracs_data_pipeline.ipynb)**: Standalone Step 1 ground truth data pipeline.
- **[`02_eye_localization_centernet.ipynb`](02_eye_localization_centernet.ipynb)**: Standalone Stage 01 sub-pixel CenterNet keypoint & multi-scale log-spiral eye localization.
- **[`03_deep_dvorak_intensity_convnext.ipynb`](03_deep_dvorak_intensity_convnext.ipynb)**: Standalone Stage 02 Deep Dvorak ConvNeXt-V2 intensity regression & automated IMD classification.
