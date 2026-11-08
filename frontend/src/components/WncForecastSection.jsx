import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Wind, 
  Gauge, 
  Layers, 
  ShieldAlert, 
  ExternalLink, 
  Activity, 
  Clock, 
  Target, 
  CheckCircle2, 
  Sliders, 
  ChevronRight, 
  FileText,
  BarChart3,
  Sparkles,
  Info
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const BENCHMARK_STORMS = [
  { id: 'fani', name: 'Cyclone Fani', year: '2019', basin: 'Bay of Bengal', cat: 'Super Cyclonic Storm (150 kts)', defaultLat: 18.23, defaultLon: 85.74 },
  { id: 'amphan', name: 'Cyclone Amphan', year: '2020', basin: 'Bay of Bengal', cat: 'Super Cyclonic Storm (140 kts)', defaultLat: 19.50, defaultLon: 87.20 },
  { id: 'biparjoy', name: 'Cyclone Biparjoy', year: '2023', basin: 'Arabian Sea', cat: 'Extremely Severe (95 kts)', defaultLat: 21.80, defaultLon: 67.20 },
  { id: 'remal', name: 'Cyclone Remal', year: '2024', basin: 'Bay of Bengal', cat: 'Severe Cyclonic Storm (65 kts)', defaultLat: 20.20, defaultLon: 88.80 },
  { id: 'michaung', name: 'Cyclone Michaung', year: '2023', basin: 'Bay of Bengal', cat: 'Severe Cyclonic Storm (55 kts)', defaultLat: 13.80, defaultLon: 80.80 },
];

export default function WncForecastSection({ onOpenBulletin, onSelectStorm }) {
  const [selectedStormId, setSelectedStormId] = useState('fani');
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Layer Visibility Controls
  const [showEnsemble, setShowEnsemble] = useState(true);
  const [showConsensus, setShowConsensus] = useState(true);
  const [showCone68, setShowCone68] = useState(true);
  const [showCone95, setShowCone95] = useState(true);
  const [showQuadrantRadii, setShowQuadrantRadii] = useState(true);

  // Timeline Scrubber Horizon (0, 6, 12, 18, 24, 36, 48, 60, 72)
  const [selectedHorizon, setSelectedHorizon] = useState(18);

  const fetchForecast = async (stormId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/forecast/wnc-ensemble/${stormId}`);
      if (!res.ok) {
        throw new Error(`Failed to load forecast (HTTP ${res.status})`);
      }
      const data = await res.json();
      setForecastData(data);
    } catch (err) {
      console.error('WN-C forecast fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast(selectedStormId);
  }, [selectedStormId]);

  const consensusTrack = forecastData?.consensus_track || [];
  const currentWaypoint = consensusTrack.find((w) => w.horizon_h === selectedHorizon) || consensusTrack[0] || null;
  const t0Analysis = forecastData?.t0_analysis || {};
  const landfallTarget = forecastData?.landfall_target || {};
  const riRisk = forecastData?.rapid_intensification_risk || {};
  const scorecard = forecastData?.verification_scorecard || null;
  const cones = forecastData?.cones_of_uncertainty || {};
  const ensembleMembers = forecastData?.ensemble_members || [];

  return (
    <section id="forecasting" className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800/80">
      {/* Section Header with Nature 2026 Citation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-[#64104E]/30 text-[#e675b3] border border-[#64104E]/60 mb-3">
            <Sparkles className="w-3 h-3 text-[#E04A31]" />
            Peer-Reviewed Operational AI Foundation
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            WeatherNext Cyclones (WN-C) Operational Forecaster
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-3xl leading-relaxed">
            Multi-horizon trajectory, 50-member stochastic ensemble, and asymmetric quadrant wind structure grounded in{' '}
            <a 
              href="https://doi.org/10.1038/s41586-026-10953-2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#E04A31] hover:underline font-medium inline-flex items-center gap-1"
            >
              Nature (2026, doi:10.1038/s41586-026-10953-2)
              <ExternalLink className="w-3 h-3 inline" />
            </a>
            {' '}by Google DeepMind and the US National Hurricane Center (NHC).
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => {
              if (onOpenBulletin) {
                onOpenBulletin(selectedStormId);
              }
            }}
            className="px-4 py-2 rounded-lg text-xs font-mono font-medium tracking-wide bg-[#1e1329] hover:bg-[#2b1b3a] text-zinc-200 border border-zinc-700/80 transition-all flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5 text-[#E04A31]" />
            Export Official Bulletin
          </button>
        </div>
      </div>

      {/* Storm Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-zinc-800/60 no-scrollbar">
        {BENCHMARK_STORMS.map((storm) => {
          const isActive = storm.id === selectedStormId;
          return (
            <button
              key={storm.id}
              onClick={() => {
                setSelectedStormId(storm.id);
                setSelectedHorizon(18);
              }}
              className={`px-4 py-2.5 rounded-lg text-xs font-mono tracking-wider transition-all whitespace-nowrap flex items-center gap-2 border ${
                isActive
                  ? 'bg-[#E04A31]/15 text-white border-[#E04A31] shadow-lg shadow-[#E04A31]/10 font-bold'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <Target className={`w-3.5 h-3.5 ${isActive ? 'text-[#E04A31]' : 'text-zinc-500'}`} />
              <span>{storm.name.toUpperCase()}</span>
              <span className="text-[10px] text-zinc-500">({storm.year})</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Synoptic Map + Diagnostic Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f0b18] border border-zinc-800/90 rounded-xl overflow-hidden flex flex-col">
          {/* Map Controls Header */}
          <div className="px-4 py-3 bg-[#150f22] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-zinc-300">
              <Compass className="w-3.5 h-3.5 text-[#E04A31]" />
              <span className="font-semibold text-white">NORTH INDIAN OCEAN SYNOPTIC RADAR</span>
              <span className="text-zinc-500">• 0.25° WN-C GRID</span>
            </div>

            {/* Layer Toggles */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowEnsemble(!showEnsemble)}
                className={`px-2 py-1 rounded text-[10px] tracking-wide border transition-all ${
                  showEnsemble 
                    ? 'bg-[#64104E]/40 text-[#f59ebd] border-[#64104E]' 
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
                title="Toggle 50 stochastic ensemble tracks"
              >
                50-Member Spaghetti
              </button>

              <button
                onClick={() => setShowConsensus(!showConsensus)}
                className={`px-2 py-1 rounded text-[10px] tracking-wide border transition-all ${
                  showConsensus 
                    ? 'bg-[#E04A31]/30 text-white border-[#E04A31]' 
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
                title="Toggle consensus mean operational track"
              >
                Consensus Track
              </button>

              <button
                onClick={() => {
                  const n = !showCone68;
                  setShowCone68(n);
                  setShowCone95(n);
                }}
                className={`px-2 py-1 rounded text-[10px] tracking-wide border transition-all ${
                  showCone68 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
                title="Toggle 68% & 95% confidence uncertainty cones"
              >
                Cone (68/95%)
              </button>

              <button
                onClick={() => setShowQuadrantRadii(!showQuadrantRadii)}
                className={`px-2 py-1 rounded text-[10px] tracking-wide border transition-all ${
                  showQuadrantRadii 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' 
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
                title="Toggle R34, R50, R64 asymmetric wind radii"
              >
                Wind Radii
              </button>
            </div>
          </div>

          {/* Interactive SVG Display */}
          <div className="relative w-full aspect-[4/3] bg-[#07050d] overflow-hidden select-none">
            {/* Ambient Oceanic Gridlines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="synoptic-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#251a38" strokeWidth="0.5" strokeDasharray="2,2" />
                </pattern>
                <linearGradient id="coneGrad95" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.03" />
                </linearGradient>
                <linearGradient id="coneGrad68" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E04A31" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#E04A31" stopOpacity="0.08" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#synoptic-grid)" />

              {/* Reference Basin Coastlines & Lat/Lon Labels */}
              <text x="75%" y="15%" fill="#4b5563" fontSize="10" fontFamily="monospace">90°E</text>
              <text x="50%" y="15%" fill="#4b5563" fontSize="10" fontFamily="monospace">75°E</text>
              <text x="25%" y="15%" fill="#4b5563" fontSize="10" fontFamily="monospace">60°E</text>
              <text x="5%" y="30%" fill="#4b5563" fontSize="10" fontFamily="monospace">25°N</text>
              <text x="5%" y="55%" fill="#4b5563" fontSize="10" fontFamily="monospace">15°N</text>
              <text x="5%" y="80%" fill="#4b5563" fontSize="10" fontFamily="monospace">05°N</text>

              {/* Bay of Bengal / Arabian Sea water body indicators */}
              <text x="68%" y="62%" fill="#38254c" fontSize="14" fontWeight="bold" fontFamily="monospace" letterSpacing="4">BAY OF BENGAL</text>
              <text x="24%" y="62%" fill="#38254c" fontSize="14" fontWeight="bold" fontFamily="monospace" letterSpacing="4">ARABIAN SEA</text>

              {/* 1. Dynamic 95% Uncertainty Cone (Outer) */}
              {showCone95 && cones.points_str_95 && (
                <polygon 
                  points={cones.points_str_95}
                  fill="url(#coneGrad95)"
                  stroke="#f59e0b"
                  strokeWidth="0.8"
                  strokeDasharray="4,3"
                  opacity="0.85"
                />
              )}

              {/* 2. Dynamic 68% Uncertainty Cone (Inner Core) */}
              {showCone68 && cones.points_str_68 && (
                <polygon 
                  points={cones.points_str_68}
                  fill="url(#coneGrad68)"
                  stroke="#E04A31"
                  strokeWidth="1.2"
                  opacity="0.95"
                />
              )}

              {/* 3. 50 Stochastic Ensemble Spaghetti Members */}
              {showEnsemble && ensembleMembers.map((m, idx) => (
                <polyline
                  key={m.member_id}
                  points={m.points_str}
                  fill="none"
                  stroke={idx % 2 === 0 ? '#b43067' : '#c3864d'}
                  strokeWidth="0.65"
                  opacity="0.32"
                />
              ))}

              {/* 4. Consensus Operational Track */}
              {showConsensus && consensusTrack.length > 1 && (
                <>
                  <polyline
                    points={consensusTrack.map((w) => `${w.pixel_x},${w.pixel_y}`).join(' ')}
                    fill="none"
                    stroke="#E04A31"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="drop-shadow(0 0 6px #E04A31)"
                  />
                  <polyline
                    points={consensusTrack.map((w) => `${w.pixel_x},${w.pixel_y}`).join(' ')}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.0"
                    strokeDasharray="3,3"
                  />
                </>
              )}

              {/* 5. Asymmetric Quadrant Radii Footprint at Current Horizon */}
              {showQuadrantRadii && currentWaypoint && currentWaypoint.quadrant_wind_radii && (
                (() => {
                  const r = currentWaypoint.quadrant_wind_radii;
                  const cx = currentWaypoint.pixel_x;
                  const cy = currentWaypoint.pixel_y;
                  // Scale NM to SVG percentage
                  const nmToPct = 0.08;
                  const r34 = r.r34_knots_nm;
                  const r50 = r.r50_knots_nm;
                  const r64 = r.r64_knots_nm;

                  // 34 kt gale-force polygon
                  const p34 = [
                    `${cx + r34.ne * nmToPct * 0.7},${cy - r34.ne * nmToPct * 0.7}`,
                    `${cx + r34.se * nmToPct * 0.7},${cy + r34.se * nmToPct * 0.7}`,
                    `${cx - r34.sw * nmToPct * 0.7},${cy + r34.sw * nmToPct * 0.7}`,
                    `${cx - r34.nw * nmToPct * 0.7},${cy - r34.nw * nmToPct * 0.7}`
                  ].join(' ');

                  // 64 kt hurricane-force polygon
                  const p64 = [
                    `${cx + r64.ne * nmToPct * 0.7},${cy - r64.ne * nmToPct * 0.7}`,
                    `${cx + r64.se * nmToPct * 0.7},${cy + r64.se * nmToPct * 0.7}`,
                    `${cx - r64.sw * nmToPct * 0.7},${cy + r64.sw * nmToPct * 0.7}`,
                    `${cx - r64.nw * nmToPct * 0.7},${cy - r64.nw * nmToPct * 0.7}`
                  ].join(' ');

                  return (
                    <g opacity="0.85">
                      {r34.ne > 0 && (
                        <polygon
                          points={p34}
                          fill="#38bdf8"
                          fillOpacity="0.12"
                          stroke="#38bdf8"
                          strokeWidth="1.2"
                          strokeDasharray="2,2"
                        />
                      )}
                      {r64.ne > 0 && (
                        <polygon
                          points={p64}
                          fill="#ef4444"
                          fillOpacity="0.22"
                          stroke="#ef4444"
                          strokeWidth="1.5"
                        />
                      )}
                    </g>
                  );
                })()
              )}

              {/* 6. Waypoint Markers */}
              {showConsensus && consensusTrack.map((wp) => {
                const isSelected = wp.horizon_h === selectedHorizon;
                const isLandfall = wp.is_landfall;

                return (
                  <g 
                    key={wp.horizon_h} 
                    className="cursor-pointer"
                    onClick={() => setSelectedHorizon(wp.horizon_h)}
                  >
                    {isSelected && (
                      <circle
                        cx={`${wp.pixel_x}%`}
                        cy={`${wp.pixel_y}%`}
                        r="14"
                        fill="#E04A31"
                        fillOpacity="0.25"
                        className="animate-pulse"
                      />
                    )}
                    <circle
                      cx={`${wp.pixel_x}%`}
                      cy={`${wp.pixel_y}%`}
                      r={isLandfall ? "7" : isSelected ? "6" : "4"}
                      fill={isLandfall ? '#ef4444' : isSelected ? '#ffffff' : '#E04A31'}
                      stroke={isSelected ? '#E04A31' : '#150f22'}
                      strokeWidth="2"
                    />
                    <text
                      x={`${wp.pixel_x}%`}
                      y={`${wp.pixel_y - 8}%`}
                      fill={isSelected ? '#ffffff' : '#9ca3af'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {wp.horizon_h === 0 ? 'T0' : `+${wp.horizon_h}h`}
                    </text>
                  </g>
                );
              })}

              {/* Landfall Marker with Target Flag */}
              {landfallTarget && landfallTarget.lat && (
                <g>
                  {consensusTrack.filter(w => w.is_landfall).map((lf) => (
                    <g key="landfall-pin">
                      <circle cx={`${lf.pixel_x}%`} cy={`${lf.pixel_y}%`} r="18" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,2" />
                      <text x={`${lf.pixel_x + 2}%`} y={`${lf.pixel_y + 4}%`} fill="#f87171" fontSize="10" fontFamily="monospace" fontWeight="bold">
                        LANDFALL: {landfallTarget.district}
                      </text>
                    </g>
                  ))}
                </g>
              )}
            </svg>

            {/* Bottom Scrubber Overlay */}
            <div className="absolute bottom-3 left-3 right-3 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-300 mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#E04A31]" />
                  <span>LEAD-TIME HORIZON:</span>
                  <span className="font-bold text-white text-sm">+{selectedHorizon} HOURS</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  {currentWaypoint?.is_landfall ? (
                    <span className="text-[#ef4444] font-bold">COASTAL LANDFALL IMMINENT</span>
                  ) : (
                    <span>Translating @ {currentWaypoint?.speed_kmh || 16} km/h</span>
                  )}
                </div>
              </div>

              {/* Horizontal Slider Steps */}
              <div className="flex items-center justify-between gap-1">
                {consensusTrack.map((wp) => {
                  const isCur = wp.horizon_h === selectedHorizon;
                  return (
                    <button
                      key={wp.horizon_h}
                      onClick={() => setSelectedHorizon(wp.horizon_h)}
                      className={`flex-1 py-1.5 rounded text-[11px] font-mono tracking-tighter transition-all ${
                        isCur
                          ? 'bg-[#E04A31] text-white font-bold shadow-md shadow-[#E04A31]/30'
                          : 'bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {wp.horizon_h === 0 ? 'T0' : `+${wp.horizon_h}h`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Physical & Verification Scorecard (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Active Fix Telemetry Card */}
          <div className="bg-[#0f0b18] border border-zinc-800/90 rounded-xl p-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">WAYPOINT DIAGNOSTIC (+{selectedHorizon}h)</span>
                <div className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>{currentWaypoint?.lat}°N, {currentWaypoint?.lon}°E</span>
                  {currentWaypoint?.is_landfall && (
                    <span className="text-[10px] bg-red-950 text-red-400 border border-red-800/80 px-2 py-0.5 rounded uppercase font-mono font-bold">
                      Landfall Point
                    </span>
                  )}
                </div>
              </div>
              <span 
                className="text-xs px-2.5 py-1 rounded font-mono font-semibold"
                style={{ 
                  backgroundColor: `${currentWaypoint?.badge_color || '#ea580c'}25`, 
                  color: currentWaypoint?.badge_color || '#ea580c',
                  border: `1px solid ${currentWaypoint?.badge_color || '#ea580c'}60` 
                }}
              >
                {currentWaypoint?.category_code || 'SCS'}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono mb-1">
                  <Wind className="w-3.5 h-3.5 text-[#E04A31]" />
                  <span>MAX SUSTAINED WIND</span>
                </div>
                <div className="text-xl font-mono font-bold text-white">
                  {currentWaypoint?.msw_kts || 0} <span className="text-xs font-normal text-zinc-400">kts</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                  {Math.round((currentWaypoint?.msw_kts || 0) * 1.852)} km/h
                </div>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono mb-1">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>MIN CENTRAL PRESSURE</span>
                </div>
                <div className="text-xl font-mono font-bold text-white">
                  {currentWaypoint?.pressure_hpa || 1010} <span className="text-xs font-normal text-zinc-400">hPa</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                  Deficit: {Math.max(0, Math.round(1013.25 - (currentWaypoint?.pressure_hpa || 1010)))} hPa
                </div>
              </div>
            </div>

            {/* Asymmetric 4-Quadrant Wind Radii Table */}
            <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-950/40">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-300 mb-2">
                <span className="font-semibold text-white">ASYMMETRIC WIND RADII (NM)</span>
                <span className="text-[10px] text-zinc-500">NE / SE / SW / NW</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>R34 (Gale Force):</span>
                  </span>
                  <span className="text-zinc-200 font-semibold">
                    {currentWaypoint?.quadrant_wind_radii?.r34_knots_nm?.ne || 0} / {currentWaypoint?.quadrant_wind_radii?.r34_knots_nm?.se || 0} / {currentWaypoint?.quadrant_wind_radii?.r34_knots_nm?.sw || 0} / {currentWaypoint?.quadrant_wind_radii?.r34_knots_nm?.nw || 0} NM
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>R50 (Storm Force):</span>
                  </span>
                  <span className="text-zinc-200 font-semibold">
                    {currentWaypoint?.quadrant_wind_radii?.r50_knots_nm?.ne || 0} / {currentWaypoint?.quadrant_wind_radii?.r50_knots_nm?.se || 0} / {currentWaypoint?.quadrant_wind_radii?.r50_knots_nm?.sw || 0} / {currentWaypoint?.quadrant_wind_radii?.r50_knots_nm?.nw || 0} NM
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>R64 (Hurricane Force):</span>
                  </span>
                  <span className="text-zinc-200 font-semibold">
                    {currentWaypoint?.quadrant_wind_radii?.r64_knots_nm?.ne || 0} / {currentWaypoint?.quadrant_wind_radii?.r64_knots_nm?.se || 0} / {currentWaypoint?.quadrant_wind_radii?.r64_knots_nm?.sw || 0} / {currentWaypoint?.quadrant_wind_radii?.r64_knots_nm?.nw || 0} NM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rapid Intensification (RI) & Landfall Card */}
          <div className="bg-[#0f0b18] border border-zinc-800/90 rounded-xl p-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#E04A31]" />
                <span className="text-xs font-mono font-bold text-white uppercase">RAPID INTENSIFICATION (RI) COUPLING</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                riRisk.threshold_met ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {riRisk.ri_probability_percent || 0}% PROBABILITY
              </span>
            </div>

            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
              Calculates probability of <span className="text-zinc-200 font-mono">ΔV ≥ 30 kts</span> sustained wind increase within 24 hours driven by eyewall convective core ΔT (<span className="text-zinc-200 font-mono">{riRisk.delta_t_k || 38} K</span>) and pressure deficit (<span className="text-zinc-200 font-mono">{riRisk.pressure_deficit_hpa || 30} hPa</span>).
            </p>

            {/* Landfall Impact Preview */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-xs font-mono">
              <div className="text-zinc-400 text-[10px] uppercase tracking-wider mb-1">PROJECTED LANDFALL TARGET</div>
              <div className="text-white font-bold text-sm">
                {landfallTarget?.district || 'Puri'}, {landfallTarget?.state || 'Odisha'}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-300">
                <span>Landfall ETA: <strong>{landfallTarget?.eta_hours || 18} Hours</strong></span>
                <span>Peak Storm Surge: <strong className="text-red-400">{landfallTarget?.surge_meters || 4.2} Meters</strong></span>
              </div>
            </div>
          </div>

          {/* Nature 2026 Verification Scorecard */}
          <div className="bg-[#0f0b18] border border-zinc-800/90 rounded-xl p-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase">
                <BarChart3 className="w-3.5 h-3.5 text-[#E04A31]" />
                <span>NATURE 2026 VERIFICATION SCORECARD</span>
              </div>
              <span className="text-[10px] font-mono text-[#E04A31] font-semibold">+24h LEAD TIME PARITY</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-[10px]">
                    <th className="py-1">HORIZON</th>
                    <th className="py-1 text-white">WN-C (AI)</th>
                    <th className="py-1 text-zinc-400">ECMWF IFS</th>
                    <th className="py-1 text-[#E04A31]">GAIN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {scorecard?.metrics?.map((m) => (
                    <tr key={m.horizon}>
                      <td className="py-1.5 font-medium">{m.horizon}</td>
                      <td className="py-1.5 text-white font-semibold">{m.wnc_track_error_km} km</td>
                      <td className="py-1.5 text-zinc-400">{m.ecmwf_ifs_error_km} km</td>
                      <td className="py-1.5 text-[#E04A31] font-bold">{m.improvement_percent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Brier Score (RI): <strong>0.124</strong> (vs NWP 0.282)</span>
              <a 
                href="https://doi.org/10.1038/s41586-026-10953-2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#E04A31] hover:underline flex items-center gap-0.5"
              >
                Inspect Paper <ChevronRight className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
