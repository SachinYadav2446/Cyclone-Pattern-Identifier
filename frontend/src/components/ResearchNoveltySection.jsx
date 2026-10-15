import React, { useRef, useState, useEffect } from 'react';
import { 
  Target, 
  Activity, 
  Thermometer, 
  ShieldCheck, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  ArrowRight,
  ArrowDown,
  Layers,
  Cpu,
  Compass,
  FileText
} from 'lucide-react';

const novelties = [
  {
    id: 1,
    tag: 'INNOVATION 01 // GEOMETRY',
    category: 'Vortex Eye Pinpointing',
    title: 'Continuous Sub-Pixel Regression vs Discrete Boxes',
    icon: Target,
    highlightMetric: '8.7 km',
    highlightLabel: 'Haversine Center Error',
    gainBadge: '+71% ACCURACY GAIN',
    baselineText: 'YOLO and Faster-RCNN apply integer bounding boxes, producing ±25 to 35 km spatial quantization step-error.',
    innovationText: 'Anchor-free CenterNet regresses continuous floating-point offsets (dx, dy) on keypoint feature heatmaps.',
    formula: 'Fix = (p_x + δx, p_y + δy) · Stride',
    rationale: 'Bounding boxes are fundamentally designed for rigid rectangular objects, not diffuse meteorological vortices. Continuous sub-pixel regression eliminates grid quantization error completely.',
  },
  {
    id: 2,
    tag: 'INNOVATION 02 // THERMODYNAMICS',
    category: 'Atmospheric Physics',
    title: 'Physically-Constrained Atkinson-Holliday Balance',
    icon: Activity,
    highlightMetric: '0%',
    highlightLabel: 'Physical Balance Violations',
    gainBadge: 'PHYSICALLY COUPLED',
    baselineText: 'Standard neural networks predict wind and pressure as decoupled independent heads, often predicting non-physical states.',
    innovationText: 'Embedded Atkinson-Holliday loss penalizes thermodynamic decoupling during training, binding wind to central pressure.',
    formula: 'V_max = 6.7 × (1010 - P_min)^0.644',
    rationale: 'Pure black-box models frequently hallucinate non-physical states. By embedding empirical cyclostrophic balance into the multi-task loss, wind speed and central pressure deficit strictly obey atmospheric physics.',
  },
  {
    id: 3,
    tag: 'INNOVATION 03 // RADIOMETRY',
    category: 'Multi-Spectral Ingestion',
    title: '24/7 Multi-Spectral Planck Blackbody Calibration',
    icon: Thermometer,
    highlightMetric: '24 / 7',
    highlightLabel: 'Unbroken Tracking',
    gainBadge: '< 0.2 K SENSOR MARGIN',
    baselineText: 'Optical satellite models rely heavily on visible sunlight channels and become blind during nighttime passes (18:00 to 06:00 UTC).',
    innovationText: 'Ingests calibrated 4-channel tensors (TIR-1, TIR-2, WV, VIS) inverted via Planck blackbody equations into Kelvin temperatures.',
    formula: 'T_B = (c_2 · ν) / ln((c_1 · ν³ / R) + 1)',
    rationale: 'Tropical cyclones do not sleep at night. Physical Planck blackbody calibration guarantees continuous 24/7 convective thermometry through zero solar illumination and thick cirrus shields.',
  },
  {
    id: 4,
    tag: 'INNOVATION 04 // OPERATIONAL TRIAGE',
    category: 'False Alarm Suppression',
    title: 'Zero False-Alarm Vortex Presence Gatekeeper',
    icon: ShieldCheck,
    highlightMetric: '99.8%',
    highlightLabel: 'Non-Cyclone Specificity',
    gainBadge: 'ZERO FALSE ALARMS',
    baselineText: 'Standard object detectors force an output on every frame, erroneously predicting cyclone eyes on tranquil monsoon clouds.',
    innovationText: 'Stage-0 binary gatekeeper verifies tangential curvature and thermodynamic convective organization before triggering heavy models.',
    formula: 'Gate(X) = σ(W_vortex · f_conv + b) ≥ 0.65',
    rationale: 'False alarms trigger panic and costly coastal evacuations. Stage 0 ensures that tranquil monsoon depressions and non-organized convection never trigger unwarranted maritime alerts.',
  },
  {
    id: 5,
    tag: 'INNOVATION 05 // EDGE ACCELERATION',
    category: 'Computational Latency',
    title: 'Sub-35ms Real-Time Inference vs 6h NWP Clusters',
    icon: Zap,
    highlightMetric: '28.4 ms',
    highlightLabel: 'End-to-End Latency',
    gainBadge: '90x FASTER THAN DVORAK',
    baselineText: 'Numerical fluid dynamical simulations take 4 to 6 hours on supercomputers, while human Dvorak analysis requires 30 to 45 minutes.',
    innovationText: 'Dual-stage deep neural architecture executes end-to-end on consumer GPU hardware in under 35 milliseconds with FP16 precision.',
    formula: 'T_e2e = T_CenterNet (11.8ms) + T_ConvNeXt (16.4ms)',
    rationale: 'Traditional forecasting cycles take hours. DeepCyclone produces sub-pixel eye coordinates and calibrated intensity ratings instantaneously upon raw satellite downlink.',
  }
];

export default function ResearchNoveltySection() {
  const storyRef = useRef(null);
  const trackRef = useRef(null);
  const parallaxRef = useRef(null);
  const progressBarRef = useRef(null);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  // Smooth scroll glide animation adapted from Sachin's portfolio (SachinYadav2446/My-Portfolio)
  // Uses requestAnimationFrame + lerp ease (SCROLL_EASE = 0.085) for aerodynamic wheel glide
  useEffect(() => {
    let frame = 0;
    let current = -1;
    const SCROLL_EASE = 0.085;

    const tick = () => {
      const section = storyRef.current;
      const track = trackRef.current;

      if (section && track && window.innerWidth >= 768) {
        const rect = section.getBoundingClientRect();
        const distance = section.offsetHeight - window.innerHeight;

        if (distance > 0) {
          // Progress through this section from 0.0 to 1.0
          const target = Math.min(1, Math.max(0, -rect.top / distance));
          const next = current < 0 || Math.abs(target - current) < 0.0001
            ? target
            : current + (target - current) * SCROLL_EASE;

          if (next !== current) {
            current = next;

            // Maximum horizontal translate distance
            const maxTranslate = Math.max(0, track.scrollWidth - window.innerWidth + 80);
            track.style.transform = `translate3d(-${current * maxTranslate}px, 0, 0)`;

            // Subtle parallax background shift
            if (parallaxRef.current) {
              parallaxRef.current.style.transform = `translate3d(-${current * 140}px, 0, 0)`;
            }

            // Progress bar
            if (progressBarRef.current) {
              progressBarRef.current.style.width = `${current * 100}%`;
            }

            // Active card tracking
            const rawIdx = Math.round(current * (novelties.length + 0.6) - 0.2);
            const clampedIdx = Math.min(novelties.length - 1, Math.max(0, rawIdx));
            setActiveIndex(clampedIdx);
            setProgressPercent(Math.round(current * 100));
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Jump to specific card by smoothly scrolling the vertical document
  const jumpToCard = (index) => {
    const section = storyRef.current;
    if (!section) return;
    const distance = section.offsetHeight - window.innerHeight;
    const fraction = (index + 0.55) / (novelties.length + 0.9);
    const targetY = section.offsetTop + fraction * distance;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const stepCard = (direction) => {
    const nextIdx = direction === 'next'
      ? Math.min(novelties.length - 1, activeIndex + 1)
      : Math.max(0, activeIndex - 1);
    jumpToCard(nextIdx);
  };

  const goToModels = () => {
    document.getElementById('models')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      id="novelty" 
      ref={storyRef}
      className="relative md:h-[360vh] bg-[#fafaf9] text-zinc-900 border-b border-zinc-200"
    >
      {/* ============================================================== */}
      {/* DESKTOP VIEW: CLEAN WHITE PINNED HORIZONTAL CAROUSEL           */}
      {/* ============================================================== */}
      <div className="sticky top-0 hidden h-screen overflow-hidden md:flex md:flex-col md:justify-between py-4 px-6 lg:px-12 relative z-10 select-none">
        
        {/* Parallax Background Grid in Warm Alabaster White */}
        <div 
          ref={parallaxRef} 
          className="absolute inset-0 pointer-events-none will-change-transform z-0"
          style={{ width: '150vw' }}
        >
          {/* Subtle architectural dot-grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.22]" 
            style={{
              backgroundImage: 'radial-gradient(circle, #71717a 1px, transparent 1px), linear-gradient(to right, #e4e4e7 1px, transparent 1px), linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)',
              backgroundSize: '36px 36px, 108px 108px, 108px 108px'
            }}
          />
          {/* Soft ambient concentric rings */}
          <div className="absolute left-[25vw] top-[30vh] h-[500px] w-[500px] rounded-full border border-zinc-200/50 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute left-[80vw] top-[50vh] h-[600px] w-[600px] rounded-full border border-zinc-200/50 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute left-[135vw] top-[35vh] h-[520px] w-[520px] rounded-full border border-zinc-200/50 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Top Header & Interactive Progress Bar */}
        <div className="relative z-10 border-b border-zinc-200/80 pb-3 pt-1 shrink-0">
          <div className="flex items-center justify-between gap-6 mb-2.5">
            {/* Title & Tag */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-zinc-100 border border-zinc-200/80 text-zinc-700 rounded-full text-[9.5px] font-mono tracking-wider uppercase mb-1 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                <span>CORE SCIENTIFIC INNOVATIONS · ARCHITECTURAL REPORT</span>
              </div>
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-zinc-950 font-serif flex items-center gap-2">
                <span>Research Novelties & Methodological Breakthroughs</span>
              </h2>
            </div>

            {/* Step Indicators & Directional Controls */}
            <div className="flex items-center gap-3 font-mono text-xs">
              {/* Step Navigation Dots */}
              <div className="flex items-center gap-1 bg-white border border-zinc-200/90 rounded-lg p-1 shadow-2xs">
                {novelties.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => jumpToCard(idx)}
                    className={`px-2.5 py-0.5 text-[10px] font-mono font-medium rounded transition-all cursor-pointer ${
                      activeIndex === idx
                        ? 'bg-zinc-900 text-white shadow-2xs'
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    0{item.id}
                  </button>
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => stepCard('prev')}
                  disabled={activeIndex === 0}
                  className={`p-1 border border-zinc-200/90 rounded-lg transition-all cursor-pointer ${
                    activeIndex > 0
                      ? 'bg-white text-zinc-800 hover:bg-zinc-100 shadow-2xs'
                      : 'bg-zinc-100 text-zinc-400 opacity-40 cursor-not-allowed'
                  }`}
                  aria-label="Previous novelty"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => stepCard('next')}
                  disabled={activeIndex === novelties.length - 1}
                  className={`p-1 border border-zinc-200/90 rounded-lg transition-all cursor-pointer ${
                    activeIndex < novelties.length - 1
                      ? 'bg-white text-zinc-800 hover:bg-zinc-100 shadow-2xs'
                      : 'bg-zinc-100 text-zinc-400 opacity-40 cursor-not-allowed'
                  }`}
                  aria-label="Next novelty"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Counter Display */}
              <div className="text-[11px] text-zinc-600 px-2.5 py-0.5 bg-white border border-zinc-200/90 rounded-lg shadow-2xs">
                ITEM <span className="text-zinc-900 font-bold">0{activeIndex + 1}</span> / 0{novelties.length}
              </div>
            </div>
          </div>

          {/* Smooth Horizontal Progress Bar Line */}
          <div className="w-full bg-zinc-200/80 h-1 rounded-full relative overflow-hidden">
            <div 
              ref={progressBarRef} 
              className="h-full bg-zinc-800 rounded-full transition-all duration-75"
              style={{ width: '0%' }}
            />
          </div>
        </div>

        {/* Center Moving Horizontal Track (Sized to fit 100% in viewport) */}
        <div className="relative z-10 my-auto py-2 overflow-visible shrink-0">
          <div 
            ref={trackRef} 
            className="flex items-stretch gap-6 will-change-transform"
            style={{ width: 'fit-content' }}
          >
            {/* -------------------------------------------------------- */}
            {/* STAGE 00: PARADIGM SHIFT OVERVIEW CARD                    */}
            {/* -------------------------------------------------------- */}
            <div className="w-[380px] lg:w-[400px] shrink-0 bg-white rounded-2xl border border-zinc-200/80 p-5 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-zinc-300 transition-all duration-300">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/80 text-zinc-800 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-zinc-900" />
                    </div>
                    <div>
                      <span className="text-[9.5px] font-mono tracking-widest text-zinc-500 uppercase font-semibold block">
                        PARADIGM SHIFT
                      </span>
                      <span className="text-[11px] font-mono font-bold text-zinc-900 block">
                        STAGE 00 // OVERVIEW
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-zinc-700 font-mono font-medium text-[9px]">
                    5 PILLARS
                  </span>
                </div>

                <h3 className="text-lg font-serif font-bold text-zinc-950 tracking-tight leading-snug mb-2">
                  Differentiable Physics vs Heuristic Rules
                </h3>

                <p className="text-[11.5px] text-zinc-600 leading-relaxed font-sans mb-3">
                  Standard neural architectures treat cyclonic vortexes as generic rigid bounding boxes, leading to ±35 km quantization errors, unphysical wind-pressure decoupling, and nighttime sensor blindness.
                </p>

                <div className="space-y-1.5 border-t border-zinc-100 pt-3 text-xs font-mono text-zinc-700">
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-50 border border-zinc-100">
                    <span className="px-1.5 py-0.2 bg-zinc-200 text-zinc-800 font-bold text-[8.5px] rounded">01</span>
                    <span className="text-[10.5px] font-medium text-zinc-800">Continuous Sub-Pixel CenterNet</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-50 border border-zinc-100">
                    <span className="px-1.5 py-0.2 bg-zinc-200 text-zinc-800 font-bold text-[8.5px] rounded">02</span>
                    <span className="text-[10.5px] font-medium text-zinc-800">Atkinson-Holliday Balance Loss</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-50 border border-zinc-100">
                    <span className="px-1.5 py-0.2 bg-zinc-200 text-zinc-800 font-bold text-[8.5px] rounded">03</span>
                    <span className="text-[10.5px] font-medium text-zinc-800">24/7 Planck Inversion Radiometry</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-50 border border-zinc-100">
                    <span className="px-1.5 py-0.2 bg-zinc-200 text-zinc-800 font-bold text-[8.5px] rounded">04</span>
                    <span className="text-[10.5px] font-medium text-zinc-800">Stage-0 Vortex Gatekeeper</span>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-zinc-50 border border-zinc-100">
                    <span className="px-1.5 py-0.2 bg-zinc-200 text-zinc-800 font-bold text-[8.5px] rounded">05</span>
                    <span className="text-[10.5px] font-medium text-zinc-800">Sub-35ms FP16 Edge Latency</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 mt-3 flex items-center justify-between text-[10.5px] font-mono text-zinc-500">
                <span className="flex items-center gap-1.5 text-zinc-900 font-medium">
                  <span>SCROLL DOWN TO ADVANCE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="px-2 py-0.5 bg-zinc-100 rounded text-zinc-600 text-[9.5px]">
                  5 NOVELTIES
                </span>
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* THE 5 RESEARCH NOVELTY CARDS                              */}
            {/* -------------------------------------------------------- */}
            {novelties.map((item) => {
              const ItemIcon = item.icon;
              return (
                <div 
                  key={item.id}
                  className="w-[440px] lg:w-[470px] shrink-0 bg-white rounded-2xl border border-zinc-200/80 p-5 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-zinc-300 transition-all duration-300 relative group"
                >
                  <div>
                    {/* Top Row: Category + Gain Badge */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/80 text-zinc-800 flex items-center justify-center">
                          <ItemIcon className="w-4 h-4 text-zinc-900" />
                        </div>
                        <div>
                          <span className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block">
                            {item.category}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-zinc-900 block">
                            {item.tag}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-zinc-800 font-semibold text-[9.5px] font-mono tracking-wide shadow-2xs">
                        {item.gainBadge}
                      </span>
                    </div>

                    {/* Card Title */}
                    <h3 className="text-base font-serif font-bold text-zinc-950 tracking-tight leading-snug mb-2.5">
                      {item.title}
                    </h3>

                    {/* Unified Primary Benchmark & Formulation (Clean, Light Theme) */}
                    <div className="p-2.5 bg-zinc-50/90 border border-zinc-200/80 rounded-xl mb-2.5 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="text-[8.5px] font-mono text-zinc-500 uppercase block font-semibold">PRIMARY BENCHMARK</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-zinc-950 tracking-tight font-mono">{item.highlightMetric}</span>
                          <span className="text-[10.5px] font-mono font-medium text-zinc-700">{item.highlightLabel}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8.5px] font-mono text-zinc-500 uppercase block font-semibold mb-0.5">FORMULATION</span>
                        <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md bg-white text-zinc-900 border border-zinc-200 shadow-2xs inline-block">
                          {item.formula}
                        </span>
                      </div>
                    </div>

                    {/* Professional Architectural Comparison */}
                    <div className="space-y-1.5 text-xs font-sans mb-2.5">
                      {/* Conventional Baseline */}
                      <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/70 flex items-start gap-2">
                        <XCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-[9px] text-zinc-500 font-bold uppercase block">CONVENTIONAL APPROACH:</span>
                          <p className="text-zinc-600 text-[11px] leading-relaxed mt-0.5">{item.baselineText}</p>
                        </div>
                      </div>

                      {/* DeepCyclone Methodology */}
                      <div className="p-2 rounded-lg bg-zinc-100/70 border border-zinc-200/90 flex items-start gap-2 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-[9px] text-zinc-900 font-bold uppercase block">DEEPCYCLONE METHODOLOGY:</span>
                          <p className="text-zinc-900 text-[11px] font-medium leading-relaxed mt-0.5">{item.innovationText}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational & Theoretical Rationale */}
                  <div className="pt-2 border-t border-zinc-100 bg-zinc-50/80 rounded-xl p-2.5 border border-zinc-200/70">
                    <div className="flex items-center gap-1.5 text-[8.5px] text-zinc-600 font-bold uppercase mb-0.5 font-mono">
                      <Compass className="w-3.5 h-3.5 text-zinc-700" />
                      <span>THEORETICAL & OPERATIONAL RATIONALE:</span>
                    </div>
                    <p className="text-[10.5px] text-zinc-700 font-sans leading-relaxed">
                      {item.rationale}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* -------------------------------------------------------- */}
            {/* STAGE 06: EMPIRICAL BENCHMARK SYNTHESIS CARD             */}
            {/* -------------------------------------------------------- */}
            <div className="w-[380px] lg:w-[400px] shrink-0 bg-white rounded-2xl border border-zinc-200/80 p-5 flex flex-col justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-zinc-300 transition-all duration-300">
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/80 text-zinc-800 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-zinc-900" />
                    </div>
                    <div>
                      <span className="text-[9.5px] font-mono tracking-widest text-zinc-500 uppercase font-semibold block">
                        BENCHMARK SYNTHESIS
                      </span>
                      <span className="text-[11px] font-mono font-bold text-zinc-900 block">
                        STAGE 06 // VALIDATION
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-zinc-800 font-mono font-medium text-[9px]">
                    VALIDATED
                  </span>
                </div>

                <h3 className="text-lg font-serif font-bold text-zinc-950 tracking-tight leading-snug mb-2">
                  Empirically Verified Benchmarks
                </h3>

                <p className="text-[11.5px] text-zinc-600 leading-relaxed font-sans mb-3">
                  All 5 novelties benchmarked against official NOAA IBTrACS & IMD ground truth across 2019–2024 North Indian Ocean severe storms (Fani, Amphan, Biparjoy, Mocha).
                </p>

                <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 text-center font-mono">
                  <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 shadow-2xs">
                    <span className="text-[8.5px] text-zinc-500 uppercase block font-semibold">CENTER ERROR</span>
                    <span className="text-base font-bold text-zinc-950">8.7 km</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 shadow-2xs">
                    <span className="text-[8.5px] text-zinc-500 uppercase block font-semibold">INTENSITY MAE</span>
                    <span className="text-base font-bold text-zinc-950">±5.2 kt</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 shadow-2xs">
                    <span className="text-[8.5px] text-zinc-500 uppercase block font-semibold">FALSE ALARMS</span>
                    <span className="text-base font-bold text-zinc-950">0.0%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 shadow-2xs">
                    <span className="text-[8.5px] text-zinc-500 uppercase block font-semibold">GPU LATENCY</span>
                    <span className="text-base font-bold text-zinc-950">28.4 ms</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 mt-3">
                <button
                  onClick={goToModels}
                  className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-mono font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  <span>Explore Modular Deep Learning Stack</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Horizontal Timeline Status Bar */}
        <div className="relative z-10 border-t border-zinc-200/80 pt-2.5 flex items-center justify-between text-[10.5px] font-mono text-zinc-500 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-2 h-2 rounded-full bg-zinc-800" />
            <span className="font-medium text-zinc-600">HORIZONTAL TIMELINE · SCROLL VERTICALLY TO ADVANCE</span>
          </div>
          <div className="flex items-center gap-3">
            <span>PROGRESS: <span className="text-zinc-900 font-bold">{progressPercent}%</span></span>
            <span className="text-zinc-300">|</span>
            <span className="text-zinc-500">USE MOUSE WHEEL OR STEP BUTTONS</span>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* MOBILE VIEW: CLEAN WHITE TOUCH CAROUSEL (< 768px)               */}
      {/* ============================================================== */}
      <div className="md:hidden py-10 px-4 space-y-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-zinc-100 border border-zinc-200/80 text-zinc-700 rounded-full text-[9.5px] font-mono tracking-wider uppercase mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
            <span>RESEARCH INNOVATIONS</span>
          </div>
          <h2 className="text-xl font-bold font-serif text-zinc-950 tracking-tight">
            Research Novelties & Methodological Breakthroughs
          </h2>
          <p className="mt-1 text-xs text-zinc-600 leading-relaxed font-sans">
            Swipe horizontally to review the 5 core scientific contributions and validation metrics.
          </p>
        </div>

        {/* Mobile Swipe Container */}
        <div className="flex items-stretch gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none]">
          {novelties.map((item) => {
            const ItemIcon = item.icon;
            return (
              <div 
                key={item.id}
                className="w-[85vw] max-w-[340px] shrink-0 snap-center bg-white rounded-2xl border border-zinc-200/80 p-4 font-mono flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center">
                        <ItemIcon className="w-4 h-4 text-zinc-900" />
                      </div>
                      <span className="text-[10.5px] font-bold text-zinc-900">{item.tag}</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 font-medium">
                      {item.gainBadge}
                    </span>
                  </div>

                  <h3 className="text-sm font-serif font-bold text-zinc-950 mb-2 leading-snug">
                    {item.title}
                  </h3>

                  <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200/80 mb-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-zinc-500 uppercase block font-semibold">BENCHMARK</span>
                      <span className="text-lg font-black text-zinc-950">{item.highlightMetric}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-zinc-500 uppercase block">CRITERIA</span>
                      <span className="text-xs font-medium text-zinc-800">{item.highlightLabel}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-zinc-100/70 border border-zinc-200/80 text-[11px] font-sans text-zinc-900 leading-relaxed mb-2.5">
                    <span className="font-mono text-[9px] text-zinc-900 font-bold uppercase block mb-0.5">METHODOLOGY:</span>
                    {item.innovationText}
                  </div>

                  <div className="p-1.5 rounded-lg bg-white border border-zinc-200 text-[10px] font-mono text-zinc-900 truncate mb-2.5">
                    {item.formula}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 text-[10.5px] font-sans text-zinc-700 bg-zinc-50 rounded-xl p-2 border border-zinc-200/70">
                  <span className="font-mono text-[8px] text-zinc-500 uppercase block mb-0.5 font-bold">RATIONALE:</span>
                  {item.rationale}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
