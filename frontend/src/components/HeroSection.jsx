import React, { useEffect, useState } from 'react';
import { Compass, Wind, ArrowUpRight, Gauge, AlertTriangle, Play, Sparkles, Navigation, Clock, Activity } from 'lucide-react';

const stormPresets = {
  michael: {
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
    dx: 0.12,
    dy: -0.18,
    riProbability: 98,
    sst: '29.7°C',
    shear: '6.4 kts',
    landfallTime: 'OCT 10 · 17:30 UTC',
    landfallTarget: 'Mexico Beach / Panama City, FL',
    surgeEst: '4.3 m',
    rotSpeed: 0.035,
    satelliteGif: '/gifs/michael_intensification_web.gif',
    satelliteSource: 'GOES-16 ABI Band 13 (10.35 µm)',
    satelliteTag: 'Clean Infrared Window · Intensification to Landfall',
  },
  fani: {
    name: 'FANI-II (BOB-04)',
    year: 'Active Pass',
    basin: 'Bay of Bengal',
    category: 'Very Severe Cyclonic Storm (VSCS)',
    badge: 'VSCS',
    mswKnots: 85.4,
    mswKmh: 158.2,
    pressureHpa: 972.0,
    deficitHpa: -41,
    lat: 15.86,
    lon: 86.18,
    dx: 0.17,
    dy: 0.32,
    riProbability: 82,
    sst: '29.4°C',
    shear: '8.2 kts',
    landfallTime: '+28h 15m',
    landfallTarget: 'Puri - Balasore, Odisha',
    surgeEst: '3.4 m',
    rotSpeed: 0.022,
  },
  amphan: {
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
    dx: -0.08,
    dy: 0.14,
    riProbability: 96,
    sst: '31.1°C',
    shear: '5.4 kts',
    landfallTime: '+18h 40m',
    landfallTarget: 'Digha - Sundarbans, WB',
    surgeEst: '5.2 m',
    rotSpeed: 0.038,
  },
  biparjoy: {
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
    dx: 0.22,
    dy: -0.19,
    riProbability: 64,
    sst: '29.8°C',
    shear: '11.5 kts',
    landfallTime: '+34h 00m',
    landfallTarget: 'Jakhau Port, Gujarat',
    surgeEst: '3.0 m',
    rotSpeed: 0.026,
  },
  remal: {
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
    dx: 0.05,
    dy: 0.09,
    riProbability: 45,
    sst: '28.9°C',
    shear: '14.2 kts',
    landfallTime: '+11h 20m',
    landfallTarget: 'Khepupara - Sagar Island',
    surgeEst: '2.1 m',
    rotSpeed: 0.016,
  },
};

export default function HeroSection({ onOpenConsole }) {
  const storm = stormPresets.michael;
  const [utcTime, setUtcTime] = useState('');

  // Live military UTC clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

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
          <div className="lg:col-span-5 relative">
            <div className="relative border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
              {/* Card Header with Active Storm Badge & Military Clock */}
              <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white tracking-wider">
                    {storm.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 border border-zinc-700 bg-zinc-800 text-zinc-200 font-bold">
                    {storm.badge}
                  </span>
                </div>
                
                <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span className="text-zinc-300 font-bold">{utcTime || '11:42:00 UTC'}</span>
                </div>
              </div>

              {/* Display Viewport: Real Geostationary Infrared Intensification Sequence */}
              <div className="relative h-72 sm:h-80 w-full bg-[#070709] flex items-center justify-center overflow-hidden">
                {/* Real Satellite Imagery Loop */}
                <img
                  src={storm.satelliteGif}
                  alt={`${storm.name} Geostationary Infrared Loop`}
                  className="absolute inset-0 w-full h-full object-cover object-center select-none"
                />
                {/* Subtle contrast grading overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                {/* CenterNet Sub-Pixel Eye Fix HUD Reticle (Dynamic Target Lock) */}
                <div
                  className="absolute pointer-events-none flex flex-col items-center justify-center"
                  style={{
                    left: '53%',
                    top: '51%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {/* Outer Pulsing Target Ring */}
                  <div className="w-14 h-14 rounded-full border border-emerald-400/50 animate-ping opacity-30" />
                  
                  {/* Precision Target Brackets */}
                  <div className="absolute w-12 h-12 border border-dashed border-emerald-400/80 flex items-center justify-center">
                    {/* Corner ticks */}
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
                    EYE FIX: {storm.lat}°N, {Math.abs(storm.lon)}°W
                  </div>
                </div>

                {/* Overlay Top-Left: Storm Position Coordinates */}
                <div className="absolute top-2.5 left-2.5 bg-black/85 backdrop-blur-md border border-zinc-800 px-2 py-1.5 font-mono text-[10px] text-zinc-300 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">POS</span>
                    <span className="text-white font-bold">{storm.lat}°N, {Math.abs(storm.lon)}°W</span>
                  </div>
                  <div className="text-[9px] text-zinc-400 mt-0.5">{storm.basin}</div>
                </div>

                {/* Overlay Top-Right: Satellite Channel / Radiometric Sensor */}
                <div className="absolute top-2.5 right-2.5 bg-black/85 backdrop-blur-md border border-zinc-800 px-2 py-1 font-mono text-[9px] text-zinc-300 pointer-events-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white font-bold">{storm.satelliteSource}</span>
                </div>

                {/* Live Reticle Alignment Badge */}
                <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur-md border border-zinc-800 px-2 py-1 text-[9px] font-mono text-zinc-400 flex items-center gap-1.5 pointer-events-none">
                  <Compass className="w-2.5 h-2.5 text-zinc-300" />
                  <span>OFFSET: +0.12 / -0.18</span>
                </div>

                {/* Eye Fix Status Pill */}
                <div className="absolute bottom-2.5 left-2.5 bg-black/85 backdrop-blur-md border border-zinc-800 px-2 py-1 text-[9px] font-mono text-emerald-400 flex items-center gap-1.5 pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>CENTERNET EYE FIX: LOCKED</span>
                </div>

                {/* Bottom Center Informational Banner for Michael */}
                <div className="absolute bottom-9 inset-x-0 mx-auto w-fit bg-zinc-950/90 backdrop-blur-md border border-zinc-700/60 px-2.5 py-0.5 text-[9px] font-mono text-zinc-300 pointer-events-none flex items-center gap-2 shadow-lg">
                  <Activity className="w-2.5 h-2.5 text-amber-400" />
                  <span>INTENSIFICATION TO CAT 5 LANDFALL · 118 SEQUENTIAL FRAMES</span>
                </div>
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
