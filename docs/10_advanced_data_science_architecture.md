# 10 Advanced Data Science Architecture

## Problem Formulation

Three linked computer vision and spatio-temporal deep learning problems:

1. **Multi-Channel Keypoint Estimation:** Pinpointing the exact circulation center $(x, y) \rightarrow (\text{Latitude}, \text{Longitude})$ from multi-spectral satellite imagery.
2. **Deep Dvorak Feature Learning:** Measuring multi-spectral thermal gradients (difference between the warm eye and freezing cloud tops) to predict Maximum Sustained Wind Speed (knots) and IMD category stages.
3. **Spatio-Temporal Sequence Forecasting:** Learning kinematic motion from satellite sequences over the past 18 hours to project future landfall tracks.

---

## Dataset Design & Stratification

- **Primary Imagery:** Multi-spectral radiance scans (1990–2024), sampled at 15–30 minute intervals over the North Indian Ocean ($0^\circ\text{N} - 30^\circ\text{N}$, $50^\circ\text{E} - 100^\circ\text{E}$).
- **Ground Truth Labels:** NOAA IBTrACS v04 (Interpolated 3-hourly Best Track fixes for storm centers, sustained wind speed, central pressure, and landfall locations).
- **Train / Val / Test Split:** Storm-Independent Temporal Split to avoid data leakage:
  - **Training:** 1990–2018 (e.g., Super Cyclone 1999, Phailin 2013, Hudhud 2014).
  - **Validation:** 2019–2021 (e.g., Fani 2019, Amphan 2020, Tauktae 2021).
  - **Test:** 2022–2024 (e.g., Biparjoy 2023, Michaung 2023, Remal 2024).

---

## Deep Learning Model Mechanics

### 1. Deep Dvorak Multi-Channel Network (ConvNeXt-V2)
The input tensor stacks four channels:
- **Channel 1 (Thermal Infrared 1):** Measures cold convective cloud tops and warm eye temperature.
- **Channel 2 (Thermal Infrared 2):** Corrects for atmospheric moisture and dust.
- **Channel 3 (Water Vapor):** Captures high-altitude atmospheric swirling and steering wind flow.
- **Channel 4 (Visible):** Captures high-resolution daylight cloud texture and shadow.

The network uses convolutional filters to measure the temperature difference between the eye and the surrounding cloud ring, passing features to two heads:
- **Regression Head:** Predicts continuous wind speed (knots) and central pressure (hPa).
- **Classification Head:** Assigns the official IMD category.

### 2. Spatio-Temporal ConvLSTM Formulation
ConvLSTM replaces standard flat matrix multiplications in recurrent networks with convolutional operations. This allows the model to learn both the spatial distribution of rotating cloud bands and the direction in which atmospheric steering currents are pushing the entire storm over time.

### 3. Explainability via Grad-CAM
Grad-CAM calculates the importance of each feature map in the final convolutional layer with respect to the predicted intensity. It produces a 2D red/yellow heatmap proving the model focused on the cold eyewall and warm central eye rather than background ocean noise.
