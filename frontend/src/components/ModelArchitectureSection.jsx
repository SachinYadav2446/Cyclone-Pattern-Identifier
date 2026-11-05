/* Stage 1: Architecture Stack */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Gauge, GitBranch, Zap, ShieldCheck, 
  Layers, Terminal, Scale, Copy, CheckCheck, ArrowRight
} from 'lucide-react';
import {
  AiBrain05Icon,
  AiChipIcon,
  Target02Icon,
  Layers01Icon,
  FlashIcon,
  Route01Icon,
  Activity01Icon,
  ChartHistogramIcon,
} from '@hugeicons/core-free-icons';
import BranchedMenu from './BranchedMenu';

const models = {
  centernet: {
    key: 'centernet',
    stageNum: '01 / 04',
    name: 'CenterNet Keypoint Locator',
    role: 'Vortex Eye Pinpointing',
    framework: 'PyTorch · ConvNeXt-Tiny + DCNv2',
    icon: Target,
    benchmarkBadge: '8.7 km Haversine Error',
    stats: [
      { label: 'GPU LATENCY', value: '11.8 ms', sub: 'FP16 TensorRT', color: 'text-[#E04A31]' },
      { label: 'MEMORY VRAM', value: '1.2 GB', sub: 'Batch Size = 1', color: 'text-white' },
      { label: 'COMPUTE FLOPS', value: '14.2 GFLOPs', sub: 'Single Frame', color: 'text-[#C3864D]' },
      { label: 'THROUGHPUT', value: '84.7 FPS', sub: 'Streaming Ingestion', color: 'text-emerald-400' }
    ],
    layers: [
      { 
        name: '4-Channel Radiance Stem', 
        shape: '512×512×4 ➔ 128×128×96', 
        desc: 'Ingests calibrated Planck brightness temperatures (TIR-1, TIR-2, WV, VIS) without destroying fine vortex eye structure.' 
      },
      { 
        name: 'ConvNeXt Inverted Bottlenecks', 
        shape: 'Stage 1-4 Feature Hierarchy', 
        desc: '7×7 depthwise convolutions extract broad cyclonic curvature across multi-resolution spatial scales.' 
      },
      { 
        name: 'Deformable Conv (DCNv2)', 
        shape: 'Spiral Rainband Offsets', 
        desc: 'Dynamically shifts 2D spatial sampling points to conform precisely along asymmetric spiral rainbands.' 
      },
      { 
        name: 'Sub-Pixel Keypoint Head', 
        shape: '128×128 Heatmap + (dx, dy)', 
        desc: 'Outputs continuous floating-point geographic coordinate offsets, restoring exact center fixes without discrete anchor boxes.' 
      }
    ],
    loss: 'L_total = L_focal + 1.0·L_offset + 0.1·L_size',
    formula: 'Center = argmax(Heatmap) + (δx, δy) · Stride',
    handoff: 'Outputs stabilized 256×256 vortex center crop to Deep Dvorak ConvNeXt'
  },
  dvorak: {
    key: 'dvorak',
    stageNum: '02 / 04',
    name: 'Deep Dvorak ConvNeXt',
    role: 'Automated Intensity Estimation & Thermal Contrast (ΔT)',
    framework: 'PyTorch · ConvNeXt + GRN',
    icon: Gauge,
    benchmarkBadge: '4.8 kts MAE · 0.89 Kappa',
    stats: [
      { label: 'GPU LATENCY', value: '16.4 ms', sub: 'FP16 TensorRT', color: 'text-[#E04A31]' },
      { label: 'MEMORY VRAM', value: '1.6 GB', sub: 'Batch Size = 1', color: 'text-white' },
      { label: 'COMPUTE FLOPS', value: '28.6 GFLOPs', sub: 'Single Frame', color: 'text-[#C3864D]' },
      { label: 'THROUGHPUT', value: '61.0 FPS', sub: 'Streaming Ingestion', color: 'text-emerald-400' }
    ],
    layers: [
      { 
        name: 'Eye-Centered Radiance Stem', 
        shape: '256×256×4 ➔ 64×64×128', 
        desc: 'Receives the stabilized 256×256 storm core patch centered on the CenterNet circulation fix.' 
      },
      { 
        name: '7×7 Depthwise Convolutions', 
        shape: 'Thermal Contrast Extraction', 
        desc: 'Quantifies temperature contrast (ΔT) between the warm central eye and the dense convective eyewall ring.' 
      },
      { 
        name: 'Global Response Normalization', 
        shape: 'GRN Redundancy Suppression', 
        desc: 'Eliminates redundant atmospheric spectral activations and prevents dead-neuron channel saturation.' 
      },
      { 
        name: 'Dual Regression & Classifier', 
        shape: 'Wind + Pressure + 7 Classes', 
        desc: 'Jointly outputs continuous wind speed, central pressure deficit, and official 7-stage IMD classification.' 
      }
    ],
    loss: 'L_intensity = L_MSE(wind, pres) + 0.4·L_CE(category)',
    formula: 'ΔT = T_eye - T_eyewall ➔ MSW = W_reg · FeatureVector + b',
    handoff: 'Passes 1024-D spatial vortex embedding to ConvLSTM temporal queue'
  },
  convlstm: {
    key: 'convlstm',
    stageNum: '03 / 04',
    name: 'ConvLSTM Spatiotemporal Forecaster',
    role: '48-Hour Kinematic Track & Uncertainty Cones',
    framework: 'PyTorch · Recurrent 2D Convolutions',
    icon: GitBranch,
    benchmarkBadge: '88.4 km 24h Track Error',
    stats: [
      { label: 'GPU LATENCY', value: '22.1 ms', sub: 'FP16 TensorRT', color: 'text-[#E04A31]' },
      { label: 'MEMORY VRAM', value: '2.1 GB', sub: 'Batch Size = 1', color: 'text-white' },
      { label: 'COMPUTE FLOPS', value: '44.8 GFLOPs', sub: 'Single Frame', color: 'text-[#C3864D]' },
      { label: 'THROUGHPUT', value: '45.2 FPS', sub: 'Streaming Ingestion', color: 'text-emerald-400' }
    ],
    layers: [
      { 
        name: 'Temporal Sequence Queue', 
        shape: '4× (256×256×4) Past 24h', 
        desc: 'Queues 4 sequential 6-hourly observation frames (T-18h, T-12h, T-6h, T0) to model atmospheric steering momentum.' 
      },
      { 
        name: 'Bidirectional ConvLSTM Cells', 
        shape: 'Hidden State H_t & Cell C_t', 
        desc: 'Maintains 2D spatial feature representations inside recurrent memory gates across temporal transitions.' 
      },
      { 
        name: 'Vortex Kinematic Autoencoder', 
        shape: 'Gyre Angular Momentum', 
        desc: 'Encodes steering currents and seasonal monsoon trough interactions into invariant motion vectors.' 
      },
      { 
        name: 'Haversine Multi-Step Projector', 
        shape: '+6h, +12h, +24h, +48h Vectors', 
        desc: 'Projects future coordinate trajectories and generates expanding cone of uncertainty polygons.' 
      }
    ],
    loss: 'L_track = Σ Haversine(predicted_coords, true_coords)',
    formula: 'H_t = ConvLSTM(X_t, H_t-1) ➔ LinearDecoder(H_4)',
    handoff: 'Outputs kinematic steering momentum vectors to XGBoost ensemble'
  },
  xgboost: {
    key: 'xgboost',
    stageNum: '04 / 04',
    name: 'Rapid Intensification Predictor',
    role: 'RI Probability & Coastal Landfall Risk',
    framework: 'XGBoost · SHAP Interpretable Trees',
    icon: Zap,
    benchmarkBadge: '91.2% RI Detection POD',
    stats: [
      { label: 'GPU LATENCY', value: '2.4 ms', sub: 'CPU / TensorRT', color: 'text-[#E04A31]' },
      { label: 'MEMORY VRAM', value: '80 MB', sub: 'RAM Allocation', color: 'text-white' },
      { label: 'COMPUTE FLOPS', value: '0.02 GFLOPs', sub: 'Single Frame', color: 'text-[#C3864D]' },
      { label: 'THROUGHPUT', value: '416 FPS', sub: 'Streaming Ingestion', color: 'text-emerald-400' }
    ],
    layers: [
      { 
        name: 'Multi-Modal Ingestion', 
        shape: '28-D Ocean & Atmospheric Features', 
        desc: 'Ingests Sea Surface Temperature (>28°C), Vertical Wind Shear (<15 kt), Ocean Heat Content, and radiance stats.' 
      },
      { 
        name: 'Gradient Boosted Forest', 
        shape: '120 Depth-6 Tree Ensembles', 
        desc: 'Evaluates non-linear thermodynamic tipping points that trigger explosive storm intensification.' 
      },
      { 
        name: 'SHAP Feature Attribution', 
        shape: 'Real-Time Explainability', 
        desc: 'Calculates exact additive Shapley values for all 28 covariates in < 1.0 ms for transparent AI explanations.' 
      },
      { 
        name: 'Civil Defense Risk Calibrator', 
        shape: 'NDMA Levels 1-4 + Coastal ETA', 
        desc: 'Maps model probabilities directly to NDMA 4-tier district disaster warning protocols and sirens.' 
      }
    ],
    loss: 'Binary Cross-Entropy with Scale Pos Weight = 3.2',
    formula: 'RI_Prob = σ(Σ Trees(SST, VWS, OHC, Eyewall_Temp, Core_ΔT))',
    handoff: 'Generates NDMA Civil Defense evacuation alert matrix and sirens'
  }
};

const theoreticalFormulations = {
  math_focal: {
    key: 'math_focal',
    stageNum: 'THEORY 01',
    title: 'Continuous Sub-Pixel Offset Fix',
    subtitle: 'CenterNet Floating-Point Keypoint Heatmap Regression',
    benchmarkBadge: '8.7 km Haversine Error',
    lossFormula: 'L_det = L_focal(p̂, p) + 1.0 · |δ̂ - (p/R - ⌊p/R⌋)| + 0.1 · |ŝ - s|',
    rationale: 'Bounding boxes are fundamentally designed for rigid rectangular objects, not diffuse meteorological vortices. Continuous sub-pixel regression eliminates grid quantization error completely.',
    conventionalApproach: 'YOLO and Faster-RCNN apply integer bounding boxes, producing ±25 to 35 km spatial quantization step-error.',
    vortexaiMethodology: 'Anchor-free CenterNet regresses continuous floating-point offsets (dx, dy) on keypoint feature heatmaps.'
  },
  math_balance: {
    key: 'math_balance',
    stageNum: 'THEORY 02',
    title: 'Physically-Constrained Cyclostrophic Balance',
    subtitle: 'Atkinson-Holliday Wind-Pressure Thermodynamic Loss',
    benchmarkBadge: '0% Physical Balance Violations',
    lossFormula: 'V_max = 6.7 · (1010 - P_min)^0.644  ➔  L_phys = |V_pred - 6.7 · (1010 - P_pred)^0.644|',
    rationale: 'Pure black-box models frequently hallucinate non-physical states. By embedding empirical cyclostrophic balance into the multi-task loss, wind speed and central pressure deficit strictly obey atmospheric physics.',
    conventionalApproach: 'Standard neural networks predict wind and pressure as decoupled independent heads, often predicting non-physical states.',
    vortexaiMethodology: 'Embedded Atkinson-Holliday loss penalizes thermodynamic decoupling during training, binding wind to central pressure.'
  },
  math_convlstm: {
    key: 'math_convlstm',
    stageNum: 'THEORY 03',
    title: 'Spatiotemporal Kinematic Trajectory Memory',
    subtitle: 'Recurrent 2D Convolutions with Haversine Path Loss',
    benchmarkBadge: '88.4 km 24h Track Error',
    lossFormula: 'L_track = Σ_{k ∈ {6,12,24,48}} Haversine(Coord̂_{t+k}, Coord_{t+k})',
    rationale: 'Flattened 1D sequence models destroy 2D vortex morphology. Recurrent 2D convolutional memory preserves internal rotational gyre angular momentum through monsoon transitions.',
    conventionalApproach: 'Standard RNNs and transformers destroy 2D spatial vortex morphology, losing internal cyclonic rotation and steering physics.',
    vortexaiMethodology: 'Bidirectional ConvLSTM cells retain 2D spatial feature maps inside recurrent hidden state gates across 4 sequential 6h observation frames.'
  },
  math_shap: {
    key: 'math_shap',
    stageNum: 'THEORY 04',
    title: 'SHAP Feature Risk Attribution Trees',
    subtitle: 'Real-Time Rapid Intensification Explainability Matrix',
    benchmarkBadge: '91.2% POD · 28 Covariates',
    lossFormula: 'φ_i(x) = Σ_{S ⊆ F \\ {i}} [|S|!(|F| - |S| - 1)! / |F|!] · [f(S ∪ {i}) - f(S)]',
    rationale: 'Civil defense evacuations demand explainable AI. Real-time Shapley additive explanations decompose rapid intensification risk into physical covariates, giving commanders transparent early warning lead time.',
    conventionalApproach: 'Black-box deep neural networks give probability scores without explaining the underlying thermodynamic causes.',
    vortexaiMethodology: 'Shapley additive explanations calculate exact additive contributions for every atmospheric factor in real time (< 2.4 ms).'
  }
};

const menuItems = [
  {
    label: 'Vision & Perception',
    children: [
      { value: 'centernet', label: '01 · CenterNet Locator', icon: Target02Icon },
      { value: 'dvorak', label: '02 · Deep Dvorak ConvNeXt', icon: Activity01Icon },
    ]
  },
  {
    label: 'Forecasting & Kinematics',
    children: [
      { value: 'convlstm', label: '03 · ConvLSTM 48h Track', icon: Route01Icon },
      { value: 'xgboost', label: '04 · XGBoost RI Predictor', icon: FlashIcon },
    ]
  },
  {
    label: 'Theoretical Objectives',
    children: [
      { value: 'math_focal', label: 'Sub-Pixel Offset Fix', icon: Layers01Icon },
      { value: 'math_balance', label: 'Atkinson-Holliday Balance', icon: AiBrain05Icon },
      { value: 'math_convlstm', label: 'Haversine Path Loss', icon: AiChipIcon },
      { value: 'math_shap', label: 'SHAP Feature Trees', icon: ChartHistogramIcon },
    ]
  }
];

export default function ModelArchitectureSection() {
  const [activeKey, setActiveKey] = useState('centernet');
  const [hasCopied, setHasCopied] = useState(false);

  const isModel = Boolean(models[activeKey]);
  const activeModel = models[activeKey] || models.centernet;
  const activeTheory = theoreticalFormulations[activeKey];
  const ActiveIcon = isModel ? activeModel.icon : Scale;

  const handleCopyFormula = (text) => {
    navigator.clipboard?.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <section 
      id="models" 
      className="relative py-20 border-y border-[#64104E]/40 bg-[#08050c] text-white"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-45" />
        <div className="absolute top-1/4 -left-20 w-[450px] h-[450px] bg-[#64104E]/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-[#E04A31]/12 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Clean, Direct Section Header (No noisy subheadings) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-6 border-b border-[#64104E]/30 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-mono tracking-tight text-white">
              Modular Deep Learning Stack
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-sans max-w-2xl leading-relaxed">
              Four specialized neural architectures chained into an automated meteorological pipeline. Select any stage from the tree to inspect.
            </p>
          </div>

          <div className="font-mono text-xs text-slate-400 shrink-0">
            <span className="text-[#E04A31] font-bold">52.7 ms</span> End-to-End Pipeline Latency
          </div>
        </div>

        {/* Master Workstation: Tree on Left, Clean Divider, Free Open Content on Right (NO BOXES) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Free-Floating BranchedMenu Tree (No box) */}
          <div className="lg:col-span-4 pr-0 lg:pr-4">
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
              NEURAL ARCHITECTURE TOPOLOGY
            </div>

            <div className="py-1">
              <BranchedMenu
                items={menuItems}
                defaultOpen={[0, 1, 2]}
                defaultActive={activeKey}
                onSelect={(val) => setActiveKey(val)}
                color="#f8fafc"
                accentColor="#E04A31"
                lineColor="#64104E"
                width={320}
                rowHeight={38}
                indent={38}
                trunk={14}
                radius={10}
                lineWidth={1.5}
                fontSize={13}
                drawDuration={320}
                foldDuration={260}
              />
            </div>
          </div>

          {/* Right Column: Free Open Content with Single Vertical Divider (NO BOXES) */}
          <div className="lg:col-span-8 pl-0 lg:pl-10 border-t lg:border-t-0 lg:border-l border-[#64104E]/30 pt-6 lg:pt-0">
            <AnimatePresence mode="wait">
              {isModel ? (
                /* Single Active Model View (Clean, open, breathable, NO nested boxes) */
                <motion.div
                  key={activeModel.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6"
                >
                  {/* Model Header */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="text-xs font-mono font-bold text-[#E04A31] tracking-wider uppercase">
                        STAGE {activeModel.stageNum} · {activeModel.role}
                      </div>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="px-2.5 py-0.5 bg-[#170c24] text-slate-300 text-[11px] rounded border border-[#64104E]/40">
                          {activeModel.framework}
                        </span>
                        <span className="px-2.5 py-0.5 bg-[#241026] text-[#fbcfe8] font-bold text-[11px] rounded border border-[#B43067]/50 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#E04A31]" />
                          <span>{activeModel.benchmarkBadge}</span>
                        </span>
                      </div>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
                      {activeModel.name}
                    </h3>
                  </div>

                  {/* Open Telemetry Stats Row (Clean hairline dividers, NO BOXES) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-[#64104E]/25 font-mono">
                    {activeModel.stats.map((s, idx) => (
                      <div key={idx} className={idx > 0 ? 'sm:border-l sm:border-[#64104E]/25 sm:pl-4' : ''}>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">{s.label}</div>
                        <div className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</div>
                        <div className="text-[10px] text-slate-400">{s.sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* Neural Layers Pipeline (Connected Vertical Spine, NO BOXES) */}
                  <div className="space-y-3 pt-1">
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-[#E04A31]" />
                      <span>NEURAL LAYER HIERARCHY &amp; TENSOR TRANSFORMATIONS</span>
                    </div>

                    <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#E04A31] before:via-[#B43067] before:to-[#64104E]">
                      {activeModel.layers.map((layer, lIdx) => (
                        <div key={lIdx} className="relative group">
                          <span className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-[#08050c] border-2 border-[#E04A31]" />
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-[#E04A31]">0{lIdx + 1}</span>
                              <span className="text-sm font-mono font-bold text-white">{layer.name}</span>
                            </div>
                            <span className="text-xs font-mono text-[#C3864D] font-semibold">{layer.shape}</span>
                          </div>
                          <p className="text-xs text-slate-300 font-sans mt-0.5 leading-relaxed">
                            {layer.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mathematical Loss Formulation (Clean left-accent bar, NO BOXES) */}
                  <div className="pl-4 border-l-2 border-[#E04A31] space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                        OBJECTIVE LOSS CRITERION &amp; FORMULATION
                      </span>
                      <button 
                        onClick={() => handleCopyFormula(activeModel.loss)}
                        className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {hasCopied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{hasCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    
                    <div className="text-sm font-mono font-semibold text-white tracking-tight">
                      {activeModel.loss}
                    </div>
                    <div className="text-xs font-mono text-[#C3864D]">
                      {activeModel.formula}
                    </div>
                  </div>

                  {/* Downstream Handoff */}
                  <div className="pt-3 border-t border-[#64104E]/25 flex items-center justify-between text-xs font-mono text-slate-400">
                    <div>
                      <span className="text-[#C3864D] font-bold text-[10px] uppercase mr-2">HANDOFF:</span>
                      <span className="text-slate-200">{activeModel.handoff}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Single Active Theoretical Formulation View */
                <motion.div
                  key={activeTheory.key}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="text-xs font-mono font-bold text-[#E04A31] tracking-wider uppercase">
                        {activeTheory.stageNum} · ATMOSPHERIC PHYSICS FOUNDATION
                      </div>
                      <span className="px-2.5 py-0.5 bg-[#241026] text-[#fbcfe8] font-bold text-[11px] rounded border border-[#B43067]/50">
                        {activeTheory.benchmarkBadge}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
                      {activeTheory.title}
                    </h3>
                    <div className="text-xs font-sans text-[#C3864D] font-medium mt-0.5">
                      {activeTheory.subtitle}
                    </div>
                  </div>

                  {/* Mathematical Loss Formula */}
                  <div className="pl-4 border-l-2 border-[#B43067] space-y-1.5 py-1">
                    <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                      PHYSICALLY-CONSTRAINED LOSS FORMULATION
                    </div>
                    <div className="text-sm font-mono font-semibold text-white">
                      {activeTheory.lossFormula}
                    </div>
                  </div>

                  {/* Intuition & Rationale */}
                  <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                    {activeTheory.rationale}
                  </p>

                  {/* Comparative Contrast */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-sans border-t border-[#64104E]/25">
                    <div>
                      <span className="text-rose-400 font-mono font-bold block text-[10px] uppercase mb-1">
                        ✕ Conventional Approach
                      </span>
                      <span className="text-slate-400 leading-relaxed">{activeTheory.conventionalApproach}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400 font-mono font-bold block text-[10px] uppercase mb-1">
                        ✓ VortexAI Methodology
                      </span>
                      <span className="text-slate-200 leading-relaxed">{activeTheory.vortexaiMethodology}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
