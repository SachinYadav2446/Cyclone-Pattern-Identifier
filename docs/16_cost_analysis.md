# 16 Cost Analysis

## MVP Cost Drivers

| Expense Category | Service & Specifications | Estimated Monthly Cost |
|---|---|---|
| **Compute & GPU Inference** | 1x Cloud GPU instance (NVIDIA T4 on-demand) for live inference, or $0 on local lab hardware / Kaggle / Google Colab for research training. | $\approx \$60\text{--}\$90\text{ / month}$ |
| **Object Storage** | 100GB S3 / MinIO storage for raw NetCDF rasters and generated Grad-CAM heatmap PNGs. | $\approx \$3\text{ / month}$ |
| **Managed Database** | PostgreSQL 16 with PostGIS 3.4 extensions. | $\approx \$15\text{ / month}$ |
| **Total Estimated Operating Cost** | Operational infrastructure during active monsoon forecasting periods. | **$\approx \$80\text{--}\$110\text{ / month}$** |

---

## Cost Optimization Strategies
- **Spot / Preemptible Instances:** Used during model training phases to reduce GPU costs by up to $70\%$.
- **ONNX Runtime Quantization:** Allows operational inference on cheaper general-purpose CPU instances without GPU lock-in.
- **Automated Lifecycle Rules:** Purges intermediate raw NetCDF cubes older than 14 days while archiving only storm-centered cropped tensors.
