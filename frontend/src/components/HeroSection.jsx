import React from 'react';
import { 
  ArrowRight, 
  Target, 
  Zap, 
  Radio
} from 'lucide-react';

export default function HeroSection({ onOpenConsole, onOpenDemo }) {
  return (
    <section className="relative overflow-hidden pt-4 pb-12 sm:pt-6 sm:pb-16 bg-[#08050c]">
      {/* Precision ambient background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-45 pointer-events-none" />

      {/* SVG Definitions for the exact Wireframe Fluid L-Curve Shape (Right Border Open) */}
      <svg className="absolute -top-[9999px] -left-[9999px] w-4 h-4 pointer-events-none opacity-0" aria-hidden="true">
        <defs>
          <clipPath id="hero-wireframe-curve" clipPathUnits="objectBoundingBox">
            <path d="M 0.56 0 L 1.02 0 L 1.02 1 L 0.06 1 C 0.025 1 0 0.9583 0 0.9 L 0 0.6833 C 0 0.6 0.03 0.5667 0.07 0.5667 L 0.4 0.5667 C 0.465 0.5667 0.5 0.4917 0.5 0.3833 L 0.5 0.1 C 0.5 0.0417 0.525 0 0.56 0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ================================================================ */}
        {/* HERO CONTAINER (NO OUTER SQUARE BOX)                             */}
        {/* ================================================================ */}
        <div className="relative min-h-[580px] lg:min-h-[640px]">
          
          {/* ============================================================== */}
          {/* 1. DESKTOP: EXACT FLUID CURVED MEDIA BACKDROP FROM WIREFRAME   */}
          {/* ============================================================== */}
          <div className="hidden lg:block absolute inset-0 z-0 animate-hero-earth">
            <div 
              className="w-full h-full bg-[#06040a] transition-colors overflow-hidden relative"
              style={{ clipPath: 'url(#hero-wireframe-curve)' }}
            >
              {/* The Cyclone Earth Globe image FITTED to cover the entire shape - NO fading away */}
              <img
                src="/images/cyclone_earth_globe.png"
                alt="Cyclone Vortex Over Earth"
                className="absolute -right-8 xl:-right-12 top-1/2 -translate-y-1/2 w-[115%] h-[125%] max-w-none object-cover object-[78%_46%] pointer-events-none select-none filter contrast-[1.08] brightness-[0.98]"
              />

              {/* Clean scanlines & subtle vignette - NO right side color gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

              {/* Tactical INSAT-3D Orbit Pill in top-right of curved shape */}
              <div className="absolute top-8 right-8 font-mono text-[10px] text-[#C3864D] bg-[#120a1a]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#64104E]/80 shadow-lg font-semibold flex items-center gap-2 z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E04A31] animate-pulse" />
                <span>INSAT-3D 74°E ORBIT · 4-BAND SATELLITE</span>
              </div>

              {/* Publication Metrics Streamed Along Bottom Arm of Curved Shape */}
              <div className="absolute bottom-6 left-10 flex items-center gap-4 font-mono text-xs z-20">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#120a1a]/90 backdrop-blur-md border border-[#64104E]/80 text-white rounded-xl shadow-lg">
                  <span className="text-[10px] text-slate-400 font-semibold">EYE FIX:</span>
                  <span className="font-black text-[#E04A31]">8.7 km MAE</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#120a1a]/90 backdrop-blur-md border border-[#64104E]/80 text-white rounded-xl shadow-lg">
                  <span className="text-[10px] text-slate-400 font-semibold">WIND:</span>
                  <span className="font-black text-[#C3864D]">4.8 kts MAE</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#120a1a]/90 backdrop-blur-md border border-[#64104E]/80 text-white rounded-xl shadow-lg">
                  <span className="text-[10px] text-slate-400 font-semibold">GPU:</span>
                  <span className="font-black text-[#B43067]">&lt; 35 ms</span>
                </div>
              </div>
            </div>
          </div>

          {/* Crisp Hairline Contour Stroke: Right border removed, top & bottom borders fading away */}
          <svg 
            className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-10 animate-hero-earth" 
            viewBox="0 0 1000 600" 
            preserveAspectRatio="none"
          >
            <defs>
              {/* Top border hairline fading away towards the right */}
              <linearGradient id="topBorderFade" x1="560" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#B43067" stopOpacity="0.55" />
                <stop offset="35%" stopColor="#B43067" stopOpacity="0.3" />
                <stop offset="70%" stopColor="#B43067" stopOpacity="0" />
                <stop offset="100%" stopColor="#B43067" stopOpacity="0" />
              </linearGradient>

              {/* Bottom border hairline fading away towards the right */}
              <linearGradient id="bottomBorderFade" x1="60" y1="600" x2="1000" y2="600" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#B43067" stopOpacity="0.55" />
                <stop offset="30%" stopColor="#CF2F4B" stopOpacity="0.35" />
                <stop offset="65%" stopColor="#B43067" stopOpacity="0" />
                <stop offset="100%" stopColor="#B43067" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Main iconic inner notch & bottom-left contour */}
            <path
              d="M 560,0 C 525,0 500,25 500,60 L 500,230 C 500,295 465,340 400,340 L 70,340 C 30,340 0,360 0,410 L 0,540 C 0,575 25,600 60,600"
              fill="none"
              stroke="rgba(180, 48, 103, 0.55)"
              strokeWidth="1.5"
            />

            {/* Top border line fading away to the right */}
            <path
              d="M 560,0 L 1000,0"
              fill="none"
              stroke="url(#topBorderFade)"
              strokeWidth="1.5"
            />

            {/* Bottom border line fading away to the right */}
            <path
              d="M 60,600 L 1000,600"
              fill="none"
              stroke="url(#bottomBorderFade)"
              strokeWidth="1.5"
            />
          </svg>

          {/* ============================================================== */}
          {/* 2. BOTTOM-RIGHT ANGLED HUD CARD WITH 3D ISOMETRIC CYLINDER     */}
          {/* ============================================================== */}
          <div className="hidden lg:flex absolute bottom-5 right-5 xl:bottom-7 xl:right-7 bg-[#0d0714]/95 backdrop-blur-xl border border-[#64104E]/80 rounded-2xl p-4 text-white shadow-2xl items-center gap-4 z-30 select-none animate-hero-hud">
            {/* 3D Isometric Cylinder matching the wireframe */}
            <div className="w-12 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full text-[#E04A31]" viewBox="0 0 48 56" fill="none">
                <ellipse cx="24" cy="12" rx="16" ry="7" stroke="currentColor" strokeWidth="2" fill="rgba(180, 48, 103, 0.3)" />
                <path d="M8 12 V38 C8 42 15 46 24 46 C33 46 40 42 40 38 V12" stroke="currentColor" strokeWidth="2" fill="rgba(100, 16, 78, 0.4)" />
                <ellipse cx="24" cy="25" rx="16" ry="6" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="2 2" />
                <ellipse cx="24" cy="38" rx="16" ry="7" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="24" cy="12" r="2.5" fill="#ffffff" />
              </svg>
            </div>

            <div className="font-mono text-left">
              <div className="text-[10px] text-[#E04A31] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E04A31] animate-pulse" />
                <span>BOB-SYS-01 · ESCS</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                115 kts <span className="text-slate-400 font-normal">|</span> 930.1 hPa
              </div>
              <div className="text-[10px] text-[#C3864D] mt-0.5">
                Fix: 18.23°N, 85.74°E
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 3. TOP-LEFT CONTENT AREA (HEADLINE, SPECS, THUMB & CTAS)       */}
          {/* ============================================================== */}
          <div className="relative z-20 w-full lg:max-w-[48%] pt-2 pb-6 lg:py-4 flex flex-col justify-between">
            
            {/* Top Row: Main Headline (Drops with bounce) */}
            <div className="pb-3 sm:pb-6 border-b border-[#64104E]/50 animate-hero-drop">
              <h1 className="text-lg xs:text-xl sm:text-3xl lg:text-[2.65rem] font-black tracking-tight text-white leading-snug sm:leading-[1.14] font-mono">
                Autonomous Sub-Pixel{' '}
                <span className="text-[#E04A31] underline decoration-[#CF2F4B] decoration-2 underline-offset-4 sm:underline-offset-6">
                  Eye Localization
                </span>{' '}
                &amp; Deep Dvorak.
              </h1>
            </div>

            {/* ============================================================== */}
            {/* MOBILE ONLY (< sm): SPACE-EFFICIENT HERO ROW & CARDS          */}
            {/* ============================================================== */}
            <div className="sm:hidden mt-3 space-y-2.5 animate-hero-drop-delayed">
              {/* Row: Small Cyclone Image + Action Buttons right in front of it */}
              <div className="flex items-stretch gap-2.5">
                {/* Cyclone Eye Thumbnail with Reticle */}
                <button
                  onClick={onOpenDemo}
                  className="w-[92px] h-[92px] min-w-[92px] min-h-[92px] max-w-[92px] max-h-[92px] rounded-2xl border border-[#64104E]/80 bg-[#120a1c] overflow-hidden relative shadow-lg shrink-0 group cursor-pointer hover:border-[#E04A31] transition-all active:scale-95"
                  title="Click to launch Interactive Demo & Sub-Pixel Eye Workbench"
                >
                  <img
                    src="/images/visible_cyclone_image.png"
                    alt="Cyclone Eye Thumbnail"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* High-tech reticle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 p-1.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[8px] font-mono text-[#E04A31] font-bold">
                      <span>10× EYE</span>
                      <Target className="w-2.5 h-2.5 text-[#E04A31] animate-pulse" />
                    </div>
                    <div className="text-[8px] font-mono text-white font-bold bg-[#0d0714]/80 px-1 py-0.5 rounded text-center border border-[#64104E]/60">
                      8.7 km Fix
                    </div>
                  </div>
                </button>

                {/* Buttons right in front of the image to save space */}
                <div className="flex-1 flex flex-col justify-between gap-1.5">
                  <button
                    onClick={onOpenConsole}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#E04A31] to-[#CF2F4B] hover:opacity-95 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(224,74,49,0.35)] active:scale-95 cursor-pointer transition-all"
                  >
                    <span>GIS Mission Control</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white shrink-0" />
                  </button>

                  <button
                    onClick={onOpenDemo}
                    className="flex-1 py-2 px-3 rounded-xl border border-[#B43067]/60 bg-[#120a1a] hover:bg-[#1f102a] text-white font-mono font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#B43067] shrink-0" />
                    <span>Interactive Demo</span>
                  </button>
                </div>
              </div>

              {/* Ultra-Compact Telemetry Bar (1-Line Pill) */}
              <div className="flex items-center justify-around py-1.5 px-3 bg-[#120a1a]/85 border border-[#64104E]/60 rounded-xl font-mono text-[10px] shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] text-slate-400 uppercase font-semibold">EYE FIX:</span>
                  <span className="font-bold text-[#E04A31]">8.7 km</span>
                </div>
                <div className="w-px h-3 bg-[#64104E]/60" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] text-slate-400 uppercase font-semibold">WIND:</span>
                  <span className="font-bold text-[#fed7aa]">4.8 kts</span>
                </div>
                <div className="w-px h-3 bg-[#64104E]/60" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] text-slate-400 uppercase font-semibold">GPU:</span>
                  <span className="font-bold text-[#B43067]">&lt;35 ms</span>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* TABLET & DESKTOP (sm+): BALANCED SIDE-BY-SIDE                  */}
            {/* ============================================================== */}
            <div className="hidden sm:block my-5 sm:my-6 animate-hero-drop-delayed">
              <div className="flex sm:flex-row items-center gap-5">
                {/* Thumbnail Card matching wireframe image placeholder with hills/sun */}
                <button
                  onClick={onOpenDemo}
                  className="w-24 h-24 sm:w-28 sm:h-28 min-w-[96px] sm:min-w-[112px] max-w-[96px] sm:max-w-[112px] min-h-[96px] sm:min-h-[112px] max-h-[96px] sm:max-h-[112px] rounded-2xl border border-[#64104E]/70 bg-[#120a1c] overflow-hidden relative shadow-md shrink-0 group cursor-pointer hover:border-[#E04A31] transition-all active:scale-95"
                  title="Click to launch Interactive Demo & Sub-Pixel Eye Workbench"
                >
                  <img
                    src="/images/visible_cyclone_image.png"
                    alt="Cyclone Eye Thumbnail"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Reticle Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 p-2 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[9px] font-mono text-[#E04A31] font-bold">
                      <span>10× EYE</span>
                      <Target className="w-3 h-3 text-[#E04A31] animate-pulse" />
                    </div>
                    <div className="text-[9px] font-mono text-white font-medium">8.7 km Fix</div>
                  </div>
                </button>

                {/* Short Clear Description & Action Buttons */}
                <div className="flex-1 space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-md">
                    Unified multi-spectral deep learning pipeline for North Indian Ocean cyclones: continuous sub-pixel center pinpointing coupled with physical Atkinson-Holliday intensity regression in &lt;35 ms.
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 font-mono text-xs">
                    {/* Outlined Pill Button */}
                    <button
                      onClick={onOpenDemo}
                      className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-[#B43067]/50 bg-[#120a1a] hover:bg-[#1f102a] hover:border-[#B43067] text-white font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2 text-xs"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#B43067]" />
                      <span>Interactive Demo</span>
                    </button>

                    {/* Filled High-Contrast Pill with Arrow */}
                    <button
                      onClick={onOpenConsole}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#E04A31] to-[#CF2F4B] hover:opacity-95 text-white font-bold transition-all duration-200 shadow-[0_0_25px_rgba(224,74,49,0.35)] active:scale-95 cursor-pointer flex items-center gap-2 group text-xs"
                    >
                      <span>GIS Mission Control</span>
                      <ArrowRight className="w-3.5 h-3.5 text-white/90 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet View for Media: Full Uncropped Earth Sphere on Mobile */}
            <div className="lg:hidden mt-3 sm:mt-4 relative rounded-2xl sm:rounded-3xl bg-black border border-[#64104E]/60 w-full max-w-[360px] mx-auto aspect-square sm:aspect-auto sm:h-[320px] overflow-hidden flex items-center justify-center animate-hero-earth shadow-2xl">
              <img
                src="/images/cyclone_earth_globe.png"
                alt="Cyclone Vortex Over Earth"
                className="w-full h-full object-contain filter contrast-[1.08] select-none pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              {/* Orbit badge top-left */}
              <div className="absolute top-2.5 left-2.5 font-mono text-[9px] text-[#C3864D] bg-[#120a1a]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#64104E]/80 shadow font-semibold flex items-center gap-1.5 z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E04A31] animate-pulse" />
                <span>INSAT-3D 74°E ORBIT</span>
              </div>

              {/* Mobile HUD strip bottom-right */}
              <div className="absolute bottom-2.5 right-2.5 bg-[#0d0714]/90 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-xl border border-[#64104E]/80 z-20 flex items-center gap-2 shadow-lg">
                <span className="text-[#E04A31] font-bold">BOB-SYS-01</span>
                <span className="text-slate-500">|</span>
                <span>115 kts</span>
                <span className="text-slate-500">|</span>
                <span className="text-[#fed7aa]">930 hPa</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
