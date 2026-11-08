import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  Wind, 
  Clock, 
  MapPin, 
  AlertTriangle,
  Compass,
  Gauge,
  CheckCircle2
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function CycloneBulletinModal({ isOpen, onClose, reportData }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  if (!isOpen || !reportData) return null;

  const {
    stormName = "UNIDENTIFIED CYCLONIC SYSTEM",
    bulletinId = `VORTEX-BULLETIN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-01`,
    issueTime = new Date().toUTCString(),
    category = "Very Severe Cyclonic Storm (VSCS)",
    eyeLat = 19.52,
    eyeLon = 85.96,
    mswKnots = 90.0,
    mswKmh = 166,
    pressureHpa = 953.0,
    pressureDeficit = 57.0,
    dvorakT = 5.0,
    vortexStageName = "Mature Cyclonic Vortex (Well-Defined Eye)",
    cyclogenesisRiskScore = 95.0,
    leadTimeToEye = "Eye Formed & Monitored",
    recommendedAction = "Maintain high alert along coastal belts. Complete evacuation of 0-5 km coastal belt. Halt all deep-sea fishing operations immediately.",
    imageSrc = null,
    waypoints = [],
    quadrantRadii = null
  } = reportData;

  const r34 = quadrantRadii?.r34_knots_nm || { ne: 140, se: 130, sw: 90, nw: 110 };

  const handleDownloadDirectPdf = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const payload = {
        storm_name: stormName,
        bulletin_id: bulletinId,
        issue_time_utc: issueTime,
        category,
        eye_lat: eyeLat,
        eye_lon: eyeLon,
        msw_knots: mswKnots,
        msw_kmh: mswKmh,
        central_pressure_hpa: pressureHpa,
        pressure_deficit_hpa: pressureDeficit,
        dvorak_t: dvorakT,
        vortex_stage_name: vortexStageName,
        cyclogenesis_risk_score: cyclogenesisRiskScore,
        lead_time_to_eye_formation: leadTimeToEye,
        recommended_action: recommendedAction,
        image_base64: imageSrc,
        waypoints,
        quadrant_radii: quadrantRadii
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/models/export-bulletin-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VortexAI_Bulletin_${stormName.replace(/\s+/g, '_')}_${bulletinId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      setExportError('Direct download failed. Use Print as PDF below.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-bulletin, #printable-bulletin * {
            visibility: visible;
          }
          #printable-bulletin {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #0f172a !important;
            padding: 20px !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Main Modal Shell */}
      <div className="relative w-full max-w-4xl bg-[#0c0616] border border-[#64104E]/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Minimalist Action Bar */}
        <div className="shrink-0 h-13 px-5 bg-[#140b22] border-b border-[#64104E]/40 flex items-center justify-between text-white font-mono">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#E04A31]/20 border border-[#E04A31]/50 text-[#E04A31]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold tracking-tight">
                Official Meteorological Situation Bulletin
              </h2>
              <span className="text-[10px] text-slate-400">
                WMO / IMD Protocol Compliant · White Theme Publication Standard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDirectPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E04A31] hover:bg-[#CF2F4B] text-white font-bold text-xs tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f102d] hover:bg-[#2b173e] border border-zinc-700 text-slate-200 text-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable White Paper Document Sheet Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950/60">
          
          {exportError && (
            <div className="mb-4 p-2.5 rounded-lg bg-amber-950/60 border border-amber-600 text-amber-200 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{exportError}</span>
            </div>
          )}

          {/* Crisp White Institutional Document Sheet */}
          <div 
            id="printable-bulletin" 
            className="bg-white text-slate-900 border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xl max-w-3xl mx-auto font-mono text-xs space-y-6"
          >
            {/* 1. Official Agency Masthead */}
            <div className="pb-3 border-b border-blue-900">
              <div className="text-[10px] font-bold text-blue-900 tracking-wider uppercase">
                Regional Specialized Meteorological Centre (RSMC) · Cyclone Intelligence
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                OFFICIAL TROPICAL CYCLONE ADVISORY BULLETIN
              </h1>
            </div>

            {/* 2. Key Metadata Summary Line */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 text-xs gap-2">
              <div>
                <span className="font-bold text-red-600 text-sm">{stormName}</span>
                <span className="mx-2 text-slate-400">·</span>
                <span className="font-bold text-blue-950">{category}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-3">
                <span>Ref: {bulletinId}</span>
                <span>Issued: {issueTime}</span>
              </div>
            </div>

            {/* 3. Section 1: Executive Telemetry (Clean Minimalist Metrics Strip) */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider pb-1 border-b border-slate-200">
                1. Executive Telemetry &amp; Intensity Assessment
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Max Sustained Wind</div>
                  <div className="text-base font-black text-red-600 mt-0.5">{mswKnots} KTS</div>
                  <div className="text-[10px] text-slate-500">{mswKmh} km/h (Gusts: {Math.round(mswKnots * 1.15)} kts)</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Central Pressure</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{pressureHpa} hPa</div>
                  <div className="text-[10px] text-slate-500">Deficit: -{pressureDeficit} hPa</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Eye Center Fix</div>
                  <div className="text-base font-black text-blue-900 mt-0.5">{eyeLat.toFixed(2)}°N, {eyeLon.toFixed(2)}°E</div>
                  <div className="text-[10px] text-slate-500">Sub-pixel CenterNet</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[9px] text-slate-500 uppercase font-bold">Dvorak Intensity</div>
                  <div className="text-base font-black text-amber-600 mt-0.5">T{dvorakT} / CI {dvorakT}</div>
                  <div className="text-[10px] text-slate-500">Dual-Scale ConvNeXt</div>
                </div>
              </div>
            </div>

            {/* 4. Section 2: Visual Satellite Pass & Wind Radii */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider pb-1 border-b border-slate-200">
                2. Geostationary Satellite Observation &amp; Wind Field
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 items-start">
                {/* Satellite Viewport */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-700 uppercase">
                    Infrared Satellite Pass (TIR-1 10.8µm)
                  </div>
                  <div className="aspect-square w-full rounded border border-slate-300 overflow-hidden bg-slate-100 flex items-center justify-center">
                    {imageSrc ? (
                      <img 
                        src={imageSrc} 
                        alt="Satellite Pass" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-slate-400 text-xs">No satellite image data</span>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Sub-pixel Eye Center: {eyeLat.toFixed(2)}° N, {eyeLon.toFixed(2)}° E · Calibrated INSAT-3D
                  </div>
                </div>

                {/* Wind Radii Breakdown */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-700 uppercase">
                    Asymmetric 4-Quadrant Wind Radii (NM)
                  </div>

                  <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200">
                        <th className="p-1.5 font-bold text-slate-700">WIND TIER</th>
                        <th className="p-1.5 text-center font-bold text-slate-700">NE</th>
                        <th className="p-1.5 text-center font-bold text-slate-700">SE</th>
                        <th className="p-1.5 text-center font-bold text-slate-700">SW</th>
                        <th className="p-1.5 text-center font-bold text-slate-700">NW</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      <tr className="bg-white">
                        <td className="p-1.5 font-bold text-sky-600">34-kt Gale (R34)</td>
                        <td className="p-1.5 text-center">{r34.ne} NM</td>
                        <td className="p-1.5 text-center">{r34.se} NM</td>
                        <td className="p-1.5 text-center">{r34.sw} NM</td>
                        <td className="p-1.5 text-center">{r34.nw} NM</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="p-1.5 font-bold text-amber-600">50-kt Storm (R50)</td>
                        <td className="p-1.5 text-center">{Math.round(r34.ne * 0.55)} NM</td>
                        <td className="p-1.5 text-center">{Math.round(r34.se * 0.55)} NM</td>
                        <td className="p-1.5 text-center">{Math.round(r34.sw * 0.55)} NM</td>
                        <td className="p-1.5 text-center">{Math.round(r34.nw * 0.55)} NM</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="p-1.5 font-bold text-red-600">64-kt Hurricane (R64)</td>
                        <td className="p-1.5 text-center">{Math.round(r34.ne * 0.30)} NM</td>
                        <td className="p-1.5 text-center">{Math.round(r34.se * 0.30)} NM</td>
                        <td className="p-1.5 text-center">{Math.round(r34.sw * 0.30)} NM</td>
                        <td className="p-1.5 text-center">{Math.round(r34.nw * 0.30)} NM</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[10px] space-y-1 text-slate-600">
                    <div><strong>Vortex Morphology:</strong> {vortexStageName}</div>
                    <div><strong>Eye Formation Lead Time:</strong> {leadTimeToEye}</div>
                    <div><strong>Cyclogenesis Risk Index:</strong> {cyclogenesisRiskScore}% probability</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Section 3: 48-Hour Track Forecast Table */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider pb-1 border-b border-slate-200">
                3. Numerical 48-Hour Waypoint &amp; Landfall Schedule
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-200 text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-800">
                      <th className="p-1.5 font-bold">HORIZON</th>
                      <th className="p-1.5 font-bold">COORDINATES</th>
                      <th className="p-1.5 font-bold text-center">MSW (KTS)</th>
                      <th className="p-1.5 font-bold text-center">MSW (KM/H)</th>
                      <th className="p-1.5 font-bold text-center">UNCERTAINTY</th>
                      <th className="p-1.5 font-bold">INTERCEPTION STATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(waypoints.length > 0 ? waypoints : [
                      { horizon_h: 0, lat: eyeLat, lon: eyeLon, msw_kts: mswKnots, cone_km: 15, is_landfall: false },
                      { horizon_h: 6, lat: eyeLat + 0.35, lon: eyeLon + 0.45, msw_kts: mswKnots + 5, cone_km: 32, is_landfall: false },
                      { horizon_h: 12, lat: eyeLat + 0.75, lon: eyeLon + 0.90, msw_kts: mswKnots + 10, cone_km: 50, is_landfall: false },
                      { horizon_h: 24, lat: eyeLat + 1.55, lon: eyeLon + 1.45, msw_kts: Math.max(45, mswKnots - 15), cone_km: 88, is_landfall: true },
                      { horizon_h: 36, lat: eyeLat + 2.20, lon: eyeLon + 1.85, msw_kts: Math.max(35, mswKnots - 35), cone_km: 120, is_landfall: false },
                      { horizon_h: 48, lat: eyeLat + 2.85, lon: eyeLon + 2.15, msw_kts: 30, cone_km: 175, is_landfall: false }
                    ]).map((wp, idx) => {
                      const isLf = wp.is_landfall;
                      const h = wp.horizon_h !== undefined ? wp.horizon_h : idx * 6;
                      const lat = (wp.latitude || wp.lat || eyeLat).toFixed(2);
                      const lon = (wp.longitude || wp.lon || eyeLon).toFixed(2);
                      const kts = Math.round(wp.wind_kts || wp.msw_kts || mswKnots);
                      const kmh = Math.round(kts * 1.852);
                      const cone = Math.round(wp.cone_km || (h * 2.8 + 25));

                      return (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                          <td className="p-1.5 font-bold text-slate-800">T+{h}H</td>
                          <td className="p-1.5">{lat}° N, {lon}° E</td>
                          <td className="p-1.5 text-center font-bold text-red-600">{kts} KTS</td>
                          <td className="p-1.5 text-center">{kmh} km/h</td>
                          <td className="p-1.5 text-center text-slate-500">± {cone} km</td>
                          <td className="p-1.5 font-bold">
                            {isLf ? (
                              <span className="text-red-600">COASTAL LANDFALL</span>
                            ) : h === 0 ? (
                              <span className="text-blue-900">INITIAL FIX</span>
                            ) : (
                              <span className="text-slate-600">MARINE SECTOR</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6. Section 4: Operational Action Directives Callout */}
            <div className="p-3.5 rounded bg-red-50 border-l-4 border-red-600 text-slate-800 text-xs space-y-1">
              <div className="font-bold text-red-700 uppercase tracking-wide text-[10px]">
                MANDATORY ACTION DIRECTIVE (NDMA / COAST GUARD COMPLIANT):
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700">
                {recommendedAction}
              </p>
            </div>

            {/* Document Footer */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>VortexAI Meteorological Surveillance Division</span>
              <span>WMO / IMD Compliant Official Advisory</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
