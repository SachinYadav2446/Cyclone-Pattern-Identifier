import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Database, Target, Gauge, GitBranch, ArrowRight, Layers, 
  Cpu, Compass, Play, Pause, CheckCircle, Activity, Sparkles,
  Terminal, ShieldCheck, Zap
} from 'lucide-react';

const pipelineSteps = [
  {
    id: 1,
    stepNum: 'FEATURE 01 OF 04',
    badge: 'RAW CALIBRATION & L1B INGESTION',
    title: 'Multi-Spectral Radiance Inversion',
    subtitle: 'Digital Numbers (DN) to Thermodynamic Brightness Kelvin',
    icon: Database,
    description:
      'Direct satellite telemetric ingestion from INSAT-3D/3DR payloads. Unpacks raw integer DN counts across 4 spectral bands and calculates physical Planck inversion to establish the thermodynamic temperature baseline.',
    bullets: [
      'Multi-spectral 4-channel tensor extraction (TIR-1, TIR-2, WV, VIS)',
      'Sub-Kelvin Planck blackbody lookup table calibration (< 0.2 K error)',
      'HDF5 / NetCDF4 radiometric grid alignment across 0°-35°N, 45°-100°E',
    ],
    ctaText: 'Inspect Ingestion Formula',
    inputNode: { title: 'RAW TELEMETRY', label: 'INSAT-3D L1B DN (4, 512, 512)' },
    middleNode: { title: 'PLANCK INVERSION', label: 'T_B = C2·ν / ln((C1·ν³/R) + 1)', latency: '32ms' },
    outputNode: { title: 'CALIBRATED TENSOR', label: 'Float32 Kelvin Matrix (4, 512, 512)' },
    formula: 'R = Gain · DN + Offset  ➔  T_B = C2·ν / ln((C1·ν³/R) + 1)',
    tensorIn: '(4, 512, 512) DN Counts',
    tensorOut: '(4, 512, 512) Float32 Kelvin',
    accuracy: '0.18 K Sensor Margin',
  },
  {
    id: 2,
    stepNum: 'FEATURE 02 OF 04',
    badge: 'ANCHOR-FREE CENTER FIXING',
    title: 'Sub-Pixel Eye Localization',
    subtitle: 'CenterNet Keypoint Heatmap & Circulation Coordinate Regression',
    icon: Target,
    description:
      'ConvNeXt deep feature pyramid isolates atmospheric circulation centers. Bypasses bulky bounding box anchors and Non-Maximum Suppression (NMS) in favor of peak Gaussian center estimation with sub-pixel float offsets.',
    bullets: [
      'Sub-pixel continuous floating-point coordinate precision (Lat, Lon)',
      'Modified Focal Loss handling 99.99% background ocean class imbalance',
      '8.7 km mean Haversine center fix error benchmarked against IBTrACS',
    ],
    ctaText: 'Inspect Keypoint Loss',
    inputNode: { title: 'CALIBRATED TENSOR', label: 'Eye-Centered Radiance Tensor' },
    middleNode: { title: 'CENTERNET HEAD', label: 'Keypoint Heatmap + L1 Offset Head', latency: '48ms' },
    outputNode: { title: 'PINPOINT EYE FIX', label: 'Center (15.86°N, 86.18°E) ± 8.7 km' },
    formula: 'Peak = argmax(Heatmap) ➔ Fix = (px + δx, py + δy) · 4',
    tensorIn: '(4, 512, 512) Tensor',
    tensorOut: '(Lat, Lon) + RMW Radius',
    accuracy: '8.7 km Haversine Error',
  },
  {
    id: 3,
    stepNum: 'FEATURE 03 OF 04',
    badge: 'AUTOMATED DVORAK CONVNEXT-V2',
    title: 'Deep Dvorak Intensity Estimation',
    subtitle: 'Thermal Contrast (ΔT) Analysis & IMD Stage Classification',
    icon: Gauge,
    description:
      'Automates Vernon Dvorak’s subjective pattern recognition using 7x7 depthwise convolutional feature maps. Quantifies thermal contrast between the warm eye core and the coldest eyewall thunderstorm ring.',
    bullets: [
      'Automated Vernon Dvorak Intensity (T-Number & Maximum Sustained Winds)',
      'Simultaneous wind speed regression (kts) & central pressure deficit (hPa)',
      '4.8 knots MAE & 0.89 Quadratic Weighted Cohen’s Kappa',
    ],
    ctaText: 'Inspect Gradient Contrast',
    inputNode: { title: 'EYE-CENTERED CROP', label: '256x256 Stabilized Storm Core' },
    middleNode: { title: 'CONVNEXT-V2 HEAD', label: 'Vernon Dvorak Thermal Contrast (ΔT)', latency: '65ms' },
    outputNode: { title: 'INTENSITY ESTIMATE', label: '85.4 kts · 972 hPa · Category: VSCS' },
    formula: 'ΔT = T_eye - T_eyewall ➔ MSW = W_reg · v_1024 + b',
    tensorIn: '(4, 256, 256) Core Patch',
    tensorOut: 'MSW (kts), CPD (hPa), 7 Stages',
    accuracy: '4.8 kts MAE (< 0.5 T-No)',
  },
  {
    id: 4,
    stepNum: 'FEATURE 04 OF 04',
    badge: 'SPATIOTEMPORAL KINEMATICS',
    title: 'Spatio-Temporal 48h Trajectory',
    subtitle: 'Recurrent 2D Convolutional Momentum & Landfall Uncertainty Cones',
    icon: GitBranch,
    description:
      'Fuses 4 sequential 6-hourly satellite frames via recurrent ConvLSTM gates. Retains 2D atmospheric vortex morphology across time steps while calculating forward steering momentum to output 48-hour landfall cones.',
    bullets: [
      'Recurrent 2D spatiotemporal memory preserving cyclonic circulation',
      'Dynamic expanding Cone of Uncertainty calculation (+12h, +24h, +48h)',
      'Automated PostGIS ST_Intersects district landfall alerts in < 4.0s',
    ],
    ctaText: 'Inspect Trajectory Cones',
    inputNode: { title: 'TEMPORAL FRAMES', label: 'T-18h, T-12h, T-6h, T0 Sequence' },
    middleNode: { title: 'CONVLSTM GATES', label: 'Atmospheric Steering & Rotational Vortex', latency: '112ms' },
    outputNode: { title: '48H TRACK & CONES', label: '+48h Landfall Cone: Odisha Coast' },
    formula: 'H_t = ConvLSTM(X_t, H_t-1) ➔ FC_Decoder(H_4)',
    tensorIn: '(4, 4, 256, 256) Time-Series',
    tensorOut: '+6h, +12h, +24h, +48h (Lat, Lon)',
    accuracy: '88.4 km 24h Track Error',
  },
];

export default function PipelineSection() {
  const [activeStepId, setActiveStepId] = useState(1);
  const containerRef = useRef(null);

  // Scroll spy: update activeStepId smoothly as user scrolls through the 4 pinned milestones (throttled with rAF)
  useEffect(() => {
    let ticking = false;

    const updateStep = () => {
      if (!containerRef.current) {
        ticking = false;
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Total scroll distance while pinned
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) {
        ticking = false;
        return;
      }
      
      const currentScroll = -rect.top;
      const rawProgress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      
      // Divide into 4 distinct thresholds with stable buffer
      let step = 1;
      if (rawProgress >= 0.72) {
        step = 4;
      } else if (rawProgress >= 0.46) {
        step = 3;
      } else if (rawProgress >= 0.20) {
        step = 2;
      } else {
        step = 1;
      }
      
      setActiveStepId((prev) => (prev !== step ? step : prev));
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateStep);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateStep();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const current = pipelineSteps.find(s => s.id === activeStepId) || pipelineSteps[0];
  const Icon = current.icon;

  return (
    <section 
      id="pipeline" 
      ref={containerRef}
      className="relative border-b border-zinc-800/80 bg-[#09090b]"
      style={{ height: '360vh' }}
    >
      {/* Precision background dot pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Sticky Fullscreen Center Presentation Frame (Sticks at top-0, perfectly centered in viewport) */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 overflow-hidden">
        {/* Section Header (Compact & Precision Styled) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 mb-1">
              <Layers className="w-3 h-3 text-white" />
              <span>SCROLL-PINNED PIPELINE WORKFLOW</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              The 4-Step Operational Pipeline.
            </h2>
          </div>

          <div className="font-mono text-xs text-zinc-400 flex items-center gap-3">
            <div className="px-3 py-1 bg-zinc-900/90 border border-zinc-800 text-white font-bold text-[11px] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>STAGE 0{current.id} / 04 · END-TO-END LATENCY &lt; 4.0s</span>
            </div>
          </div>
        </div>

        {/* Crisp Monochromatic Engineering Workstation Card (Deep Graphite-Slate Elevation) */}
        <div className="relative border border-[#232733] bg-gradient-to-b from-[#111319] via-[#0e1015] to-[#0a0b0e] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-5 sm:p-7 backdrop-blur-xl max-h-[82vh] flex flex-col justify-between overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-zinc-500/30 before:to-transparent">
          {/* Micro Corner Plus Marks (DoD / Scientific Instrumentation Accents) */}
          <div className="absolute top-1.5 left-1.5 font-mono text-[9px] text-zinc-600 select-none pointer-events-none">+</div>
          <div className="absolute top-1.5 right-1.5 font-mono text-[9px] text-zinc-600 select-none pointer-events-none">+</div>
          <div className="absolute bottom-1.5 left-1.5 font-mono text-[9px] text-zinc-600 select-none pointer-events-none">+</div>
          <div className="absolute bottom-1.5 right-1.5 font-mono text-[9px] text-zinc-600 select-none pointer-events-none">+</div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center"
            >
              {/* Left Column: Feature Narrative, Bullet Points, and Details */}
              <div className="lg:col-span-6 flex flex-col items-start">
                {/* Top Badge Row */}
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 bg-[#161822] border border-[#272b38] flex items-center justify-center text-white shadow-sm">
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#161822] border border-[#272b38] text-[10px] font-mono font-semibold text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{current.badge}</span>
                  </div>
                </div>

                {/* Step Subtitle & Main Title */}
                <div className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  FEATURE 0{current.id} // 04
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight mt-0.5">
                  {current.title}
                </h3>
                <div className="font-mono text-[11px] text-zinc-400 mt-0.5 mb-3">
                  {current.subtitle}
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4 font-sans line-clamp-3">
                  {current.description}
                </p>

                {/* Feature Bullet Points with Sharp Checkmark Chips */}
                <div className="space-y-2 w-full mb-4">
                  {current.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <div className="w-3.5 h-3.5 border border-[#2f3545] bg-[#141620] flex items-center justify-center shrink-0 mt-0.5 text-white">
                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="leading-tight">{bullet}</span>
                    </div>
                  ))}
                </div>

                {/* Mathematical / Technical Formula Box (Clean Inset Console) */}
                <div className="w-full p-2.5 bg-[#090a0e] border border-[#232733] font-mono text-xs">
                  <div className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>NUMERICAL FORMULATION</span>
                    <span className="text-zinc-400">BENCHMARK: {current.accuracy}</span>
                  </div>
                  <div className="text-white font-semibold text-[11px] truncate bg-black/90 p-2 border border-[#1b1e28]">
                    {current.formula}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Node Graph Canvas (Deep Blueprint Console) */}
              <div className="lg:col-span-6">
                <div 
                  className="relative border border-[#262b3a] bg-[#07080b] overflow-hidden shadow-2xl p-4 sm:p-5 h-[340px] flex flex-col justify-between"
                  style={{ backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                >
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between border-b border-[#1e222e] pb-2.5 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-zinc-600" />
                      <span className="w-2 h-2 bg-zinc-600" />
                      <span className="w-2 h-2 bg-zinc-600" />
                      <span className="ml-2 font-mono text-[9px] text-zinc-400 tracking-wider">
                        EXECUTION_DAG // STAGE_0{current.id}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1 font-mono text-[9px] text-emerald-400 px-2 py-0.5 bg-emerald-950/40 border border-emerald-800/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>LIVE EXECUTION</span>
                    </div>
                  </div>

                  {/* Node Canvas Area with Precise Hairline Connectors */}
                  <div className="relative flex-1 flex flex-col justify-between py-1">
                    {/* SVG Bezier Cable Connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="cableGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
                          <stop offset="50%" stopColor="rgba(255, 255, 255, 0.3)" />
                          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.85)" />
                        </linearGradient>
                      </defs>

                      {/* Cable from Node 1 to Node 2 */}
                      <path
                        d="M 180 36 C 240 36, 210 95, 260 105"
                        fill="none"
                        stroke="url(#cableGradient)"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        className="animate-pulse"
                      />

                      {/* Cable from Node 2 to Node 3 */}
                      <path
                        d="M 260 135 C 210 155, 170 165, 180 185"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.35)"
                        strokeWidth="1.5"
                      />
                    </svg>

                    {/* Node 1: Input Port (Top Left) */}
                    <div className="relative z-10 w-fit max-w-[270px] p-2.5 border border-[#282d3d] bg-[#11131a]/95 shadow-xl font-mono text-xs">
                      <div className="flex items-center justify-between gap-2 text-[9px] text-zinc-400 font-semibold mb-0.5">
                        <span className="text-zinc-500 uppercase tracking-wider">[IN] {current.inputNode.title}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
                      </div>
                      <div className="text-white font-medium text-[11px] truncate">
                        {current.inputNode.label}
                      </div>
                    </div>

                    {/* Node 2: Neural Processing Engine (Center Right) */}
                    <div className="relative z-10 ml-auto w-fit max-w-[290px] p-3 border border-zinc-500/80 bg-[#161822] shadow-2xl font-mono text-xs">
                      <div className="flex items-center justify-between gap-2 text-[9px] text-zinc-300 font-semibold mb-0.5">
                        <span className="flex items-center gap-1.5 text-white font-bold">
                          <Cpu className="w-3 h-3 text-white" />
                          <span>[KERNEL] {current.middleNode.title}</span>
                        </span>
                        <span className="px-1.5 py-0.2 bg-[#0e1015] border border-[#2e3447] text-emerald-400 text-[8px] font-bold">
                          {current.middleNode.latency}
                        </span>
                      </div>
                      <div className="text-white font-semibold text-[11px] mt-0.5">
                        {current.middleNode.label}
                      </div>
                    </div>

                    {/* Node 3: Output Port (Bottom Left) */}
                    <div className="relative z-10 w-fit max-w-[270px] p-2.5 border border-[#282d3d] bg-[#11131a]/95 shadow-xl font-mono text-xs">
                      <div className="flex items-center justify-between gap-2 text-[9px] text-zinc-400 font-semibold mb-0.5">
                        <span className="text-emerald-400 uppercase tracking-wider">[OUT] {current.outputNode.title}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="text-white font-semibold text-[11px]">
                        {current.outputNode.label}
                      </div>
                    </div>
                  </div>

                  {/* Mini Tensor Signature Footer */}
                  <div className="pt-2 border-t border-[#1e222e] grid grid-cols-2 gap-3 font-mono text-[9px] text-zinc-400">
                    <div>
                      <span className="text-zinc-500 block uppercase">INPUT TENSOR:</span>
                      <span className="text-zinc-200">{current.tensorIn}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-500 block uppercase">OUTPUT TENSOR:</span>
                      <span className="text-white font-bold">{current.tensorOut}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Stage Switcher / Progress Indicators (Sharp Technical Tabs) */}
          <div className="mt-4 pt-3 border-t border-[#232733] flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-[10px]">STAGE SELECTOR:</span>
              <div className="flex items-center gap-1">
                {pipelineSteps.map(step => {
                  const isSelected = activeStepId === step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStepId(step.id)}
                      className={`px-3 py-1 transition-all text-xs font-mono font-medium border ${
                        isSelected
                          ? 'bg-white text-zinc-950 font-bold border-white shadow-sm'
                          : 'bg-[#13151d] border-[#262a38] text-zinc-400 hover:text-white hover:bg-[#1a1d28]'
                      }`}
                    >
                      0{step.id} · {step.title.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scroll Progress Bar (Precision Linear Track) */}
            <div className="hidden sm:flex items-center gap-2 text-zinc-400 text-[10px]">
              <span>SCROLL PINNED</span>
              <div className="w-28 h-1 bg-[#13151d] border border-[#262a38] overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-200"
                  style={{ width: `${(activeStepId / pipelineSteps.length) * 100}%` }}
                />
              </div>
              <span className="text-white font-bold">{activeStepId}/4</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
