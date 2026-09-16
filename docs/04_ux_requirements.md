# 04 UX Requirements

## Information Architecture

```
Satellite Ingestion Feed
  └─▶ Multi-Spectral Mapbox View (Thermal IR, Water Vapor, Visible Layers)
        ├─▶ Cyclone Tracking & Intensity Telemetry Panel
        ├─▶ Spatio-Temporal Landfall & Cone of Uncertainty Forecast
        ├─▶ Explainability & Historical Analog Diagnostics
        ├─▶ District Vulnerability & Evacuation Planner
        └─▶ Automated IMD Advisory Bulletin Exporter
```

---

## Screen-by-Screen UX Specifications

### 1. Operational GIS Command Map
- Full-screen interactive map (Mapbox GL JS) with smooth time-scrubbing across historical and forecast satellite frames.
- Toggleable multi-spectral raster layers (Thermal IR colorized enhancement, Water Vapor channel, Visible optical).
- Visual rendering of historical track (solid line with past storm points), predicted trajectory (dashed line), and dynamic 6h–48h Cone of Uncertainty polygon.
- Directional quadrant wind radii rings (34, 50, and 64 knots) rendered as semi-transparent hazard overlays.
- Animated Deck.gl wind vector particle layer representing surface flow.

### 2. Storm Telemetry & Intensity Sidebar
- Live gauge cards displaying: Current Intensity Category (e.g., Very Severe Cyclonic Storm), Maximum Sustained Wind Speed (knots / km/h), Central Pressure (hPa), and Current Movement Speed/Heading.
- Rapid Intensification Risk Barometer: Color-coded probability gauge (Low: Green, Moderate: Yellow, Severe: Red).

### 3. Diagnostics & "Doctor Mode" Drawer
- Side-by-side view of raw Infrared satellite image and Grad-CAM Thermal Attention Map.
- Historical Cyclone Analog Cards: Displays matching historical storms (e.g., "92% match with Cyclone Phailin (2013)") with comparative track overlays.

### 4. District Disaster Impact & Evacuation Matrix
- Table ranking coastal districts by vulnerability score based on population density, estimated storm surge (e.g., 2.5 to 3.5 meters), and predicted heavy rainfall.
- Direct download button for district-wise evacuation priority spreadsheets (CSV/Excel).

### 5. Bulletin Publisher Modal
- Instant preview of generated official IMD National Cyclone Warning Centre Bulletin (PDF).
- Language selector dropdown (English, Hindi, Odia, Bengali, Tamil, Telugu) with copy-to-clipboard public broadcast summary.

---

## Accessibility & Required States

- **Color Contrast:** High-contrast color palette adhering to official storm category colors:
  $$\text{Blue} \rightarrow \text{Green} \rightarrow \text{Yellow} \rightarrow \text{Orange} \rightarrow \text{Red} \rightarrow \text{Purple}$$
- **Loading States:** Progressive rendering during satellite tensor ingestion.
- **Offline Mode / Cache State:** Displaying the last verified operational advisory in case of network drops.
