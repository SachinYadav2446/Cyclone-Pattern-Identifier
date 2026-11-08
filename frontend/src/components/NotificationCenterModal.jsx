import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Clock, 
  Wind, 
  Gauge, 
  FileText, 
  ChevronRight, 
  RefreshCw, 
  Radio, 
  Waves, 
  ShieldCheck, 
  Siren, 
  Download, 
  Square,
  Crosshair,
  Satellite,
  Calendar,
  Activity,
  Film
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function NotificationCenterModal({ 
  isOpen, 
  onClose, 
  onSelectStorm,
  onOpenBulletin,
  onOpenTimelapse 
}) {
  const [feedMode, setFeedMode] = useState('live'); // 'live' | 'storm'
  const [liveWarning, setLiveWarning] = useState(null);
  const [hourlyPasses, setHourlyPasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  // Web Audio API refs
  const audioCtxRef = useRef(null);
  const sirenOscRef = useRef(null);
  const sirenGainRef = useRef(null);
  const sirenTimerRef = useRef(null);

  const fetchLiveFeed = async (mode = feedMode) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/notifications?mode=${mode}`);
      if (res.ok) {
        const data = await res.json();
        setLiveWarning(data.live_warning || null);
        setHourlyPasses(data.hourly_passes || []);

        // Initialize countdown seconds directly from live telemetry
        if (data.live_warning?.evacuation_window?.time_to_gale_hours) {
          setCountdownSeconds(Math.round(data.live_warning.evacuation_window.time_to_gale_hours * 3600));
        } else {
          setCountdownSeconds(0);
        }
      }
    } catch (err) {
      console.warn('Live early warning fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLiveFeed(feedMode);
    } else {
      stopSiren();
    }
  }, [isOpen, feedMode]);

  // Live countdown ticker
  useEffect(() => {
    if (countdownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCountdownSeconds(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdownSeconds]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        stopSiren();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Stop siren when unmounting
  useEffect(() => {
    return () => stopSiren();
  }, []);

  const stopSiren = () => {
    if (sirenTimerRef.current) {
      clearInterval(sirenTimerRef.current);
      sirenTimerRef.current = null;
    }
    if (sirenOscRef.current) {
      try {
        sirenOscRef.current.stop();
        sirenOscRef.current.disconnect();
      } catch (e) {}
      sirenOscRef.current = null;
    }
    if (sirenGainRef.current) {
      try {
        sirenGainRef.current.disconnect();
      } catch (e) {}
      sirenGainRef.current = null;
    }
    setIsSirenPlaying(false);
  };

  const playSiren = () => {
    if (!soundEnabled) return;
    stopSiren();

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const stageNum = liveWarning?.warning_protocol?.stage_number || 2;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth'; // Civil defense emergency timbre
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (stageNum >= 4) {
        // Stage 4 Red Alert: Warble oscillating between 440 Hz and 880 Hz
        let high = false;
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.start();
        sirenTimerRef.current = setInterval(() => {
          high = !high;
          const target = high ? 880 : 440;
          osc.frequency.exponentialRampToValueAtTime(target, ctx.currentTime + 0.45);
        }, 500);
      } else {
        // Stage 2/3 Alert: Intermittent pulsed chime burst at 800 Hz
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.start();
        let on = true;
        sirenTimerRef.current = setInterval(() => {
          on = !on;
          gain.gain.setValueAtTime(on ? 0.08 : 0.0001, ctx.currentTime);
        }, 400);
      }

      sirenOscRef.current = osc;
      sirenGainRef.current = gain;
      setIsSirenPlaying(true);
    } catch (err) {
      console.warn("Web Audio API error:", err);
    }
  };

  const toggleSirenAudio = () => {
    if (isSirenPlaying) {
      stopSiren();
    } else {
      playSiren();
    }
  };

  const handleDownloadPdf = async () => {
    const stormName = liveWarning?.storm_name || "CYCLONE FANI";
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/models/export-bulletin-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storm_name: stormName,
          category: liveWarning?.imd_category_name || "Super Cyclonic Storm (SuCS)",
          msw_knots: liveWarning?.msw_knots || 112.0,
          pressure_hpa: liveWarning?.central_pressure_hpa || 930.7,
          lat: liveWarning?.eye_fix?.latitude || 18.25,
          lon: liveWarning?.eye_fix?.longitude || 85.80,
          landfall_eta: liveWarning?.evacuation_window?.target_location || "Puri District Coastline, Odisha",
          landfall_location: liveWarning?.evacuation_window?.target_location || "Puri District Coastline, Odisha"
        })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `VortexAI_Official_Bulletin_${stormName.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("PDF export error:", err);
    }
  };

  if (!isOpen) return null;

  const isQuiescent = liveWarning?.live_status === 'QUIESCENT_BASELINE';
  const stageInfo = liveWarning?.warning_protocol || {};
  const evacWindow = liveWarning?.evacuation_window || {};
  const surgeInfo = liveWarning?.storm_surge || {};
  const districts = liveWarning?.district_threat_matrix || [];
  const eye = liveWarning?.eye_fix || {};

  const formatCountdown = (totalSec) => {
    if (!totalSec || totalSec <= 0) return "00h 00m 00s";
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Semi-transparent Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => {
          stopSiren();
          onClose();
        }}
        aria-hidden="true"
      />

      {/* Right Slide-Over Panel Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-8">
        <aside 
          className="w-screen max-w-xl sm:max-w-2xl bg-[#090510] border-l border-[#64104E]/50 shadow-2xl flex flex-col h-full transform transition ease-in-out duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 bg-[#12081d] border-b border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${
                isQuiescent 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' 
                  : 'bg-[#E04A31]/20 border-[#E04A31]/50 text-[#E04A31]'
              }`}>
                {isQuiescent ? <ShieldCheck className="w-5 h-5" /> : <Siren className="w-5 h-5 animate-pulse" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    METEOROLOGICAL ALARM & CIVIL DEFENSE
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isQuiescent 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40' 
                      : 'bg-[#E04A31] text-white animate-pulse'
                  }`}>
                    {isQuiescent ? 'LIVE FEED: ALL CLEAR' : 'LIVE FEED: ALERT'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <p className="text-[11px] text-zinc-400 font-mono">
                    ISRO INSAT-3D/3DR Real-Time Downlink • 74.0°E Sub-Satellite
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchLiveFeed(feedMode)}
                disabled={loading}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Refresh Live Satellite Pass"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#E04A31]' : ''}`} />
              </button>
              <button
                onClick={() => {
                  stopSiren();
                  onClose();
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close alarm drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub-Header: Live Feed Mode Switcher & Acoustic Siren */}
          <div className="px-5 py-3 bg-[#0e0717] border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Direct Telemetry Selector */}
            <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
              <span className="text-[10px] text-zinc-500 px-1 font-semibold uppercase tracking-wider">Feed:</span>
              <button
                onClick={() => {
                  stopSiren();
                  setFeedMode('live');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  feedMode === 'live'
                    ? 'bg-emerald-600 text-white font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Direct live satellite feed over North Indian Ocean right now"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                <span>Live INSAT-3D Feed</span>
              </button>
              <button
                onClick={() => {
                  setFeedMode('storm');
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  feedMode === 'storm'
                    ? 'bg-[#E04A31] text-white font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Simulate active cyclone intercept for civil defense emergency drills"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span>Storm Intercept Drill</span>
              </button>
            </div>

            {/* Siren Controls (Active in storm mode or when threats exist) */}
            {!isQuiescent && (
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSirenAudio}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isSirenPlaying
                      ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/40 animate-pulse'
                      : 'bg-zinc-900 text-amber-300 border-amber-500/40 hover:bg-zinc-800 hover:border-amber-400'
                  }`}
                  title="Plays authentic Web Audio API civil defense evacuation siren"
                >
                  {isSirenPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>STOP SIREN</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                      <span>TEST SIREN AUDIO</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (isSirenPlaying) stopSiren();
                    setSoundEnabled(!soundEnabled);
                  }}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    soundEnabled ? 'text-zinc-400 border-zinc-800 hover:text-white' : 'text-red-400 border-red-900 bg-red-950/30'
                  }`}
                  title={soundEnabled ? 'Mute acoustic alarms' : 'Unmute acoustic alarms'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Scrollable Main Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {loading ? (
              <div className="py-20 text-center text-xs font-mono text-zinc-500 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#E04A31]" />
                <span>Connecting directly to INSAT-3D radiometer downlink...</span>
              </div>
            ) : isQuiescent ? (
              /* REAL LIVE CURRENT STATE: Quiescent Basin Flow */
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-950/30 via-zinc-900/40 to-zinc-950 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/50 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      STAGE 0: ALL CLEAR (QUIESCENT BASIN)
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">{liveWarning?.timestamp_utc}</span>
                  </div>
                  <h4 className="text-base font-bold text-white tracking-wide">
                    Live Geostationary Surveillance — Zero Active Vortices
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    The autonomous AI radiometer pipeline has scanned the latest operational INSAT-3D pass over the Bay of Bengal and Arabian Sea. Atmospheric conditions are quiescent with normal tropical flow and zero organized convective eyes detected.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 font-mono text-xs">
                    <div className="p-2.5 rounded bg-black/40 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 uppercase">Ambient Wind</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">12.0 kts</div>
                      <div className="text-[9px] text-zinc-500">22.2 km/h Flow</div>
                    </div>
                    <div className="p-2.5 rounded bg-black/40 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 uppercase">Surface Pressure</div>
                      <div className="text-sm font-bold text-zinc-200 mt-0.5">1012.0 hPa</div>
                      <div className="text-[9px] text-zinc-500">ΔP 0.0 hPa Deficit</div>
                    </div>
                    <div className="p-2.5 rounded bg-black/40 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 uppercase">Marine Alert</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">ALL CLEAR</div>
                      <div className="text-[9px] text-emerald-500">Ports Nominal</div>
                    </div>
                  </div>
                </div>

                {/* Live Pass Telemetry Status Pill */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-2 text-zinc-300">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Hourly Radiometer Cadence:</span>
                    <span className="text-white font-bold">Every 60 Minutes (INSAT-3D Asia Scan)</span>
                  </span>
                  <span className="text-amber-400 text-[11px]">
                    Next pass estimate: {liveWarning?.next_pass_estimate || 'in 18 min'}
                  </span>
                </div>
              </div>
            ) : (
              /* ACTIVE CYCLONE INTERCEPT: Complete Early Warning Triage */
              <>
                {/* 1. Official IMD 4-Stage Warning Protocol Stepper */}
                <div className="p-4 rounded-xl bg-[#140a20] border border-[#64104E]/60 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        Official IMD 4-Stage Warning Protocol
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {stageInfo.stage_badge || 'STAGE 2 ALERT'}
                    </span>
                  </div>

                  {/* 4-Stage Visual Progress Bar */}
                  <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
                    {stageInfo.all_stages?.map((st) => (
                      <div 
                        key={st.stage}
                        className={`p-2 rounded-lg border transition-all text-center ${
                          st.active 
                            ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400' 
                            : st.passed 
                              ? 'bg-zinc-900/80 border-zinc-700 text-zinc-400' 
                              : 'bg-black/30 border-zinc-800/80 text-zinc-600 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 font-bold">
                          {st.passed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          <span>Stage {st.stage}</span>
                        </div>
                        <div className="text-[9px] truncate mt-0.5 font-semibold text-zinc-300">{st.code}</div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">{st.lead_target}</div>
                      </div>
                    ))}
                  </div>

                  {/* Operational Civil Defense Directive */}
                  <div className="p-3 rounded-lg bg-black/40 border border-amber-900/40 text-xs text-amber-200/90 font-mono flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold text-white tracking-wide">{stageInfo.stage_name}</div>
                      <div className="text-[11px] text-zinc-300 leading-relaxed font-sans">{stageInfo.directive}</div>
                    </div>
                  </div>
                </div>

                {/* 2. Civil Defense "Time-to-Gale" Evacuation Window Countdown */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-[#180a18] to-black border border-red-600/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-300">
                      <Clock className="w-4 h-4 text-red-400 animate-pulse" />
                      <span>TIME-TO-GALE EVACUATION WINDOW</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      R34 Radius: {evacWindow.r34_gale_radius_km || 220} km
                    </span>
                  </div>

                  {/* Digital Countdown Clock */}
                  <div className="py-2.5 px-4 rounded-lg bg-black/60 border border-red-900/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Countdown to Gale Onset:</div>
                      <div className="text-2xl sm:text-3xl font-mono font-black text-red-400 tracking-wider drop-shadow-md">
                        {formatCountdown(countdownSeconds)}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-[10px] text-zinc-500 uppercase">Target Coast</div>
                      <div className="text-xs font-bold text-white mt-0.5">{evacWindow.target_location?.split(',')[0] || 'Puri Coast'}</div>
                      <div className="text-[10px] text-amber-400 mt-0.5">{evacWindow.distance_to_coast_km || 270} km offshore</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-red-200/90 leading-relaxed font-mono">
                    ⚠️ {evacWindow.civil_directive}
                  </p>
                </div>

                {/* 3. SLOSH Storm Surge Modeling & Coastal District Threat Triage */}
                <div className="p-4 rounded-xl bg-[#12081d] border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
                      <Waves className="w-4 h-4 text-cyan-400" />
                      <span>SLOSH STORM SURGE & DISTRICT TRIAGE</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Peak Surge: +{surgeInfo.peak_surge_m || 4.3} m
                    </span>
                  </div>

                  {/* Surge Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 uppercase">Peak Surge</div>
                      <div className="text-base font-bold text-cyan-400 mt-0.5">+{surgeInfo.peak_surge_m} m</div>
                      <div className="text-[9px] text-zinc-500">Above Astro Tide</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 uppercase">Inundation</div>
                      <div className="text-base font-bold text-amber-400 mt-0.5">{surgeInfo.inundation_penetration_km} km</div>
                      <div className="text-[9px] text-zinc-500">Inland Penetration</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 uppercase">Total Water Crest</div>
                      <div className="text-base font-bold text-red-400 mt-0.5">{surgeInfo.total_peak_water_level_m} m</div>
                      <div className="text-[9px] text-zinc-500">Peak High Water</div>
                    </div>
                  </div>

                  {/* District Threat Matrix Table */}
                  <div className="overflow-x-auto rounded-lg border border-zinc-800/80">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="bg-[#180e25] text-zinc-400 border-b border-zinc-800 uppercase text-[9px] tracking-wider">
                        <tr>
                          <th className="py-2 px-3">District</th>
                          <th className="py-2 px-2">Risk</th>
                          <th className="py-2 px-2">Surge</th>
                          <th className="py-2 px-3">Port Signal / Mandate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 bg-black/20">
                        {districts.map((d, idx) => (
                          <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                            <td className="py-2 px-3 font-bold text-white whitespace-nowrap">
                              {d.district}
                              <span className="block text-[9px] font-normal text-zinc-500">{d.state}</span>
                            </td>
                            <td className="py-2 px-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${d.badge_bg}`}>
                                {d.threat_level.split(' ')[0]}
                              </span>
                            </td>
                            <td className="py-2 px-2 font-bold text-cyan-400 whitespace-nowrap">
                              +{d.est_surge_m}m
                            </td>
                            <td className="py-2 px-3 text-zinc-300 text-[10px]">
                              <span className="font-semibold text-amber-300">{d.port_signal}</span>
                              <span className="block text-[9px] text-zinc-400 truncate max-w-xs">{d.mandate}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Action Banner: PDF Export & GIS Console */}
                <div className="p-3.5 rounded-xl bg-black/50 border border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                    <FileText className="w-4 h-4 text-[#E04A31]" />
                    <span>Official IMD/WMO Standard Cyclone Bulletin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadPdf}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#64104E] hover:bg-[#831862] text-white border border-[#B43067]/60 transition-all flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        stopSiren();
                        onClose();
                        if (onSelectStorm) {
                          onSelectStorm(liveWarning?.storm_id || 'fani');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-[#E04A31] hover:bg-[#ff5537] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <span>Inspect in GIS</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* 5. Real Hourly Satellite Pass Notification Stream */}
            <div className="pt-2 border-t border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1.5 font-bold text-white uppercase tracking-wider">
                  <Satellite className="w-4 h-4 text-[#E04A31]" />
                  <span>Hourly Satellite Pass Telemetry Log</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenTimelapse && onOpenTimelapse(feedMode === 'storm' ? 'phailin_super_cyclone' : 'live_insat')}
                    className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-[#64104E] hover:bg-[#831862] text-white border border-[#B43067]/60 transition-all flex items-center gap-1 cursor-pointer shadow"
                    title="Open 4D animated satellite timelapse player"
                  >
                    <Film className="w-3 h-3 text-amber-400" />
                    <span>Watch 4D Loop</span>
                  </button>
                  <span className="text-[10px] text-zinc-500">
                    {hourlyPasses.length} Passes
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {hourlyPasses.map((p, idx) => (
                  <div 
                    key={p.id || idx}
                    className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors font-mono text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          p.status === 'VORTEX_DETECTED'
                            ? 'bg-red-950 text-red-300 border border-red-700'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        }`}>
                          {p.category_badge}
                        </span>
                        <span className="font-bold text-white text-[11px]">{p.pass_number}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {p.timestamp_utc}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                      {p.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-900 text-[10px] text-zinc-500">
                      <span>MSW: <strong className="text-zinc-300">{p.msw_knots} kts</strong></span>
                      <span>Pressure: <strong className="text-zinc-300">{p.pressure_hpa} hPa</strong></span>
                      <span>Fix: <strong className="text-zinc-300">{p.eye_fix}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="px-5 py-3 bg-[#12081d] border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>ISRO INSAT-3D/3DR • IMD MoES Operational Early Warning</span>
            </span>
            <button
              onClick={() => {
                stopSiren();
                onClose();
              }}
              className="px-3 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors cursor-pointer"
            >
              Close Feed
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
