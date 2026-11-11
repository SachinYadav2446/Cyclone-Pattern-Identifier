import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft,
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Wind, 
  Gauge, 
  Layers, 
  Crosshair, 
  Satellite, 
  Info, 
  Palette, 
  Download, 
  Compass, 
  Thermometer, 
  Droplets,
  Activity
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function SatelliteTimelapsePlayer({ 
  isOpen, 
  onClose 
}) {
  const [selectedBand, setSelectedBand] = useState('ir1');
  const [paletteMode, setPaletteMode] = useState('enhanced'); // 'enhanced' | 'raw'
  const [selectedHours, setSelectedHours] = useState(48); // 12, 24, 48
  const [researchMode] = useState('storm'); // Default directly to real cyclone tracking pass
  const [sequenceData, setSequenceData] = useState(null);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 0.5, 1.0, 2.0, 4.0
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const [loading, setLoading] = useState(false);

  // Interactive temperature probe on hover
  const [hoverProbe, setHoverProbe] = useState({
    active: false,
    xPct: 50,
    yPct: 50,
    cursorX: 0,
    cursorY: 0,
    tbK: 220,
    tbC: -53.1,
    regime: 'Cold Cirrus Canopy',
    regimeColor: '#f59e0b'
  });

  const timerRef = useRef(null);
  const viewportRef = useRef(null);

  // Fetch sequence frames when band, hours, or mode changes
  useEffect(() => {
    if (!isOpen) return;
    const fetchSeq = async () => {
      setLoading(true);
      try {
        const url = `${API_BASE_URL}/api/v1/satellite/timelapse/live_insat?band=${selectedBand}&hours=${selectedHours}&mode=${researchMode}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setSequenceData(data);
          setCurrentFrameIdx(0);
          setIsPlaying(true);

          // Preload frame images for smooth playback
          if (data.frames) {
            data.frames.forEach((f) => {
              const img = new window.Image();
              const fullUrl = f.image_url.startsWith('http') 
                ? f.image_url 
                : `${API_BASE_URL}${f.image_url}&palette=${paletteMode}`;
              img.src = fullUrl;
            });
          }
        }
      } catch (err) {
        console.warn('Satellite sequence fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeq();
  }, [isOpen, selectedBand, selectedHours, researchMode, paletteMode]);

  // Animation playback loop
  useEffect(() => {
    if (!isPlaying || !sequenceData?.frames?.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.round(1000 / (1.5 * playbackSpeed));
    timerRef.current = setInterval(() => {
      setCurrentFrameIdx(prev => (prev + 1) % sequenceData.frames.length);
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, sequenceData, playbackSpeed]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentFrameIdx(p => (p > 0 ? p - 1 : (sequenceData?.frames?.length || 1) - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIsPlaying(false);
        setCurrentFrameIdx(p => (p + 1) % (sequenceData?.frames?.length || 1));
      } else if (e.key === 'r' || e.key === 'R') {
        setCurrentFrameIdx(0);
        setIsPlaying(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, sequenceData, onClose]);

  if (!isOpen) return null;

  const currentFrame = sequenceData?.frames?.[currentFrameIdx] || null;
  const totalFrames = sequenceData?.frames?.length || 0;

  const currentImageUrl = currentFrame 
    ? (currentFrame.image_url.startsWith('http') 
        ? currentFrame.image_url 
        : `${API_BASE_URL}${currentFrame.image_url}&palette=${paletteMode}`)
    : '';

  // Interactive temperature probe on image mouse hover
  const handleImageMouseMove = (e) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, (y / rect.height) * 100));

    const baseTbC = currentFrame?.cloud_top_temp_c || -69.4;
    let coreDist = 999;
    if (currentFrame?.has_cyclone && currentFrame.pixel_x_pct) {
      const dx = xPct - currentFrame.pixel_x_pct;
      const dy = yPct - currentFrame.pixel_y_pct;
      coreDist = Math.sqrt(dx * dx + dy * dy);
    }

    let estimatedTbC;
    if (currentFrame?.has_cyclone) {
      if (coreDist < 3.5) {
        estimatedTbC = Math.round(baseTbC + (currentFrame.delta_t_k || 36.0));
      } else if (coreDist < 16.0) {
        estimatedTbC = Math.round(baseTbC - 6.0);
      } else if (coreDist < 34.0) {
        estimatedTbC = Math.round(baseTbC + (coreDist - 16) * 1.6);
      } else {
        estimatedTbC = Math.round(Math.min(29.0, 12.0 + (coreDist - 34) * 0.5));
      }
    } else {
      estimatedTbC = Math.round(27.0 - (yPct / 100.0) * 14.0 + Math.sin(xPct * 0.12) * 5.0);
    }

    const tbK = Math.round((estimatedTbC + 273.15) * 10) / 10;
    let regime = "Warm Tropical Ocean (> +15°C)";
    let regimeColor = "#38bdf8";

    if (estimatedTbC <= -75) {
      regime = "Overshooting Convective Peak (< -75°C)";
      regimeColor = "#ffffff";
    } else if (estimatedTbC <= -60) {
      regime = "Intense Eyewall Convection (-60°C to -75°C)";
      regimeColor = "#ea580c";
    } else if (estimatedTbC <= -40) {
      regime = "Cold Cirrus Canopy (-40°C to -60°C)";
      regimeColor = "#f59e0b";
    } else if (estimatedTbC <= -10) {
      regime = "Mid-Level Spiral Rainband (-10°C to -40°C)";
      regimeColor = "#06b6d4";
    } else if (estimatedTbC <= 15) {
      regime = "Low Stratiform Deck / Cumulus";
      regimeColor = "#10b981";
    }

    setHoverProbe({
      active: true,
      xPct: Math.round(xPct * 10) / 10,
      yPct: Math.round(yPct * 10) / 10,
      cursorX: x,
      cursorY: y,
      tbK,
      tbC: estimatedTbC,
      regime,
      regimeColor
    });
  };

  const handleExportCurrentPass = () => {
    if (!currentImageUrl) return;
    const link = document.createElement('a');
    link.href = currentImageUrl;
    const cleanTs = (currentFrame?.timestamp_utc || 'pass').replace(/[: ]/g, '_');
    link.download = `INSAT3D_${selectedBand}_${cleanTs}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans flex items-center justify-center p-2 sm:p-4">
      {/* Dark Ambient Backdrop */}
      <div 
        className="fixed inset-0 bg-black/95 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Mission Control Console Modal (Height capped at 92vh to NEVER overflow) */}
      <div 
        className="relative z-10 w-[98vw] max-w-[1740px] h-[92vh] bg-[#07030e] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar: Clean, Single-Row & Professional (No Wrapping) */}
        <div className="h-14 px-4 sm:px-6 bg-[#0c0616] border-b border-zinc-800 flex items-center justify-between gap-4 shrink-0 font-mono">
          {/* Left: Back Button & Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#180e28] hover:bg-[#26133c] border border-[#64104E]/80 hover:border-[#E04A31] text-xs font-bold text-slate-200 hover:text-white transition-all duration-200 cursor-pointer shadow-sm active:scale-95 group"
              title="Back to Home (Esc)"
            >
              <ArrowLeft className="w-4 h-4 text-[#E04A31] group-hover:-translate-x-1 transition-transform duration-200" />
              <span>Back</span>
            </button>

            <div className="h-5 w-px bg-zinc-800" />

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#E04A31]/20 border border-[#E04A31]/40 text-[#E04A31]">
                <Satellite className="w-4 h-4 animate-pulse" />
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                ISRO INSAT-3D/3DR OBSERVATORY
              </h2>
              <span className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE (74.0°E)
              </span>
            </div>
          </div>

          {/* Right: Operational Controls Strip (Single Line, Never Wraps) */}
          <div className="flex items-center gap-2 text-xs shrink-0">
            {/* Spectral Band Selector */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setSelectedBand('ir1')}
                className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                  selectedBand === 'ir1' ? 'bg-[#E04A31] text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
                title="TIR-1 Thermal Infrared (10.8 µm)"
              >
                TIR-1 (10.8µm)
              </button>
              <button
                onClick={() => setSelectedBand('vis')}
                className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                  selectedBand === 'vis' ? 'bg-sky-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
                title="Visible (0.65 µm)"
              >
                VIS (0.65µm)
              </button>
              <button
                onClick={() => setSelectedBand('wv')}
                className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                  selectedBand === 'wv' ? 'bg-purple-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
                title="Water Vapor (6.8 µm)"
              >
                WV (6.8µm)
              </button>
            </div>



            {/* Close Modal (Esc) */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close observatory"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Stage: Panoramic Satellite Viewport + Dedicated Right Telemetry Sidebar */}
        <div className="flex-1 min-h-0 flex flex-row overflow-hidden bg-black">
          {/* Main Satellite Viewport Stage */}
          <div 
            ref={viewportRef}
            className="flex-1 relative bg-[#040108] flex items-center justify-center overflow-hidden select-none p-4 font-mono"
          >
            {/* Clean Tactical Loading State */}
            <div className="flex flex-col items-center justify-center gap-4 text-center p-6 max-w-md">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-zinc-800 border-t-[#E04A31] animate-spin" />
                <Satellite className="w-6 h-6 text-[#E04A31] absolute animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm sm:text-base font-bold text-white tracking-widest flex items-center justify-center gap-2">
                  <span>LOADING LIVE SATELLITE PASS</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E04A31] animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E04A31] animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E04A31] animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
                <div className="text-xs text-zinc-400">
                  Downlinking geostationary radiometer passes ({selectedBand.toUpperCase()} · 74.0°E)...
                </div>
              </div>
            </div>
          </div>

          {/* Dedicated Mission Control Telemetry Sidebar */}
          {currentFrame && (
            <div className="w-80 sm:w-84 shrink-0 bg-[#0a0514] border-l border-zinc-800 p-4 flex flex-col justify-between overflow-y-auto font-mono text-xs space-y-3">
              {/* Telemetry Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold">
                    Vortex Classification
                  </span>
                  <span 
                    className="px-2.5 py-0.5 rounded text-[10px] font-bold"
                    style={{ backgroundColor: `${currentFrame.stage_color}25`, color: currentFrame.stage_color, borderColor: currentFrame.stage_color }}
                  >
                    {currentFrame.stage_name}
                  </span>
                </div>

                {/* Primary Gauges */}
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <div className="text-[9px] text-zinc-500 uppercase flex items-center gap-1 font-bold">
                      <Wind className="w-3.5 h-3.5 text-[#E04A31]" />
                      <span>Sustained Wind</span>
                    </div>
                    <div className="text-lg font-black text-[#E04A31] mt-1">
                      {currentFrame.msw_knots} kts
                    </div>
                    <div className="text-[10px] text-zinc-400">{currentFrame.msw_kmh} km/h</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <div className="text-[9px] text-zinc-500 uppercase flex items-center gap-1 font-bold">
                      <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Pressure</span>
                    </div>
                    <div className="text-lg font-black text-cyan-400 mt-1">
                      {currentFrame.pressure_hpa} hPa
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Dvorak CI {currentFrame.dvorak_t || '5.5'}
                    </div>
                  </div>
                </div>

                {/* Atmospheric Thermodynamics & Kinematics */}
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block pb-1 border-b border-zinc-800">
                    Atmospheric Physics
                  </span>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Compass className="w-3.5 h-3.5 text-amber-400" /> Vertical Shear:
                    </span>
                    <strong className="text-white">{currentFrame.shear_knots || 14.0} kts</strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Thermometer className="w-3.5 h-3.5 text-red-400" /> Sea Surface Temp:
                    </span>
                    <strong className="text-white">{currentFrame.sst_celsius || 29.8}°C</strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Droplets className="w-3.5 h-3.5 text-sky-400" /> Tropospheric RH:
                    </span>
                    <strong className="text-white">{currentFrame.tropospheric_rh_pct || 75}%</strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Cloud-Top Temp:</span>
                    <strong className="text-amber-300">{currentFrame.cloud_top_temp_k || 220} K</strong>
                  </div>

                  {currentFrame.has_cyclone && (
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800">
                      <span className="text-zinc-400">Core Warm Anomaly:</span>
                      <strong className="text-[#E04A31]">+{currentFrame.delta_t_k} K</strong>
                    </div>
                  )}
                </div>

                {/* Synoptic Meteorological Advisory */}
                {currentFrame.synoptic_note && (
                  <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-300 space-y-1.5">
                    <div className="flex items-center gap-1 text-amber-400 text-[10px] uppercase font-bold">
                      <Info className="w-3.5 h-3.5" />
                      <span>Meteorological Advisory</span>
                    </div>
                    <p className="font-sans text-[11px] leading-relaxed text-zinc-300">
                      {currentFrame.synoptic_note}
                    </p>
                  </div>
                )}
              </div>

              {/* Station Downlink Footnote */}
              <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-500">
                Processed via CenterNet & Radiance Inversion Engine.
              </div>
            </div>
          )}
        </div>

        {/* Bottom Playback & Scrubber Bar */}
        <div className="px-5 py-2.5 bg-[#0d0618] border-t border-zinc-800 flex flex-col gap-2 shrink-0 font-mono">
          {/* Scrubber Progress Slider */}
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span className="w-16 text-left font-bold text-zinc-300">
              {currentFrameIdx + 1} / {totalFrames}
            </span>
            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min="0"
                max={Math.max(0, totalFrames - 1)}
                value={currentFrameIdx}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentFrameIdx(Number(e.target.value));
                }}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#E04A31]"
              />
            </div>
            <span className="w-24 text-right text-amber-300 font-bold">
              {currentFrame?.timestamp_utc ? currentFrame.timestamp_utc.split(' ')[1] : '00:00 UTC'}
            </span>
          </div>

          {/* Controls Strip */}
          <div className="flex items-center justify-between gap-3 text-xs">
            {/* Play / Reset Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-1.5 rounded-lg bg-[#E04A31] hover:bg-[#ff5537] text-white font-bold transition-all flex items-center gap-2 shadow cursor-pointer active:scale-95"
                title="Play / Pause (Spacebar)"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY LOOP'}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentFrameIdx(0);
                  setIsPlaying(true);
                }}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                title="Restart Loop"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Time Depth Range */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-500 px-1 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                RANGE:
              </span>
              {[12, 24, 48].map((hr) => (
                <button
                  key={hr}
                  onClick={() => setSelectedHours(hr)}
                  className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                    selectedHours === hr
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {hr === 48 ? '48h (2D)' : (hr === 24 ? '24h (1D)' : `${hr}h`)}
                </button>
              ))}
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[10px] text-zinc-500 uppercase mr-1">Speed:</span>
              {[0.5, 1.0, 2.0, 4.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-xs transition-all cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-[#64104E] text-white font-bold border border-[#B43067]'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
