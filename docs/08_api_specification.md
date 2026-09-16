# 08 API Specification

**Base URL:** `/api/v1/cyclone`

---

## 1. Telemetry & Active Storm Endpoints

### `GET /active`
- **Description:** Returns a list of all currently active cyclones in the North Indian Ocean.
- **Response (200 OK):**
```json
{
  "activeCount": 1,
  "cyclones": [
    {
      "cycloneId": "cyc-2026-05b",
      "name": "FANI-II",
      "basin": "Bay of Bengal",
      "currentIntensity": "Very Severe Cyclonic Storm (VSCS)",
      "currentMSWKnots": 85.0,
      "currentPressureHpa": 972.0,
      "center": {
        "latitude": 15.42,
        "longitude": 86.18
      },
      "riAlert": true,
      "riProbability": 0.82,
      "lastUpdated": "2026-09-10T07:00:00Z"
    }
  ]
}
```

### `GET /{cycloneId}/telemetry`
- **Description:** Returns the complete historical observed track points and intensity curve for a specific storm.

---

## 2. AI Inference & Forecasting Endpoints

### `POST /{cycloneId}/forecast`
- **Description:** Triggers the full multi-spectral inference pipeline for a given satellite observation pass.
- **Request Body:**
```json
{
  "satellitePassTimestamp": "2026-09-10T07:00:00Z",
  "modelVersion": "v2.1"
}
```
- **Response (200 OK):**
```json
{
  "forecastRunId": "fc-99824a",
  "observedCenter": {
    "latitude": 15.42,
    "longitude": 86.18
  },
  "estimatedMSWKnots": 85.2,
  "estimatedCategory": "VSCS",
  "quadrantWindRadii": {
    "r34Knots": { "ne": 140, "nw": 110, "se": 130, "sw": 90 },
    "r50Knots": { "ne": 75, "nw": 60, "se": 70, "sw": 45 },
    "r64Knots": { "ne": 35, "nw": 30, "se": 30, "sw": 20 }
  },
  "predictions": [
    { "leadHours": 6, "lat": 16.10, "lon": 86.00, "mswKnots": 90.0, "category": "VSCS" },
    { "leadHours": 12, "lat": 16.85, "lon": 85.78, "mswKnots": 95.0, "category": "ESCS" },
    { "leadHours": 24, "lat": 18.30, "lon": 85.40, "mswKnots": 105.0, "category": "ESCS" },
    { "leadHours": 48, "lat": 20.10, "lon": 85.80, "mswKnots": 65.0, "category": "SCS (Landfall)" }
  ],
  "landfallEstimate": {
    "location": "Between Puri and Balasore, Odisha",
    "estimatedTimeWindow": "2026-09-11T08:00:00Z to 2026-09-11T12:00:00Z",
    "peakSurgeMeters": 3.4
  },
  "coneOfUncertaintyGeoJSON": {
    "type": "Feature",
    "geometry": {
      "type": "Polygon",
      "coordinates": [[[85.2, 15.4], [85.9, 17.1], [86.4, 20.5], [85.1, 20.3], [85.2, 15.4]]]
    }
  },
  "gradCamUrl": "/static/xai/gradcam_fc99824a.png"
}
```

---

## 3. Disaster Management & Bulletin Endpoints

### `GET /{cycloneId}/impact/districts`
- **Description:** Returns district-level population at risk, expected storm surge heights, and evacuation priority rankings computed via PostGIS.

### `POST /{cycloneId}/bulletin/pdf`
- **Description:** Generates and streams the official standardized IMD National Cyclone Warning Centre Advisory Bulletin PDF.

### `GET /{cycloneId}/alerts/multilingual`
- **Description:** Returns localized public broadcast alerts formatted in English, Hindi, Odia, Bengali, Tamil, and Telugu.
