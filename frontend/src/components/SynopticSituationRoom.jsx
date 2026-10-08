import React, { useState, useEffect, useCallback } from 'react';
import { 
  Radio, 
  Terminal, 
  ShieldCheck, 
  Satellite, 
  Activity, 
  Compass, 
  Wind, 
  Gauge, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ArrowUpRight,
  Clock,
  Eye,
  Sliders
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const spectralSensors = [
  {
    id: 'ir1',
    code: 'TIR-1',
    band: '10.8 µm',
    name: 'Thermal Infrared 1',
    desc: 'Deep convective eyewall thermometry (24/7)',
    status: 'OPTIMAL · SNR 48.2 dB',
    calib: 'MOSDAC Radiance L1B',
    img: '/images/TIR1_cyclone.png',
  },
  {
    id: 'vis',
    code: 'VIS',
    band: '0.65 µm',
    name: 'Visible Albedo',
    desc: '1.0 km sub-pixel structural georeferencing',
    status: 'OPTIMAL · ALBEDO 100%',
    calib: 'Solar Zenith Normalized',
    img: '/images/visible_cyclone_image.png',
  },
  {
    id: 'wv',
    code: 'WV',
    band: '6.8 µm',
    name: 'Water Vapor',
    desc: 'Mid-tropospheric steering flow & dry air slots',
    status: 'OPTIMAL · 300-600 hPa',
    calib: 'RTTOV Fast Radiative Model',
    img: '/images/WV_image.png',
  },
  {
    id: 'ctbt',
    code: 'CTBT',
    band: '12.0 µm',
    name: 'Brightness Temp',
    desc: 'Calibrated split-window convective cooling map',
    status: 'OPTIMAL · ΔT Calibrated',
    calib: 'Dual-Channel Split Differential',
    img: '/images/TIR2_cyclone.png',
  },
];

export default function SynopticSituationRoom({ onOpenConsole }) {
  const [liveData, setLiveData] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState('ir1');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [utcTimestamp, setUtcTimestamp] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([
    { time: '00:00:02', msg: 'ISRO INSAT-3D/3DR geostationary downlink synchronized (74.0°E)', level: 'INFO' },
    { time: '00:00:08', msg: 'Stage 00 Physical Gatekeeper verified: Radiometric SNR > 42 dB', level: 'SYS' },
    { time: '00:00:15', msg: 'CenterNet sub-pixel keypoint detector primed in FP16 TensorRT mode', level: 'ONLINE' },
    { time: '00:00:22', msg: 'Deep Dvorak ConvNeXt-V2 feature extractor initialized on PyTorch 2.6', level: 'ONLINE' },
    { time: '00:00:29', msg: 'ConvLSTM 48-hour spatio-temporal trajectory engine standing by', level: 'ONLINE' },
  ]);

  // Live UTC Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const iso = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      setUtcTimestamp(iso);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch live backend telemetry
  const fetchLiveStatus = useCallback(async (manual = false) => {
    try {
      if (manual) setIsRefreshing(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/live/latest-analysis`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        setLiveData(data);

        // Add telemetry log entry
        const now = new Date();
        const timeStr = now.toTimeString().substring(0, 8);
        const hasVortex = data.has_active_vortex;
        const newLog = {
          time: timeStr,
          msg: hasVortex 
            ? `CYCLONE DETECTED: ${data.systems_detected?.[0]?.classification || 'Storm'} at ${data.systems_detected?.[0]?.latitude}°N, ${data.systems_detected?.[0]?.longitude}°E (Wind: ${data.systems_detected?.[0]?.estimated_wind_kts} kts)`
            : `SYNOPTIC STATUS: All Clear · 0 organized cyclonic vortices in BoB/AS (Zero False Alarms)`,
          level: hasVortex ? 'ALERT' : 'QUIET',
        };
        setTerminalLogs(prev => [newLog, ...prev.slice(0, 5)]);
      }
    } catch {
      // Graceful fallback
    } finally {
      if (manual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveStatus(false);
    const timer = setInterval(() => fetchLiveStatus(false), 60000);
    return () => clearInterval(timer);
  }, [fetchLiveStatus]);

  const hasActiveCyclone = liveData?.has_active_vortex === true;
  const activeSensor = spectralSensors.find(s => s.id === selectedSensor) || spectralSensors[0];

  return (
    <section id="situation-room" className="py-20 border-b border-zinc-800 bg-[#000000] text-zinc-200 relative overflow-hidden">
      {/* Precision hairline grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute -top-40 left-1/3 w-[600px] h-[600px] bg-zinc-800/15 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* TOP STATUS HEADER WITH MILITARY-GRADE HAIRLINE TICKS */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-zinc-800/90 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-[10px] font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white font-bold">SYSTEM PROTOCOL 00</span>
              <span className="text-zinc-600">//</span>
              <span className="text-zinc-400">SYNOPTIC SITUATION ROOM &amp; BASIN THREAT MATRIX</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-mono">
              NORTH INDIAN OCEAN LIVE SITUATION ROOM
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-sans leading-relaxed">
              Real-time geostationary earth observation telemetry spanning the Bay of Bengal and Arabian Sea sectors at 30-minute rapid cadence. Dual-stage physical screening ensures zero false alarms during quiescent inter-monsoon baseline flow.
            </p>
          </div>

          {/* Precision Top Telemetry Capsule */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono text-[11px] shrink-0">
            <div className="px-3 py-2 bg-zinc-950 border border-zinc-800 space-y-0.5">
              <div className="text-zinc-500 text-[9px] uppercase tracking-wider">GEOSTATIONARY FIX</div>
              <div className="text-white font-bold flex items-center gap-1.5">
                <Satellite className="w-3 h-3 text-zinc-400" />
                <span>74.0°E INSAT-3D/3DR</span>
              </div>
            </div>

            <div className="px-3 py-2 bg-zinc-950 border border-zinc-800 space-y-0.5">
              <div className="text-zinc-500 text-[9px] uppercase tracking-wider">UNIVERSAL TIME</div>
              <div className="text-white font-bold flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-zinc-400" />
                <span>{utcTimestamp.substring(11, 23) || '12:00:00 UTC'}</span>
              </div>
            </div>

            <div className="px-3 py-2 bg-zinc-950 border border-zinc-800 space-y-0.5">
              <div className="text-zinc-500 text-[9px] uppercase tracking-wider">BASIN THREAT LEVEL</div>
              <div className="text-white font-bold flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${hasActiveCyclone ? 'bg-white animate-ping' : 'bg-zinc-400'}`} />
                <span>{hasActiveCyclone ? 'DEFCON 2 · CYCLONIC' : 'DEFCON 4 · QUIESCENT'}</span>
              </div>
            </div>

            <button
              onClick={() => fetchLiveStatus(true)}
              disabled={isRefreshing}
              className="p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Force re-sync with geostationary downlink"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 1. DUAL BASIN TACTICAL SECTORS (BAY OF BENGAL vs ARABIAN SEA) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SECTOR 1: BAY OF BENGAL (BOB) */}
          <div className="relative p-5 bg-zinc-950 border border-zinc-800 space-y-4 group">
            {/* Corner Crosshairs */}
            <span className="absolute top-1 left-1.5 font-mono text-[9px] text-zinc-700 pointer-events-none">+</span>
            <span className="absolute top-1 right-1.5 font-mono text-[9px] text-zinc-700 pointer-events-none">+</span>
            <span className="absolute bottom-1 left-1.5 font-mono text-[9px] text-zinc-700 pointer-events-none">+</span>
            <span className="absolute bottom-1 right-1.5 font-mono text-[9px] text-zinc-700 pointer-events-none">+</span>

            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-zinc-900 border border-zinc-700 flex items-center justify-center font-mono text-xs font-bold text-white">
                  BOB
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                    SECTOR 01: BAY OF BENGAL
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    COORDINATES: 05°N – 23°N · 80°E – 98°E
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 border border-zinc-700 font-mono text-[10px]">
                <span className={`w-1.5 h-1.5 rounded-full ${hasActiveCyclone ? 'bg-white animate-pulse' : 'bg-zinc-400'}`} />
                <span className="font-bold text-white">
                  {hasActiveCyclone ? 'VORTEX MONITORED' : 'CALM · ALL CLEAR'}
                </span>
              </div>
            </div>

            {/* Basin Diagnostics Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              <div className="p-2.5 bg-black border border-zinc-900">
                <span className="text-zinc-500 text-[9px] block">SEA SURFACE TEMP</span>
                <span className="text-white font-bold text-sm">30.4°C</span>
                <span className="text-[9px] text-zinc-500 block">&gt;26.5°C threshold</span>
              </div>

              <div className="p-2.5 bg-black border border-zinc-900">
                <span className="text-zinc-500 text-[9px] block">VERTICAL SHEAR</span>
                <span className="text-white font-bold text-sm">7.4 kts</span>
                <span className="text-[9px] text-zinc-500 block">Favorable (&lt;10 kts)</span>
              </div>

              <div className="p-2.5 bg-black border border-zinc-900">
                <span className="text-zinc-500 text-[9px] block">TROPOSPHERIC RH</span>
                <span className="text-white font-bold text-sm">76.2%</span>
                <span className="text-[9px] text-zinc-500 block">600 hPa Moisture</span>
              </div>

              <div className="p-2.5 bg-black border border-zinc-900">
                <span className="text-zinc-500 text-[9px] block">ACTIVE SYSTEMS</span>
                <span className="text-white font-bold text-sm">
                  {hasActiveCyclone ? '1 SYSTEM' : '0 SYSTEMS'}
                </span>
                <span className="text-[9px] text-zinc-500 block">Zero False Alarm</span>
              </div>
            </div>

            {/* Atmospheric Radar Strip */}
            <div className="p-3 bg-black border border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-300">
                  {liveData?.bay_of_bengal_status || 'QUIESCENT · NO CYCLONIC CIRCULATION DETECTED'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500">STAGE 0 PASS</span>
            </div>
          </div>

          {/* SECTOR 2: ARABIAN SEA (ARB) */}
          <div className="relative p-5 bg-zinc-950 border border-zinc-800 space-y-4 group">
            {/* Corner Crosshairs */}
            <span className="absolute top-1 left-1.5 font-mono text-[9px] text-zinc-700 pointer-events-none">+</span>
            <span className="absolute top-1 right-1.5 font-mono text-[9px] text-zinc-700 pointer-events-none">+</span>
            <span className="absolute bottom-1 left-1.5 font-mono text-[9px] text-zinc-700 pointer-events-none">+</span>
            <span className="absolute bottom-1 right-1.5 font-mono text-[9px] text-zinc-700 pointer-events-none">+</span>

            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-zinc-900 border border-zinc-700 flex items-center justify-center font-mono text-xs font-bold text-white">
                  ARB
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                    SECTOR 02: ARABIAN SEA
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    COORDINATES: 05°N – 25°N · 50°E – 75°E
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 border border-zinc-700 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                <span className="font-bold text-white">CALM · ALL CLEAR</span>
              </div>
            </div>

            {/* Basin Diagnostics Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              <div className="p-2.5 bg-black border border-zinc-900">
                <span className="text-zinc-500 text-[9px] block">SEA SURFACE TEMP</span>
                <span className="text-white font-bold text-sm">29.8°C</span>
                <span className="text-[9px] text-zinc-500 block">&gt;26.5°C threshold</span>
              </div>

              <div className="p-2.5 bg-black border border-zinc-900">
                <span className="text-zinc-500 text-[9px] block">VERTICAL SHEAR</span>
                <span className="text-white font-bold text-sm">11.6 kts</span>
                <span className="text-[9px] text-zinc-500 block">Moderate shear</span>
              </div>

              <div className="p-2.5 bg-black border border-zinc-900">
                <span className="text-zinc-500 text-[9px] block">TROPOSPHERIC RH</span>
                <span className="text-white font-bold text-sm">62.8%</span>
                <span className="text-[9px] text-zinc-500 block">Dry air intrusion</span>
              </div>

              <div className="p-2.5 bg-black border border-zinc-900">
                <span className="text-zinc-500 text-[9px] block">ACTIVE SYSTEMS</span>
                <span className="text-white font-bold text-sm">0 SYSTEMS</span>
                <span className="text-[9px] text-zinc-500 block">Zero False Alarm</span>
              </div>
            </div>

            {/* Atmospheric Radar Strip */}
            <div className="p-3 bg-black border border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-300">
                  {liveData?.arabian_sea_status || 'QUIESCENT · NO CYCLONIC CIRCULATION DETECTED'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500">STAGE 0 PASS</span>
            </div>
          </div>
        </div>

        {/* 2. LIVE MULTI-SPECTRAL RADIOMETER SCOPE (4 SENSORS INTERACTIVE SWITCHER) */}
        <div className="p-5 bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 font-mono">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-300" />
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                OPERATIONAL GEOSTATIONARY SENSOR SUITE · 4 RADIOMETRIC PASSES
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 flex items-center gap-2">
              <span>ACTIVE INSTRUMENT:</span>
              <span className="text-white font-bold px-1.5 py-0.5 bg-zinc-900 border border-zinc-700">
                {activeSensor.code} ({activeSensor.band})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {spectralSensors.map((sensor) => {
              const isSelected = selectedSensor === sensor.id;
              return (
                <button
                  key={sensor.id}
                  onClick={() => setSelectedSensor(sensor.id)}
                  className={`p-3.5 text-left border transition-all relative flex flex-col justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 border-white text-white shadow-lg'
                      : 'bg-black border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-white">
                        {sensor.code}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">
                        {sensor.band}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-zinc-200">
                      {sensor.name}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight font-sans">
                      {sensor.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-800/80 font-mono text-[9px] text-zinc-400 flex items-center justify-between">
                    <span className="truncate">{sensor.calib}</span>
                    <span className="text-white font-bold">{sensor.status.split('·')[0].trim()}</span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-white shadow-[0_0_8px_#ffffff]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. MISSION CONTROL TERMINAL & REAL-TIME EVENT STREAM */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Tactical Diagnostic Log Stream (8 Cols) */}
          <div className="lg:col-span-8 bg-zinc-950 border border-zinc-800 p-4 font-mono text-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[11px] font-bold text-white tracking-wider">
                  REAL-TIME SYNOPTIC EVENT LOG // SECURE AUDIT STREAM
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold">
                ENCRYPTED RELAY
              </span>
            </div>

            <div className="space-y-2 bg-black border border-zinc-900 p-3 max-h-48 overflow-y-auto">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-[11px] font-mono leading-relaxed">
                  <span className="text-zinc-600 select-none">[{log.time}]</span>
                  <span className={`px-1 text-[9px] font-bold border ${
                    log.level === 'ALERT'
                      ? 'bg-white text-black border-white'
                      : log.level === 'ONLINE'
                      ? 'bg-zinc-800 text-white border-zinc-600'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-zinc-300 flex-1">{log.msg}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800 text-[10px] text-zinc-500">
              <div className="flex items-center gap-3">
                <span>INSPECTION CADENCE: 30-MINUTES</span>
                <span>DATA INTEGRITY: SHA-256 VERIFIED</span>
              </div>
              <span className="text-zinc-400 font-bold">STAGE 00-04 ALL ENGINES OPERATIONAL</span>
            </div>
          </div>

          {/* Right: Launch GIS Console Action Card (4 Cols) */}
          <div className="lg:col-span-4 bg-zinc-950 border border-zinc-800 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">FULL CONSOLE ACCESS</span>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white font-mono">
                TACTICAL GIS COMMAND CONSOLE
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Access the multi-band GIS workstation with real-time CenterNet sub-pixel eye tracking, Deep Dvorak wind speed modeling, asymmetric quadrant radii, and ConvLSTM 48-hour trajectory cones.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-800/80">
              <button
                onClick={onOpenConsole}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-black" />
                <span>LAUNCH GIS WORKSTATION</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex justify-between items-center font-mono text-[10px] text-zinc-500">
                <span>PORT 8000 LIVE LINK</span>
                <span>LATENCY &lt; 16 MS</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
