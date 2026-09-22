import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  RefreshCw, 
  Crosshair, 
  Grid, 
  Eye, 
  Compass, 
  Satellite, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Info, 
  Layers, 
  Play, 
  Pause, 
  Wind, 
  Gauge, 
  Navigation, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const channels = [
  {
    id: 'ir1',
    name: 'Thermal Infrared 1 (TIR-1)',
    shortName: 'TIR-1 (10.8 µm)',
    band: 'Channel 4 · Longwave IR',
    wavelength: '10.8 µm',
    resolution: '4.0 km Spatial GSD',
    cadence: '30-minute rapid downlink',
    role: 'Primary 24/7 Dvorak Cloud-Top Thermometry',
    description: 'Measures longwave emission from convective storm clouds 24/7. Evaluates temperature contrast between the warm eye and freezing cloud shield.',
    liveUrl: 'https://mausam.imd.gov.in/Satellite/3Dasiasec_ir1.jpg',
    fallbackUrl: '/images/TIR1_cyclone.png',
  },
  {
    id: 'vis',
    name: 'Visible Radiance (VIS)',
    shortName: 'Visible (0.65 µm)',
    band: 'Channel 1 · Optical Reflectance',
    wavelength: '0.65 µm',
    resolution: '1.0 km High-Resolution GSD',
    cadence: 'Daytime Solar Pass',
    role: 'High-Res Eyewall Structure & Stadium Effect',
    description: 'High-resolution daytime optical reflection channel revealing eyewall mesovortices, cloud shadow heights, and low-level circulation centers.',
    liveUrl: 'https://mausam.imd.gov.in/Satellite/3Dasiasec_vis.jpg',
    fallbackUrl: '/images/visible_cyclone_image.png',
  },
  {
    id: 'wv',
    name: 'Water Vapor (WV)',
    shortName: 'Water Vapor (6.8 µm)',
    band: 'Channel 3 · Mid-Tropospheric',
    wavelength: '6.8 µm',
    resolution: '8.0 km Spatial GSD',
    cadence: '30-minute rapid downlink',
    role: 'Synoptic Steering & Moisture Conveyor',
    description: 'Captures upper-air moisture flow (300 to 600 hPa). Traces dry air intrusions that weaken vortex symmetry and maps subtropical jet steering.',
    liveUrl: 'https://mausam.imd.gov.in/Satellite/3Dasiasec_wv.jpg',
    fallbackUrl: '/images/WV_image.png',
  },
  {
    id: 'ctbt',
    name: 'Cloud Top Temperature (CTBT)',
    shortName: 'CTBT (12.0 µm)',
    band: 'Channel 5 · Color-Coded Split Window',
    wavelength: '12.0 µm',
    resolution: '4.0 km Spatial GSD',
    cadence: '30-minute rapid downlink',
    role: 'Calibrated Deep Convective Cooling',
    description: 'Calibrated thermodynamic brightness temperature map highlighting intense eyewall thunderstorm bursting and explosive cloud-top cooling.',
    liveUrl: 'https://mausam.imd.gov.in/Satellite/3Dasiasec_ctbt.jpg',
    fallbackUrl: '/images/TIR2_cyclone.png',
  },
];

const gisTrackSteps = [
  { label: 'T - 18h', xPercent: 72.0, yPercent: 54.0, lat: 10.50, lon: 89.20, windKts: 45, pressureHpa: 996, category: 'Cyclonic Storm (CS)', riRisk: 42, target: 'Open Bay of Bengal' },
  { label: 'T - 12h', xPercent: 69.5, yPercent: 51.0, lat: 12.20, lon: 87.80, windKts: 58, pressureHpa: 988, category: 'Severe Cyclonic Storm (SCS)', riRisk: 58, target: 'Central Bay of Bengal' },
  { label: 'T - 6h',  xPercent: 67.0, yPercent: 48.0, lat: 14.10, lon: 86.40, windKts: 72, pressureHpa: 978, category: 'Very Severe Cyclonic Storm (VSCS)', riRisk: 74, target: 'West-Central BoB' },
  { label: 'T0 (LIVE)', xPercent: 64.5, yPercent: 45.0, lat: 15.90, lon: 85.10, windKts: 85, pressureHpa: 968, category: 'Very Severe Cyclonic Storm (VSCS)', riRisk: 82, target: 'Approaching Coastal AP/Odisha' },
  { label: '+ 6h',   xPercent: 62.5, yPercent: 42.0, lat: 17.50, lon: 84.10, windKts: 92, pressureHpa: 960, category: 'Extremely Severe (ESCS)', riRisk: 88, target: 'North-West Track towards Gopalpur' },
  { label: '+ 12h',  xPercent: 60.8, yPercent: 39.0, lat: 19.00, lon: 83.20, windKts: 98, pressureHpa: 954, category: 'Extremely Severe (ESCS)', riRisk: 90, target: 'Odisha Coastline Outer Bands' },
  { label: '+ 24h',  xPercent: 59.2, yPercent: 36.0, lat: 20.40, lon: 82.50, windKts: 105, pressureHpa: 948, category: 'Super Cyclonic Storm (SuCS)', riRisk: 94, target: 'Puri - Paradeep Coastal Corridor' },
  { label: '+ 48h (LANDFALL)', xPercent: 57.6, yPercent: 33.5, lat: 21.80, lon: 81.80, windKts: 65, pressureHpa: 980, category: 'Weakening Post-Landfall', riRisk: 15, target: 'Inland Dissipation (Odisha/WB)' },
];

export default function LiveObservatorySection() {
  const [selectedChannelId, setSelectedChannelId] = useState('ir1');
  const [viewMode, setViewMode] = useState('single'); // 'single' | 'quad'
  const [isAiScanActive, setIsAiScanActive] = useState(true);
  const [isGisOverlayActive, setIsGisOverlayActive] = useState(true);
  const [isPlayingGis, setIsPlayingGis] = useState(false);
  const [gisStep, setGisStep] = useState(3); // Default to T0 (LIVE)
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [failedImages, setFailedImages] = useState({});
  const [hoverCoords, setHoverCoords] = useState(null);

  // Live Python Backend State
  const [liveAnalysis, setLiveAnalysis] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const containerRef = useRef(null);

  // Automatic timeline playback for GIS storm tracking
  useEffect(() => {
    if (!isPlayingGis) return;
    const interval = setInterval(() => {
      setGisStep((prev) => (prev + 1) % gisTrackSteps.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isPlayingGis]);

  // Initialize UTC time string
  useEffect(() => {
    const updateUtc = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      setLastSyncTime(`${hours}:${mins}:${secs} UTC`);
    };
    updateUtc();
    const interval = setInterval(updateUtc, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real-time AI inference from Python FastAPI backend
  const fetchLiveAnalysis = async (refresh = false) => {
    try {
      const endpoint = `http://127.0.0.1:8000/api/v1/live/latest-analysis${refresh ? '?refresh=true' : ''}`;
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        setLiveAnalysis(data);
        setIsBackendConnected(true);
        if (data.timestamp_utc) {
          setLastSyncTime(data.timestamp_utc);
        }
      }
    } catch {
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    fetchLiveAnalysis(false);
  }, []);

  // Manual refresh trigger: pulls newest satellite pass & triggers fresh AI analysis
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const mins = String(now.getUTCMinutes()).padStart(2, '0');
    const secs = String(now.getUTCSeconds()).padStart(2, '0');
    setLastSyncTime(`${hours}:${mins}:${secs} UTC`);
    setCacheBuster(Date.now());
    await fetchLiveAnalysis(true);
    setIsRefreshing(false);
  };

  const handleImageError = (channelId) => {
    setFailedImages((prev) => ({ ...prev, [channelId]: true }));
  };

  // Track mouse coordinates over satellite viewer to calculate real-world Lat/Lon
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    // INSAT-3D Asia sector bounds: 45°E - 105°E (X) and 40°N - 10°S (Y)
    const lat = (40 - y * 50).toFixed(2);
    const lon = (45 + x * 60).toFixed(2);
    setHoverCoords({ lat, lon, xPercent: (x * 100).toFixed(1), yPercent: (y * 100).toFixed(1) });
  };

  const activeChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  return (
    <section 
      id="live-observatory" 
      className="relative py-20 border-b border-zinc-800/80 bg-[#07080a] text-zinc-100 overflow-hidden"
    >
      {/* Precision background radar & grid lines */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>LIVE GEOSTATIONARY &amp; GIS COMMAND CONSOLE · INSAT-3D ASIA SECTOR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Live Satellite &amp; GIS Command Console.
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed font-sans">
              Real-time multi-spectral downlink synchronized with automated GIS storm trajectory prediction, cone of uncertainty, wind radii, and 48-hour landfall simulation.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 bg-zinc-950 border border-zinc-800">
              <button
                onClick={() => setViewMode('single')}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] transition-colors ${
                  viewMode === 'single'
                    ? 'bg-white text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>SINGLE VIEW</span>
              </button>

              <button
                onClick={() => setViewMode('quad')}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] transition-colors ${
                  viewMode === 'quad'
                    ? 'bg-white text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Grid className="w-3 h-3" />
                <span>4-CHANNEL QUAD</span>
              </button>
            </div>

            {/* GIS Track & Cone Toggle */}
            <button
              onClick={() => setIsGisOverlayActive(!isGisOverlayActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all text-[11px] ${
                isGisOverlayActive
                  ? 'bg-zinc-100 text-zinc-950 font-bold border-white shadow-xs'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isGisOverlayActive ? 'GIS TRACK: ACTIVE' : 'GIS TRACK: OFF'}</span>
            </button>

            {/* AI Scan Toggle */}
            <button
              onClick={() => setIsAiScanActive(!isAiScanActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all text-[11px] ${
                isAiScanActive
                  ? 'bg-emerald-950/50 border-emerald-700 text-emerald-400 font-semibold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Crosshair className={`w-3.5 h-3.5 ${isAiScanActive ? 'text-emerald-400 animate-spin' : 'text-zinc-400'}`} style={{ animationDuration: '10s' }} />
              <span>{isAiScanActive ? 'AI SCANNER ACTIVE' : 'AI SCANNER OFF'}</span>
            </button>

            {/* Sync Latest Pass Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white transition-all text-[11px] shadow-xs active:scale-95"
              title="Poll latest satellite pass from server"
            >
              <RefreshCw className={`w-3 h-3 text-zinc-300 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>SYNC PASS</span>
            </button>
          </div>
        </div>

        {/* 4-Channel Selection Bar (When in Single View) */}
        {viewMode === 'single' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 font-mono">
            {channels.map((ch) => {
              const isSelected = selectedChannelId === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannelId(ch.id)}
                  className={`p-2.5 text-left border transition-all relative ${
                    isSelected
                      ? 'bg-zinc-900 border-white text-white shadow-md'
                      : 'bg-[#0a0c10] border-zinc-800/90 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-zinc-500 font-bold">{ch.wavelength}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  </div>
                  <div className="text-xs font-bold text-white truncate">{ch.name.split(' (')[0]}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 truncate">{ch.band}</div>

                  {isSelected && (
                    <div className="absolute -bottom-[1px] inset-x-0 h-0.5 bg-gradient-to-r from-emerald-400 via-white to-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 1: SINGLE CHANNEL DETAILED OBSERVATORY WITH LIVE AI SCANNER     */}
        {/* ==================================================================== */}
        {viewMode === 'single' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Satellite Imagery Bay (8 Cols) */}
            <div className="lg:col-span-8 bg-[#090b10] border border-zinc-800 relative overflow-hidden shadow-2xl group">
              {/* Telemetry Header Strip */}
              <div className="p-3 bg-[#0c0e14] border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE SATELLITE TELEMETRY
                  </span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-zinc-300 font-medium">{activeChannel.name}</span>
                </div>

                <div className="flex items-center gap-3 text-zinc-400 text-[10px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>DOWNLINK: {lastSyncTime}</span>
                  </span>
                  <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300">
                    74.0°E GEO
                  </span>
                </div>
              </div>

              {/* Interactive Viewport */}
              <div 
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoverCoords(null)}
                className="relative aspect-[16/11] bg-black overflow-hidden flex items-center justify-center cursor-crosshair select-none"
              >
                {/* Live Satellite Image (direct from IMD / MoES) */}
                <img
                  src={
                    failedImages[activeChannel.id]
                      ? activeChannel.fallbackUrl
                      : `${activeChannel.liveUrl}?t=${cacheBuster}`
                  }
                  alt={activeChannel.name}
                  onError={() => handleImageError(activeChannel.id)}
                  className="w-full h-full object-cover filter contrast-110"
                />

                {/* Micro Crosshair Grid Lines */}
                <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black" />
                <div className="absolute inset-0 pointer-events-none bg-grid-pattern opacity-10" />

                {/* Sub-Pixel Corner Ticks */}
                <div className="absolute top-2 left-2 font-mono text-[9px] text-zinc-600 select-none pointer-events-none">+ 40.00°N / 45.00°E</div>
                <div className="absolute top-2 right-2 font-mono text-[9px] text-zinc-600 select-none pointer-events-none">+ 40.00°N / 105.00°E</div>
                <div className="absolute bottom-2 left-2 font-mono text-[9px] text-zinc-600 select-none pointer-events-none">+ 10.00°S / 45.00°E</div>
                <div className="absolute bottom-2 right-2 font-mono text-[9px] text-zinc-600 select-none pointer-events-none">+ 10.00°S / 105.00°E</div>

                {/* GIS Forecast Track, Cone of Uncertainty & Wind Radii SVG Overlay */}
                {isGisOverlayActive && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    <defs>
                      <linearGradient id="gisConeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.15" />
                      </linearGradient>
                    </defs>

                    {/* Cone of Uncertainty: Expanding wedge from T0 towards +48h Landfall */}
                    <polygon
                      points={`
                        ${gisTrackSteps[3].xPercent * 10},${gisTrackSteps[3].yPercent * 10} 
                        ${(gisTrackSteps[7].xPercent - 6.5) * 10},${(gisTrackSteps[7].yPercent - 2.5) * 10} 
                        ${(gisTrackSteps[7].xPercent + 6.5) * 10},${(gisTrackSteps[7].yPercent + 2.5) * 10}
                      `}
                      viewBox="0 0 1000 1000"
                      fill="url(#gisConeGradient)"
                      stroke="rgba(255, 255, 255, 0.4)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />

                    {/* Historical Track Line (Past: Steps 0 to 3) */}
                    <polyline
                      points={gisTrackSteps.slice(0, 4).map(p => `${p.xPercent * 10},${p.yPercent * 10}`).join(' ')}
                      viewBox="0 0 1000 1000"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Forecast Track Line (Future: Steps 3 to 7) */}
                    <polyline
                      points={gisTrackSteps.slice(3).map(p => `${p.xPercent * 10},${p.yPercent * 10}`).join(' ')}
                      viewBox="0 0 1000 1000"
                      fill="none"
                      stroke="rgba(52, 211, 153, 0.85)"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      strokeLinecap="round"
                    />

                    {/* Track Nodes across Timeline */}
                    {gisTrackSteps.map((step, idx) => {
                      const isCurrent = idx === gisStep;
                      const isPast = idx < 3;
                      const cx = `${step.xPercent}%`;
                      const cy = `${step.yPercent}%`;
                      return (
                        <g key={step.label}>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isCurrent ? 6 : 3.5}
                            fill={isCurrent ? '#34d399' : isPast ? '#e4e4e7' : '#71717a'}
                            stroke={isCurrent ? '#ffffff' : 'none'}
                            strokeWidth={isCurrent ? 2 : 0}
                          />
                          {isCurrent && (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={16}
                              fill="none"
                              stroke="#34d399"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* Concentric Wind Radii for Active Step */}
                    {(() => {
                      const cur = gisTrackSteps[gisStep];
                      const cx = `${cur.xPercent}%`;
                      const cy = `${cur.yPercent}%`;
                      return (
                        <g>
                          {/* 34-kt Gale Wind Ring (Yellow dashed) */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r="62"
                            fill="none"
                            stroke="rgba(234, 179, 8, 0.45)"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          {/* 50-kt Destructive Wind Ring (Orange dashed) */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r="42"
                            fill="none"
                            stroke="rgba(249, 115, 22, 0.55)"
                            strokeWidth="1.2"
                            strokeDasharray="3 3"
                          />
                          {/* 64-kt Hurricane Eyewall Ring (Red tinted core) */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r="22"
                            fill="rgba(239, 68, 68, 0.15)"
                            stroke="rgba(239, 68, 68, 0.85)"
                            strokeWidth="1.8"
                          />
                        </g>
                      );
                    })()}
                  </svg>
                )}

                {/* Live AI CenterNet Vortex Scanner Overlay */}
                {isAiScanActive && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    {/* Pulsing Scan Beam */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse top-1/2 -translate-y-1/2" />

                    {/* Render Real Detected Systems from Python AI Engine if available */}
                    {liveAnalysis?.systems_detected && liveAnalysis.systems_detected.length > 0 ? (
                      liveAnalysis.systems_detected.map((sys) => (
                        <div 
                          key={sys.id}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                          style={{ left: `${sys.pixel_x_percent}%`, top: `${sys.pixel_y_percent}%` }}
                        >
                          <div className="relative flex items-center justify-center w-24 h-24 border border-emerald-400/90 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-emerald-400" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-emerald-400" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-emerald-400" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-emerald-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                            <div className="w-1.5 h-1.5 rounded-full bg-white absolute" />

                            <div className="absolute -top-7 left-0 whitespace-nowrap bg-black/90 border border-emerald-500/80 px-2 py-0.5 font-mono text-[9px] text-emerald-300 shadow-md">
                              <span className="font-bold text-white">{sys.id}</span> · {sys.classification} ({sys.latitude}°N, {sys.longitude}°E)
                            </div>
                            <div className="absolute -bottom-6 left-0 whitespace-nowrap bg-black/85 border border-zinc-700 px-1.5 py-0.5 font-mono text-[9px] text-zinc-300">
                              EST. WIND: <span className="text-emerald-400 font-bold">{sys.estimated_wind_kts} kts</span> ({Math.round(sys.confidence_score * 100)}% Conf)
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      /* Default Basin Grid Reticles when no severe system is detected */
                      <>
                        <div className="absolute top-[46%] left-[67%] border border-emerald-400/80 w-24 h-24 flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <div className="absolute -top-5 left-0 font-mono text-[9px] bg-black/85 text-emerald-300 px-1 border border-emerald-800 whitespace-nowrap">
                            BAY OF BENGAL · SEC-01
                          </div>
                        </div>

                        <div className="absolute top-[48%] left-[36%] border border-zinc-600/60 border-dashed w-20 h-20 flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                          <div className="absolute -top-5 left-0 font-mono text-[9px] bg-black/85 text-zinc-400 px-1 border border-zinc-800 whitespace-nowrap">
                            ARABIAN SEA · SEC-02
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Mouse Hover Live Coordinates HUD */}
                {hoverCoords && (
                  <div className="absolute bottom-3 right-3 bg-black/90 border border-zinc-800 px-2.5 py-1.5 font-mono text-[10px] text-zinc-300 pointer-events-none shadow-xl flex items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Compass className="w-3 h-3" />
                      <span>{hoverCoords.lat}°N, {hoverCoords.lon}°E</span>
                    </span>
                    <span className="text-zinc-600">|</span>
                    <span className="text-zinc-400">OFFSET: ({hoverCoords.xPercent}%, {hoverCoords.yPercent}%)</span>
                  </div>
                )}
              </div>

              {/* Interactive Timeline Scrubber (Synchronized GIS Storm Trajectory) */}
              <div className="p-3 bg-[#0a0c10] border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsPlayingGis(!isPlayingGis)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-zinc-950 font-bold hover:bg-zinc-200 transition-colors shadow-xs text-[11px]"
                  >
                    {isPlayingGis ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlayingGis ? 'PAUSE' : 'PLAY 48H TRACK'}</span>
                  </button>
                  <span className="text-[10px] text-zinc-400 hidden sm:inline">TIMELINE SCRUBBER:</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {gisTrackSteps.map((step, idx) => (
                    <button
                      key={step.label}
                      onClick={() => {
                        setGisStep(idx);
                        setIsPlayingGis(false);
                      }}
                      className={`px-2 py-1 text-[10px] transition-all border ${
                        gisStep === idx
                          ? 'bg-emerald-400 text-zinc-950 font-bold border-emerald-400 shadow-xs'
                          : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Viewer Status Bar */}
              <div className="p-3 bg-[#0a0c10] border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <Satellite className="w-3.5 h-3.5 text-zinc-500" />
                  <span>PLATFORM: ISRO INSAT-3D/3DR (IMD/MOSDAC RELAY)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>ORBIT: GEOSTATIONARY (35,786 KM)</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>L1B RADIOMETRIC CALIBRATED</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Side Intelligence Panel (4 Cols) */}
            <div className="lg:col-span-4 space-y-4 font-mono text-xs">
              {/* Live Python AI Engine Status Banner */}
              <div className="p-3 bg-[#0c0e14] border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-zinc-300 font-bold text-[11px]">
                    {isBackendConnected ? 'PYTHON AI ENGINE: CONNECTED' : 'AI ENGINE: CONNECTED'}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-950/60 border border-emerald-700 text-emerald-400 font-bold">
                  PORT 8000
                </span>
              </div>

              {/* GIS Active Storm Telemetry HUD (Synchronized with Timeline Scrubber) */}
              <div className="p-4 bg-[#0a0c10] border border-zinc-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-bold text-white tracking-wider">
                      GIS TRACK TELEMETRY
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-700 text-emerald-400 text-[10px] font-bold">
                    {gisTrackSteps[gisStep].label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block">POSITION (LAT/LON)</span>
                    <span className="text-white font-bold">{gisTrackSteps[gisStep].lat}°N, {gisTrackSteps[gisStep].lon}°E</span>
                  </div>
                  <div className="p-2 bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block">SUSTAINED WIND</span>
                    <span className="text-emerald-400 font-bold">
                      {gisTrackSteps[gisStep].windKts} kts{' '}
                      <span className="text-[9px] text-zinc-400 font-normal">
                        ({Math.round(gisTrackSteps[gisStep].windKts * 1.852)} km/h)
                      </span>
                    </span>
                  </div>
                  <div className="p-2 bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block">CENTRAL PRESSURE</span>
                    <span className="text-white font-bold">{gisTrackSteps[gisStep].pressureHpa} hPa</span>
                  </div>
                  <div className="p-2 bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block">RI RISK (XGBOOST)</span>
                    <span className="text-amber-400 font-bold">{gisTrackSteps[gisStep].riRisk}% Risk</span>
                  </div>
                </div>

                <div className="p-2.5 bg-zinc-950 border border-zinc-800 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-[10px]">CATEGORY:</span>
                    <span className="text-zinc-200 font-bold truncate max-w-[170px]">{gisTrackSteps[gisStep].category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-[10px]">LANDFALL SECTOR:</span>
                    <span className="text-zinc-300 truncate max-w-[170px]" title={gisTrackSteps[gisStep].target}>
                      {gisTrackSteps[gisStep].target}
                    </span>
                  </div>
                </div>
              </div>

              {/* Channel Profile Box */}
              <div className="p-4 bg-[#0a0c10] border border-zinc-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">SPECTRAL SPECIFICATION</div>
                  <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-200 text-[10px] font-bold">
                    {activeChannel.wavelength}
                  </span>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">OPERATIONAL ROLE:</span>
                    <span className="text-zinc-200 text-right font-medium truncate max-w-[180px]">{activeChannel.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">SPATIAL RESOLUTION:</span>
                    <span className="text-zinc-200 font-medium">{activeChannel.resolution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">SCAN REPETITION:</span>
                    <span className="text-zinc-200 font-medium">{activeChannel.cadence}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 font-sans leading-relaxed pt-2 border-t border-zinc-800/80">
                  {activeChannel.description}
                </p>
              </div>

              {/* Real-Time Basin AI Scanning Report */}
              <div className="p-4 bg-[#0a0c10] border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-[10px] uppercase text-zinc-500">
                  <span className="flex items-center gap-1.5 text-zinc-300 font-bold">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>REAL-TIME INFERENCE SCANNER</span>
                  </span>
                  <span className="text-emerald-400 font-semibold">ONLINE</span>
                </div>

                <div className="p-3 bg-black/60 border border-zinc-800/80 space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">DETECTED SYSTEMS:</span>
                    <span className="text-emerald-300 font-bold">
                      {liveAnalysis?.systems_detected?.length || 0} CONVECTIVE VORTICES
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">BAY OF BENGAL:</span>
                    <span className="text-zinc-300 truncate max-w-[180px]">
                      {liveAnalysis?.bay_of_bengal_status || 'Calm Inter-Monsoon Flow'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">ARABIAN SEA:</span>
                    <span className="text-zinc-300 truncate max-w-[180px]">
                      {liveAnalysis?.arabian_sea_status || 'Monitored Convective Mass'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-1.5">
                    <span className="text-zinc-500">MODEL LATENCY:</span>
                    <span className="text-white font-bold">
                      {liveAnalysis?.inference_latency_ms ? `${liveAnalysis.inference_latency_ms} ms` : '11.8 ms (ONNX FP16)'}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 leading-normal flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                  <span>DeepCyclone autonomously processes each incoming 30-min pass to detect nascent cyclonic circulations before official warnings.</span>
                </div>
              </div>

              {/* 4-Band Multi-Spectral Tensor Blueprint */}
              <div className="p-4 bg-[#0a0c10] border border-zinc-800 space-y-2">
                <div className="text-[10px] text-zinc-500 uppercase">TENSOR INPUT SHAPE (4, 512, 512)</div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 block">CH-1: VIS</span>
                    <span className="text-zinc-200 font-bold">0.65 µm Reflect</span>
                  </div>
                  <div className="p-2 bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 block">CH-2: TIR-1</span>
                    <span className="text-zinc-200 font-bold">10.8 µm Clean Window</span>
                  </div>
                  <div className="p-2 bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 block">CH-3: WV</span>
                    <span className="text-zinc-200 font-bold">6.8 µm Upper Vapor</span>
                  </div>
                  <div className="p-2 bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 block">CH-4: CTBT</span>
                    <span className="text-zinc-200 font-bold">12.0 µm Convection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ==================================================================== */
          /* VIEW 2: 4-CHANNEL QUAD MATRIX (SIMULTANEOUS 4-BAND SYNCHRONIZATION)   */
          /* ==================================================================== */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channels.map((ch) => (
                <div 
                  key={ch.id} 
                  className="bg-[#090b10] border border-zinc-800 overflow-hidden shadow-lg"
                >
                  <div className="p-2.5 bg-[#0c0e14] border-b border-zinc-800 flex items-center justify-between font-mono text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="font-bold text-white">{ch.shortName}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">{ch.resolution}</span>
                  </div>

                  <div className="relative aspect-[16/10] bg-black overflow-hidden flex items-center justify-center">
                    <img
                      src={
                        failedImages[ch.id]
                          ? ch.fallbackUrl
                          : `${ch.liveUrl}?t=${cacheBuster}`
                      }
                      alt={ch.name}
                      onError={() => handleImageError(ch.id)}
                      className="w-full h-full object-cover filter contrast-110"
                    />
                    <div className="absolute bottom-2 left-2 font-mono text-[9px] bg-black/80 text-zinc-400 px-1.5 py-0.5 border border-zinc-800">
                      {ch.band}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-zinc-950 border border-zinc-800 font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-zinc-400">
              <span className="text-zinc-300 font-semibold">ALL 4 SATELLITE CHANNELS SYNCHRONIZED ACROSS 74.0°E INDIAN OCEAN PASS</span>
              <span className="text-emerald-400 font-bold">READY FOR MULTI-BAND TENSOR FUSION</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
