# VortexAI Cyclone Showcase & Live Demonstration Guide

This directory contains curated satellite imagery across the full tropical cyclone lifecycle, specifically prepared for live demonstrations, examiner reviews, and academic presentations.

---

## 📁 01_Mature_Cyclones_With_Eyes (8 Samples · 90 to 146 kts)
**Storms**: Cyclone Fani (ESCS), Super Cyclone Amphan (SuCS), Cyclone Biparjoy (VSCS), Cyclone Phailin (ESCS), Super Cyclone Nepartak, Cyclone Chapala, Cyclone Bansi, Cyclone Winston (Cat 5).
* **Characteristics**: Intense tropical vortices with well-defined, open circular eyewalls and compact pinhole eyes.
* **Demonstration Goal**: 
  - Upload to **Interactive Demo Workbench**.
  - Show **CenterNet Sub-Pixel Localization** pinpointing the exact geometrical and thermal center of the eye ($< 8.7\text{ km}$ Haversine error).
  - Show **Atkinson-Holliday physical regression** predicting peak sustained wind ($115–146\text{ kts}$) and extreme low central pressure ($900–935\text{ hPa}$).
  - Click **Download Official Bulletin (PDF)** to generate the 2-page publication-grade report.

---

## 📁 02_Building_Now_Formative_Depressions (6 Samples · 20 to 22 kts)
**Storms**: Formative Depressions & Deep Depressions (TWENTYSIX, Cristina, Rick, Chedza, Four, Chaba).
* **Characteristics**: Active convective thunderstorms coiling into an early log-spiral whirlpool. **No open circular eye hole exists yet** (buried under dense Central Dense Overcast - CDO).
* **Demonstration Goal**: 
  - Key differentiator against conventional models (like YOLO or circular Hough transforms) which fail when no eye hole is visible.
  - Show how vortexAI identifies the **Low-Level Circulation Center (LLCC)** / Virtual Rotation Axis using **Log-Spiral Streamline Convergence** 24–48 hours before an open eye cavity opens.

---

## 📁 03_Asymmetric_Sheared_Storms (6 Samples · 48 to 50 kts)
**Storms**: Cristina, Chedza, Chaba, Nida, Amos, Bansi under vertical atmospheric wind shear.
* **Characteristics**: Distorted cloud shields, ragged eyewalls, and elongated convective bands.
* **Demonstration Goal**: 
  - Demonstrates model robustness against chaotic atmospheric conditions, dry air intrusions, and vertical wind shear.

---

## 📁 04_Calm_Ocean_Baseline_AllClear (3 Multi-Spectral Channels)
**Channels**: TIR-1 (Thermal Infrared 10.8 µm), VIS (Visible Channel), WV (Water Vapor Channel).
* **Characteristics**: Clear ocean background with nominal fair-weather clouds.
* **Demonstration Goal**: 
  - Demonstrates the **3-Tier Out-of-Distribution (OOD) Gatekeeper**.
  - Proves the system outputs **"Quiescent Marine Baseline / All Clear (0 Vortices)"** with **0% false alarms** on calm ocean water.
