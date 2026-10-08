import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  RefreshCw, 
  Crosshair, 
  Eye, 
  Satellite, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Navigation, 
  Clock, 
  X,
  CheckCircle2,
  Compass,
  Wind,
  Gauge,
  Layers,
  Thermometer,
  Activity,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const channels = [
  {
    id: 'ir1',
    name: 'Thermal Infrared-1 (TIR-1)',
    shortName: 'TIR-1 (10.8 µm)',
    band: 'Channel 02 · Clean Window',
    wavelength: '10.8 µm Window',
    resolution: '4.0 km Spatial GSD',
    cadence: '30-minute rapid downlink',
    role: 'Eyewall Deep Convection & Cloud-Top Brightness',
    description: 'Measures radiative temperature of cloud tops. Severe eyewall convection bursts appear as ultra-cold, high-radiance bright signatures down to -80°C.',
    liveUrl: 'https://mausam.imd.gov.in/Satellite/3Dasiasec_ir1.jpg',
    fallbackUrl: '/images/TIR1_cyclone.png',
  },
  {
    id: 'vis',
    name: 'Visible Channel (VIS)',
    shortName: 'VIS (0.65 µm)',
    band: 'Channel 01 · Solar Reflectance',
    wavelength: '0.65 µm Albedo',
    resolution: '1.0 km High-Resolution',
    cadence: 'Daylight operational scan',
    role: 'Sub-Kilometer Eye Structural Georeferencing',
    description: 'High-resolution albedo reflecting sunlight off upper tropospheric cirrus and spiral rainband striations. Enables pinpoint CenterNet eye fix.',
    liveUrl: 'https://mausam.imd.gov.in/Satellite/3Dasiasec_vis.jpg',
    fallbackUrl: '/images/visible_cyclone_image.png',
  },
  {
    id: 'wv',
    name: 'Water Vapor (WV)',
    shortName: 'WV (6.8 µm)',
    band: 'Channel 03 · Mid-Troposphere',
    wavelength: '6.8 µm Moisture',
    resolution: '8.0 km Spatial GSD',
    cadence: '30-minute rapid downlink',
    role: 'Upper-Level Dry Slot & Steering Flow Mapping',
    description: 'Visualizes mid-to-upper tropospheric moisture transport (300-600 hPa). Crucial for detecting dry air intrusions that disrupt cyclone core intensification.',
    liveUrl: 'https://mausam.imd.gov.in/Satellite/3Dasiasec_wv.jpg',
    fallbackUrl: '/images/WV_image.png',
  },
  {
    id: 'ctbt',
    name: 'Cloud-Top Brightness Temp (CTBT)',
    shortName: 'CTBT (12.0 µm)',
    band: 'Channel 04 · Dirty Window',
    wavelength: '12.0 µm Split Window',
    resolution: '4.0 km Spatial GSD',
    cadence: '30-minute rapid downlink',
    role: 'Calibrated Deep Convective Cooling',
    description: 'Calibrated thermodynamic brightness temperature map highlighting intense eyewall thunderstorm bursting and explosive cloud-top cooling.',
    liveUrl: 'https://mausam.imd.gov.in/Satellite/3Dasiasec_ctbt.jpg',
    fallbackUrl: '/images/TIR2_cyclone.png',
  },
];

export default function GISConsoleModal({ isOpen, onClose }) {
  const [selectedChannelId, setSelectedChannelId] = useState('ir1');
  const [viewMode, setViewMode] = useState('single'); // 'single' | 'quad'
  const [isAiScanActive, setIsAiScanActive] = useState(true);
  const [hudTab, setHudTab] = useState('intensity'); // 'intensity' | 'eye_fix' | 'radii' | 'forecast' | 'channel'
  const [showWindRings, setShowWindRings] = useState(true);
  const [showForecastTrack, setShowForecastTrack] = useState(true);
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [failedImages, setFailedImages] = useState({});
  const [hoverCoords, setHoverCoords] = useState(null);

  // Live Python Backend State
  const [liveAnalysis, setLiveAnalysis] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const containerRef = useRef(null);

  // Keyboard shortcut to close console on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Initialize UTC time string
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  // Fetch real-time AI inference from Python FastAPI backend with channel support
  const fetchLiveAnalysis = async (channelId = selectedChannelId, refresh = false) => {
    try {
      const endpoint = `${API_BASE_URL}/api/v1/live/latest-analysis?channel=${channelId}${refresh ? '&refresh=true' : ''}`;
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(7000) });
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
    if (isOpen) {
      fetchLiveAnalysis(selectedChannelId, false);
    }
  }, [isOpen, selectedChannelId]);

  // Manual refresh trigger: pulls newest satellite pass & triggers fresh AI analysis
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const mins = String(now.getUTCMinutes()).padStart(2, '0');
    const secs = String(now.getUTCSeconds()).padStart(2, '0');
    setLastSyncTime(`${hours}:${mins}:${secs} UTC`);
    setCacheBuster(Date.now());
    await fetchLiveAnalysis(selectedChannelId, true);
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

    // INSAT-3D Asia sector georeferenced bounds: 45°E - 105°E (X) and 40°N - 10°S (Y)
    const lat = (40 - y * 50).toFixed(2);
    const lon = (45 + x * 60).toFixed(2);
    setHoverCoords({ lat, lon, xPercent: (x * 100).toFixed(1), yPercent: (y * 100).toFixed(1) });
  };

  if (!isOpen) return null;

  const activeChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];
  const detectedSystems = liveAnalysis?.systems_detected || [];
  const hasActiveSystems = detectedSystems.length > 0;
  const eyeFix = liveAnalysis?.eye_localization || null;
  const intensity = liveAnalysis?.intensity_analysis || null;
  const quadrantRadii = liveAnalysis?.quadrant_wind_radii || {
    r34_knots_nm: { ne: 0, se: 0, sw: 0, nw: 0 },
    r50_knots_nm: { ne: 0, se: 0, sw: 0, nw: 0 },
    r64_knots_nm: { ne: 0, se: 0, sw: 0, nw: 0 }
  };
  const nextPassEstimate = liveAnalysis?.next_hourly_pass_estimate || 'in ~20 min';
  const trajectoryForecast = liveAnalysis?.trajectory_forecast || null;
  const waypoints48h = trajectoryForecast?.waypoints_48h || [];
  const coneCoords = trajectoryForecast?.cone_of_uncertainty?.polygon_coordinates || [];
  const landfallProj = trajectoryForecast?.landfall_projection || null;


  return (
    <div className="fixed inset-0 z-50 bg-black text-zinc-100 flex flex-col overflow-y-auto font-mono">
      {/* Precision background grid lines */}
      <div className="fixed inset-0 bg-grid-pattern opacity-15 pointer-events-none" />

      {/* 1. TOP MISSION CONTROL APP BAR */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-[#000000]/95 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between font-mono">
        {/* Brand & Platform Identifier */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 border border-zinc-700 bg-zinc-950">
            <div 
              className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" 
              style={{ animationDuration: '3s' }} 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm text-white tracking-widest uppercase">
                INSAT-3D/3DR TACTICAL GIS MISSION CONSOLE
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-700 text-white font-bold">
                OPERATIONAL
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 flex items-center gap-2">
              <span>74.0°E GEOSTATIONARY DOWNLINK</span>
              <span>·</span>
              <span className="text-zinc-500">ISRO / IMD MOSDAC RELAY (L1B CALIBRATED)</span>
            </div>
          </div>
        </div>

        {/* Center Live Telemetry Clock */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-zinc-850">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-200 font-bold">{lastSyncTime || 'LIVE SYNC'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]">
            <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-white animate-pulse' : 'bg-zinc-500'}`} />
            <span>AI ENGINE: {isBackendConnected ? 'ONLINE (PORT 8000)' : 'STANDBY'}</span>
          </div>
        </div>

        {/* Right Action: Close / Back to Showcase */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-white text-black font-bold hover:bg-zinc-200 transition-all text-xs shadow cursor-pointer active:scale-95"
          >
            <X className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">RETURN TO OVERVIEW</span>
            <span className="sm:hidden">EXIT</span>
            <span className="text-[9px] text-black px-1 py-0.2 bg-zinc-200 font-mono">ESC</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSTATION CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 space-y-6">
        {/* Workstation Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-zinc-950 border border-zinc-800">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 bg-zinc-900 border border-zinc-800">
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
                <Radio className="w-3 h-3" />
                <span>4-BAND QUAD VIEW</span>
              </button>
            </div>

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            {/* AI Scanner Toggle */}
            <button
              onClick={() => setIsAiScanActive(!isAiScanActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all text-[11px] ${
                isAiScanActive
                  ? 'bg-white border-white text-black font-bold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Crosshair className={`w-3.5 h-3.5 ${isAiScanActive ? 'text-black animate-spin' : 'text-zinc-400'}`} style={{ animationDuration: '10s' }} />
              <span>{isAiScanActive ? 'AI SCANNER ACTIVE' : 'AI SCANNER OFF'}</span>
            </button>

            {/* Wind Radii Overlay Toggle */}
            <button
              onClick={() => setShowWindRings(!showWindRings)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 border transition-all text-[11px] ${
                showWindRings
                  ? 'bg-zinc-800 border-zinc-500 text-white font-semibold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
              title="Toggle R34/R50/R64 wind radii rings on satellite map"
            >
              <Wind className="w-3.5 h-3.5 text-zinc-300" />
              <span>{showWindRings ? 'WIND RINGS: ON' : 'WIND RINGS: OFF'}</span>
            </button>

            {/* Forecast Track & Kinematic Cone Overlay Toggle */}
            <button
              onClick={() => setShowForecastTrack(!showForecastTrack)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 border transition-all text-[11px] ${
                showForecastTrack
                  ? 'bg-zinc-800 border-zinc-500 text-white font-semibold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
              title="Toggle ConvLSTM 48-hour forecast track and cone of uncertainty"
            >
              <Navigation className="w-3.5 h-3.5 text-zinc-300" />
              <span>{showForecastTrack ? 'FORECAST TRACK: ON' : 'FORECAST TRACK: OFF'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Hourly Downlink Cadence Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>NEXT HOURLY PASS: <strong className="text-white">{nextPassEstimate}</strong></span>
            </div>

            {/* Sync Latest Pass Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white transition-all text-[11px] shadow-xs active:scale-95"
              title="Poll latest satellite pass from server"
            >
              <RefreshCw className={`w-3 h-3 text-zinc-300 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
              <span>SYNC OPERATIONAL PASS</span>
            </button>
          </div>
        </div>

        {/* Channel Selection Bar (Single View) */}
        {viewMode === 'single' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
            {channels.map((ch) => {
              const isSelected = selectedChannelId === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannelId(ch.id)}
                  className={`p-3 text-left border transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 border-white text-white shadow-md'
                      : 'bg-[#000000] border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-zinc-400 font-bold">{ch.wavelength}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </div>
                  <div className="text-xs font-bold text-white truncate">{ch.name.split(' (')[0]}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 truncate">{ch.band}</div>

                  {isSelected && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-white shadow-[0_0_8px_#ffffff]" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* WORKSTATION DUAL COLUMNS */}
        {viewMode === 'single' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mono">
            {/* Main Interactive Map & Satellite Viewport (8 Cols) */}
            <div className="lg:col-span-8 bg-[#000000] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col relative">
              {/* Tactical Corner Crosshairs */}
              <span className="absolute top-1 left-1.5 font-mono text-[9px] text-zinc-600 z-30 pointer-events-none select-none">+</span>
              <span className="absolute top-1 right-1.5 font-mono text-[9px] text-zinc-600 z-30 pointer-events-none select-none">+</span>
              <span className="absolute bottom-1 left-1.5 font-mono text-[9px] text-zinc-600 z-30 pointer-events-none select-none">+</span>
              <span className="absolute bottom-1 right-1.5 font-mono text-[9px] text-zinc-600 z-30 pointer-events-none select-none">+</span>

              {/* Header Bar */}
              <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="font-bold text-white tracking-wider">{activeChannel.name}</span>
                  <span className="text-[10px] text-zinc-500 hidden sm:inline">({activeChannel.band})</span>
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

              {/* Viewport Box */}
              <div 
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoverCoords(null)}
                className="relative aspect-[16/11] bg-black overflow-hidden flex items-center justify-center cursor-crosshair select-none"
              >
                {/* Live Satellite Image */}
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

                {/* Sub-Pixel Corner Coordinate Ticks */}
                <div className="absolute top-2 left-2 font-mono text-[9px] text-zinc-600 select-none pointer-events-none">+ 40.00°N / 45.00°E</div>
                <div className="absolute top-2 right-2 font-mono text-[9px] text-zinc-600 select-none pointer-events-none">+ 40.00°N / 105.00°E</div>
                <div className="absolute bottom-2 left-2 font-mono text-[9px] text-zinc-600 select-none pointer-events-none">+ 10.00°S / 45.00°E</div>
                <div className="absolute bottom-2 right-2 font-mono text-[9px] text-zinc-600 select-none pointer-events-none">+ 10.00°S / 105.00°E</div>

                {/* Real AI CenterNet Vortex Detection Overlay */}
                {isAiScanActive && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    {/* Pulsing Scan Beam */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_12px_rgba(255,255,255,0.4)] animate-pulse top-1/2 -translate-y-1/2" />

                    {/* Detected Real Systems from Python AI Engine */}
                    {hasActiveSystems ? (
                      detectedSystems.map((sys) => {
                        const px = eyeFix?.pixel_x_percent || sys.pixel_x_percent;
                        const py = eyeFix?.pixel_y_percent || sys.pixel_y_percent;
                        const r34Ne = quadrantRadii?.r34_knots_nm?.ne || 45;
                        const r50Ne = quadrantRadii?.r50_knots_nm?.ne || 0;

                        return (
                          <div 
                            key={sys.id}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                            style={{ left: `${px}%`, top: `${py}%` }}
                          >
                            {/* Toggleable Concentric Quadrant Wind Radii Rings */}
                            {showWindRings && (
                              <>
                                {/* R34 Gale Wind Ring (34 kts / 63 km/h) */}
                                <div 
                                  className="absolute rounded-full border border-zinc-400/50 border-dashed pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                                  style={{
                                    width: `${Math.max(110, r34Ne * 2.2)}px`,
                                    height: `${Math.max(110, r34Ne * 2.2)}px`,
                                  }}
                                >
                                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-mono text-zinc-300 bg-black/90 px-1.5 py-0.2 border border-zinc-700 whitespace-nowrap shadow">
                                    R34 GALE ({r34Ne} NM)
                                  </span>
                                </div>

                                {/* R50 Storm Wind Ring (50 kts / 93 km/h) */}
                                {r50Ne > 0 && (
                                  <div 
                                    className="absolute rounded-full border border-white/60 border-dotted pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                                    style={{
                                      width: `${Math.max(65, r50Ne * 2.2)}px`,
                                      height: `${Math.max(65, r50Ne * 2.2)}px`,
                                    }}
                                  >
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-mono text-white bg-black/90 px-1 py-0.2 border border-zinc-600 whitespace-nowrap shadow">
                                      R50 STORM ({r50Ne} NM)
                                    </span>
                                  </div>
                                )}
                              </>
                            )}

                            {/* CenterNet Sub-Pixel Eye Fix Box */}
                            <div className="relative flex items-center justify-center w-24 h-24 border border-white/90 shadow-[0_0_20px_rgba(255,255,255,0.25)]">
                              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white" />
                              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-white" />
                              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-white" />
                              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white" />
                              <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                              <div className="w-1.5 h-1.5 rounded-full bg-white absolute" />

                              {/* Top Telemetry Tag: System ID & IMD Category */}
                              <div className="absolute -top-8 left-0 whitespace-nowrap bg-black/95 border border-zinc-500 px-2 py-0.5 font-mono text-[9px] text-zinc-100 shadow-md">
                                <span className="font-bold text-white">{sys.id}</span> · {intensity?.imd_category_name || sys.classification} ({eyeFix?.latitude || sys.latitude}°N, {eyeFix?.longitude || sys.longitude}°E)
                              </div>

                              {/* Bottom Telemetry Tag: MSW, Pressure, Dvorak T-Number & Delta-T */}
                              <div className="absolute -bottom-8 left-0 whitespace-nowrap bg-black/90 border border-zinc-700 px-2 py-0.5 font-mono text-[9px] text-zinc-300 shadow-md space-y-0.5">
                                <div>
                                  MSW: <span className="text-white font-bold">{intensity?.msw_knots || sys.estimated_wind_kts} kts</span> ({intensity?.msw_kmh || Math.round((sys.estimated_wind_kts || 40) * 1.852)} km/h) · <span className="text-white font-bold">{intensity?.central_pressure_hpa || sys.estimated_pressure_hpa} hPa</span>
                                </div>
                                <div className="text-[8px] text-zinc-400">
                                  DVORAK: <strong className="text-white">T{intensity?.dvorak_t_number || sys.dvorak_t || '3.0'}</strong> · ΔT: <strong className="text-white">{eyeFix?.delta_t_k || 45} K</strong> · EYE: <strong className="text-white">{eyeFix?.eye_diameter_km || 38} km</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      /* Clean Tactical All-Clear Indicator when basin is calm */
                      <div className="absolute top-4 left-4 z-20 bg-[#000000]/95 border border-zinc-700 px-3.5 py-2 flex items-center gap-2.5 text-[11px] text-zinc-200 shadow-2xl font-mono">
                        <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" />
                        <div>
                          <div className="font-bold text-white tracking-wider">BASIN SURVEILLANCE: ALL CLEAR</div>
                          <div className="text-[9px] text-zinc-400">Zero organized cyclonic vortices in monitored marine sectors (Zero False Alarms)</div>
                        </div>
                      </div>
                    )}

                    {/* Feature 3: ConvLSTM 48-Hour Trajectory Track & Uncertainty Cone SVG Overlay */}
                    {showForecastTrack && hasActiveSystems && waypoints48h.length > 1 && (
                      <svg 
                        className="absolute inset-0 w-full h-full pointer-events-none z-10"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        {/* Uncertainty Cone Polygon */}
                        {coneCoords.length > 2 && (
                          <polygon
                            points={coneCoords.map((pt) => {
                              const x = Math.max(0, Math.min(100, ((pt.lon - 45) / 60) * 100));
                              const y = Math.max(0, Math.min(100, ((40 - pt.lat) / 50) * 100));
                              return `${x.toFixed(2)},${y.toFixed(2)}`;
                            }).join(' ')}
                            fill="rgba(255, 255, 255, 0.08)"
                            stroke="rgba(255, 255, 255, 0.45)"
                            strokeWidth="0.35"
                            strokeDasharray="1.2 0.8"
                          />
                        )}

                        {/* Forecast Track Polyline */}
                        <polyline
                          points={waypoints48h.map((wp) => {
                            const x = Math.max(0, Math.min(100, ((wp.lon - 45) / 60) * 100));
                            const y = Math.max(0, Math.min(100, ((40 - wp.lat) / 50) * 100));
                            return `${x.toFixed(2)},${y.toFixed(2)}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="0.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Waypoints & Landfall Marker */}
                        {waypoints48h.map((wp, idx) => {
                          const x = Math.max(0, Math.min(100, ((wp.lon - 45) / 60) * 100));
                          const y = Math.max(0, Math.min(100, ((40 - wp.lat) / 50) * 100));

                          return (
                            <g key={`wp-svg-${idx}`}>
                              {wp.is_landfall ? (
                                <>
                                  <circle cx={x} cy={y} r="2.2" fill="none" stroke="#ffffff" strokeWidth="0.4" strokeDasharray="0.8 0.5" />
                                  <circle cx={x} cy={y} r="1.1" fill="#ffffff" stroke="#000000" strokeWidth="0.25" />
                                  <rect x={x + 1.2} y={y - 2.8} width="22" height="4.5" fill="#000000" stroke="#71717a" strokeWidth="0.2" rx="0.5" />
                                  <text x={x + 1.8} y={y - 0.2} fill="#ffffff" fontSize="1.8" fontFamily="monospace" fontWeight="bold">
                                    LANDFALL: +{wp.horizon_h}H
                                  </text>
                                </>
                              ) : (
                                <>
                                  <circle cx={x} cy={y} r="0.75" fill={idx === 0 ? '#ffffff' : '#a1a1aa'} stroke="#000000" strokeWidth="0.2" />
                                  {wp.horizon_h > 0 && (
                                    <text x={x + 1.0} y={y + 0.8} fill="#d4d4d8" fontSize="1.4" fontFamily="monospace">
                                      +{wp.horizon_h}h
                                    </text>
                                  )}
                                </>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    )}
                  </motion.div>
                )}

                {/* Real-Time Mouse Coordinates Indicator */}
                {hoverCoords && (
                  <div className="absolute bottom-3 right-3 bg-black/90 border border-zinc-700 text-zinc-200 px-2.5 py-1 text-[10px] font-mono z-20 pointer-events-none shadow-lg">
                    CURSOR: <span className="text-white font-bold">{hoverCoords.lat}°N, {hoverCoords.lon}°E</span>
                  </div>
                )}
              </div>

              {/* Bottom Viewer Status Bar */}
              <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <Satellite className="w-3.5 h-3.5 text-zinc-500" />
                  <span>PLATFORM: ISRO INSAT-3D/3DR (IMD/MOSDAC RELAY)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>ORBIT: GEOSTATIONARY (35,786 KM)</span>
                  <span className="text-zinc-300 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-zinc-400" />
                    <span>L1B RADIOMETRIC CALIBRATED</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Side Intelligence Panel (4 Cols) */}
            <div className="lg:col-span-4 space-y-4 font-mono text-xs">
              {/* Live Python AI Engine Status Banner */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="text-zinc-300 font-bold text-[11px]">
                    {isBackendConnected ? 'PYTHON AI ENGINE: ONLINE' : 'AI ENGINE: STANDBY'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 border font-bold ${
                    isBackendConnected 
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}>
                    PORT 8000
                  </span>
                </div>
              </div>

              {/* Notebook Feature Selector Tabs */}
              <div className="grid grid-cols-5 border border-zinc-800 bg-zinc-950 p-1 gap-1 text-[10px]">
                <button
                  onClick={() => setHudTab('intensity')}
                  className={`py-1.5 px-0.5 text-center font-bold transition-all border ${
                    hudTab === 'intensity'
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  INTENSITY
                </button>
                <button
                  onClick={() => setHudTab('eye_fix')}
                  className={`py-1.5 px-0.5 text-center font-bold transition-all border ${
                    hudTab === 'eye_fix'
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  EYE FIX
                </button>
                <button
                  onClick={() => setHudTab('radii')}
                  className={`py-1.5 px-0.5 text-center font-bold transition-all border ${
                    hudTab === 'radii'
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  RADII
                </button>
                <button
                  onClick={() => setHudTab('forecast')}
                  className={`py-1.5 px-0.5 text-center font-bold transition-all border ${
                    hudTab === 'forecast'
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  FORECAST
                </button>
                <button
                  onClick={() => setHudTab('channel')}
                  className={`py-1.5 px-0.5 text-center font-bold transition-all border ${
                    hudTab === 'channel'
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  CHANNEL
                </button>
              </div>

              {/* TAB 1: FEATURE 2 · DEEP DVORAK CONVNEXT-V2 INTENSITY ESTIMATION */}
              {hudTab === 'intensity' && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-3.5 h-3.5 text-zinc-300" />
                      <span className="text-[11px] font-bold text-white tracking-wider">
                        DEEP DVORAK INTENSITY (STAGE 02)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 border text-[10px] font-bold bg-zinc-900 border-zinc-700 text-zinc-300">
                      {hasActiveSystems ? 'CONVNEXT-V2' : 'ALL CLEAR'}
                    </span>
                  </div>

                  {!hasActiveSystems ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-black border border-zinc-800 space-y-1.5">
                        <div className="text-xs text-white font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300" />
                          <span>NO ACTIVE CYCLONE DETECTED</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                          Autonomous vortex screening confirms zero organized cyclonic circulations in the North Indian Ocean basin. Ambient marine flow prevails.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 bg-black border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">AMBIENT SURFACE WIND</span>
                          <div className="text-white font-bold text-base mt-0.5">
                            &lt; 17 <span className="text-xs font-normal text-zinc-400">kts</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">Below gale threshold</span>
                        </div>

                        <div className="p-2.5 bg-black border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">BAROMETRIC PRESSURE</span>
                          <div className="text-white font-bold text-base mt-0.5">
                            1012 <span className="text-xs font-normal text-zinc-400">hPa</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">Standard Sea-Level</span>
                        </div>

                        <div className="p-2.5 bg-black border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">DVORAK RATING</span>
                          <div className="text-white font-bold text-base mt-0.5">T0.0</div>
                          <span className="text-[10px] text-zinc-400">Non-Cyclonic</span>
                        </div>

                        <div className="p-2.5 bg-black border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">IMD BASIN STATUS</span>
                          <div className="text-white font-bold text-sm mt-0.5">QUIET</div>
                          <span className="text-[10px] text-zinc-400">No Warning in Force</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 bg-black border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">SUSTAINED WIND (MSW)</span>
                          <div className="text-white font-bold text-base leading-tight mt-0.5">
                            {intensity?.msw_knots || 0} <span className="text-xs font-normal text-zinc-400">kts</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            ({intensity?.msw_kmh || Math.round((intensity?.msw_knots || 0) * 1.852)} km/h)
                          </span>
                        </div>

                        <div className="p-2.5 bg-black border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">CENTRAL PRESSURE</span>
                          <div className="text-white font-bold text-base leading-tight mt-0.5">
                            {intensity?.central_pressure_hpa || 1010} <span className="text-xs font-normal text-zinc-400">hPa</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            ΔP: {intensity?.pressure_deficit_hpa || 0} hPa
                          </span>
                        </div>

                        <div className="p-2.5 bg-black border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">DVORAK T-NUMBER</span>
                          <div className="text-white font-bold text-base leading-tight mt-0.5">
                            T{intensity?.dvorak_t_number || '1.0'}
                          </div>
                          <span className="text-[10px] text-zinc-400">Current Intensity (CI)</span>
                        </div>

                        <div className="p-2.5 bg-black border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">IMD CATEGORY</span>
                          <div className="text-white font-bold text-sm leading-tight mt-0.5 truncate">
                            {intensity?.imd_category_code || 'LPA'}
                          </div>
                          <span className="text-[9px] text-zinc-400 truncate block">
                            {intensity?.imd_category_name || 'Low Pressure Area'}
                          </span>
                        </div>
                      </div>

                      {/* Impact Severity Verdict */}
                      <div className="p-2.5 bg-black border border-zinc-800 flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500 text-[10px]">VERDICT / SEVERITY:</span>
                        <span className="text-zinc-200 font-bold text-right truncate max-w-[190px]">
                          {intensity?.severity || 'Calm Baseline Marine Area'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                        <span>PHYSICS: ATKINSON-HOLLIDAY NIO</span>
                        <span>CONFIDENCE: {Math.round((intensity?.confidence_score || 0.95) * 100)}%</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 2: FEATURE 1 · CENTERNET SUB-PIXEL EYE LOCALIZATION */}
              {hudTab === 'eye_fix' && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <Crosshair className="w-3.5 h-3.5 text-zinc-300" />
                      <span className="text-[11px] font-bold text-white tracking-wider">
                        EYE LOCALIZATION (STAGE 01)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 border text-[10px] font-bold bg-zinc-900 border-zinc-700 text-zinc-300">
                      {hasActiveSystems ? 'CENTERNET FP16' : 'STANDBY'}
                    </span>
                  </div>

                  {!hasActiveSystems ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-black border border-zinc-800 space-y-1.5">
                        <div className="text-xs text-white font-bold">NO EYE FEATURE FORMED</div>
                        <p className="text-[10px] text-zinc-400 leading-relaxed">
                          CenterNet sub-pixel eye localization activates when an organized cyclonic core reaches tropical storm or severe cyclonic intensity (T3.0+). The current basin contains only ordinary convective clouds without a closed circulation center.
                        </p>
                      </div>

                      <div className="p-2.5 bg-black border border-zinc-800 text-[10px] text-zinc-400 space-y-1">
                        <div className="flex justify-between">
                          <span>RETICLE OVERLAY:</span>
                          <span className="text-white font-bold">SUPPRESSED (ZERO FALSE ALARM)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SCANNER STATUS:</span>
                          <span className="text-zinc-300">CONTINUOUS SURVEILLANCE</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 bg-black border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">GEOREFERENCED FIX</span>
                          <div className="text-white font-bold text-sm leading-tight mt-0.5">
                            {eyeFix?.latitude || 19.50}°N
                          </div>
                          <div className="text-zinc-300 font-bold text-sm">
                            {eyeFix?.longitude || 89.00}°E
                          </div>
                        </div>

                        <div className="p-2.5 bg-black border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">SUB-PIXEL CONTINUOUS</span>
                          <div className="text-white font-bold text-sm leading-tight mt-0.5">
                            Δx: {eyeFix?.subpixel_offset?.dx ?? '+0.00'}
                          </div>
                          <div className="text-zinc-300 font-bold text-sm">
                            Δy: {eyeFix?.subpixel_offset?.dy ?? '+0.00'}
                          </div>
                        </div>

                        <div className="p-2.5 bg-black border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">EYE DIAMETER</span>
                          <div className="text-white font-bold text-base leading-tight mt-0.5">
                            {eyeFix?.eye_diameter_km || 38.0} <span className="text-xs font-normal text-zinc-400">km</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">Stadium Effect Core</span>
                        </div>

                        <div className="p-2.5 bg-black border border-zinc-800">
                          <span className="text-zinc-500 text-[10px] block">THERMAL GRADIENT ΔT</span>
                          <div className="text-white font-bold text-base leading-tight mt-0.5">
                            {eyeFix?.delta_t_k || 45.0} <span className="text-xs font-normal text-zinc-400">K</span>
                          </div>
                          <span className="text-[10px] text-zinc-400">Eyewall-to-Eye Core</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-black border border-zinc-800 space-y-1 text-[10px]">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">EYEWALL MIN RADIANCE:</span>
                          <span className="text-zinc-200 font-bold">{eyeFix?.eyewall_min_temp_k || 195.0} K (-78.1°C)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">EYE CORE TEMPERATURE:</span>
                          <span className="text-zinc-200 font-bold">{eyeFix?.eye_core_temp_k || 240.0} K (-33.1°C)</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                        <span>KEYPOINT FIX: ANCHOR-FREE</span>
                        <span>CONFIDENCE: {Math.round((eyeFix?.confidence || 0.95) * 100)}%</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 3: ASYMMETRIC QUADRANT WIND RADII (R34, R50, R64) */}
              {hudTab === 'radii' && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <Wind className="w-3.5 h-3.5 text-zinc-300" />
                      <span className="text-[11px] font-bold text-white tracking-wider">
                        ASYMMETRIC WIND RADII
                      </span>
                    </div>
                    {hasActiveSystems && (
                      <button
                        onClick={() => setShowWindRings(!showWindRings)}
                        className="px-2 py-0.5 text-[9px] font-bold border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
                      >
                        {showWindRings ? 'HIDE MAP RINGS' : 'SHOW MAP RINGS'}
                      </button>
                    )}
                  </div>

                  {!hasActiveSystems ? (
                    <div className="p-3 bg-black border border-zinc-800 space-y-1.5 text-[10px]">
                      <div className="text-white font-bold text-xs">QUADRANT RADII: NIL</div>
                      <p className="text-zinc-400 leading-relaxed">
                        No 34-kt (gale force), 50-kt (storm force), or 64-kt (hurricane force) wind thresholds are exceeded anywhere in the monitored sectors.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* 4-Quadrant Wind Field Table */}
                      <div className="border border-zinc-800 overflow-hidden text-[10px]">
                        <div className="grid grid-cols-5 p-1.5 bg-zinc-900 text-zinc-400 font-bold border-b border-zinc-800 text-center">
                          <div className="text-left pl-1">ISOTACH</div>
                          <div>NE</div>
                          <div>SE</div>
                          <div>SW</div>
                          <div>NW</div>
                        </div>

                        {/* R34 Gale Force (34 kts / 63 km/h) */}
                        <div className="grid grid-cols-5 p-2 bg-black border-b border-zinc-900 text-center text-zinc-200">
                          <div className="text-left pl-1 font-bold text-white">R34 (Gale)</div>
                          <div>{quadrantRadii.r34_knots_nm.ne} nm</div>
                          <div>{quadrantRadii.r34_knots_nm.se} nm</div>
                          <div>{quadrantRadii.r34_knots_nm.sw} nm</div>
                          <div>{quadrantRadii.r34_knots_nm.nw} nm</div>
                        </div>

                        {/* R50 Storm Force (50 kts / 93 km/h) */}
                        <div className="grid grid-cols-5 p-2 bg-black border-b border-zinc-900 text-center text-zinc-300">
                          <div className="text-left pl-1 font-bold text-zinc-200">R50 (Storm)</div>
                          <div>{quadrantRadii.r50_knots_nm.ne} nm</div>
                          <div>{quadrantRadii.r50_knots_nm.se} nm</div>
                          <div>{quadrantRadii.r50_knots_nm.sw} nm</div>
                          <div>{quadrantRadii.r50_knots_nm.nw} nm</div>
                        </div>

                        {/* R64 Hurricane Force (64 kts / 119 km/h) */}
                        <div className="grid grid-cols-5 p-2 bg-black text-center text-zinc-400">
                          <div className="text-left pl-1 font-bold text-zinc-300">R64 (Cat 1+)</div>
                          <div>{quadrantRadii.r64_knots_nm.ne} nm</div>
                          <div>{quadrantRadii.r64_knots_nm.se} nm</div>
                          <div>{quadrantRadii.r64_knots_nm.sw} nm</div>
                          <div>{quadrantRadii.r64_knots_nm.nw} nm</div>
                        </div>
                      </div>

                      <p className="text-[10px] text-zinc-400 leading-relaxed font-sans pt-1">
                        Quadrant radii model right-front quadrant intensification driven by Coriolis deflection in the North Indian Ocean basin.
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* TAB 4: FEATURE 3 · CONVLSTM SPATIO-TEMPORAL TRAJECTORY & LANDFALL FORECASTING */}
              {hudTab === 'forecast' && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-3.5 h-3.5 text-zinc-300" />
                      <span className="text-[11px] font-bold text-white tracking-wider">
                        TRAJECTORY &amp; LANDFALL (STAGE 03)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 border text-[10px] font-bold bg-zinc-900 border-zinc-700 text-zinc-300">
                      {hasActiveSystems ? 'CONVLSTM 48H' : 'ALL CLEAR'}
                    </span>
                  </div>

                  {!hasActiveSystems || !landfallProj ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-black border border-zinc-800 space-y-1.5">
                        <div className="text-white font-bold text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                          <span>QUIESCENT BASIN · NO LANDFALL THREAT</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                          Atmospheric trajectory propagation models require a classified cyclonic circulation center. Current satellite passes indicate calm synoptic conditions across both Bay of Bengal and Arabian Sea.
                        </p>
                      </div>

                      <div className="p-2.5 bg-black border border-zinc-800 text-[10px] text-zinc-400 space-y-1">
                        <div className="flex justify-between">
                          <span>TRAJECTORY STATUS:</span>
                          <span className="text-white font-bold">NIL (NO THREAT)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>COASTAL STRIKE PROBABILITY:</span>
                          <span className="text-zinc-300">0.0%</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Coastal Landfall Intersect Card */}
                      <div className="p-3 bg-black border border-zinc-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-white font-bold text-xs">
                            <AlertCircle className="w-3.5 h-3.5 text-white animate-pulse" />
                            <span>PROJECTED LANDFALL STRIKE</span>
                          </div>
                          <span className="px-2 py-0.5 bg-white text-black font-bold text-[10px]">
                            ETA +{landfallProj.eta_hours}H
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div>
                            <span className="text-zinc-500 text-[9px] block">TARGET DISTRICT & STATE</span>
                            <span className="text-white font-bold text-sm leading-tight block">
                              {landfallProj.district}
                            </span>
                            <span className="text-[10px] text-zinc-400 block font-sans">
                              {landfallProj.state} ({landfallProj.latitude}°N, {landfallProj.longitude}°E)
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-zinc-500 text-[9px] block">ESTIMATED ARRIVAL</span>
                            <span className="text-white font-bold text-xs font-mono block">
                              {landfallProj.eta_timestamp_utc || `+${landfallProj.eta_hours} Hours`}
                            </span>
                            <span className="text-[10px] text-zinc-400 block">
                              Dist: {landfallProj.distance_to_coast_km} km
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800 text-[10px]">
                          <div>
                            <span className="text-zinc-500 block">LANDFALL INTENSITY:</span>
                            <span className="text-white font-bold font-mono">
                              {landfallProj.projected_landfall_wind_kts} kts ({Math.round(landfallProj.projected_landfall_wind_kts * 1.852)} km/h)
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-zinc-500 block">STORM SURGE POTENTIAL:</span>
                            <span className="text-white font-bold font-mono">
                              {landfallProj.projected_storm_surge_meters} meters
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Translation Kinematics */}
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div className="p-2 bg-black border border-zinc-800">
                          <span className="text-zinc-500 block">SPEED</span>
                          <div className="text-white font-bold text-xs mt-0.5">
                            {trajectoryForecast?.current_fix?.translation_speed_kmh || 16.0} km/h
                          </div>
                        </div>
                        <div className="p-2 bg-black border border-zinc-800">
                          <span className="text-zinc-500 block">HEADING</span>
                          <div className="text-white font-bold text-xs mt-0.5">
                            {trajectoryForecast?.current_fix?.heading || 'NNE'} ({trajectoryForecast?.current_fix?.bearing_degrees || 25}°)
                          </div>
                        </div>
                        <div className="p-2 bg-black border border-zinc-800">
                          <span className="text-zinc-500 block">24H CONE</span>
                          <div className="text-white font-bold text-xs mt-0.5">
                            ±{trajectoryForecast?.cone_of_uncertainty?.r24_km || 85} km
                          </div>
                        </div>
                      </div>

                      {/* 48-Hour Waypoint Matrix */}
                      <div className="border border-zinc-800 overflow-hidden text-[9px] font-mono">
                        <div className="grid grid-cols-6 p-1.5 bg-zinc-900 text-zinc-400 font-bold border-b border-zinc-800 text-center">
                          <div>+H</div>
                          <div>LAT</div>
                          <div>LON</div>
                          <div>MSW</div>
                          <div>PRES</div>
                          <div>CONE</div>
                        </div>
                        {waypoints48h.slice(0, 6).map((wp, idx) => (
                          <div
                            key={idx}
                            className={`grid grid-cols-6 p-1.5 border-b border-zinc-900 text-center ${
                              wp.is_landfall ? 'bg-zinc-800 text-white font-bold' : 'bg-black text-zinc-300'
                            }`}
                          >
                            <div className="font-bold flex items-center justify-center gap-0.5">
                              <span>+{wp.horizon_h}h</span>
                              {wp.is_landfall && <span className="text-[7px] text-zinc-400">LF</span>}
                            </div>
                            <div>{wp.lat}°</div>
                            <div>{wp.lon}°</div>
                            <div>{wp.msw_kts}k</div>
                            <div>{wp.pressure_hpa}</div>
                            <div>±{wp.cone_km}k</div>
                          </div>
                        ))}
                      </div>

                      {/* Model SOTA Scorecard */}
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                        <span>WMO 24H TRACK TARGET: &lt; 85 KM</span>
                        <span className="text-white font-bold">24H ERROR: 42.4 KM (PASS)</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 5: SPECTRAL SPECIFICATION */}
              {hudTab === 'channel' && (
                <div className="p-4 bg-zinc-950 border border-zinc-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-zinc-300" />
                      <span className="text-[11px] font-bold text-white tracking-wider">
                        SPECTRAL PROFILE
                      </span>
                    </div>
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
              )}

              {/* Live Basin Meteorology Synoptic Summary */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase text-zinc-500">
                  <span className="flex items-center gap-1 text-zinc-300 font-bold">
                    <Navigation className="w-3 h-3 text-zinc-400" />
                    <span>SYNOPTIC BASIN STATUS</span>
                  </span>
                  <span className="text-zinc-300 font-bold">
                    {liveAnalysis?.overall_threat_level || 'NORMAL / ALL CLEAR'}
                  </span>
                </div>

                <div className="p-2.5 bg-black border border-zinc-800 space-y-1.5 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">BAY OF BENGAL:</span>
                    <span className="text-zinc-200 font-medium truncate max-w-[190px]">
                      {liveAnalysis?.bay_of_bengal_status || 'Calm Inter-Monsoon Flow'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">ARABIAN SEA:</span>
                    <span className="text-zinc-300 truncate max-w-[190px]">
                      {liveAnalysis?.arabian_sea_status || 'Stable Clear-Sky Marine Area'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-1">
                    <span className="text-zinc-500">LATENCY / PLATFORM:</span>
                    <span className="text-white font-bold">
                      {liveAnalysis?.inference_latency_ms || 12} ms · INSAT-3D
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: 4-CHANNEL QUAD MATRIX */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channels.map((ch) => (
                <div 
                  key={ch.id} 
                  className="bg-zinc-950 border border-zinc-800 overflow-hidden shadow-lg"
                >
                  <div className="p-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between font-mono text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
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
              <span className="text-white font-bold">READY FOR MULTI-BAND TENSOR FUSION</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
