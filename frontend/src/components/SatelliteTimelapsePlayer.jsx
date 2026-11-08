import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Clock, 
  Wind, 
  Gauge, 
  Layers, 
  Crosshair, 
  Satellite, 
  Film, 
  Info,
  Activity,
  Palette,
  Eye
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function SatelliteTimelapsePlayer({ 
  isOpen, 
  onClose,
  initialSequence = 'live_insat'
}) {
  const [sequences, setSequences] = useState([]);
  const [selectedSeqId, setSelectedSeqId] = useState(initialSequence);
  const [selectedBand, setSelectedBand] = useState('ir1');
  const [paletteMode, setPaletteMode] = useState('enhanced'); // 'enhanced' | 'raw'
  const [sequenceData, setSequenceData] = useState(null);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 0.5, 1.0, 2.0, 4.0
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef(null);

  // Fetch catalog of available sequences
  useEffect(() => {
    if (!isOpen) return;
    const fetchCatalog = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/satellite/timelapse/sequences`);
        if (res.ok) {
          const data = await res.json();
          setSequences(data.sequences || []);
        }
      } catch (err) {
        console.warn('Timelapse catalog fetch warning:', err);
      }
    };
    fetchCatalog();
  }, [isOpen]);

  // Fetch sequence frames when sequence or band changes
  useEffect(() => {
    if (!isOpen) return;
    const fetchSeq = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/satellite/timelapse/${selectedSeqId}?band=${selectedBand}`);
        if (res.ok) {
          const data = await res.json();
          setSequenceData(data);
          setCurrentFrameIdx(0);
          setIsPlaying(true);

          // Preload all frame images into memory for instant, seamless 60fps playback
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
        console.warn('Timelapse sequence fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeq();
  }, [isOpen, selectedSeqId, selectedBand, paletteMode]);

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
      } else if (e.key === 'ArrowRight') {
        handleNextFrame();
      } else if (e.key === 'ArrowLeft') {
        handlePrevFrame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, sequenceData]);

  if (!isOpen) return null;

  const currentFrame = sequenceData?.frames?.[currentFrameIdx] || null;
  const totalFrames = sequenceData?.frames?.length || 0;

  const handlePrevFrame = () => {
    setIsPlaying(false);
    setCurrentFrameIdx(prev => (prev - 1 + totalFrames) % totalFrames);
  };

  const handleNextFrame = () => {
    setIsPlaying(false);
    setCurrentFrameIdx(prev => (prev + 1) % totalFrames);
  };

  // Build the complete image URL with base and palette mode
  const currentImageUrl = currentFrame?.image_url 
    ? (currentFrame.image_url.startsWith('http') 
        ? currentFrame.image_url 
        : `${API_BASE_URL}${currentFrame.image_url}&palette=${paletteMode}`)
    : '';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans flex items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Dark Ambient Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Player Modal Window */}
      <div 
        className="relative z-10 w-full max-w-6xl max-h-[96vh] bg-[#0a0612] border border-[#64104E]/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-[#12081d] border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#E04A31]/20 border border-[#E04A31]/40 text-[#E04A31]">
              <Film className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  4D SATELLITE TIMELAPSE & KINEMATICS LOOP
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E04A31] text-white">
                  {sequenceData?.is_live ? 'LIVE SATELLITE LOOP' : 'HISTORICAL CYCLONE SEQUENCE'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                {sequenceData?.sensor || 'ISRO INSAT-3D Imager • 74.0°E Geostationary Orbit'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Palette Mode Toggle */}
            <button
              onClick={() => setPaletteMode(p => p === 'enhanced' ? 'raw' : 'enhanced')}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                paletteMode === 'enhanced'
                  ? 'bg-amber-950/40 text-amber-300 border-amber-600/50'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-800'
              }`}
              title="Toggle Dvorak BD-Curve False Color vs Clean Infrared"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{paletteMode === 'enhanced' ? 'Dvorak False-Color' : 'Raw Clean IR'}</span>
            </button>

            {/* AI Reticle Toggle */}
            <button
              onClick={() => setShowAiOverlay(!showAiOverlay)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                showAiOverlay 
                  ? 'bg-[#E04A31]/20 text-[#E04A31] border-[#E04A31]/50 font-bold' 
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
              title="Toggle CenterNet Eye Reticle & Deep Dvorak HUD Overlay"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>AI Reticle: {showAiOverlay ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Close timelapse player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sequence Selector Ribbon */}
        <div className="px-5 py-2.5 bg-[#0e0717] border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs font-mono">
          {/* Sequence Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {sequences.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSeqId(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedSeqId === s.id
                    ? 'bg-[#64104E] text-white font-bold shadow-md shadow-[#64104E]/30 ring-1 ring-[#B43067]'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <span>{s.tab_label || s.title.split(':')[0]}</span>
                <span className="text-[10px] text-amber-400 font-semibold">({s.duration_hours}h)</span>
              </button>
            ))}
          </div>

          {/* Spectral Band Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-zinc-800 text-[11px]">
            <span className="text-[10px] text-zinc-500 px-1 font-semibold">BAND:</span>
            <button
              onClick={() => setSelectedBand('ir1')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                selectedBand === 'ir1' ? 'bg-[#E04A31] text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              TIR-1 (10.8µm)
            </button>
            <button
              onClick={() => setSelectedBand('vis')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                selectedBand === 'vis' ? 'bg-sky-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              VIS (0.65µm)
            </button>
            <button
              onClick={() => setSelectedBand('wv')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                selectedBand === 'wv' ? 'bg-purple-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              WV (6.8µm)
            </button>
          </div>
        </div>

        {/* Main Viewport & HUD Overlay */}
        <div className="relative flex-1 bg-black min-h-[380px] sm:min-h-[460px] flex items-center justify-center overflow-hidden">
          {loading ? (
            <div className="text-center font-mono text-zinc-500 flex flex-col items-center gap-3">
              <Activity className="w-8 h-8 animate-spin text-[#E04A31]" />
              <span>Sequencing multi-spectral geostationary frames...</span>
            </div>
          ) : currentFrame ? (
            <div className="relative w-full h-full flex items-center justify-center select-none">
              {/* Actual Sequential Satellite Image for this Frame */}
              <img 
                key={currentImageUrl}
                src={currentImageUrl} 
                alt={`Pass frame ${currentFrame.timestamp_utc}`}
                className="max-h-[58vh] sm:max-h-[64vh] w-auto object-contain filter contrast-125 transition-opacity duration-150"
              />

              {/* Dynamic CenterNet Eye Reticle Overlay */}
              {showAiOverlay && currentFrame.has_cyclone && currentFrame.pixel_x_pct && (
                <div 
                  className="absolute pointer-events-none transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${currentFrame.pixel_x_pct}%`,
                    top: `${currentFrame.pixel_y_pct}%`
                  }}
                >
                  <div className="w-16 h-16 rounded-full border-2 border-[#E04A31] animate-ping opacity-75" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-[#E04A31] bg-[#E04A31]/20 flex items-center justify-center shadow-[0_0_15px_#E04A31]">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/80 border border-[#E04A31]/60 text-[10px] font-mono font-bold text-white whitespace-nowrap shadow-md">
                    {currentFrame.lat}°N, {currentFrame.lon}°E
                  </div>
                </div>
              )}

              {/* Top-Left Telemetry Pass Timestamp Overlay */}
              <div className="absolute top-4 left-4 p-3 rounded-xl bg-black/75 backdrop-blur-md border border-zinc-800 font-mono text-xs space-y-1.5 shadow-xl">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock className="w-4 h-4 text-[#E04A31]" />
                  <span className="text-[11px] uppercase tracking-wider">Pass Timestamp:</span>
                </div>
                <div className="text-base sm:text-lg font-black text-white tracking-wide">
                  {currentFrame.timestamp_utc}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                  <span>Pass {currentFrameIdx + 1} of {totalFrames}</span>
                  <span>•</span>
                  <span className="text-amber-400">-{currentFrame.hours_ago}h relative</span>
                </div>
              </div>

              {/* Top-Right Deep Dvorak Intensity Metrics HUD */}
              {showAiOverlay && (
                <div className="absolute top-4 right-4 p-3 rounded-xl bg-black/75 backdrop-blur-md border border-zinc-800 font-mono text-xs space-y-2 shadow-xl max-w-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Estimated Intensity:</span>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ backgroundColor: `${currentFrame.stage_color}25`, color: currentFrame.stage_color, borderColor: currentFrame.stage_color }}
                    >
                      {currentFrame.stage_name}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800">
                      <div className="text-[9px] text-zinc-500 uppercase flex items-center gap-1">
                        <Wind className="w-3 h-3 text-[#E04A31]" />
                        <span>Max Wind</span>
                      </div>
                      <div className="text-sm font-bold text-[#E04A31] mt-0.5">
                        {currentFrame.msw_knots} kts
                      </div>
                      <div className="text-[9px] text-zinc-400">{currentFrame.msw_kmh} km/h</div>
                    </div>

                    <div className="p-1.5 rounded bg-zinc-900/60 border border-zinc-800">
                      <div className="text-[9px] text-zinc-500 uppercase flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-cyan-400" />
                        <span>Central P</span>
                      </div>
                      <div className="text-sm font-bold text-cyan-400 mt-0.5">
                        {currentFrame.pressure_hpa} hPa
                      </div>
                      <div className="text-[9px] text-zinc-400">CI {currentFrame.dvorak_t || '0.0'}</div>
                    </div>
                  </div>

                  {currentFrame.cloud_top_temp_k > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-[10px] text-zinc-400">
                      <span>Cloud-Top: <strong className="text-white">{currentFrame.cloud_top_temp_k} K</strong></span>
                      <span>Core ΔT: <strong className="text-amber-300">+{currentFrame.delta_t_k} K</strong></span>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Synoptic Meteorological Narrative Banner */}
              {currentFrame.synoptic_note && (
                <div className="absolute bottom-4 left-4 right-4 p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-zinc-800 text-xs font-mono text-zinc-300 flex items-center gap-2.5 shadow-xl">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="line-clamp-2 leading-relaxed font-sans text-[11px] sm:text-xs">
                    {currentFrame.synoptic_note}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Video Scrubber & Playback Controls Bar */}
        <div className="p-4 bg-[#12081d] border-t border-zinc-800 space-y-3 shrink-0">
          {/* Scrubber Progress Slider */}
          <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
            <span className="w-12 text-left">{currentFrameIdx + 1} / {totalFrames}</span>
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
            <span className="w-24 text-right text-zinc-300 font-bold">
              {currentFrame?.timestamp_utc?.split(' ')[1] || '00:00 UTC'}
            </span>
          </div>

          {/* Control Buttons Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Play / Step Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevFrame}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                title="Step backward 1 frame (Left Arrow)"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-lg bg-[#E04A31] hover:bg-[#ff5537] text-white font-mono font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-[#E04A31]/30 cursor-pointer"
                title="Play / Pause timelapse (Spacebar)"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY LOOP'}</span>
              </button>

              <button
                onClick={handleNextFrame}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                title="Step forward 1 frame (Right Arrow)"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setCurrentFrameIdx(0);
                  setIsPlaying(true);
                }}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                title="Restart loop from beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Speed Selector Buttons */}
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-[10px] text-zinc-500 uppercase">Speed:</span>
              {[0.5, 1.0, 2.0, 4.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded text-[11px] transition-all cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-[#64104E] text-white font-bold border border-[#B43067]'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Frame Thumbnail Scrubber Strip */}
            <div className="hidden md:flex items-center gap-1.5 overflow-x-auto max-w-sm">
              {sequenceData?.frames?.map((f, i) => {
                const thumbUrl = f.image_url.startsWith('http') 
                  ? f.image_url 
                  : `${API_BASE_URL}${f.image_url}&palette=${paletteMode}`;
                return (
                  <button
                    key={f.frame_id || i}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentFrameIdx(i);
                    }}
                    className={`relative shrink-0 w-11 h-9 rounded border overflow-hidden transition-all cursor-pointer ${
                      currentFrameIdx === i 
                        ? 'border-[#E04A31] ring-2 ring-[#E04A31]/50 scale-105' 
                        : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                    title={`${f.timestamp_utc} - ${f.msw_knots} kts`}
                  >
                    <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 text-[8px] font-mono bg-black/80 px-1 text-white">
                      {i + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
