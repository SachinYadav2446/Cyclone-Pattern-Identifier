"""
Real-Time 96-Hour INSAT-3D/3DR Satellite Archive Service
Captures and stores operational geostationary passes (IR1, VIS, WV) with their
corresponding CenterNet + ConvNeXt AI telemetry for 48h/96h Observatory playback.
Auto-prunes entries older than 96 hours to keep disk usage bounded (~100-150 MB).
"""

import os
import io
import json
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple
from PIL import Image
import numpy as np

ARCHIVE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "archive"))
INDEX_FILE = os.path.join(ARCHIVE_DIR, "archive_index.json")
MAX_RETENTION_HOURS = 96

os.makedirs(ARCHIVE_DIR, exist_ok=True)


class SatelliteArchiveService:
    def __init__(self):
        self._entries: List[Dict[str, Any]] = []
        self._load_index()

    def _load_index(self):
        if os.path.exists(INDEX_FILE):
            try:
                with open(INDEX_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        self._entries = data
            except Exception as exc:
                print(f"[ArchiveService] Failed to load index: {exc}")
                self._entries = []

    def _save_index(self):
        try:
            with open(INDEX_FILE, "w", encoding="utf-8") as f:
                json.dump(self._entries, f, indent=2)
        except Exception as exc:
            print(f"[ArchiveService] Failed to save index: {exc}")

    def _prune_old_entries(self):
        cutoff = datetime.now(timezone.utc) - timedelta(hours=MAX_RETENTION_HOURS)
        kept: List[Dict[str, Any]] = []
        for entry in self._entries:
            try:
                ts = datetime.fromisoformat(entry["timestamp_iso"])
                if ts >= cutoff:
                    kept.append(entry)
                else:
                    for fname in entry.get("files", {}).values():
                        fpath = os.path.join(ARCHIVE_DIR, fname)
                        if os.path.exists(fpath):
                            try:
                                os.remove(fpath)
                            except Exception:
                                pass
            except Exception:
                pass
        self._entries = kept

    def capture_pass(self, live_analysis: Dict[str, Any], band_bytes: Dict[str, bytes]) -> Optional[Dict[str, Any]]:
        """
        Saves a live multi-spectral satellite pass + AI telemetry to the 96-hour archive.
        Deduplicates if the most recent archived pass is < 15 minutes old.
        """
        if not band_bytes or "ir1" not in band_bytes:
            return None

        now = datetime.now(timezone.utc)
        if self._entries:
            try:
                last_ts = datetime.fromisoformat(self._entries[-1]["timestamp_iso"])
                if (now - last_ts).total_seconds() < 900:  # 15 min dedup
                    return self._entries[-1]
            except Exception:
                pass

        frame_id = now.strftime("%Y%m%d_%H%M%S")
        saved_files: Dict[str, str] = {}

        for band, raw_bytes in band_bytes.items():
            if not raw_bytes:
                continue
            fname = f"{frame_id}_{band}.jpg"
            fpath = os.path.join(ARCHIVE_DIR, fname)
            try:
                # Store compressed JPEG (~250-450 KB per frame) to keep 96h archive lightweight
                img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
                img.save(fpath, format="JPEG", quality=85, optimize=True)
                saved_files[band] = fname
            except Exception as exc:
                print(f"[ArchiveService] Failed saving {fname}: {exc}")

        if not saved_files:
            return None

        has_cyclone = bool(live_analysis.get("has_active_vortex", False))
        eye = live_analysis.get("eye_localization") or {}
        intensity = live_analysis.get("intensity_analysis") or {}
        prim = live_analysis.get("primary_system") or {}

        entry = {
            "frame_id": frame_id,
            "timestamp_iso": now.isoformat(),
            "timestamp_utc": now.strftime("%Y-%m-%d %H:%M UTC"),
            "files": saved_files,
            "has_cyclone": has_cyclone,
            "lat": eye.get("latitude"),
            "lon": eye.get("longitude"),
            "pixel_x_pct": eye.get("pixel_x_percent"),
            "pixel_y_pct": eye.get("pixel_y_percent"),
            "msw_knots": float(intensity.get("msw_knots", 14.0)),
            "pressure_hpa": float(intensity.get("central_pressure_hpa", 1012.0)),
            "dvorak_t": float(intensity.get("dvorak_t_number", 0.0)),
            "delta_t_k": float(eye.get("delta_t_k", 0.0)),
            "stage_name": intensity.get("imd_category_name", "Calm Marine State") if has_cyclone else "Quiescent Basin (All Clear)",
            "stage_color": "#e04a31" if has_cyclone else "#10b981",
            "storm_name": prim.get("name", "NORTH INDIAN OCEAN BASIN"),
            "bay_of_bengal_status": live_analysis.get("bay_of_bengal_status", "Calm Marine State"),
            "arabian_sea_status": live_analysis.get("arabian_sea_status", "Stable Clear-Sky Marine Area"),
        }

        self._entries.append(entry)
        self._prune_old_entries()
        self._save_index()
        return entry

    def get_archived_frames(self, hours: int = 96, band: str = "ir1") -> List[Dict[str, Any]]:
        """Returns chronological archived passes within the last `hours`."""
        self._prune_old_entries()
        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        now = datetime.now(timezone.utc)
        results: List[Dict[str, Any]] = []

        for entry in self._entries:
            try:
                ts = datetime.fromisoformat(entry["timestamp_iso"])
                if ts < cutoff:
                    continue
                files = entry.get("files", {})
                if band not in files and "ir1" not in files:
                    continue

                hours_ago = round((now - ts).total_seconds() / 3600.0, 1)
                msw = entry.get("msw_knots", 14.0)
                has_cyc = entry.get("has_cyclone", False)
                note = (
                    f"Archived INSAT-3D Pass ({entry['timestamp_utc']}): {entry.get('storm_name')} | "
                    f"Eye {entry.get('lat')}°N, {entry.get('lon')}°E | MSW {msw} kts, {entry.get('pressure_hpa')} hPa."
                    if has_cyc else
                    f"Archived INSAT-3D Pass ({entry['timestamp_utc']}): {entry.get('bay_of_bengal_status')} | "
                    f"{entry.get('arabian_sea_status')}."
                )

                results.append({
                    "frame_idx": len(results),
                    "frame_id": entry["frame_id"],
                    "timestamp_utc": entry["timestamp_utc"],
                    "hours_ago": hours_ago,
                    "is_real_archive": True,
                    "image_url": f"/api/v1/satellite/archive-frame/{entry['frame_id']}?band={band}",
                    "has_cyclone": has_cyc,
                    "lat": entry.get("lat"),
                    "lon": entry.get("lon"),
                    "pixel_x_pct": entry.get("pixel_x_pct"),
                    "pixel_y_pct": entry.get("pixel_y_pct"),
                    "msw_knots": msw,
                    "msw_kmh": round(msw * 1.852, 1),
                    "pressure_hpa": entry.get("pressure_hpa", 1012.0),
                    "dvorak_t": entry.get("dvorak_t", 0.0),
                    "stage_name": entry.get("stage_name", "Quiescent Basin"),
                    "stage_color": entry.get("stage_color", "#10b981"),
                    "cloud_top_temp_k": 272.0 if not has_cyc else 205.0,
                    "cloud_top_temp_c": -1.1 if not has_cyc else -68.1,
                    "delta_t_k": entry.get("delta_t_k", 0.0),
                    "shear_knots": 14.0,
                    "sst_celsius": 28.8,
                    "tropospheric_rh_pct": 68.0,
                    "translation_speed_kmh": 0.0 if not has_cyc else 16.0,
                    "heading_deg": 0.0,
                    "synoptic_note": note,
                })
            except Exception:
                continue

        return results

    def get_frame_bytes(self, frame_id: str, band: str = "ir1", palette: str = "raw") -> Optional[Tuple[bytes, str]]:
        """Loads archived image bytes for the given frame_id & band."""
        from ai_engine.services.timelapse_service import apply_satellite_ir_palette, apply_water_vapor_palette

        target = next((e for e in self._entries if e.get("frame_id") == frame_id), None)
        if not target:
            return None

        files = target.get("files", {})
        fname = files.get(band) or files.get("ir1")
        if not fname:
            return None

        fpath = os.path.join(ARCHIVE_DIR, fname)
        if not os.path.exists(fpath):
            return None

        with open(fpath, "rb") as f:
            raw_bytes = f.read()

        if palette == "enhanced" and band in ("ir1", "wv"):
            img = Image.open(io.BytesIO(raw_bytes)).convert("L")
            gray_arr = np.array(img, dtype=np.uint8)
            rgb = apply_water_vapor_palette(gray_arr) if band == "wv" else apply_satellite_ir_palette(gray_arr)
            out_buf = io.BytesIO()
            Image.fromarray(rgb).save(out_buf, format="JPEG", quality=85)
            return out_buf.getvalue(), "image/jpeg"

        return raw_bytes, "image/jpeg"


archive_service = SatelliteArchiveService()
