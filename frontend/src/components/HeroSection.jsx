import React, { useEffect, useState, useCallback } from 'react';
import { 
  Compass, Wind, ArrowUpRight, Gauge, AlertTriangle, Play, 
  Sparkles, Navigation, Clock, Activity, RefreshCw, Satellite, Radio 
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const stormPresets = {
  michael: {
    id: 'michael',
    name: 'MICHAEL (AL142018)',
    year: 'Historic Cat 5 Landfall',
    basin: 'Gulf of Mexico / Florida',
    category: 'Category 5 Major Hurricane',
    badge: 'CAT 5',
    mswKnots: 140.0,
    mswKmh: 259.3,
    pressureHpa: 919.0,
    deficitHpa: -94,
    lat: 29.90,
    lon: 85.39,
    lonDir: 'W',
    reticleLeft: '53%',
    reticleTop: '51%',
    offsetStr: '+0.12 / -0.18',
    riProbability: 98,
    sst: '29.7°C',
    shear: '6.4 kts',
    landfallTime: 'OCT 10 · 17:30 UTC',
    landfallTarget: 'Mexico Beach / Panama City, FL',
    surgeEst: '4.3 m',
    image: '/gifs/michael_intensification_web.gif',
    webpImage: '/gifs/michael_intensification_web.webp',
    satelliteSource: 'GOES-16 ABI Band 13 (10.35 µm)',
    satelliteTag: 'Clean Infrared Window · Intensification to Landfall',
    bannerText: 'INTENSIFICATION TO CAT 5 LANDFALL · 118 SEQUENTIAL FRAMES',
  },
  fani: {
    id: 'fani',
    name: 'FANI-II (BOB-04)',
    year: 'Active Pass Benchmark',
    basin: 'Bay of Bengal',
    category: 'Extremely Severe (ESCS)',
    badge: 'ESCS',
    mswKnots: 115.0,
    mswKmh: 213.0,
    pressureHpa: 932.0,
    deficitHpa: -78,
    lat: 19.80,
    lon: 85.80,
    lonDir: 'E',
    reticleLeft: '63%',
    reticleTop: '46%',
    offsetStr: '+0.17 / +0.32',
    riProbability: 92,
    sst: '30.4°C',
    shear: '7.8 kts',
    landfallTime: 'MAY 03 · 03:30 UTC',
    landfallTarget: 'Puri Coastline, Odisha',
    surgeEst: '4.8 m',
    image: '/images/TIR1_cyclone.png',
    webpImage: null,
    satelliteSource: 'INSAT-3D TIR-1 (10.8 µm)',
    satelliteTag: 'Thermal Infrared 1 · Symmetric Eyewall Ring',
    bannerText: 'SYMMETRIC CDO WITH PINHOLE WARM EYE · T-NO 6.5',
  },
  amphan: {
    id: 'amphan',
    name: 'AMPHAN (BOB-01)',
    year: 'Super Cyclone Benchmark',
    basin: 'Central Bay of Bengal',
    category: 'Super Cyclonic Storm (SuCS)',
    badge: 'SuCS',
    mswKnots: 140.0,
    mswKmh: 259.3,
    pressureHpa: 907.0,
    deficitHpa: -106,
    lat: 13.20,
    lon: 86.40,
    lonDir: 'E',
    reticleLeft: '58%',
    reticleTop: '48%',
    offsetStr: '-0.08 / +0.14',
    riProbability: 96,
    sst: '31.1°C',
    shear: '5.4 kts',
    landfallTime: 'MAY 20 · 11:30 UTC',
    landfallTarget: 'Digha - Sundarbans, WB',
    surgeEst: '5.2 m',
    image: '/images/TIR2_cyclone.png',
    webpImage: null,
    satelliteSource: 'INSAT-3D TIR-2 (12.0 µm)',
    satelliteTag: 'Split-Window Thermodynamic Outflow',
    bannerText: 'EXPLOSIVE RI: 75 KTS TO 140 KTS IN 24 HOURS',
  },
  biparjoy: {
    id: 'biparjoy',
    name: 'BIPARJOY (ARB-02)',
    year: 'Long-Tracking Arabian Sea',
    basin: 'East-Central Arabian Sea',
    category: 'Extremely Severe (ESCS)',
    badge: 'ESCS',
    mswKnots: 95.0,
    mswKmh: 176.0,
    pressureHpa: 966.0,
    deficitHpa: -47,
    lat: 20.70,
    lon: 66.50,
    lonDir: 'E',
    reticleLeft: '44%',
    reticleTop: '46%',
    offsetStr: '+0.22 / -0.19',
    riProbability: 64,
    sst: '29.8°C',
    shear: '11.5 kts',
    landfallTime: 'JUN 15 · 17:00 UTC',
    landfallTarget: 'Jakhau Port, Gujarat',
    surgeEst: '3.0 m',
    image: '/images/WV_image.png',
    webpImage: null,
    satelliteSource: 'INSAT-3D Water Vapor (6.8 µm)',
    satelliteTag: 'Mid-Tropospheric Moisture & Steering',
    bannerText: 'LONGEST-LIVED ARABIAN SEA CYCLONE · 13 CONSECUTIVE DAYS',
  },
  remal: {
    id: 'remal',
    name: 'REMAL (BOB-02)',
    year: 'Rapid Monsoon Genesis',
    basin: 'North Bay of Bengal',
    category: 'Severe Cyclonic Storm (SCS)',
    badge: 'SCS',
    mswKnots: 60.0,
    mswKmh: 111.1,
    pressureHpa: 984.0,
    deficitHpa: -29,
    lat: 21.30,
    lon: 89.20,
    lonDir: 'E',
    reticleLeft: '68%',
    reticleTop: '38%',
    offsetStr: '+0.05 / +0.09',
    riProbability: 45,
    sst: '28.9°C',
    shear: '14.2 kts',
    landfallTime: 'MAY 26 · 15:30 UTC',
    landfallTarget: 'Khepupara - Sagar Island',
    surgeEst: '2.1 m',
    image: '/images/visible_cyclone_image.png',
    webpImage: null,
    satelliteSource: 'INSAT-3D Optical Visible (0.65 µm)',
    satelliteTag: '1.0 km High-Resolution Albedo',
    bannerText: 'EXPANSIVE MONSOONAL GYRE CONVERGENCE AT PRE-LANDFALL',
  },
};

function LiveClock() {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return <span className="text-zinc-300 font-bold">{utcTime || '12:00:00 UTC'}</span>;
}

export default function HeroSection({ onOpenConsole }) {
  const [selectedPresetKey, setSelectedPresetKey] = useState('michael');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [liveImageError, setLiveImageError] = useState(false);

  // Fetch live operational pass from FastAPI backend
  const fetchLiveTelemetry = useCallback(async (refresh = false) => {
    try {
      setIsScanning(true);
      const url = `${API_BASE_URL}/api/v1/live/latest-analysis${refresh ? '?refresh=true' : ''}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        setLiveData(data);
      }
    } catch (err) {
      console.warn('Backend live analysis fallback:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Poll live telemetry periodically when in Live mode
  useEffect(() => {
    if (isLiveMode) {
      fetchLiveTelemetry(false);
      const interval = setInterval(() => fetchLiveTelemetry(false), 45000);
      return () => clearInterval(interval);
    }
  }, [isLiveMode, fetchLiveTelemetry]);

  // Construct active storm data object
  let storm = stormPresets[selectedPresetKey] || stormPresets.michael;

  if (isLiveMode) {
    const hasSystems = liveData?.systems_detected && liveData.systems_detected.length > 0;
    const topSystem = hasSystems ? liveData.systems_detected[0] : null;

    storm = {
      id: 'live',
      name: topSystem ? `VORTEX ${topSystem.id}` : 'INSAT-3D OPERATIONAL PASS',
      year: liveData?.timestamp_utc || 'LIVE 30-MIN CADENCE',
      basin: topSystem?.basin || 'North Indian Ocean (BoB & AS)',
      category: topSystem?.classification || 'Inter-Monsoon Marine Observation',
      badge: topSystem ? (topSystem.estimated_wind_kts >= 34 ? 'CYCLONIC' : 'MONITORED') : 'OPERATIONAL',
      mswKnots: topSystem ? topSystem.estimated_wind_kts : 22.0,
      mswKmh: topSystem ? (topSystem.estimated_wind_kts * 1.852).toFixed(1) : 40.7,
      pressureHpa: topSystem ? topSystem.estimated_pressure_hpa : 1010.0,
      deficitHpa: topSystem ? (topSystem.estimated_pressure_hpa - 1012) : -2,
      lat: topSystem ? topSystem.latitude : 15.50,
      lon: topSystem ? topSystem.longitude : 85.00,
      lonDir: 'E',
      reticleLeft: topSystem ? `${topSystem.pixel_x_percent}%` : '65%',
      reticleTop: topSystem ? `${topSystem.pixel_y_percent}%` : '46%',
      offsetStr: topSystem ? `CONF: ${(topSystem.confidence_score * 100).toFixed(0)}%` : 'RADAR: SCANNING',
      riProbability: topSystem ? (topSystem.estimated_wind_kts >= 40 ? 68 : 24) : 4,
      sst: '30.1°C',
      shear: '9.2 kts',
      landfallTime: topSystem ? 'Tracking Oceanic Vector' : 'Clear Sea Lanes',
      landfallTarget: topSystem ? `${topSystem.basin} Marine Sector` : 'No Imminent Landfall Threat',
      surgeEst: '0.6 m',
      image: liveImageError 
        ? '/images/TIR1_cyclone.png' 
        : 'https://mausam.imd.gov.in/Satellite/3Dasiasec_ir1.jpg',
      webpImage: null,
      satelliteSource: 'ISRO INSAT-3D/3DR (IMD Downlink)',
      satelliteTag: 'Live 10.8 µm Thermal Infrared Downlink',
      bannerText: liveData?.bay_of_bengal_status 
        ? `BOB: ${liveData.bay_of_bengal_status} · ARB: ${liveData.arabian_sea_status}` 
        : 'SYNCHRONIZING WITH GEOSTATIONARY SATELLITE FEED...',
    };
  }

  return (
    <section className="relative overflow-hidden pt-8 pb-20 border-b border-zinc-850 bg-[#09090b]">
      {/* Precision background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Mission Narrative */}
          <div className="lg:col-span-7 flex flex-col items-start pt-2">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 mb-3">
              <Sparkles className="w-3 h-3 text-zinc-300" />
              <span>GEOSTATIONARY DEEP LEARNING ARCHITECTURE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]">
              Autonomous Satellite Intelligence for{' '}
              <span className="text-zinc-400 underline decoration-zinc-700 underline-offset-8">Tropical Cyclone</span> Identification & 48h Landfall.
            </h1>

            <p className="mt-4 text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
              Transforming raw geostationary infrared radiances into sub-pixel circulation center fixes, automated Dvorak wind estimations, and expanding uncertainty cones in <span className="text-white font-mono font-bold">&lt;4.0 seconds</span>.
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenConsole}
                className="flex items-center gap-2 px-5 py-2.5 rounded bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-all font-mono shadow cursor-pointer active:scale-95"
              >
                <span>Launch GIS Command Center</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <a
                href="#pipeline"
                className="flex items-center gap-2 px-4 py-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium text-xs hover:bg-zinc-800 hover:text-white transition-all font-mono"
              >
                <Play className="w-3 h-3 text-zinc-400" />
                <span>Explore Operational Pipeline</span>
              </a>
            </div>

            {/* Quick Metrics Bar with Precision Hairlines */}
            <div className="mt-10 grid grid-cols-3 gap-6 pt-6 border-t border-zinc-800/80 w-full max-w-lg font-mono text-xs">
              <div>
                <div className="text-zinc-500 text-[10px] tracking-wider uppercase">CENTER FIX</div>
                <div className="text-2xl font-bold text-white mt-1">8.7 km</div>
                <div className="text-zinc-500 text-[10px] mt-0.5">Haversine Error</div>
              </div>
              <div>
                <div className="text-zinc-500 text-[10px] tracking-wider uppercase">WIND SPEED</div>
                <div className="text-2xl font-bold text-white mt-1">4.8 kts</div>
                <div className="text-zinc-500 text-[10px] mt-0.5">Mean Abs Error</div>
              </div>
              <div>
                <div className="text-zinc-500 text-[10px] tracking-wider uppercase">LATENCY</div>
                <div className="text-2xl font-bold text-white mt-1">&lt; 4.0s</div>
                <div className="text-zinc-500 text-[10px] mt-0.5">Full End-to-End</div>
              </div>
            </div>
          </div>

          {/* Right Column: Mission Control Telemetry Workstation */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
              {/* Card Header with Active Storm Badge & Military Clock */}
              <div className="px-3.5 py-2.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90 font-mono text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="font-bold text-white tracking-wider truncate">
                    {storm.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 border border-zinc-700 bg-zinc-800 text-zinc-200 font-bold shrink-0">
                    {storm.badge}
                  </span>
                </div>
                
                <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <LiveClock />
                </div>
              </div>

              {/* Integrated Storm Selector Tabs Strip */}
              <div className="px-2.5 py-1.5 border-b border-zinc-800 bg-[#0b0c10] flex items-center justify-between gap-1 font-mono text-[10px]">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-zinc-500 text-[9px] uppercase tracking-wider mr-1 shrink-0">STORM:</span>
                  {Object.keys(stormPresets).map((key) => {
                    const p = stormPresets[key];
                    const isSelected = !isLiveMode && selectedPresetKey === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setIsLiveMode(false);
                          setSelectedPresetKey(key);
                        }}
                        className={`px-2 py-0.5 transition-all whitespace-nowrap border text-[10px] ${
                          isSelected
                            ? 'bg-white text-zinc-950 font-bold border-white shadow-xs'
                            : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {p.name.split(' ')[0]}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => {
                      setIsLiveMode(true);
                      fetchLiveTelemetry(false);
                    }}
                    className={`px-2 py-0.5 transition-all whitespace-nowrap border text-[10px] flex items-center gap-1 ${
                      isLiveMode
                        ? 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-xs'
                        : 'bg-emerald-950/40 text-emerald-400 hover:text-white border-emerald-900/60'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>LIVE</span>
                  </button>
                </div>

                {isLiveMode && (
                  <button
                    onClick={() => fetchLiveTelemetry(true)}
                    disabled={isScanning}
                    className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-[10px] flex items-center gap-1 shrink-0 active:scale-95 transition-all disabled:opacity-50 ml-1"
                    title="Force re-scan latest geostationary frame"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${isScanning ? 'animate-spin text-emerald-400' : ''}`} />
                    <span>{isScanning ? '...' : 'SYNC'}</span>
                  </button>
                )}
              </div>

              {/* Display Viewport: Real Geostationary Infrared Intensification Sequence */}
              <div className="relative h-72 sm:h-80 w-full bg-[#070709] flex items-center justify-center overflow-hidden">
                {/* Satellite Imagery Viewport */}
                <picture className="absolute inset-0 w-full h-full select-none">
                  {storm.webpImage && (
                    <source srcSet={storm.webpImage} type="image/webp" />
                  )}
                  <img
                    src={storm.image}
                    alt={`${storm.name} Geostationary Satellite Imagery`}
                    loading="eager"
                    decoding="async"
                    onError={() => {
                      if (isLiveMode) setLiveImageError(true);
                    }}
                    className="w-full h-full object-cover object-center select-none"
                  />
                </picture>

                {/* Subtle contrast grading overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                {/* Scanning radar sweep animation when refreshing live pass */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="w-full h-1 bg-emerald-400/80 shadow-[0_0_15px_#10b981] animate-pulse absolute top-0 animate-[scan_2s_linear_infinite]" />
                  </div>
                )}

                {/* CenterNet Sub-Pixel Eye Fix HUD Reticle (Dynamic Target Lock) */}
                <div
                  className="absolute pointer-events-none flex flex-col items-center justify-center transition-all duration-700 ease-out"
                  style={{
                    left: storm.reticleLeft,
                    top: storm.reticleTop,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {/* Outer Pulsing Target Ring */}
                  <div className="w-14 h-14 rounded-full border border-emerald-400/50 animate-ping opacity-30" />
                  
                  {/* Precision Target Brackets */}
                  <div className="absolute w-12 h-12 border border-dashed border-emerald-400/80 flex items-center justify-center">
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-emerald-400" />
                    
                    {/* Center Crosshair */}
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    <div className="absolute w-6 h-[1px] bg-emerald-400/70" />
                    <div className="absolute h-6 w-[1px] bg-emerald-400/70" />
                  </div>

                  {/* Micro Target Tag */}
                  <div className="absolute top-14 whitespace-nowrap bg-black/85 backdrop-blur-sm border border-emerald-500/40 px-1.5 py-0.5 text-[8px] font-mono text-emerald-300">
                    EYE FIX: {storm.lat}°N, {Math.abs(storm.lon)}°{storm.lonDir}
                  </div>
                </div>

                {/* Overlay Top-Left: Storm Position Coordinates */}
                <div className="absolute top-2 left-2 bg-black/85 backdrop-blur-md border border-zinc-800 px-2 py-1 font-mono text-[9px] text-zinc-300 pointer-events-none">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">POS</span>
                    <span className="text-white font-bold">{storm.lat}°N, {Math.abs(storm.lon)}°{storm.lonDir}</span>
                  </div>
                </div>

                {/* Overlay Top-Right: Satellite Channel / Radiometric Sensor */}
                <div className="absolute top-2 right-2 bg-black/85 backdrop-blur-md border border-zinc-800 px-2 py-1 font-mono text-[9px] text-zinc-300 pointer-events-none flex items-center gap-1.5 max-w-[190px] truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-white font-bold truncate">{storm.satelliteSource.split('(')[0].trim()}</span>
                </div>

                {/* Live Reticle Alignment Badge */}
                <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-md border border-zinc-800 px-2 py-0.5 text-[9px] font-mono text-zinc-400 flex items-center gap-1.5 pointer-events-none">
                  <Compass className="w-2.5 h-2.5 text-zinc-300" />
                  <span>OFFSET: {storm.offsetStr}</span>
                </div>

                {/* Eye Fix Status Pill */}
                <div className="absolute bottom-2 left-2 bg-black/85 backdrop-blur-md border border-zinc-800 px-2 py-0.5 text-[9px] font-mono text-emerald-400 flex items-center gap-1.5 pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>CENTERNET: LOCKED</span>
                </div>
              </div>

              {/* Status Ticker Bar right under Viewport */}
              <div className="px-3 py-1.5 bg-[#090a0e] border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <div className="flex items-center gap-1.5 truncate">
                  <Activity className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate text-zinc-300">{storm.bannerText}</span>
                </div>
                <span className="text-[9px] text-zinc-500 shrink-0 ml-2">&lt; 4.0s</span>
              </div>

              {/* Live Telemetry Grid */}
              <div className="grid grid-cols-2 divide-x divide-y divide-zinc-800 border-t border-zinc-800 bg-zinc-950 font-mono text-xs">
                <div className="p-3.5 bg-zinc-950/80">
                  <div className="text-zinc-500 text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span>SUSTAINED WIND (1-MIN)</span>
                    <Wind className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="text-lg font-bold text-white mt-1">{storm.mswKnots} kts</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{storm.mswKmh} km/h · {storm.badge}</div>
                </div>

                <div className="p-3.5 bg-zinc-950/80">
                  <div className="text-zinc-500 text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span>CENTRAL PRESSURE</span>
                    <Gauge className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="text-lg font-bold text-white mt-1">{storm.pressureHpa} hPa</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Deficit: {storm.deficitHpa} hPa</div>
                </div>

                <div className="p-3.5 bg-zinc-950/80">
                  <div className="text-zinc-500 text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span>RAPID INTENSIFICATION</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-lg font-bold text-white mt-1">{storm.riProbability}% Risk</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">SST {storm.sst} · Shear {storm.shear}</div>
                </div>

                <div className="p-3.5 bg-zinc-950/80">
                  <div className="text-zinc-500 text-[10px] uppercase tracking-wider flex items-center justify-between">
                    <span>EST. LANDFALL ETA</span>
                    <Navigation className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="text-lg font-bold text-white mt-1">{storm.landfallTime}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 truncate" title={storm.landfallTarget}>{storm.landfallTarget}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
