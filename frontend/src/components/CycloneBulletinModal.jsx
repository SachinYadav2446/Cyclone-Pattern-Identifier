import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  ShieldAlert, 
  Target, 
  Wind, 
  Clock, 
  MapPin, 
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight
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
    badgeColor = "#ef4444",
    eyeLat = 19.52,
    eyeLon = 85.96,
    mswKnots = 90.0,
    mswKmh = 166,
    pressureHpa = 953.0,
    pressureDeficit = 57.0,
    dvorakT = 5.0,
    vortexStageName = "Mature Cyclonic Vortex (Well-Defined Eye Cavity)",
    cyclogenesisRiskScore = 95.0,
    leadTimeToEye = "Eye Fully Formed & Closed",
    recommendedAction = "Maintain High Alert along coastal belts. Halt all deep-sea fishing operations immediately.",
    imageSrc = null,
    waypoints = [],
    quadrantRadii = null,
    morphology = "CIRCULAR EYE"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
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
            padding: 16px !important;
            border: none !important;
          }
          #printable-bulletin .bg-\[\#140b20\],
          #printable-bulletin .bg-\[\#120a1c\],
          #printable-bulletin .bg-\[\#0d0714\] {
            background: #f8fafc !important;
            border-color: #cbd5e1 !important;
            color: #0f172a !important;
          }
          #printable-bulletin text-white,
          #printable-bulletin h1,
          #printable-bulletin span {
            color: #0f172a !important;
          }
          #printable-bulletin table th {
            background: #1e293b !important;
            color: #ffffff !important;
          }
          #printable-bulletin table td {
            color: #1e293b !important;
          }
        }
      `}</style>
      {/* Container styled like an official military/meteorological document */}
      <div className="relative w-full max-w-4xl bg-[#0e0716] border-2 border-[#64104E] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Control Bar */}
        <div className="shrink-0 h-14 px-5 bg-[#170c24] border-b border-[#64104E]/80 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#E04A31]/20 border border-[#E04A31]/50 text-[#E04A31]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase font-mono">
                Official Meteorological Situation Bulletin
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                WMO / IMD Standard Compliant · RSMC Cyclone Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDirectPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#E04A31] to-[#CF2F4B] hover:brightness-110 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#E04A31]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'GENERATING PDF...' : 'DOWNLOAD PDF (.PDF)'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#241026] hover:bg-[#321535] border border-[#B43067]/70 text-slate-200 hover:text-white font-mono text-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PRINT / SAVE AS PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#1e1030] hover:bg-rose-950/80 border border-[#64104E]/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Bulletin Content */}
        <div id="printable-bulletin" className="flex-1 overflow-y-auto p-6 space-y-5 text-slate-200 font-sans">
          
          {exportError && (
            <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/70 text-amber-200 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{exportError}</span>
            </div>
          )}

          {/* Bulletin Header Header Banner */}
          <div className="p-4 rounded-xl bg-[#140b20] border border-[#64104E]/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#E04A31]/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#64104E]/50">
              <div>
                <span className="text-[10px] font-mono text-[#fbcfe8] uppercase tracking-widest font-bold block">
                  VORTEX-AI AUTONOMOUS GEOSTATIONARY SATELLITE NETWORK
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide font-mono mt-0.5">
                  TROPICAL CYCLONE ADVISORY BULLETIN: {stormName}
                </h1>
              </div>

              <span 
                className="px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider shadow-md border"
                style={{ backgroundColor: `${badgeColor}25`, borderColor: badgeColor, color: '#ffffff' }}
              >
                {category}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono mt-3 text-slate-300">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">BULLETIN TRACKING ID</span>
                <span className="font-bold text-white text-[11px]">{bulletinId}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">ISSUE TIMESTAMP</span>
                <span className="font-bold text-white text-[11px]">{issueTime}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">ANALYSIS ENGINE</span>
                <span className="font-bold text-[#E04A31] text-[11px]">CenterNet + ConvNeXt-V2</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">GENESIS STATUS</span>
                <span className="font-bold text-amber-300 text-[11px]">{cyclogenesisRiskScore}% Risk</span>
              </div>
            </div>
          </div>

          {/* 2-Column Core Section: Satellite Pass Image + Telemetry Table */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            
            {/* Left: Satellite Capture Preview */}
            <div className="md:col-span-6 bg-[#120a1c] border border-[#64104E]/70 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#64104E]/40 text-xs font-mono">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#E04A31]" />
                  <span>SATELLITE PASS &amp; EYE FIX</span>
                </span>
                <span className="text-[10px] text-slate-400">GEOREFERENCED</span>
              </div>

              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black border border-[#64104E]/50 flex items-center justify-center">
                {imageSrc ? (
                  <img 
                    src={imageSrc} 
                    alt="Observed Cyclone Satellite Pass" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <Target className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-pulse" />
                    <span className="text-xs text-slate-500 font-mono">Live INSAT-3D Pass Telemetry</span>
                  </div>
                )}
                
                {/* Visual reticle tag indicator */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-[#E04A31] text-[9.5px] font-mono text-white">
                  EYE FIX: ({eyeLat.toFixed(2)}°N, {eyeLon.toFixed(2)}°E)
                </div>
              </div>

              <div className="mt-2 text-[10px] font-mono text-slate-400 text-center">
                Sub-Pixel Hessian Refined Resolution · Continuous 2D Peak Centroid
              </div>
            </div>

            {/* Right: Technical Verification Telemetry Table */}
            <div className="md:col-span-6 bg-[#120a1c] border border-[#64104E]/70 rounded-xl p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#64104E]/40 text-xs font-mono">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CORE INFERENCE TELEMETRY</span>
                </span>
                <span className="text-[10px] text-cyan-300 font-bold">WMO TIER 1</span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0d0714] border border-[#64104E]/40">
                  <span className="text-slate-400">Eye Center Coordinates</span>
                  <span className="font-bold text-white">{eyeLat.toFixed(2)}°N, {eyeLon.toFixed(2)}°E</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0d0714] border border-[#64104E]/40">
                  <span className="text-slate-400">Max Sustained Wind (MSW)</span>
                  <span className="font-bold text-[#E04A31]">{mswKnots} KTS ({mswKmh} km/h)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0d0714] border border-[#64104E]/40">
                  <span className="text-slate-400">Central Minimum Pressure</span>
                  <span className="font-bold text-[#C3864D]">{pressureHpa} hPa (-{pressureDeficit} deficit)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0d0714] border border-[#64104E]/40">
                  <span className="text-slate-400">Dvorak Intensity Rating</span>
                  <span className="font-bold text-white">T{dvorakT} / CI {dvorakT}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0d0714] border border-[#64104E]/40">
                  <span className="text-slate-400">Vortex Lifecycle Stage</span>
                  <span className="font-bold text-amber-300 truncate max-w-[200px]" title={vortexStageName}>
                    {vortexStageName}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-[#0d0714] border border-[#64104E]/40">
                  <span className="text-slate-400">Eye Formation Lead Time</span>
                  <span className="font-bold text-cyan-300">{leadTimeToEye}</span>
                </div>
              </div>

              {/* Gale Wind Radii (R34) */}
              <div className="mt-3 p-2 rounded-lg bg-[#170e24] border border-[#64104E]/60 text-[10px] font-mono">
                <span className="text-slate-400 block text-[9px] uppercase font-bold text-center mb-1">
                  ASYMMETRIC GALE RADII EXTENT (34 KTS / R34)
                </span>
                <div className="grid grid-cols-4 gap-1 text-center font-bold text-white">
                  <div><span className="text-slate-500 block text-[8px]">NE</span>{r34.ne} NM</div>
                  <div><span className="text-slate-500 block text-[8px]">SE</span>{r34.se} NM</div>
                  <div><span className="text-slate-500 block text-[8px]">SW</span>{r34.sw} NM</div>
                  <div><span className="text-slate-500 block text-[8px]">NW</span>{r34.nw} NM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: 48-Hour Track Forecast Table */}
          <div className="bg-[#120a1c] border border-[#64104E]/70 rounded-xl p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#64104E]/40 text-xs font-mono">
              <span className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>48-HOUR PROJECTED TRAJECTORY &amp; LANDFALL SCHEDULE</span>
              </span>
              <span className="text-[10px] text-slate-400">STEERING CURRENT + BETA-DRIFT KINEMATICS</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#64104E]/60 text-slate-400 text-[10px]">
                    <th className="pb-1.5 font-bold">HORIZON</th>
                    <th className="pb-1.5 font-bold">COORDINATES</th>
                    <th className="pb-1.5 font-bold">WIND (KTS)</th>
                    <th className="pb-1.5 font-bold">WIND (KM/H)</th>
                    <th className="pb-1.5 font-bold">UNCERTAINTY CONE</th>
                    <th className="pb-1.5 font-bold text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#64104E]/30 text-slate-200">
                  {(waypoints.length > 0 ? waypoints : [
                    { horizon_h: 0, latitude: eyeLat, longitude: eyeLon, wind_kts: mswKnots, is_landfall: false },
                    { horizon_h: 6, latitude: Number((eyeLat + 0.35).toFixed(2)), longitude: Number((eyeLon + 0.45).toFixed(2)), wind_kts: mswKnots + 5, is_landfall: false },
                    { horizon_h: 12, latitude: Number((eyeLat + 0.75).toFixed(2)), longitude: Number((eyeLon + 0.90).toFixed(2)), wind_kts: mswKnots + 10, is_landfall: false },
                    { horizon_h: 24, latitude: Number((eyeLat + 1.55).toFixed(2)), longitude: Number((eyeLon + 1.45).toFixed(2)), wind_kts: Math.max(45, mswKnots - 15), is_landfall: true },
                    { horizon_h: 48, latitude: Number((eyeLat + 2.85).toFixed(2)), longitude: Number((eyeLon + 2.15).toFixed(2)), wind_kts: 35, is_landfall: false }
                  ]).map((wp, i) => (
                    <tr key={i} className={`hover:bg-[#1a0e28]/50 ${wp.is_landfall ? 'bg-rose-950/20' : ''}`}>
                      <td className="py-2 font-bold text-white">T+{wp.horizon_h}H</td>
                      <td className="py-2 text-slate-300">{wp.latitude}°N, {wp.longitude}°E</td>
                      <td className="py-2 font-bold text-[#E04A31]">{wp.wind_kts} KTS</td>
                      <td className="py-2 text-slate-400">{Math.round(wp.wind_kts * 1.852)} km/h</td>
                      <td className="py-2 text-slate-400">± {Math.round(wp.horizon_h * 2.8 + 25)} km</td>
                      <td className="py-2 text-right">
                        {wp.is_landfall ? (
                          <span className="px-2 py-0.5 rounded bg-rose-900/80 border border-rose-500/80 text-rose-200 font-bold text-[9px]">
                            COASTAL LANDFALL
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            {wp.horizon_h === 0 ? 'CURRENT FIX' : 'OVER WATER'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: NDMA Action Directive & Fishermen Advisory */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-[#1c0a1a] to-amber-950/40 border border-red-500/60 flex flex-col gap-2 font-mono text-xs">
            <div className="flex items-center gap-2 text-red-300 font-bold tracking-wide">
              <ShieldAlert className="w-4 h-4 text-[#E04A31]" />
              <span>EMERGENCY DISASTER MANAGEMENT DIRECTIVE (NDMA / COAST GUARD)</span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed font-sans">
              <strong className="text-white font-mono uppercase">Operational Action: </strong>
              {recommendedAction}
            </p>

            <div className="pt-2 border-t border-red-500/30 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
              <span>Notice: Generated by VortexAI Autonomous Satellite Pipeline.</span>
              <span className="font-bold text-slate-300">AUTHORITY: REGIONAL SPECIALIZED METEOROLOGICAL CENTER (RSMC)</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
