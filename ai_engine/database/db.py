"""
VortexAI Persistent SQLite Database Engine.
Stores and indexes:
1. Multi-spectral satellite passes (IR1, VIS, WV) with verified AI telemetry.
2. 4D Satellite timelapse sequences and frame-by-frame metadata.
3. IMD 4-Stage Warning Bulletins and civil defense alerts.
4. Email notification subscribers.

Zero external dependencies - uses standard library `sqlite3` with WAL mode.
"""

import os
import sqlite3
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger("vortexai.database")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DB_DIR = os.path.join(BASE_DIR, "ai_engine", "data")
DB_PATH = os.path.join(DB_DIR, "vortexai.db")

os.makedirs(DB_DIR, exist_ok=True)


def get_connection() -> sqlite3.Connection:
    """Returns a thread-safe sqlite3 connection with WAL mode enabled."""
    conn = sqlite3.connect(DB_PATH, timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def init_db():
    """Initializes schema and tables if they do not exist."""
    with get_connection() as conn:
        cursor = conn.cursor()

        # 1. Satellite Passes
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS satellite_passes (
                pass_id TEXT PRIMARY KEY,
                timestamp_utc TEXT NOT NULL,
                channel TEXT NOT NULL,
                sensor TEXT NOT NULL,
                image_path TEXT,
                has_active_vortex INTEGER NOT NULL DEFAULT 0,
                storm_name TEXT,
                imd_category_name TEXT,
                imd_category_code TEXT,
                stage_color TEXT,
                msw_knots REAL,
                msw_kmh REAL,
                central_pressure_hpa REAL,
                dvorak_t REAL,
                eye_lat REAL,
                eye_lon REAL,
                pixel_x_pct REAL,
                pixel_y_pct REAL,
                cloud_top_temp_k REAL,
                core_delta_t_k REAL,
                synoptic_summary TEXT,
                created_at TEXT NOT NULL
            );
        """)

        # 2. Timelapse Sequences
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS timelapse_sequences (
                sequence_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                tab_label TEXT,
                storm_name TEXT NOT NULL,
                basin TEXT NOT NULL,
                sensor TEXT NOT NULL,
                primary_band TEXT NOT NULL,
                duration_hours INTEGER NOT NULL,
                cadence_minutes INTEGER NOT NULL,
                is_live INTEGER NOT NULL DEFAULT 0,
                total_frames INTEGER NOT NULL,
                default_speed_fps REAL NOT NULL DEFAULT 2.0,
                description TEXT,
                available_bands TEXT
            );
        """)

        # 3. Timelapse Frames
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS timelapse_frames (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sequence_id TEXT NOT NULL,
                frame_idx INTEGER NOT NULL,
                frame_id TEXT NOT NULL,
                timestamp_utc TEXT NOT NULL,
                hours_ago INTEGER NOT NULL DEFAULT 0,
                image_path TEXT,
                has_cyclone INTEGER NOT NULL DEFAULT 0,
                lat REAL,
                lon REAL,
                pixel_x_pct REAL,
                pixel_y_pct REAL,
                msw_knots REAL,
                msw_kmh REAL,
                pressure_hpa REAL,
                dvorak_t REAL,
                stage_name TEXT,
                stage_color TEXT,
                cloud_top_temp_k REAL,
                delta_t_k REAL,
                translation_speed_kmh REAL,
                heading_deg REAL,
                synoptic_note TEXT,
                UNIQUE(sequence_id, frame_idx),
                FOREIGN KEY(sequence_id) REFERENCES timelapse_sequences(sequence_id) ON DELETE CASCADE
            );
        """)

        # 4. IMD Warning Alerts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS imd_warning_alerts (
                alert_id TEXT PRIMARY KEY,
                timestamp_utc TEXT NOT NULL,
                stage_number INTEGER NOT NULL,
                stage_name TEXT NOT NULL,
                stage_code TEXT NOT NULL,
                stage_color TEXT NOT NULL,
                storm_name TEXT NOT NULL,
                threat_level TEXT NOT NULL,
                target_coast TEXT,
                distance_offshore_km REAL,
                countdown_seconds INTEGER,
                siren_activated INTEGER NOT NULL DEFAULT 0,
                bulletin_payload TEXT,
                created_at TEXT NOT NULL
            );
        """)

        # 5. Subscribers
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS subscribers (
                email TEXT PRIMARY KEY,
                name TEXT,
                category_threshold TEXT NOT NULL DEFAULT 'Cyclonic Storm (CS)',
                frequency TEXT NOT NULL DEFAULT 'daily',
                subscribed_at TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1
            );
        """)

        # Indexes for rapid retrieval
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_passes_time ON satellite_passes(timestamp_utc DESC);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_frames_seq ON timelapse_frames(sequence_id, frame_idx ASC);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_time ON imd_warning_alerts(timestamp_utc DESC);")
        conn.commit()

    logger.info("VortexAI SQLite database initialized at %s", DB_PATH)


# ---------------------------------------------------------------------------
# Database Access Helpers
# ---------------------------------------------------------------------------

def save_satellite_pass(pass_dict: Dict[str, Any]) -> str:
    """Inserts or updates a satellite pass in the database."""
    with get_connection() as conn:
        cursor = conn.cursor()
        now_str = datetime.now(timezone.utc).isoformat()
        pass_id = pass_dict.get("pass_id") or f"PASS-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M')}-{pass_dict.get('channel', 'ir1').upper()}"
        
        cursor.execute("""
            INSERT OR REPLACE INTO satellite_passes (
                pass_id, timestamp_utc, channel, sensor, image_path,
                has_active_vortex, storm_name, imd_category_name, imd_category_code,
                stage_color, msw_knots, msw_kmh, central_pressure_hpa, dvorak_t,
                eye_lat, eye_lon, pixel_x_pct, pixel_y_pct, cloud_top_temp_k,
                core_delta_t_k, synoptic_summary, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            pass_id,
            pass_dict.get("timestamp_utc", now_str),
            pass_dict.get("channel", "ir1"),
            pass_dict.get("sensor", "ISRO INSAT-3D/3DR (74.0°E Geostationary Downlink)"),
            pass_dict.get("image_path", ""),
            1 if pass_dict.get("has_active_vortex") else 0,
            pass_dict.get("storm_name", "INTER-MONSOON SECTOR"),
            pass_dict.get("imd_category_name", "Calm Marine State / Inter-Monsoon"),
            pass_dict.get("imd_category_code", "QUIESCENT"),
            pass_dict.get("stage_color", "#22c55e"),
            float(pass_dict.get("msw_knots") or 15.0),
            float(pass_dict.get("msw_kmh") or 27.8),
            float(pass_dict.get("central_pressure_hpa") or 1011.0),
            float(pass_dict.get("dvorak_t") or 0.0),
            float(pass_dict.get("eye_lat")) if pass_dict.get("eye_lat") is not None else None,
            float(pass_dict.get("eye_lon")) if pass_dict.get("eye_lon") is not None else None,
            float(pass_dict.get("pixel_x_pct")) if pass_dict.get("pixel_x_pct") is not None else None,
            float(pass_dict.get("pixel_y_pct")) if pass_dict.get("pixel_y_pct") is not None else None,
            float(pass_dict.get("cloud_top_temp_k") or 282.0),
            float(pass_dict.get("core_delta_t_k") or 0.0),
            pass_dict.get("synoptic_summary", "Nominal inter-monsoon baseline flow across South Asian sector."),
            now_str
        ))
        conn.commit()
        return pass_id


def get_latest_satellite_passes(limit: int = 12) -> List[Dict[str, Any]]:
    """Retrieves the most recent satellite passes."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM satellite_passes 
            ORDER BY timestamp_utc DESC 
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


def save_imd_warning_alert(alert_dict: Dict[str, Any]) -> str:
    """Logs an IMD 4-Stage early warning bulletin or civil defense alert."""
    with get_connection() as conn:
        cursor = conn.cursor()
        now_str = datetime.now(timezone.utc).isoformat()
        alert_id = alert_dict.get("alert_id") or f"ALERT-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
        payload = alert_dict.get("bulletin_payload")
        if isinstance(payload, (dict, list)):
            payload = json.dumps(payload)

        cursor.execute("""
            INSERT OR REPLACE INTO imd_warning_alerts (
                alert_id, timestamp_utc, stage_number, stage_name, stage_code,
                stage_color, storm_name, threat_level, target_coast,
                distance_offshore_km, countdown_seconds, siren_activated,
                bulletin_payload, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            alert_id,
            alert_dict.get("timestamp_utc", now_str),
            int(alert_dict.get("stage_number", 0)),
            alert_dict.get("stage_name", "STAGE 0: ALL CLEAR"),
            alert_dict.get("stage_code", "ALL_CLEAR"),
            alert_dict.get("stage_color", "#22c55e"),
            alert_dict.get("storm_name", "SOUTH ASIA BASIN"),
            alert_dict.get("threat_level", "NORMAL / NO CYCLONE"),
            alert_dict.get("target_coast", "North Indian Ocean Coasts"),
            float(alert_dict.get("distance_offshore_km") or 0.0),
            int(alert_dict.get("countdown_seconds") or 0),
            1 if alert_dict.get("siren_activated") else 0,
            payload,
            now_str
        ))
        conn.commit()
        return alert_id


def get_latest_imd_warning() -> Optional[Dict[str, Any]]:
    """Returns the most recent IMD warning alert logged."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM imd_warning_alerts 
            ORDER BY timestamp_utc DESC 
            LIMIT 1
        """)
        row = cursor.fetchone()
        if not row:
            return None
        res = dict(row)
        if res.get("bulletin_payload"):
            try:
                res["bulletin_payload"] = json.loads(res["bulletin_payload"])
            except Exception:
                pass
        return res


def save_subscriber(email: str, name: Optional[str] = None, threshold: str = "Cyclonic Storm (CS)", frequency: str = "daily") -> bool:
    """Adds or updates an email notification subscription."""
    with get_connection() as conn:
        cursor = conn.cursor()
        now_str = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
            INSERT OR REPLACE INTO subscribers (
                email, name, category_threshold, frequency, subscribed_at, is_active
            ) VALUES (?, ?, ?, ?, ?, 1)
        """, (email.strip().lower(), name or "", threshold, frequency, now_str))
        conn.commit()
        return True


def get_all_subscribers() -> List[Dict[str, Any]]:
    """Returns list of all active notification subscribers."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM subscribers WHERE is_active = 1 ORDER BY subscribed_at DESC")
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


def get_timelapse_sequences_from_db() -> List[Dict[str, Any]]:
    """Retrieves all sequence descriptors from the database."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM timelapse_sequences")
        rows = cursor.fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["id"] = d["sequence_id"]
            if d.get("available_bands"):
                try:
                    d["available_bands"] = json.loads(d["available_bands"])
                except Exception:
                    d["available_bands"] = ["ir1", "vis", "wv"]
            d["is_live"] = bool(d["is_live"])
            result.append(d)
        return result


def get_timelapse_frames_from_db(sequence_id: str) -> List[Dict[str, Any]]:
    """Retrieves all frame records for a sequence sorted by frame_idx."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM timelapse_frames 
            WHERE sequence_id = ? 
            ORDER BY frame_idx ASC
        """, (sequence_id,))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


def update_live_timelapse_frames_in_db(frames: List[Dict[str, Any]]):
    """Overwrites or synchronizes the live sequence frames in SQLite."""
    with get_connection() as conn:
        cursor = conn.cursor()
        for f in frames:
            cursor.execute("""
                INSERT OR REPLACE INTO timelapse_frames (
                    sequence_id, frame_idx, frame_id, timestamp_utc, hours_ago,
                    image_path, has_cyclone, lat, lon, pixel_x_pct, pixel_y_pct,
                    msw_knots, msw_kmh, pressure_hpa, dvorak_t, stage_name,
                    stage_color, cloud_top_temp_k, delta_t_k,
                    translation_speed_kmh, heading_deg, synoptic_note
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "live_insat",
                int(f["frame_idx"]),
                f.get("frame_id", f"live-insat-{f['frame_idx']}"),
                f.get("timestamp_utc", ""),
                int(f.get("hours_ago", 0)),
                f.get("image_path", ""),
                1 if f.get("has_cyclone") else 0,
                f.get("lat"),
                f.get("lon"),
                f.get("pixel_x_pct"),
                f.get("pixel_y_pct"),
                float(f.get("msw_knots", 15.0)),
                float(f.get("msw_kmh", 27.8)),
                float(f.get("pressure_hpa", 1010.0)),
                float(f.get("dvorak_t", 0.0)),
                f.get("stage_name", ""),
                f.get("stage_color", "#22c55e"),
                float(f.get("cloud_top_temp_k", 280.0)),
                float(f.get("delta_t_k", 0.0)),
                float(f.get("translation_speed_kmh", 15.0)),
                float(f.get("heading_deg", 0.0)),
                f.get("synoptic_note", "")
            ))
        conn.commit()


def seed_timelapse_sequences_if_empty(catalog: List[Dict[str, Any]], frames_by_seq: Dict[str, List[Dict[str, Any]]]):
    """Seeds sequence catalog and frame data into SQLite if not present."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) AS cnt FROM timelapse_sequences")
        cnt = cursor.fetchone()["cnt"]
        if cnt > 0:
            return

        for seq in catalog:
            cursor.execute("""
                INSERT OR REPLACE INTO timelapse_sequences (
                    sequence_id, title, tab_label, storm_name, basin, sensor, primary_band,
                    duration_hours, cadence_minutes, is_live, total_frames,
                    default_speed_fps, description, available_bands
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                seq["id"],
                seq["title"],
                seq.get("tab_label", seq["title"]),
                seq["storm_name"],
                seq["basin"],
                seq["sensor"],
                seq["primary_band"],
                int(seq["duration_hours"]),
                int(seq["cadence_minutes"]),
                1 if seq.get("is_live") else 0,
                int(seq["total_frames"]),
                float(seq.get("default_speed_fps", 2.0)),
                seq.get("description", ""),
                json.dumps(seq.get("available_bands", ["ir1", "vis", "wv"]))
            ))

            frames = frames_by_seq.get(seq["id"], [])
            for f in frames:
                cursor.execute("""
                    INSERT OR REPLACE INTO timelapse_frames (
                        sequence_id, frame_idx, frame_id, timestamp_utc, hours_ago,
                        image_path, has_cyclone, lat, lon, pixel_x_pct, pixel_y_pct,
                        msw_knots, msw_kmh, pressure_hpa, dvorak_t, stage_name,
                        stage_color, cloud_top_temp_k, delta_t_k,
                        translation_speed_kmh, heading_deg, synoptic_note
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    seq["id"],
                    int(f["frame_idx"]),
                    f.get("frame_id", f"{seq['id']}-{f['frame_idx']}"),
                    f.get("timestamp_utc", ""),
                    int(f.get("hours_ago", 0)),
                    f.get("image_path", ""),
                    1 if f.get("has_cyclone") else 0,
                    f.get("lat"),
                    f.get("lon"),
                    f.get("pixel_x_pct"),
                    f.get("pixel_y_pct"),
                    float(f.get("msw_knots", 15.0)),
                    float(f.get("msw_kmh", 27.8)),
                    float(f.get("pressure_hpa", 1010.0)),
                    float(f.get("dvorak_t", 0.0)),
                    f.get("stage_name", ""),
                    f.get("stage_color", "#22c55e"),
                    float(f.get("cloud_top_temp_k", 280.0)),
                    float(f.get("delta_t_k", 0.0)),
                    float(f.get("translation_speed_kmh", 15.0)),
                    float(f.get("heading_deg", 0.0)),
                    f.get("synoptic_note", "")
                ))
        conn.commit()


# Initialize tables upon module import
init_db()
