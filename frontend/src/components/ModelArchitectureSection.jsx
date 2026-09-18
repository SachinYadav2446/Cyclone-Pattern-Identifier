import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Gauge, GitBranch, Zap, Binary, 
  ChevronLeft, ChevronRight, Play, Pause, ArrowRight, Check,
  Cpu, Activity, ShieldCheck, ArrowLeftRight
} from 'lucide-react';

const models = [
  {
    id: 1,
    stepNum: 'STAGE 01 // 04',
    name: 'CenterNet Keypoint Locator',
    tagline: 'Anchor-Free Circulation Center Regression',
    role: 'Vortex Eye Pinpointing',
    framework: 'PyTorch · ConvNeXt Backbone',
    icon: Target,
    benchmarkBadge: '8.7 km Haversine Error',
    accuracyScore: 92,
    input: '(4, 512, 512) Multi-Spectral Tensor',
    output: 'Heatmap, Offset (dx, dy), RMW Size (km)',
    loss: 'L_total = L_focal + λ1·L_offset + λ2·L_size',
    formula: 'Center = argmax(Heatmap) + (δx, δy) · Stride',
    details: [
      'Eliminates anchor box hyperparameter tuning and NMS computational bottlenecks',
      'Modified focal loss actively resolves 99.99% background ocean pixel imbalance',
      'Continuous sub-pixel float offsets restore exact geometric center coordinates',
      'Directly feeds eye-stabilized 256x256 radiance crop to downstream intensity models',
    ],
  },
  {
    id: 2,
    stepNum: 'STAGE 02 // 04',
    name: 'Deep Dvorak ConvNeXt-V2',
    tagline: 'Multi-Task Wind Regression & IMD Stage Classification',
    role: 'Automated Intensity Estimation',
    framework: 'PyTorch · timm Library',
    icon: Gauge,
    benchmarkBadge: '4.8 kts MAE · 0.89 Kappa',
    accuracyScore: 88,
    input: '(4, 256, 256) Eye-Centered Crop',
    output: 'Wind Speed (kts), Central Pressure (hPa), 7 IMD Stages',
    loss: 'L_intensity = L_MSE(wind, pres) + β·L_CE(category)',
    formula: 'ΔT = T_eye - T_eyewall ➔ MSW = W_reg · FeatureVector + b',
    details: [
      '7x7 depthwise convolutions model broad spiral rainband curvature',
      'Automates Vernon Dvorak subjective gradient analysis (Warm Eye vs Cold Cloud Shield)',
      '1024-dimensional shared latent representation simultaneously outputs speed & pressure',
      'Trained on 10+ years of INSAT-3D radiances coupled with NOAA IBTrACS consensus',
    ],
  },
  {
    id: 3,
    stepNum: 'STAGE 03 // 04',
    name: 'ConvLSTM Spatiotemporal Forecaster',
    tagline: 'Recurrent 2D Convolutional Kinematics & Landfall Cones',
    role: '48-Hour Track Forecasting',
    framework: 'PyTorch · Recurrent 2D Convolutions',
    icon: GitBranch,
    benchmarkBadge: '88.4 km 24h Track Error',
    accuracyScore: 84,
    input: '(4, 4, 256, 256) 4 Sequential 6h Timesteps',
    output: '+6h, +12h, +24h, +48h Track Points & Uncertainty Cones',
    loss: 'L_track = Σ Haversine(predicted_coords, true_coords)',
    formula: 'H_t = ConvLSTM(X_t, H_t-1) ➔ LinearDecoder(H_4)',
    details: [
      '2D convolutions replace flat matrix ops, preserving vortex rotation across time',
      'Retains internal atmospheric steering momentum throughout monsoon transitions',
      'Computes expanding cone of uncertainty polygons (+12h, +24h, +48h)',
      'Automates PostGIS ST_Intersects district landfall alerts in < 4.0 seconds',
    ],
  },
  {
    id: 4,
    stepNum: 'STAGE 04 // 04',
    name: 'XGBoost Rapid Intensification (RI)',
    tagline: 'Extreme Deepening Risk & Environmental Shear Fusion',
    role: 'Sudden Burst Warning',
    framework: 'XGBoost · Scikit-Learn Ensemble',
    icon: Zap,
    benchmarkBadge: '0.78 F1-Score · 0.91 AUC-ROC',
    accuracyScore: 94,
    input: '7 Tabular Environmental & Thermal Radiance Features',
    output: 'RI Event Probability: 0% to 100% (High Risk Alert)',
    loss: 'Second-Order Gradient Boosted Binary Logloss',
    formula: 'P(RI) = σ(Σ Trees(ΔT, SST, VWS, Coriolis, Div850))',
    details: [
      'Identifies critical rapid intensification bursts (≥ 30 knots jump within 24 hours)',
      'Fuses multi-spectral cloud-top cooling rates with ECMWF ERA5 Sea Surface Temp (SST)',
      'scale_pos_weight parameter counteracts the extreme 10:1 class rarity imbalance',
      'Provides emergency response commanders with critical early evacuation lead time',
    ],
  },
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 320, damping: 30 },
      opacity: { duration: 0.22 },
      scale: { duration: 0.22 },
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.18,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function ModelArchitectureSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  // Auto-advance loop across all 4 models every 5.0 seconds
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % models.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlay]);

  // Keyboard navigation support (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % models.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + models.length) % models.length);
  };

  const handleSelect = (idx) => {
    if (idx === currentIndex) return;
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  // Touch gesture handlers for mobile & tablet swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    const threshold = 40;
    if (touchDeltaX.current < -threshold) {
      handleNext(); // Swiped finger left -> advance to next stage
    } else if (touchDeltaX.current > threshold) {
      handlePrev(); // Swiped finger right -> return to previous stage
    }
    touchStartX.current = 0;
    touchDeltaX.current = 0;
  };

  const current = models[currentIndex];
  const Icon = current.icon;

  return (
    <section 
      id="models" 
      className="relative py-20 border-b border-zinc-800/80 bg-[#09090b] text-zinc-100 overflow-hidden"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Precision background patterns */}
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 mb-2">
              <Binary className="w-3.5 h-3.5 text-zinc-300" />
              <span>THE 4 SCIENTIFIC PILLARS · END-TO-END PIPELINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Modular Deep Learning Stack.
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed font-sans">
              Each specialized module is scientifically grounded in tropical cyclone meteorology and independently benchmarked.
            </p>
          </div>

          {/* Controls: Left/Right Arrows + Auto-Advance Indicator */}
          <div className="flex items-center gap-2 font-mono text-xs">
            {/* Auto-Play Toggle */}
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-[11px]"
              title={isAutoPlay ? 'Pause Auto-Advance' : 'Resume Auto-Advance'}
            >
              {isAutoPlay ? <Pause className="w-3 h-3 text-emerald-400" /> : <Play className="w-3 h-3" />}
              <span>{isAutoPlay ? 'FLOW ACTIVE' : 'FLOW PAUSED'}</span>
            </button>

            {/* Step Counter */}
            <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-[11px]">
              0{current.id} / 04
            </div>

            {/* Previous Arrow Button */}
            <button
              onClick={handlePrev}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-1"
              aria-label="Previous Module"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">PREV</span>
            </button>

            {/* Next Arrow Button */}
            <button
              onClick={handleNext}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white text-zinc-950 font-bold hover:bg-zinc-200 transition-all flex items-center gap-1 shadow"
              aria-label="Next Module"
            >
              <span className="hidden sm:inline text-[11px]">NEXT</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canonical Stage Pipeline Rail (Clean single presentation) */}
        <div className="mb-6 p-2 bg-zinc-950 border border-zinc-800 font-mono text-xs overflow-x-auto">
          <div className="flex items-center justify-between min-w-[640px] gap-2">
            {models.map((m, idx) => {
              const isSelected = currentIndex === idx;
              const isPast = currentIndex > idx;
              return (
                <React.Fragment key={m.id}>
                  {/* Step Button */}
                  <button
                    onClick={() => handleSelect(idx)}
                    className={`flex items-center gap-2 px-3 py-2 transition-all text-left border flex-1 ${
                      isSelected
                        ? 'bg-white text-zinc-950 font-bold border-white shadow-sm'
                        : isPast
                        ? 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <span className="text-[10px] opacity-75">0{m.id}</span>
                    <span className="text-xs tracking-tight truncate">{m.name.split(' ')[0]}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-auto" />}
                  </button>

                  {/* Connecting Arrow between pipeline stages */}
                  {idx < models.length - 1 && (
                    <div className="flex items-center gap-1 text-zinc-600 px-1 select-none shrink-0">
                      <div className="w-4 h-[1px] bg-zinc-800" />
                      <ArrowRight className={`w-3.5 h-3.5 transition-colors ${currentIndex === idx ? 'text-emerald-400 animate-pulse' : 'text-zinc-700'}`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Swipeable / Draggable Stage Box */}
        <div 
          className="relative min-h-[420px] touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={current.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipeThreshold = 40;
                const velocityThreshold = 180;
                if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
                  handleNext();
                } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
                  handlePrev();
                }
              }}
              className="relative p-6 sm:p-8 bg-[#0d0f15] border border-[#232733] shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-zinc-500/30 before:to-transparent"
            >
              {/* Micro Corner Ticks */}
              <div className="absolute top-1.5 left-1.5 font-mono text-[9px] text-zinc-700 select-none pointer-events-none">+</div>
              <div className="absolute top-1.5 right-1.5 font-mono text-[9px] text-zinc-700 select-none pointer-events-none">+</div>
              <div className="absolute bottom-1.5 left-1.5 font-mono text-[9px] text-zinc-700 select-none pointer-events-none">+</div>
              <div className="absolute bottom-1.5 right-1.5 font-mono text-[9px] text-zinc-700 select-none pointer-events-none">+</div>

              {/* Card Top Row: Identity & Status Tags */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#1f2330]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#151824] border border-[#282d3d] flex items-center justify-center text-white shadow-sm shrink-0">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                      {current.stepNum} · {current.role}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {current.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-[11px] px-2 py-0.5 bg-[#141620] border border-[#262a38] text-zinc-300">
                    {current.framework}
                  </span>
                  <span className="text-[11px] px-2.5 py-0.5 bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{current.benchmarkBadge}</span>
                  </span>
                </div>
              </div>

              {/* Two-Column Technical Architecture Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-6 items-start">
                {/* Left Column: Input / Output / Loss Tensor Contracts */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-zinc-400" />
                    <span>TENSOR INTERFACE & MATHEMATICAL FORMULATION</span>
                  </div>

                  <div className="bg-[#08090d] border border-[#202433] p-4 font-mono text-xs space-y-3 shadow-inner">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-zinc-400 text-[10px] uppercase shrink-0">INPUT TENSOR:</span>
                      <span className="text-zinc-200 text-right font-medium">{current.input}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3 border-t border-[#1a1d29] pt-2">
                      <span className="text-zinc-400 text-[10px] uppercase shrink-0">OUTPUT HEADS:</span>
                      <span className="text-white text-right font-semibold">{current.output}</span>
                    </div>
                    <div className="flex items-start justify-between gap-3 border-t border-[#1a1d29] pt-2">
                      <span className="text-zinc-400 text-[10px] uppercase shrink-0">LOSS FUNCTION:</span>
                      <code className="text-zinc-300 text-right text-[11px] font-mono">{current.loss}</code>
                    </div>
                    <div className="flex items-start justify-between gap-3 border-t border-[#1a1d29] pt-2 bg-black/60 p-2 border border-zinc-800/80">
                      <span className="text-zinc-400 text-[10px] uppercase shrink-0">FORMULA:</span>
                      <code className="text-emerald-300 text-right text-[11px] font-mono truncate">{current.formula}</code>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    {current.tagline} designed specifically for geostationary radiometric data structures.
                  </p>
                </div>

                {/* Right Column: Scientific Details & Empirical Proofs */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-emerald-400" />
                    <span>METEOROLOGICAL GROUNDING & EMPIRICAL BENCHMARK</span>
                  </div>

                  <div className="space-y-2.5">
                    {current.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300 bg-[#0c0e14]/60 border border-[#1b1e2b] p-2.5 font-sans leading-relaxed">
                        <div className="w-4 h-4 bg-[#141622] border border-[#272b38] flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>

                  {/* Benchmark Progress Bar */}
                  <div className="pt-2 font-mono text-[11px] text-zinc-400">
                    <div className="flex items-center justify-between mb-1 text-[10px]">
                      <span>INDEPENDENT TEST BENCHMARK ACCURACY:</span>
                      <span className="text-white font-bold">{current.accuracyScore}% SOTA</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#121520] border border-[#232736] overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-zinc-500 via-zinc-200 to-white transition-all duration-500"
                        style={{ width: `${current.accuracyScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Clean Interactive Footer: Gesture Hint & Step Indicators (No duplicate stage cards) */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-500 font-mono text-[11px] px-1">
          {/* Finger Swipe / Drag Cues */}
          <div className="flex items-center gap-2 text-zinc-400">
            <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-400" />
            <span>Drag or swipe with finger left / right to navigate stages</span>
          </div>

          {/* Active Stage Indicator Dots */}
          <div className="flex items-center gap-2">
            {models.map((m, idx) => (
              <button
                key={m.id}
                onClick={() => handleSelect(idx)}
                className={`h-1.5 transition-all ${
                  currentIndex === idx 
                    ? 'w-7 bg-white' 
                    : 'w-2 bg-zinc-800 hover:bg-zinc-600'
                }`}
                aria-label={`Jump to stage 0${m.id}`}
              />
            ))}
          </div>

          {/* Keyboard Hint */}
          <div className="hidden sm:flex items-center gap-1.5 text-zinc-500 text-[10px]">
            <span>KEYBOARD:</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300">←</kbd>
            <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300">→</kbd>
          </div>
        </div>
      </div>
    </section>
  );
}
