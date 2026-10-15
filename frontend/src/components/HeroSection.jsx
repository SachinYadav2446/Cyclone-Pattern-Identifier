import React, { useState, useEffect } from 'react';
import { 
  Wind, 
  Gauge, 
  ArrowUpRight, 
  Compass, 
  Zap, 
  Layers, 
  Award, 
  Target, 
  Clock, 
  CheckCircle2,
  Activity
} from 'lucide-react';

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

export default function HeroSection({ onOpenConsole, onOpenDemo }) {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 border-b border-zinc-800 bg-black">
      {/* Precision ambient background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] bg-zinc-800/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Mission Narrative & Paper Architecture */}
          <div className="lg:col-span-7 flex flex-col items-start">
            
            {/* Paper Scope Protocol Badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-[10px] font-mono tracking-widest text-zinc-300 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white font-bold">STAGE 01 &amp; 02</span>
              <span className="text-zinc-600">//</span>
              <span className="text-zinc-400">NORTH INDIAN OCEAN TROPICAL CYCLONE INTELLIGENCE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12] font-mono">
              Autonomous Sub-Pixel{' '}
              <span className="text-white underline decoration-zinc-700 decoration-2 underline-offset-8">
                Eye Localization
              </span>{' '}
              &amp; Deep Dvorak Intensity.
            </h1>

            <p className="mt-5 text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed font-sans">
              A unified deep learning framework for the Bay of Bengal &amp; Arabian Sea: <strong className="text-white">CenterNet</strong> isolates the low-level circulation center with sub-pixel continuous regression (&lt;10 km error), streaming stabilized convective core radiances into <strong className="text-white">ConvNeXt-V2</strong> to estimate sustained wind, minimum pressure, and IMD storm category in <strong className="text-white font-mono">&lt;40 ms</strong>.
            </p>

            {/* Tactical CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-xs">
              <a
                href="#workbench"
                className="flex items-center gap-2.5 px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-black" />
                <span>Launch Live Workbench (Upload Image)</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <a
                href="#models"
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-all active:scale-95"
              >
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>AI Architecture</span>
              </a>

              <a
                href="#benchmarks"
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all active:scale-95"
              >
                <Award className="w-3.5 h-3.5 text-zinc-400" />
                <span>Accuracy Benchmarks</span>
              </a>
            </div>

            {/* Clean Publication Metric Cards */}
            <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-zinc-800/80 w-full max-w-lg font-mono text-xs">
              <div className="p-3 bg-zinc-950 border border-zinc-850 space-y-0.5">
                <div className="text-zinc-500 text-[9px] uppercase font-semibold">EYE FIX ACCURACY</div>
                <div className="text-xl sm:text-2xl font-extrabold text-white">8.7 km</div>
                <div className="text-zinc-500 text-[10px]">Target: &lt; 30 km</div>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-850 space-y-0.5">
                <div className="text-zinc-500 text-[9px] uppercase font-semibold">INTENSITY MAE</div>
                <div className="text-xl sm:text-2xl font-extrabold text-white">4.8 kts</div>
                <div className="text-zinc-500 text-[10px]">Target: &lt; 7.5 kts</div>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-850 space-y-0.5">
                <div className="text-zinc-500 text-[9px] uppercase font-semibold">INFERENCE SPEED</div>
                <div className="text-xl sm:text-2xl font-extrabold text-white">&lt; 35 ms</div>
                <div className="text-zinc-500 text-[10px]">End-to-End FP16</div>
              </div>
            </div>

          </div>

          {/* Right Column: Clean Satellite Preview Showcase */}
          <div className="lg:col-span-5 relative w-full">
            <div className="border border-zinc-800 bg-black shadow-2xl overflow-hidden font-mono text-xs">
              
              {/* Header */}
              <div className="px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="font-bold text-white tracking-wide">ACTIVE BENCHMARK PASS</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 text-zinc-300">
                    INSAT-3D
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <LiveClock />
                </div>
              </div>

              {/* Viewport with Animated Eye Reticle */}
              <div className="relative h-72 sm:h-80 w-full bg-black flex items-center justify-center overflow-hidden">
                <img
                  src="/images/visible_cyclone_image.png"
                  alt="Cyclone Satellite Imagery"
                  className="w-full h-full object-cover object-center select-none"
                />

                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                {/* Sub-Pixel Eye Fix Reticle at Cyclone Fani core (63%, 46%) */}
                <div
                  className="absolute pointer-events-none flex flex-col items-center justify-center"
                  style={{ left: '63%', top: '46%', transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-14 h-14 rounded-full border border-cyan-400/60 animate-ping opacity-30" />
                  <div className="absolute w-12 h-12 border border-zinc-400/80 flex items-center justify-center">
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    <div className="absolute w-6 h-[1px] bg-white/80" />
                    <div className="absolute h-6 w-[1px] bg-white/80" />
                  </div>

                  <div className="absolute top-14 whitespace-nowrap bg-black/90 border border-zinc-700 px-2 py-0.5 text-[9px] font-mono text-zinc-200 rounded">
                    EYE FIX: 19.80°N, 85.80°E · Ø 38.5 km
                  </div>
                </div>

                {/* Status Badges */}
                <div className="absolute top-2.5 left-2.5 bg-black/90 border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                  CYCLONE FANI · BAY OF BENGAL
                </div>

                <div className="absolute bottom-2.5 left-2.5 bg-black/90 border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                  CENTERNET: LOCKED (8.7 km error)
                </div>

                <div className="absolute bottom-2.5 right-2.5 bg-black/90 border border-zinc-800 px-2 py-0.5 text-[10px] text-emerald-400 font-bold">
                  ΔT = 87.2 K
                </div>
              </div>

              {/* Clean Telemetry Strip */}
              <div className="grid grid-cols-3 divide-x divide-zinc-800 border-t border-zinc-800 bg-zinc-950 p-3 text-center">
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase">SUSTAINED WIND</span>
                  <span className="text-base font-extrabold text-white">115 kts</span>
                  <span className="text-[9px] text-zinc-400 block">[ESCS]</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase">MIN PRESSURE</span>
                  <span className="text-base font-extrabold text-white">932 hPa</span>
                  <span className="text-[9px] text-zinc-400 block">-78 hPa deficit</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase">DVORAK RATING</span>
                  <span className="text-base font-extrabold text-white">T6.0</span>
                  <span className="text-[9px] text-zinc-400 block">CI 6.0</span>
                </div>
              </div>

              {/* Quick Link to Workbench */}
              <a
                href="#workbench"
                className="block text-center py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border-t border-zinc-800 text-[11px] transition-colors"
              >
                Upload your own satellite pass in the Workbench &rarr;
              </a>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
