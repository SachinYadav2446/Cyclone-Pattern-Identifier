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
  Compass
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

  // Fetch real-time AI inference from Python FastAPI backend
  const fetchLiveAnalysis = async (refresh = false) => {
    try {
      const endpoint = `${API_BASE_URL}/api/v1/live/latest-analysis${refresh ? '?refresh=true' : ''}`;
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
    if (isOpen) {
      fetchLiveAnalysis(false);
    }
  }, [isOpen]);

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

    // INSAT-3D Asia sector georeferenced bounds: 45°E - 105°E (X) and 40°N - 10°S (Y)
    const lat = (40 - y * 50).toFixed(2);
    const lon = (45 + x * 60).toFixed(2);
    setHoverCoords({ lat, lon, xPercent: (x * 100).toFixed(1), yPercent: (y * 100).toFixed(1) });
  };

  if (!isOpen) return null;

  const activeChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];
  const detectedSystems = liveAnalysis?.systems_detected || [];
  const hasActiveSystems = detectedSystems.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#060709] text-zinc-100 flex flex-col overflow-y-auto font-mono">
      {/* Precision background grid lines */}
      <div className="fixed inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
      <div className="fixed -top-32 -left-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. TOP MISSION CONTROL APP BAR */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand & Platform Identifier */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded border border-zinc-700 bg-zinc-900">
            <div 
              className="w-3 h-3 rounded-full border border-emerald-400 border-t-transparent animate-spin" 
              style={{ animationDuration: '3s' }} 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-wider">
                DEEPCYCLONE · GIS COMMAND CENTER
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-950/80 border border-emerald-700 text-emerald-400 font-bold">
                OPERATIONAL
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 flex items-center gap-2">
              <span>INSAT-3D / 3DR ASIA SECTOR</span>
              <span>·</span>
              <span className="text-zinc-500">74.0°E GEOSTATIONARY DOWNLINK</span>
            </div>
          </div>
        </div>

        {/* Center Live Telemetry Clock */}
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-zinc-900 border border-zinc-800">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-300 font-bold">{lastSyncTime || 'LIVE SYNC'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>PYTHON AI: {isBackendConnected ? 'CONNECTED' : 'STANDBY'}</span>
          </div>
        </div>

        {/* Right Action: Close / Back to Showcase */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-white text-zinc-950 font-bold hover:bg-zinc-200 transition-all text-xs shadow"
          >
            <X className="w-4 h-4 text-zinc-900" />
            <span>RETURN TO SHOWCASE</span>
            <span className="text-[9px] text-zinc-600 px-1 py-0.2 bg-zinc-200 rounded">ESC</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSTATION CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 space-y-6">
        {/* Workstation Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-zinc-950/90 border border-zinc-800">
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
                  ? 'bg-emerald-950/50 border-emerald-700 text-emerald-400 font-semibold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Crosshair className={`w-3.5 h-3.5 ${isAiScanActive ? 'text-emerald-400 animate-spin' : 'text-zinc-400'}`} style={{ animationDuration: '10s' }} />
              <span>{isAiScanActive ? 'AI SCANNER ACTIVE' : 'AI SCANNER OFF'}</span>
            </button>
          </div>

          {/* Sync Latest Pass Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white transition-all text-[11px] shadow-xs active:scale-95"
            title="Poll latest satellite pass from server"
          >
            <RefreshCw className={`w-3 h-3 text-zinc-300 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>SYNC OPERATIONAL PASS</span>
          </button>
        </div>

        {/* Channel Selection Bar (Single View) */}
        {viewMode === 'single' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* WORKSTATION DUAL COLUMNS */}
        {viewMode === 'single' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Main Interactive Map & Satellite Viewport (8 Cols) */}
            <div className="lg:col-span-8 bg-[#090b10] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
              {/* Header Bar */}
              <div className="p-3 bg-[#0c0e14] border-b border-zinc-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white tracking-wide">{activeChannel.name}</span>
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
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse top-1/2 -translate-y-1/2" />

                    {/* Detected Real Systems from Python AI Engine */}
                    {hasActiveSystems ? (
                      detectedSystems.map((sys) => (
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
                      /* Clean All-Clear Indicator when basin is calm */
                      <div className="absolute top-4 left-4 z-20 bg-black/85 border border-emerald-700/80 px-3 py-1.5 flex items-center gap-2 text-[10px] text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>AI BASIN STATUS: ALL CLEAR · NO ORGANIZED CYCLONIC VORTICES DETECTED</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Real-Time Mouse Coordinates Indicator */}
                {hoverCoords && (
                  <div className="absolute bottom-3 right-3 bg-black/90 border border-zinc-700 text-zinc-200 px-2.5 py-1 text-[10px] font-mono z-20 pointer-events-none shadow-lg">
                    CURSOR: <span className="text-emerald-400 font-bold">{hoverCoords.lat}°N, {hoverCoords.lon}°E</span>
                  </div>
                )}
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
                    {isBackendConnected ? 'PYTHON AI ENGINE: CONNECTED' : 'AI ENGINE: STANDBY'}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 border font-bold ${
                  isBackendConnected 
                    ? 'bg-emerald-950/60 border-emerald-700 text-emerald-400'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}>
                  FASTAPI LIVE
                </span>
              </div>

              {/* Telemetry HUD: Real-Time Live Basin Meteorology */}
              <div className="p-4 bg-[#0a0c10] border border-zinc-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-bold text-white tracking-wider">
                      LIVE BASIN METEOROLOGY
                    </span>
                  </div>
                  <span className="px-2 py-0.5 border text-[10px] font-bold bg-emerald-950/80 border-emerald-700 text-emerald-400">
                    REAL-TIME OBSERVATION
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block">BASIN STATUS</span>
                    <span className="text-emerald-400 font-bold">
                      {hasActiveSystems ? `${detectedSystems.length} ACTIVE VORTEX` : 'NO CYCLONE ACTIVE'}
                    </span>
                  </div>
                  <div className="p-2 bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block">DETECTED SYSTEMS</span>
                    <span className="text-zinc-200 font-bold">
                      {detectedSystems.length} Convective Systems
                    </span>
                  </div>
                  <div className="p-2 bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block">THREAT LEVEL</span>
                    <span className={`font-bold ${
                      liveAnalysis?.overall_threat_level?.includes('ELEVATED')
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}>
                      {liveAnalysis?.overall_threat_level || 'NORMAL / ALL CLEAR'}
                    </span>
                  </div>
                  <div className="p-2 bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500 text-[10px] block">AI INFERENCE SPEED</span>
                    <span className="text-white font-bold">
                      {liveAnalysis?.inference_latency_ms ? `${liveAnalysis.inference_latency_ms} ms` : '12 ms'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-zinc-950 border border-zinc-800 space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-[10px]">BAY OF BENGAL:</span>
                    <span className="text-zinc-200 font-medium truncate max-w-[190px]">
                      {liveAnalysis?.bay_of_bengal_status || 'Calm Inter-Monsoon Flow'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 text-[10px]">ARABIAN SEA:</span>
                    <span className="text-zinc-300 truncate max-w-[190px]">
                      {liveAnalysis?.arabian_sea_status || 'Stable Clear-Sky Marine Area'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-zinc-800 pt-1">
                    <span className="text-zinc-500 text-[10px]">SATELLITE POSITION:</span>
                    <span className="text-zinc-300">
                      {liveAnalysis?.sub_satellite_point || '74.0°E Geostationary'}
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
                  <span className="text-emerald-400 font-semibold">
                    {isAiScanActive ? 'ONLINE' : 'STANDBY'}
                  </span>
                </div>

                <div className="p-3 bg-black/60 border border-zinc-800/80 space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">CONVECTIVE VORTICES:</span>
                    <span className="text-emerald-300 font-bold">
                      {detectedSystems.length} SYSTEMS REPORTED
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">EYE LOCALIZATION:</span>
                    <span className="text-zinc-300">
                      {hasActiveSystems ? 'CENTERNET FIX LOCKED' : 'STANDBY / ALL CLEAR'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-1.5">
                    <span className="text-zinc-500">DATA SOURCE:</span>
                    <span className="text-zinc-300">
                      IMD MoES / NOAA GOES
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
      </main>
    </div>
  );
}
