"""
Automated NOAA HURSAT-B1 Dataset Extractor & Labeling Pipeline
Extracts 65 downloaded storm archives from Downloads into clean 512x512 images + labels CSV.
Splits 80/20 strictly by storm name into dataset/train and dataset/val to avoid data leakage.
"""

import os
import glob
import tarfile
import tempfile
import csv
import random
import netCDF4
import cv2
import numpy as np

def categorize_storm(msw_kts: float) -> str:
    if msw_kts < 28.0:
        return "Depression (D)"
    elif msw_kts < 34.0:
        return "Deep Depression (DD)"
    elif msw_kts < 48.0:
        return "Cyclonic Storm (CS)"
    elif msw_kts < 64.0:
        return "Severe Cyclonic Storm (SCS)"
    elif msw_kts < 90.0:
        return "Very Severe Cyclonic Storm (VSCS)"
    elif msw_kts < 120.0:
        return "Extremely Severe Cyclonic Storm (ESCS)"
    else:
        return "Super Cyclonic Storm (SuCS)"

def process_hursat_dataset():
    dl_dir = os.path.expanduser(r"~\Downloads")
    base_out = os.path.join(os.getcwd(), "dataset")
    train_img_dir = os.path.join(base_out, "train", "images")
    val_img_dir = os.path.join(base_out, "val", "images")

    os.makedirs(train_img_dir, exist_ok=True)
    os.makedirs(val_img_dir, exist_ok=True)

    archives = sorted(glob.glob(os.path.join(dl_dir, "HURSAT_b1_v06_*.tar.gz")))
    print(f"Found {len(archives)} storm archives in {dl_dir}")

    # Deterministic split: 80% train storms, 20% validation storms
    random.seed(42)
    random.shuffle(archives)
    split_idx = int(len(archives) * 0.80)
    train_archives = set(archives[:split_idx])
    val_archives = set(archives[split_idx:])

    print(f"Split: {len(train_archives)} storms for Training, {len(val_archives)} storms for Validation.")

    all_rows = []
    train_rows = []
    val_rows = []

    total_images_processed = 0

    for arch_idx, arch_path in enumerate(archives, 1):
        arch_name = os.path.basename(arch_path)
        is_train = arch_path in train_archives
        split_name = "train" if is_train else "val"
        dest_dir = train_img_dir if is_train else val_img_dir

        # Extract storm name from filename e.g. HURSAT_b1_v06_2013281N12098_PHAILIN_c20170721.tar.gz
        parts = arch_name.split("_")
        storm_name = parts[4] if len(parts) > 4 else "CYCLONE"

        print(f"[{arch_idx}/{len(archives)}] Processing {storm_name} ({split_name})...", end="", flush=True)
        storm_count = 0

        try:
            with tarfile.open(arch_path, "r:gz") as tar:
                nc_members = [m for m in tar.getmembers() if m.name.endswith(".nc")]
                
                # To ensure high variety without duplicate overlapping passes from different satellites at the same hour,
                # sample every 2nd or 3rd pass if storm has > 60 passes
                step = 2 if len(nc_members) > 60 else 1
                selected_members = nc_members[::step]

                for m in selected_members:
                    f_bytes = tar.extractfile(m).read()
                    with tempfile.NamedTemporaryFile("wb", suffix=".nc", delete=False) as tf:
                        tf.write(f_bytes)
                        tmp_nc = tf.name

                    try:
                        ds = netCDF4.Dataset(tmp_nc, "r")
                        if "IRWIN" not in ds.variables:
                            ds.close()
                            os.remove(tmp_nc)
                            continue

                        ir_raw = ds.variables["IRWIN"][0].astype(np.float32)
                        
                        # Validate temperature grid (must have reasonable Kelvin temperatures > 160K)
                        valid_temps = ir_raw[ir_raw > 150.0]
                        if len(valid_temps) < 10000:
                            ds.close()
                            os.remove(tmp_nc)
                            continue

                        # Extract metadata
                        wind_kts = float(ds.variables["WindSpd"][0]) if "WindSpd" in ds.variables else 45.0
                        pres_hpa = float(ds.variables["CentPrs"][0]) if "CentPrs" in ds.variables else 990.0
                        lat = float(ds.variables["CentLat"][0]) if "CentLat" in ds.variables else 15.0
                        lon = float(ds.variables["CentLon"][0]) if "CentLon" in ds.variables else 85.0
                        
                        # Check ARCHER objective eye if available
                        eye_x_pct = 50.0
                        eye_y_pct = 50.0
                        if "archer_lat" in ds.variables and "archer_lon" in ds.variables:
                            a_lat = float(ds.variables["archer_lat"][0])
                            a_lon = float(ds.variables["archer_lon"][0])
                            if a_lat > -90.0 and a_lon > -900.0:
                                # Grid resolution is approx 0.07 degrees per pixel (~8 km)
                                d_lon_px = (a_lon - lon) / 0.07
                                d_lat_px = -(a_lat - lat) / 0.07
                                eye_x_pct = round(float(np.clip(50.0 + (d_lon_px / 301.0) * 100.0, 10.0, 90.0)), 2)
                                eye_y_pct = round(float(np.clip(50.0 + (d_lat_px / 301.0) * 100.0, 10.0, 90.0)), 2)

                        # Clean meteorological normalization:
                        # 180K (extreme cold cloud top, -93C) -> 255 (Bright White)
                        # 310K (warm ocean/land surface, +37C) -> 0 (Dark)
                        ir_norm = np.clip((310.0 - ir_raw) / (310.0 - 180.0) * 255.0, 0.0, 255.0).astype(np.uint8)
                        
                        # Resize to standard 512x512
                        img512 = cv2.resize(ir_norm, (512, 512), interpolation=cv2.INTER_CUBIC)

                        # Filename format: PHAILIN_20131007_1200.png
                        base_fname = os.path.basename(m.name).replace(".hursat-b1.v06.nc", "").replace(".nc", "")
                        out_filename = f"{storm_name}_{base_fname}.png"
                        out_filepath = os.path.join(dest_dir, out_filename)

                        cv2.imwrite(out_filepath, img512)

                        category = categorize_storm(wind_kts)

                        rel_path = os.path.join("train" if is_train else "val", "images", out_filename)
                        row = {
                            "filename": out_filename,
                            "relative_path": rel_path,
                            "split": split_name,
                            "storm_name": storm_name,
                            "eye_x_percent": eye_x_pct,
                            "eye_y_percent": eye_y_pct,
                            "latitude": round(lat, 2),
                            "longitude": round(lon, 2),
                            "wind_knots": round(wind_kts, 1),
                            "pressure_hpa": round(pres_hpa, 1),
                            "category": category
                        }

                        all_rows.append(row)
                        if is_train:
                            train_rows.append(row)
                        else:
                            val_rows.append(row)

                        storm_count += 1
                        total_images_processed += 1

                        ds.close()
                    except Exception:
                        pass
                    finally:
                        if os.path.exists(tmp_nc):
                            try:
                                os.remove(tmp_nc)
                            except Exception:
                                pass
        except Exception as e:
            print(f" [Archive error: {e}]")
            continue

        print(f" {storm_count} images extracted.")

    print(f"\nExtraction complete! Total images created: {total_images_processed}")
    print(f"Train images: {len(train_rows)}")
    print(f"Validation images: {len(val_rows)}")

    fieldnames = [
        "filename", "relative_path", "split", "storm_name",
        "eye_x_percent", "eye_y_percent", "latitude", "longitude",
        "wind_knots", "pressure_hpa", "category"
    ]

    # Save CSV files
    for filename, rows in [
        ("dataset_labels.csv", all_rows),
        ("train_labels.csv", train_rows),
        ("val_labels.csv", val_rows)
    ]:
        p = os.path.join(base_out, filename)
        with open(p, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        print(f"Saved: {p} ({len(rows)} records)")

if __name__ == "__main__":
    process_hursat_dataset()
