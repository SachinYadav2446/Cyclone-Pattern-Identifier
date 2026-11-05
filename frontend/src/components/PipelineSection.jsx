import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    badge: 'AUTOMATED DVORAK CONVNEXT',
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
    middleNode: { title: 'CONVNEXT HEAD', label: 'Vernon Dvorak Thermal Contrast (ΔT)', latency: '65ms' },
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

  useEffect(() => {
    let ticking = false;

    const updateStep = () => {
      if (!containerRef.current) {
        ticking = false;
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) {
        ticking = false;
        return;
      }
      
      const currentScroll = -rect.top;
      const rawProgress = Math.max(0, Math.min(1, currentScroll / totalScrollable));
      
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
      className="relative border-b border-[#64104E]/40 bg-[#08050c] text-white"
      style={{ height: '360vh' }}
    >
      {/* Precision background dot pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-45 pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#64104E]/20 rounded-full blur-[170px] pointer-events-none" />

      {/* Sticky Fullscreen Center Presentation Frame */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 overflow-hidden">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white">
              The 4-Step Operational Pipeline.
            </h2>
          </div>

          <div className="font-mono text-xs text-slate-400 flex items-center gap-3">
            <div className="px-3 py-1 bg-[#130b1c] border border-[#64104E]/50 text-slate-300 font-semibold text-xs flex items-center gap-2 rounded-lg shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E04A31] animate-pulse" />
              <span>Stage 0{current.id} / 04 · Latency &lt; 4.0s</span>
            </div>
          </div>
        </div>

        {/* Engineering Workstation Card */}
        <div className="relative border border-[#64104E]/60 bg-[#120a1c]/95 shadow-2xl p-5 sm:p-7 backdrop-blur-xl max-h-[82vh] flex flex-col justify-between overflow-hidden rounded-2xl text-white">
          {/* Micro Corner Plus Marks */}
          <div className="absolute top-1.5 left-1.5 font-mono text-[9px] text-slate-600 select-none pointer-events-none">+</div>
          <div className="absolute top-1.5 right-1.5 font-mono text-[9px] text-slate-600 select-none pointer-events-none">+</div>
          <div className="absolute bottom-1.5 left-1.5 font-mono text-[9px] text-slate-600 select-none pointer-events-none">+</div>
          <div className="absolute bottom-1.5 right-1.5 font-mono text-[9px] text-slate-600 select-none pointer-events-none">+</div>

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
                  <div className="w-7 h-7 bg-[#1c0f2b] border border-[#B43067]/40 flex items-center justify-center text-[#E04A31] shadow-md rounded-lg">
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#1c0f2b] border border-[#64104E]/60 text-[10px] font-mono font-bold text-[#E04A31] rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E04A31] animate-pulse" />
                    <span>{current.badge}</span>
                  </div>
                </div>

                {/* Step Subtitle & Main Title */}
                <div className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Feature 0{current.id} / 04
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white leading-tight mt-0.5">
                  {current.title}
                </h3>
                <div className="font-mono text-[11px] text-[#C3864D] mt-0.5 mb-3 font-bold">
                  {current.subtitle}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4 font-sans line-clamp-3">
                  {current.description}
                </p>

                {/* Feature Bullet Points with Sharp Checkmark Chips */}
                <div className="space-y-2 w-full mb-4">
                  {current.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <div className="w-4 h-4 border border-[#B43067]/40 bg-[#1c0f2b] flex items-center justify-center shrink-0 mt-0.5 text-[#E04A31] rounded">
                        <CheckCircle className="w-2.5 h-2.5 text-[#E04A31]" />
                      </div>
                      <span className="leading-tight font-medium">{bullet}</span>
                    </div>
                  ))}
                </div>

                {/* Mathematical / Technical Formula Box */}
                <div className="w-full p-3 bg-[#0a050f] border border-[#64104E]/50 font-mono text-xs rounded-xl shadow-lg">
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between font-semibold">
                    <span>NUMERICAL FORMULATION</span>
                    <span className="text-[#C3864D] font-bold">BENCHMARK: {current.accuracy}</span>
                  </div>
                  <div className="text-white font-bold text-[11px] truncate bg-[#140b1e] p-2 border border-[#64104E]/60 rounded">
                    {current.formula}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Node Graph Canvas (High-Contrast Radar Terminal) */}
              <div className="lg:col-span-6">
                <div 
                  className="relative border border-[#64104E]/70 bg-[#07040d] overflow-hidden shadow-2xl p-4 sm:p-5 h-[340px] flex flex-col justify-between rounded-xl"
                  style={{ backgroundImage: 'radial-gradient(rgba(224, 74, 49, 0.16) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                >
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between border-b border-[#64104E]/50 pb-2.5 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#64104E]" />
                      <span className="w-2 h-2 rounded-full bg-[#B43067]" />
                      <span className="w-2 h-2 rounded-full bg-[#E04A31]" />
                      <span className="ml-2 font-mono text-[9px] text-slate-400 tracking-wider">
                        Execution Graph · Stage 0{current.id}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-1 font-mono text-[9px] text-[#C3864D] px-2 py-0.5 bg-[#170a20] border border-[#64104E]/80 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E04A31] animate-pulse shadow-[0_0_6px_#E04A31]" />
                      <span>LIVE EXECUTION</span>
                    </div>
                  </div>

                  {/* Node Canvas Area with Precise Hairline Connectors */}
                  <div className="relative flex-1 flex flex-col justify-between py-1">
                    {/* SVG Bezier Cable Connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="cableGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#64104E" />
                          <stop offset="50%" stopColor="#CF2F4B" />
                          <stop offset="100%" stopColor="#E04A31" />
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
                        stroke="rgba(224, 74, 49, 0.55)"
                        strokeWidth="1.5"
                      />
                    </svg>

                    {/* Node 1: Input Port (Top Left) */}
                    <div className="relative z-10 w-fit max-w-[270px] p-2.5 border border-[#64104E]/60 bg-[#120a1c] shadow-xl font-mono text-xs rounded-lg">
                      <div className="flex items-center justify-between gap-2 text-[9px] text-slate-400 font-semibold mb-0.5">
                        <span className="text-slate-400 uppercase tracking-wider">[IN] {current.inputNode.title}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E04A31]" />
                      </div>
                      <div className="text-white font-medium text-[11px] truncate">
                        {current.inputNode.label}
                      </div>
                    </div>

                    {/* Node 2: Neural Processing Engine (Center Right) */}
                    <div className="relative z-10 ml-auto w-fit max-w-[290px] p-3 border border-[#B43067]/80 bg-gradient-to-br from-[#1c0e27] to-[#251033] shadow-[0_0_24px_rgba(224,74,49,0.25)] font-mono text-xs rounded-lg">
                      <div className="flex items-center justify-between gap-2 text-[9px] text-slate-300 font-semibold mb-0.5">
                        <span className="flex items-center gap-1.5 text-white font-bold">
                          <Cpu className="w-3 h-3 text-[#E04A31]" />
                          <span>[KERNEL] {current.middleNode.title}</span>
                        </span>
                        <span className="px-1.5 py-0.2 bg-[#B43067]/30 border border-[#B43067]/80 text-[#fbcfe8] text-[8px] font-bold rounded">
                          {current.middleNode.latency}
                        </span>
                      </div>
                      <div className="text-white font-semibold text-[11px] mt-0.5">
                        {current.middleNode.label}
                      </div>
                    </div>

                    {/* Node 3: Output Port (Bottom Left) */}
                    <div className="relative z-10 w-fit max-w-[270px] p-2.5 border border-[#64104E]/60 bg-[#120a1c] shadow-xl font-mono text-xs rounded-lg">
                      <div className="flex items-center justify-between gap-2 text-[9px] text-slate-400 font-semibold mb-0.5">
                        <span className="text-[#C3864D] uppercase tracking-wider">[OUT] {current.outputNode.title}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E04A31]" />
                      </div>
                      <div className="text-white font-semibold text-[11px]">
                        {current.outputNode.label}
                      </div>
                    </div>
                  </div>

                  {/* Mini Tensor Signature Footer */}
                  <div className="pt-2 border-t border-[#64104E]/50 grid grid-cols-2 gap-3 font-mono text-[9px] text-slate-400">
                    <div>
                      <span className="text-slate-500 block uppercase">INPUT TENSOR:</span>
                      <span className="text-slate-300">{current.tensorIn}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block uppercase">OUTPUT TENSOR:</span>
                      <span className="text-white font-bold">{current.tensorOut}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Stage Switcher / Progress Indicators */}
          <div className="mt-4 pt-3 border-t border-[#64104E]/40 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[10px] font-bold">STAGE SELECTOR:</span>
              <div className="flex items-center gap-1">
                {pipelineSteps.map(step => {
                  const isSelected = activeStepId === step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => setActiveStepId(step.id)}
                      className={`px-3 py-1.5 transition-all text-xs font-mono font-bold border rounded-lg cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#E04A31] to-[#CF2F4B] text-white border-transparent shadow-md shadow-[#E04A31]/20'
                          : 'bg-[#120a1c] border-[#64104E]/50 text-slate-300 hover:text-white hover:border-[#B43067]/60 hover:bg-[#1a0f28]'
                      }`}
                    >
                      0{step.id} · {step.title.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scroll Progress Bar */}
            <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[10px]">
              <span className="font-semibold">SCROLL PINNED</span>
              <div className="w-28 h-1.5 bg-[#180e24] border border-[#64104E]/50 overflow-hidden rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-[#B43067] via-[#CF2F4B] to-[#E04A31] transition-all duration-200"
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
