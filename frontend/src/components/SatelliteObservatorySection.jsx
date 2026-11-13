import React from 'react';
import { 
  Satellite, Play, Layers, Eye, Radio, ArrowRight, 
  Sparkles, Maximize2 
} from 'lucide-react';

export default function SatelliteObservatorySection({ onOpenObservatory }) {
  return (
    <section className="py-8 sm:py-10 border-t border-[#64104E]/30 relative overflow-hidden bg-[#07030c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header - Compact, no subheading, no gradients */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#64104E]/30">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#140a20] text-cyan-300 border border-cyan-500/30 mb-1.5 max-w-full">
              <Satellite className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">ISRO INSAT-3D / 3DR · 74.0°E GEOSTATIONARY DOWNLINK</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
              Satellite Research &amp; Genesis Observatory
            </h2>
          </div>

          {/* Observatory Launch Button with Premium Hover & Click Animation */}
          <button
            onClick={onOpenObservatory}
            className="w-full sm:w-auto justify-center relative px-4 sm:px-5 py-2.5 rounded-lg font-mono text-xs font-bold bg-[#E04A31] hover:bg-[#CF2F4B] text-white shadow-md hover:shadow-[0_0_25px_rgba(224,74,49,0.55)] transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-[0.96] active:brightness-90 flex items-center gap-2.5 group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Satellite className="w-4 h-4 text-white group-hover:rotate-[25deg] group-hover:scale-115 transition-transform duration-300 ease-out" />
            <span className="tracking-wide">Launch Satellite Observatory</span>
            <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1.5 transition-transform duration-200 ease-out" />
          </button>
        </div>

        {/* Observatory Showcase Mission Control Console - 40% Less Height */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Column: Technical Specifications & Features (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 font-mono">
            {/* Top Downlink Card */}
            <div className="p-3.5 rounded-xl bg-[#0c0614] border border-[#64104E]/50">
              <div className="flex items-center justify-between text-[10px] text-cyan-300 font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>ORBITAL TELEMETRY</span>
                </span>
                <span className="text-slate-400">BAY OF BENGAL CORRIDOR</span>
              </div>
              <div className="text-sm font-bold text-white mb-1">
                30-Minute Rapid Synoptic Cadence
              </div>
              <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Direct space downlink from INSAT-3D/3DR geostationary sounders at 74.0°E and 93.5°E with continuous 4-band radiometer swaths.
              </div>
            </div>

            {/* 4 Feature Badges (Compact 2x2 Grid) */}
            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <div className="p-2.5 rounded-lg bg-[#11091a] border border-[#64104E]/40">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-0.5">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>3-BAND SPECTRUM</span>
                </div>
                <div className="text-[10px] text-slate-400 font-sans">
                  TIR-1 (10.8µm), VIS (0.65µm), WV (6.8µm)
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#11091a] border border-[#64104E]/40">
                <div className="flex items-center gap-1.5 text-[#E04A31] font-bold mb-0.5">
                  <Play className="w-3 h-3 text-[#E04A31]" />
                  <span>4D TIMELAPSE</span>
                </div>
                <div className="text-[10px] text-slate-400 font-sans">
                  48-hour kinematic flow from 0.5x to 4x
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#11091a] border border-[#64104E]/40">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-0.5">
                  <Eye className="w-3 h-3 text-amber-400" />
                  <span>EYE RETICLE</span>
                </div>
                <div className="text-[10px] text-slate-400 font-sans">
                  Sub-pixel CenterNet cavity coordinate lock
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#11091a] border border-[#64104E]/40">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold mb-0.5">
                  <Sparkles className="w-3 h-3 text-rose-400" />
                  <span>DVORAK BD-CURVE</span>
                </div>
                <div className="text-[10px] text-slate-400 font-sans">
                  Thermal cloud-top temperature inversion
                </div>
              </div>
            </div>

            {/* Launch Action Strip with Dynamic Hover & Click */}
            <button 
              onClick={onOpenObservatory}
              className="w-full p-2.5 rounded-lg bg-[#140a20] hover:bg-[#201032] border border-cyan-500/30 hover:border-cyan-400 text-slate-300 hover:text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.97] active:brightness-90 flex items-center justify-between text-xs group shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-cyan-400 group-hover:animate-ping" />
                <span className="font-bold">Enter Fullscreen Mission Control</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1.5 transition-transform duration-200" />
            </button>
          </div>

          {/* Right Column: Sleek Compact Viewport Preview (7 Cols) */}
          <div className="lg:col-span-7">
            <div 
              onClick={onOpenObservatory}
              className="relative h-[250px] sm:h-[270px] lg:h-[285px] rounded-xl bg-[#030106] border border-[#64104E]/50 hover:border-cyan-400 transition-all duration-300 overflow-hidden cursor-pointer group hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] active:scale-[0.99]"
            >
              {/* Tactical Top Bar */}
              <div className="absolute top-0 inset-x-0 z-20 px-3 py-1.5 bg-black/80 backdrop-blur-sm border-b border-white/10 flex items-center justify-between text-[10.5px] font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-bold text-white truncate max-w-[200px] sm:max-w-none">
                    INSAT-3D/3DR VISIBLE<span className="hidden xs:inline"> SPECTRUM</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-300 text-[9.5px]">
                  <span>EXPAND</span>
                  <Maximize2 className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                </div>
              </div>

              {/* Viewport Satellite Image - Authentic Visible Cyclone Pass */}
              <img
                src="/images/visible_cyclone_image.png"
                alt="INSAT Visible Spectrum Cyclone Pass"
                className="w-full h-full object-cover filter contrast-110 brightness-95 group-hover:scale-102 transition-transform duration-500"
              />

              {/* Tactical Corner Crosshairs */}
              <span className="absolute top-8 left-3 font-mono text-xs text-white/40 pointer-events-none select-none">+</span>
              <span className="absolute top-8 right-3 font-mono text-xs text-white/40 pointer-events-none select-none">+</span>
              <span className="absolute bottom-8 left-3 font-mono text-xs text-white/40 pointer-events-none select-none">+</span>
              <span className="absolute bottom-8 right-3 font-mono text-xs text-white/40 pointer-events-none select-none">+</span>

              {/* Center Reticle Lock Graphic */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-16 h-16 rounded-full border border-white/60 border-dashed animate-spin flex items-center justify-center [animation-duration:20s]">
                  <div className="w-8 h-8 rounded-full border border-cyan-400/80" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-white/20 font-mono text-[9px] text-white whitespace-nowrap shadow">
                  16.72°N, 86.80°E
                </div>
              </div>

              {/* Hover Enter Overlay with Smooth Scale & Pulse Feedback */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                <div className="px-5 py-2 rounded-xl bg-[#0e0717]/95 border border-cyan-400/60 text-white font-mono text-xs font-bold flex items-center gap-2.5 shadow-2xl transform scale-95 group-hover:scale-100 transition-transform duration-200">
                  <Play className="w-4 h-4 text-[#E04A31] fill-current animate-pulse" />
                  <span>CLICK TO OPEN FULL OBSERVATORY</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Bottom HUD Bar */}
              <div className="absolute bottom-0 inset-x-0 z-20 px-3 py-1.5 bg-black/85 backdrop-blur-sm border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <Radio className="w-3 h-3 text-[#E04A31]" />
                  <span>SYNOPTIC ORBITAL PASS: 2026-11-10 17:03 UTC</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300">EYE Ø 38.5 KM</span>
                  <span>·</span>
                  <span className="text-[#E04A31] font-bold">T5.5 (VSCS)</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
