# 21 Model Card

## CycloneAI Deep Dvorak & Spatio-Temporal Forecasting Pipeline

### Model Details
- **Architecture:** Multi-stage deep learning pipeline:
  1. **CenterNet Keypoint Locator:** Anchor-free center detection with sub-pixel offset regression.
  2. **ConvNeXt-V2 Multi-Spectral Intensity Network:** 4-channel input (`TIR-1, TIR-2, WV, VIS`) with auxiliary central pressure regression.
  3. **ConvLSTM Spatio-Temporal Network:** Recurrent sequence model consuming 4 historical frames ($T_{-18\text{h}} \to T_{0}$) to project $+6\text{h}, +12\text{h}, +24\text{h}, +48\text{h}$ coordinates.
  4. **XGBoost Rapid Intensification Classifier:** Tabular gradient booster evaluating satellite thermal features, SST, and vertical wind shear.

---

### Intended Use
- Operational meteorological decision support.
- Disaster management pre-evacuation planning (NDRF / SDMAs).
- Port safety and commercial maritime danger zone enforcement.

---

### Evaluation Benchmarks & Metrics
- **Intensity Estimation:** Wind speed MAE $< 7.5\text{ knots}$ ($< 0.5$ Dvorak T-number step).
- **24-Hour Track Forecast:** Mean Absolute Track Error (MATE) $< 110\text{ km}$ across North Indian Ocean test storms.
- **Center Localization:** Mean distance error $< 28\text{ km}$ against IBTrACS ground truth.
- **Rapid Intensification (RI):** F1-score $\ge 0.75$ on sudden intensification events ($\ge 30\text{ knots}$ in 24h).
