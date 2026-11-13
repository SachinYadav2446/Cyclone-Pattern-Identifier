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
    tag: 'Innovation 01 · Geometry',
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
    tag: 'Innovation 02 · Thermodynamics',
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
    tag: 'Innovation 03 · Radiometry',
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
    tag: 'Innovation 04 · Operational Triage',
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
    tag: 'Innovation 05 · Edge Latency',
    category: 'Computational Latency',
    title: 'Sub-35ms Real-Time Inference vs 6h NWP Clusters',
    icon: Zap,
    highlightMetric: '28.4 ms',
    highlightLabel: 'End-to-End Latency',
    gainBadge: '90x FASTER THAN DVORAK',
    baselineText: 'Numerical fluid dynamical simulations take 4 to 6 hours on supercomputers, while human Dvorak analysis requires 30 to 45 minutes.',
    innovationText: 'Dual-stage deep neural architecture executes end-to-end on consumer GPU hardware in under 35 milliseconds with FP16 precision.',
    formula: 'T_e2e = T_CenterNet (11.8ms) + T_ConvNeXt (16.4ms)',
    rationale: 'Traditional forecasting cycles take hours. vortexAI produces sub-pixel eye coordinates and calibrated intensity ratings instantaneously upon raw satellite downlink.',
  }
];

const allCards = [
  {
    stageId: '00',
    type: 'overview',
    category: 'Paradigm Shift',
    tag: 'Stage 00 · Overview',
    gainBadge: '5 PILLARS',
    title: 'Differentiable Physics vs Heuristic Rules',
    icon: Layers,
    summary: 'Standard neural architectures treat cyclonic vortexes as generic rigid bounding boxes, leading to ±35 km quantization errors, unphysical wind-pressure decoupling, and nighttime sensor blindness.',
    pillars: [
      { id: '01', title: 'Continuous Sub-Pixel CenterNet Regression' },
      { id: '02', title: 'Atkinson-Holliday Physical Balance Loss' },
      { id: '03', title: '24/7 Multi-Spectral Planck Inversion Radiometry' },
      { id: '04', title: 'Stage-0 Zero False-Alarm Vortex Gatekeeper' },
      { id: '05', title: 'Sub-35ms Dual-Stage GPU Edge Latency' },
    ]
  },
  ...novelties.map((item) => ({
    stageId: `0${item.id}`,
    type: 'novelty',
    ...item
  })),
  {
    stageId: '06',
    type: 'synthesis',
    category: 'Benchmark Synthesis',
    tag: 'Stage 06 · Empirical Validation',
    gainBadge: 'VALIDATED',
    title: 'Empirically Verified Benchmarks',
    icon: Cpu,
    summary: 'All 5 novelties benchmarked against official NOAA IBTrACS & IMD ground truth across 2019–2024 North Indian Ocean severe storms (Fani, Amphan, Biparjoy, Mocha).',
    metrics: [
      { label: 'CENTER ERROR', value: '8.7 km' },
      { label: 'INTENSITY MAE', value: '±5.2 kt' },
      { label: 'FALSE ALARMS', value: '0.0%' },
      { label: 'GPU LATENCY', value: '28.4 ms' }
    ]
  }
];

export default function ResearchNoveltySection() {
  const storyRef = useRef(null);
  const cardRefs = useRef([]);
  const parallaxRef = useRef(null);
  const progressBarRef = useRef(null);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [mobileActiveIdx, setMobileActiveIdx] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  // Pinned Scrollytelling Engine: Screen stays pinned until all cards are scrolled horizontally
  useEffect(() => {
    let frame = 0;
    let current = -1;
    let lastActiveIdx = -1;
    let lastPercent = -1;
    const SCROLL_EASE = 0.09;

    const tick = () => {
      const section = storyRef.current;

      if (section && window.innerWidth >= 768) {
        const rect = section.getBoundingClientRect();
        const totalDistance = section.offsetHeight - window.innerHeight;

        if (totalDistance > 0) {
          const target = Math.min(1, Math.max(0, -rect.top / totalDistance));
          const next = current < 0 || Math.abs(target - current) < 0.0001
            ? target
            : current + (target - current) * SCROLL_EASE;

          if (next !== current || current < 0) {
            current = next;
            const progressFloat = current * (allCards.length - 1);
            const stageWidth = window.innerWidth;
            const R = Math.max(680, Math.min(920, stageWidth * 0.58));
            const ANGLE_STEP = 34; // degrees per card along the horizontal circular carousel

            // True 3D Horizontal Circular Carousel: strictly Right to Left (X and Z only, zero translateY)
            allCards.forEach((_, i) => {
              const cardEl = cardRefs.current[i];
              if (!cardEl) return;

              const delta = i - progressFloat;
              const absDelta = Math.abs(delta);
              const angleDeg = delta * ANGLE_STEP;
              const angleRad = (angleDeg * Math.PI) / 180;

              if (Math.abs(angleDeg) <= 85) {
                // Card is visible on the front arc of the horizontal 3D circle
                const X = R * Math.sin(angleRad);
                const Z = R * (Math.cos(angleRad) - 1);
                const rotateY = -angleDeg;
                const scale = Math.max(0.68, 1 - absDelta * 0.13);

                let opacity = 1;
                if (absDelta <= 1.0) {
                  opacity = 1 - absDelta * 0.28;
                } else {
                  opacity = Math.max(0, 0.72 - (absDelta - 1.0) * 0.52);
                }

                const brightness = Math.max(0.35, 1 - absDelta * 0.32);
                const blur = Math.min(3, Math.max(0, absDelta - 0.2) * 1.5);
                const zIndex = Math.round(50 - absDelta * 12);
                const pointerEvents = absDelta <= 1.35 ? 'auto' : 'none';
                const cursor = absDelta < 0.25 ? 'default' : (absDelta <= 1.35 ? 'pointer' : 'default');

                cardEl.style.transform = `translate3d(${X}px, 0px, ${Z}px) rotateY(${rotateY}deg) scale(${scale})`;
                cardEl.style.opacity = opacity;
                cardEl.style.filter = `brightness(${brightness}) blur(${blur}px)`;
                cardEl.style.zIndex = zIndex;
                cardEl.style.pointerEvents = pointerEvents;
                cardEl.style.cursor = cursor;
              } else {
                // Behind the circle / out of view
                const sign = Math.sign(delta) || 1;
                const X = sign * R * 1.05;
                const Z = -R * 1.2;
                cardEl.style.transform = `translate3d(${X}px, 0px, ${Z}px) rotateY(${-sign * 85}deg) scale(0.6)`;
                cardEl.style.opacity = 0;
                cardEl.style.zIndex = 0;
                cardEl.style.pointerEvents = 'none';
              }
            });

            if (parallaxRef.current) {
              parallaxRef.current.style.transform = `translate3d(-${current * 80}px, 0, 0)`;
            }

            if (progressBarRef.current) {
              progressBarRef.current.style.width = `${current * 100}%`;
            }

            const rawIdx = Math.round(progressFloat);
            const clampedIdx = Math.min(allCards.length - 1, Math.max(0, rawIdx));
            if (clampedIdx !== lastActiveIdx) {
              lastActiveIdx = clampedIdx;
              setActiveIndex(clampedIdx);
            }

            const newPercent = Math.round(current * 100);
            if (newPercent !== lastPercent) {
              lastPercent = newPercent;
              setProgressPercent(newPercent);
            }
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const jumpToCard = (index) => {
    const section = storyRef.current;
    if (!section) return;
    const totalDistance = section.offsetHeight - window.innerHeight;
    const fraction = index / (allCards.length - 1);
    const targetY = section.offsetTop + fraction * totalDistance;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const stepCard = (direction) => {
    const nextIdx = direction === 'next'
      ? Math.min(allCards.length - 1, activeIndex + 1)
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
      className="relative h-auto md:h-[380vh] bg-[#08050c] text-white border-b border-[#64104E]/40"
    >
      {/* ============================================================== */}
      {/* DESKTOP PINNED VIEWPORT: Locks screen until all cards scroll   */}
      {/* ============================================================== */}
      <div className="sticky top-0 hidden h-screen overflow-hidden md:flex md:flex-col md:justify-between py-5 px-6 lg:px-12 relative z-10 select-none">
        
        {/* Parallax Background Grid */}
        <div 
          ref={parallaxRef} 
          className="absolute inset-0 pointer-events-none will-change-transform z-0"
          style={{ width: '130vw' }}
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-40" />
          <div className="absolute left-[20vw] top-[30vh] h-[520px] w-[520px] rounded-full border border-[#64104E]/25 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute left-[70vw] top-[50vh] h-[650px] w-[650px] rounded-full border border-[#B43067]/20 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute left-[110vw] top-[35vh] h-[550px] w-[550px] rounded-full border border-[#E04A31]/15 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Top Header & Interactive Progress Bar */}
        <div className="relative z-20 border-b border-[#64104E]/40 pb-3 pt-1 shrink-0">
          <div className="flex items-center justify-between gap-6 mb-2.5">
            {/* Title & Active Stage Tag */}
            <div>
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                <span>Research Novelties &amp; Methodological Breakthroughs</span>
              </h2>
              <div className="flex items-center gap-2 mt-0.5 text-xs font-mono">
                <span className="text-[#C3864D] font-bold">
                  STAGE {allCards[activeIndex]?.stageId || '00'} / 06
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-300 font-medium">
                  {allCards[activeIndex]?.category || 'Paradigm Shift'}
                </span>
              </div>
            </div>

            {/* Step Indicators & Directional Controls */}
            <div className="flex items-center gap-3 font-mono text-xs">
              {/* Step Navigation Pills (00 to 06) */}
              <div className="flex items-center gap-1 bg-[#120a1c] border border-[#64104E]/50 rounded-lg p-1 shadow-md">
                {allCards.map((card, idx) => (
                  <button
                    key={card.stageId}
                    onClick={() => jumpToCard(idx)}
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
                      activeIndex === idx
                        ? 'bg-gradient-to-r from-[#E04A31] to-[#CF2F4B] text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-[#1a0f28]'
                    }`}
                  >
                    {card.stageId}
                  </button>
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => stepCard('prev')}
                  disabled={activeIndex === 0}
                  className={`p-1.5 border border-[#64104E]/50 rounded-lg transition-all cursor-pointer ${
                    activeIndex > 0
                      ? 'bg-[#120a1c] text-slate-300 hover:bg-[#1e0e2c] hover:border-[#B43067]/60 shadow-sm'
                      : 'bg-[#0a050f] text-slate-600 opacity-40 cursor-not-allowed border-[#64104E]/20'
                  }`}
                  aria-label="Previous novelty"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => stepCard('next')}
                  disabled={activeIndex === allCards.length - 1}
                  className={`p-1.5 border border-[#64104E]/50 rounded-lg transition-all cursor-pointer ${
                    activeIndex < allCards.length - 1
                      ? 'bg-[#120a1c] text-slate-300 hover:bg-[#1e0e2c] hover:border-[#B43067]/60 shadow-sm'
                      : 'bg-[#0a050f] text-slate-600 opacity-40 cursor-not-allowed border-[#64104E]/20'
                  }`}
                  aria-label="Next novelty"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Counter Display */}
              <div className="text-[11px] text-slate-300 px-3 py-1 bg-[#120a1c] border border-[#64104E]/50 rounded-lg shadow-sm font-bold">
                STAGE <span className="text-[#E04A31]">{allCards[activeIndex]?.stageId || '00'}</span> / 06
              </div>
            </div>
          </div>

          {/* Smooth Horizontal Progress Bar Line in Coral-Plum Gradient */}
          <div className="w-full bg-[#180e24] h-1.5 rounded-full relative overflow-hidden border border-[#64104E]/40">
            <div 
              ref={progressBarRef}
              className="h-full bg-gradient-to-r from-[#B43067] via-[#CF2F4B] to-[#E04A31] rounded-full transition-all duration-75 shadow-[0_0_8px_#E04A31]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* CENTER 3D HORIZONTAL CIRCULAR STAGE (Left, Center, Right)     */}
        {/* ------------------------------------------------------------ */}
        <div className="relative z-10 my-auto w-full max-w-7xl mx-auto flex items-center justify-center h-[520px]">
          {/* Left Flanking Arrow */}
          <button
            onClick={() => stepCard('prev')}
            disabled={activeIndex === 0}
            aria-label="Previous novelty"
            className={`hidden md:flex absolute left-2 lg:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full items-center justify-center border transition-all z-50 cursor-pointer ${
              activeIndex > 0
                ? 'bg-[#140a1d]/90 border-[#64104E]/70 text-slate-200 hover:text-white hover:border-[#B43067] hover:bg-[#1f0e2b] shadow-2xl hover:scale-105 backdrop-blur-md'
                : 'bg-[#0a0510]/50 border-[#64104E]/20 text-slate-600 opacity-25 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* 3D Circular Perspective Stage */}
          <div 
            className="relative w-full h-[480px] flex items-center justify-center"
            style={{ perspective: '1400px', transformStyle: 'preserve-3d' }}
          >
            {allCards.map((card, i) => {
              const ItemIcon = card.icon;

              return (
                <div
                  key={card.stageId}
                  ref={el => cardRefs.current[i] = el}
                  onClick={() => {
                    if (i !== activeIndex) jumpToCard(i);
                  }}
                  className="absolute w-[88vw] max-w-[560px] lg:max-w-[580px] h-[470px] bg-gradient-to-b from-[#140a1d]/98 via-[#0e0616]/98 to-[#09040e]/98 backdrop-blur-2xl rounded-2xl border border-[#64104E]/50 p-6 sm:p-7 flex flex-col justify-between shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),_0_0_35px_-5px_rgba(100,16,78,0.25)] hover:border-[#B43067]/80 overflow-hidden will-change-transform select-none"
                  style={{
                    transformOrigin: '50% 50%',
                    backfaceVisibility: 'hidden',
                    transform: i === 0 
                      ? 'translate3d(0,0,0) rotateY(0deg) scale(1)' 
                      : (i === 1 ? 'translate3d(460px,0,-140px) rotateY(-34deg) scale(0.88)' : 'translate3d(900px,0,-450px) scale(0.6)'),
                    opacity: i === 0 ? 1 : (i === 1 ? 0.72 : 0),
                    zIndex: i === 0 ? 50 : (i === 1 ? 38 : 0),
                  }}
                >
                  {/* Specular Rim Light & Ambient Accent Glow */}
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B43067]/80 to-transparent pointer-events-none" />
                  <div className="absolute -top-16 right-0 w-48 h-48 bg-[#B43067]/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-16 left-0 w-48 h-48 bg-[#E04A31]/10 rounded-full blur-3xl pointer-events-none" />

                  <div>
                    {/* Top Row: Category + Gain Badge */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#64104E]/30 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#240e2b] to-[#14071b] border border-[#B43067]/50 text-[#E04A31] flex items-center justify-center shadow-md">
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C3864D] font-bold block">
                            {card.category}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-200 block">
                            {card.tag}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#CF2F4B]/15 border border-[#CF2F4B]/50 text-[#fbcfe8] font-bold text-[9.5px] font-mono tracking-wider shadow-sm">
                        {card.gainBadge}
                      </span>
                    </div>

                    {/* Card Title */}
                    <h3 className="text-lg font-mono font-bold text-white tracking-tight leading-snug mb-3">
                      {card.title}
                    </h3>

                    {/* STAGE 00: PARADIGM SHIFT OVERVIEW */}
                    {card.type === 'overview' && (
                      <div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                          {card.summary}
                        </p>
                        <div className="space-y-1.5 border-t border-[#64104E]/30 pt-3 font-mono">
                          {card.pillars.map((p) => (
                            <div key={p.id} className="flex items-center gap-3 py-0.5 group/item">
                              <span className="w-5 h-5 rounded-md bg-[#240e2b] border border-[#B43067]/40 text-[#fbcfe8] font-bold text-[9px] flex items-center justify-center shrink-0">
                                {p.id}
                              </span>
                              <span className="text-xs font-medium text-slate-300 group-hover/item:text-white transition-colors">
                                {p.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* NOVELTIES 01 TO 05 */}
                    {card.type === 'novelty' && (
                      <div>
                        {/* De-boxed Primary Benchmark & Formulation */}
                        <div className="flex items-end justify-between py-1 mb-3.5">
                          <div>
                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                              PRIMARY BENCHMARK
                            </span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black font-mono text-white tracking-tight">
                                {card.highlightMetric}
                              </span>
                              <span className="text-xs font-mono font-bold text-[#C3864D]">
                                {card.highlightLabel}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                              FORMULATION
                            </span>
                            <code className="inline-block px-2.5 py-1 rounded-md bg-[#180a22]/80 border border-[#64104E]/60 text-slate-200 font-mono text-[10.5px] shadow-inner">
                              {card.formula}
                            </code>
                          </div>
                        </div>

                        {/* De-boxed Architectural Comparison */}
                        <div className="space-y-2 mb-3">
                          {/* Conventional Baseline */}
                          <div className="flex items-start gap-2.5 px-0.5 text-slate-400">
                            <XCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <div className="text-[11.5px] leading-relaxed">
                              <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-slate-500 mr-1.5">
                                Conventional:
                              </span>
                              <span>{card.baselineText}</span>
                            </div>
                          </div>

                          {/* vortexAI Methodology */}
                          <div className="relative pl-3.5 pr-2.5 py-2 rounded-r-xl border-l-2 border-[#E04A31] bg-gradient-to-r from-[#220c2a]/80 to-transparent flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-[#E04A31] shrink-0 mt-0.5" />
                            <div className="text-[11.5px] leading-relaxed">
                              <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-[#fbcfe8] mr-1.5">
                                vortexAI:
                              </span>
                              <span className="text-white font-medium">{card.innovationText}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STAGE 06: BENCHMARK SYNTHESIS */}
                    {card.type === 'synthesis' && (
                      <div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                          {card.summary}
                        </p>
                        <div className="grid grid-cols-2 gap-2.5 border-t border-[#64104E]/30 pt-3 text-center font-mono">
                          {card.metrics.map((m, idx) => (
                            <div key={idx} className="py-2.5 px-2 rounded-xl bg-[#160a20]/60 border border-[#64104E]/30">
                              <span className="text-[9px] text-[#C3864D] uppercase tracking-wider block font-semibold mb-0.5">
                                {m.label}
                              </span>
                              <span className="text-lg font-black text-white">{m.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footers */}
                  {card.type === 'overview' && (
                    <div className="pt-3 border-t border-[#64104E]/30 mt-auto flex items-center justify-between text-[10.5px] font-mono text-slate-400">
                      <span className="flex items-center gap-1.5 text-[#E04A31] font-bold">
                        <span>SCROLL DOWN TO ADVANCE DECK</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="px-2 py-0.5 bg-[#1e0e29] text-[#fbcfe8] border border-[#B43067]/40 rounded text-[9.5px] font-bold">
                        5 NOVELTIES
                      </span>
                    </div>
                  )}

                  {card.type === 'novelty' && (
                    <div className="pt-3 border-t border-[#64104E]/30 mt-auto">
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#C3864D] uppercase font-bold tracking-wider mb-1">
                        <Compass className="w-3.5 h-3.5 text-[#E04A31]" />
                        <span>Physical Rationale</span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                        {card.rationale}
                      </p>
                    </div>
                  )}

                  {card.type === 'synthesis' && (
                    <div className="pt-3 border-t border-[#64104E]/30 mt-auto">
                      <button
                        onClick={(e) => { e.stopPropagation(); goToModels(); }}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-[#E04A31] via-[#CF2F4B] to-[#B43067] hover:brightness-110 text-white font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#E04A31]/25 active:scale-[0.98]"
                      >
                        <span>Explore Modular Deep Learning Stack</span>
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Flanking Arrow */}
          <button
            onClick={() => stepCard('next')}
            disabled={activeIndex === allCards.length - 1}
            aria-label="Next novelty"
            className={`hidden md:flex absolute right-2 lg:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full items-center justify-center border transition-all z-50 cursor-pointer ${
              activeIndex < allCards.length - 1
                ? 'bg-[#140a1d]/90 border-[#64104E]/70 text-slate-200 hover:text-white hover:border-[#B43067] hover:bg-[#1f0e2b] shadow-2xl hover:scale-105 backdrop-blur-md'
                : 'bg-[#0a0510]/50 border-[#64104E]/20 text-slate-600 opacity-25 cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom 3D Horizon Status Bar */}
        <div className="relative z-20 border-t border-[#64104E]/40 pt-2.5 flex items-center justify-between text-[10.5px] font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E04A31] shadow-[0_0_8px_#E04A31]" />
            <span className="font-semibold text-slate-300">HORIZONTAL 3D CAROUSEL · SCREEN PINNED UNTIL ALL CARDS ARE SCROLLED</span>
          </div>
          <div className="flex items-center gap-3">
            <span>PROGRESS: <span className="text-[#E04A31] font-bold">{progressPercent}%</span></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">CLICK LEFT / RIGHT OR ARROW KEYS</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MOBILE ADAPTIVE VIEW (MD:HIDDEN): High-Tech Cyber Deck         */}
      {/* ============================================================== */}
      <div className="md:hidden py-8 px-4 sm:px-6 relative z-10 font-mono">
        {/* Mobile Section Header */}
        <div className="pb-4 mb-4 border-b border-[#64104E]/40">
          <div className="flex items-center gap-2 mb-1.5 text-xs">
            <span className="text-[#fed7aa] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E04A31] animate-ping" />
              STAGE {allCards[mobileActiveIdx]?.stageId || '00'} / 06
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300 font-medium truncate max-w-[200px]">
              {allCards[mobileActiveIdx]?.category || 'Paradigm Shift'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
            Research Novelties &amp; Breakthroughs
          </h2>
        </div>

        {/* Cyber Stage Selector Pill Scroller */}
        <div className="relative mb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 px-0.5 scrollbar-none">
            {allCards.map((card, idx) => {
              const isActive = mobileActiveIdx === idx;
              const shortLabels = {
                '00': '00 Shift',
                '01': '01 Sub-Pixel',
                '02': '02 Physics',
                '03': '03 24/7 IR',
                '04': '04 Gatekeeper',
                '05': '05 <35ms',
                '06': '06 Synthesis',
              };
              return (
                <button
                  key={card.stageId}
                  onClick={() => setMobileActiveIdx(idx)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E04A31] to-[#CF2F4B] text-white border-[#E04A31] shadow-lg shadow-[#E04A31]/25 scale-[1.02]'
                      : 'bg-[#12091c]/80 text-slate-400 hover:text-white border-[#64104E]/40 hover:border-[#B43067]/60'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#fed7aa] animate-pulse" />}
                  <span>{shortLabels[card.stageId] || card.stageId}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Active Card Presentation */}
        {(() => {
          const card = allCards[mobileActiveIdx];
          const CardIcon = card.icon;

          return (
            <div className="rounded-2xl border border-[#64104E]/80 bg-gradient-to-b from-[#160a24] via-[#10061a] to-[#08030e] p-4 sm:p-5 shadow-2xl relative overflow-hidden space-y-4">
              {/* Ambient Glow Aura */}
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#E04A31]/15 rounded-full blur-2xl pointer-events-none" />

              {/* Card Header Strip */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#64104E]/40 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#240e2d] border border-[#B43067]/50 flex items-center justify-center text-[#fed7aa] shadow-inner shrink-0">
                    <CardIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-[#fed7aa] uppercase font-bold tracking-wider block truncate">
                      {card.tag}
                    </span>
                    <span className="text-xs font-bold text-slate-200 font-mono truncate block">
                      {card.category}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#64104E]/60 text-[#fed7aa] border border-[#B43067]/60 shrink-0 shadow-sm">
                  {card.gainBadge}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-white font-mono leading-snug relative z-10">
                {card.title}
              </h3>

              {/* Stage 00 Overview */}
              {card.type === 'overview' && (
                <div className="space-y-3 relative z-10">
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {card.summary}
                  </p>
                  <div className="space-y-2 border-t border-[#64104E]/40 pt-3">
                    <span className="text-[10px] text-[#fed7aa] uppercase font-bold tracking-wider block font-mono">
                      Core Methodological Innovations
                    </span>
                    {card.pillars.map((p) => (
                      <div key={p.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-[#14081c]/80 border border-[#64104E]/40">
                        <span className="w-6 h-6 rounded-lg bg-[#270e30] border border-[#B43067]/50 text-[#fed7aa] font-bold text-[10px] flex items-center justify-center shrink-0">
                          {p.id}
                        </span>
                        <span className="text-xs font-medium text-slate-200 font-mono">
                          {p.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Novelty Stages 01 to 05 */}
              {card.type === 'novelty' && (
                <div className="space-y-3.5 relative z-10">
                  {/* Glowing Benchmark Spotlight HUD */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1d0b28] to-[#0d0515] border border-[#B43067]/50 p-3.5 shadow-lg">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-[#E04A31]/15 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono font-bold block">
                          PRIMARY BENCHMARK
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-100 to-[#fed7aa] font-mono">
                            {card.highlightMetric}
                          </span>
                          <span className="text-xs text-[#fed7aa] font-mono font-bold">
                            {card.highlightLabel}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#E04A31]/20 text-[#fed7aa] border border-[#E04A31]/40 shadow-sm shrink-0">
                        VALIDATED
                      </span>
                    </div>
                  </div>

                  {/* Terminal Formulation Box */}
                  <div className="rounded-xl bg-[#0a0410] border border-[#64104E]/60 p-3 font-mono">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5 pb-1 border-b border-[#64104E]/30">
                      <span className="text-[#fed7aa] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E04A31] animate-pulse" />
                        MATHEMATICAL FORMULATION
                      </span>
                      <span className="text-zinc-500 text-[9px] font-mono">L_Coupled</span>
                    </div>
                    <div className="text-[11px] sm:text-xs text-rose-200/90 bg-[#14081c] p-2 rounded-lg border border-[#B43067]/30 overflow-x-auto scrollbar-none font-mono">
                      {card.formula}
                    </div>
                  </div>

                  {/* High-Contrast Architecture Face-off */}
                  <div className="space-y-2 text-xs font-mono">
                    {/* Conventional */}
                    <div className="p-2.5 rounded-xl bg-[#0e0716]/90 border border-zinc-800/80 flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-rose-400/80 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-relaxed">
                        <span className="font-bold text-rose-400/90 mr-1.5 uppercase text-[9px] tracking-wider block sm:inline">
                          Conventional:
                        </span>
                        <span className="text-slate-400">{card.baselineText}</span>
                      </div>
                    </div>

                    {/* vortexAI Novelty */}
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#290c29]/90 to-[#15071f]/90 border border-[#E04A31]/60 flex items-start gap-2.5 shadow-md">
                      <CheckCircle2 className="w-4 h-4 text-[#E04A31] shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-relaxed">
                        <span className="font-bold text-[#fed7aa] mr-1.5 uppercase text-[9px] tracking-wider block sm:inline">
                          vortexAI Novelty:
                        </span>
                        <span className="text-white font-medium">{card.innovationText}</span>
                      </div>
                    </div>
                  </div>

                  {/* Physical Rationale */}
                  <div className="pt-2.5 border-t border-[#64104E]/30">
                    <div className="flex items-center gap-1.5 text-[9.5px] text-[#fed7aa] uppercase font-bold tracking-wider mb-1 font-mono">
                      <Compass className="w-3.5 h-3.5 text-[#E04A31]" />
                      <span>Physical Rationale</span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {card.rationale}
                    </p>
                  </div>
                </div>
              )}

              {/* Stage 06 Synthesis */}
              {card.type === 'synthesis' && (
                <div className="space-y-4 relative z-10">
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {card.summary}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-center font-mono">
                    {card.metrics.map((m, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#160a20] border border-[#64104E]/50">
                        <span className="text-[9px] text-[#fed7aa] uppercase tracking-wider block font-semibold mb-0.5">
                          {m.label}
                        </span>
                        <span className="text-lg font-black text-white">{m.value}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={goToModels}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#E04A31] to-[#CF2F4B] text-white font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-[#E04A31]/20 cursor-pointer"
                  >
                    <span>Explore Modular Deep Learning Stack</span>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Quick Navigation Footer with Step Dots */}
              <div className="pt-3 border-t border-[#64104E]/30 flex items-center justify-between text-xs font-mono relative z-10">
                {/* Step indicator dots */}
                <div className="flex items-center gap-1.5">
                  {allCards.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMobileActiveIdx(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        mobileActiveIdx === idx
                          ? 'w-5 bg-[#E04A31]'
                          : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                      }`}
                      aria-label={`Jump to stage ${idx}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMobileActiveIdx(prev => (prev === 0 ? allCards.length - 1 : prev - 1))}
                    className="px-2.5 py-1 rounded-lg bg-[#14081c] border border-[#64104E]/50 text-slate-300 hover:text-white text-xs active:scale-95 transition-all cursor-pointer"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => setMobileActiveIdx(prev => (prev === allCards.length - 1 ? 0 : prev + 1))}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#E04A31] to-[#CF2F4B] text-white text-xs font-bold active:scale-95 shadow-sm transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
