# DeepCyclone Research & Training Notebooks

### 🚀 Primary End-to-End Master Notebook
- **`DeepCyclone_Master_Pipeline.ipynb`**: Complete, unified end-to-end notebook for research, model training, and viva presentation. Covers raw data ingestion (NOAA IBTrACS), multi-spectral Planck calibration (`TIR1`, `TIR2`, `WV`, `VIS`), CenterNet eye localization, ConvNeXt intensity estimation with physics-informed loss, XGBoost Rapid Intensification (RI), Grad-CAM "Doctor Mode" explainability, and ONNX serialization for live deployment. Compatible with Google Colab (T4 GPU), Kaggle (P100), and local workstations.

---

### Legacy Experimental Step Notebooks
- `01_ibtracs_data_pipeline.ipynb`: Ground truth track data cleaning and IMD category mapping.
- `02_satellite_preprocessing_pipeline.ipynb`: Standalone satellite physics calibration tests.

