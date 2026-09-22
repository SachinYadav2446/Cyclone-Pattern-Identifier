import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Gauge, GitBranch, Zap, Binary, 
  Check, Cpu, ShieldCheck, Layers, Terminal, ChevronRight
} from 'lucide-react';

const models = [
  {
    id: 1,
    key: 'centernet',
    stepNum: 'STAGE 01 // 04',
    name: 'CenterNet Keypoint Locator',
    shortName: 'CenterNet',
    role: 'Vortex Eye Pinpointing',
    framework: 'PyTorch · ConvNeXt-Tiny + DCNv2',
    icon: Target,
    latency: '11.8 ms',
    memory: '1.2 GB VRAM',
    flops: '14.2 GFLOPs',
    benchmarkBadge: '8.7 km Haversine Error',
    inputTensor: '(B, 4, 512, 512) Multi-Spectral L1B',
    outputTensor: 'Heatmap (B, 1, 128, 128) + Offset (dx, dy)',
    loss: 'L_total = L_focal + 1.0·L_offset + 0.1·L_size',
    formula: 'Center = argmax(Heatmap) + (δx, δy) · Stride',
    handoff: 'Outputs stabilized 256×256 vortex center crop to Deep Dvorak',
    layers: [
      { name: '4-Channel Radiance Stem', shape: '512×512×4 ➔ 128×128×96', type: 'Stem Conv' },
      { name: 'ConvNeXt Inverted Bottlenecks', shape: 'Stage 1-4 Feature Hierarchy', type: 'Backbone' },
      { name: 'Deformable Conv (DCNv2)', shape: 'Spiral Rainband Deformable Sampling', type: 'Neck' },
      { name: 'Sub-Pixel Keypoint Head', shape: '128×128 Heatmap + Continuous Float (dx, dy)', type: 'Head' }
    ],
    details: [
      'Eliminates anchor box tuning and NMS computational bottlenecks',
      'Modified focal loss actively resolves 99.99% background ocean pixel imbalance',
      'Continuous sub-pixel float offsets restore exact geometric vortex coordinates',
      'Feeds eye-stabilized 256×256 radiance crop to downstream intensity models'
    ]
  },
  {
    id: 2,
    key: 'dvorak',
    stepNum: 'STAGE 02 // 04',
    name: 'Deep Dvorak ConvNeXt-V2',
    shortName: 'Deep Dvorak',
    role: 'Automated Intensity Estimation',
    framework: 'PyTorch · ConvNeXt-V2 + GRN',
    icon: Gauge,
    latency: '16.4 ms',
    memory: '1.6 GB VRAM',
    flops: '28.6 GFLOPs',
    benchmarkBadge: '4.8 kts MAE · 0.89 Kappa',
    inputTensor: '(B, 4, 256, 256) Eye-Centered Crop',
    outputTensor: 'MSW (kts), Central Pressure (hPa), 7 IMD Stages',
    loss: 'L_intensity = L_MSE(wind, pres) + 0.4·L_CE(category)',
    formula: 'ΔT = T_eye - T_eyewall ➔ MSW = W_reg · FeatureVector + b',
    handoff: 'Passes 1024-D spatial vortex embedding to ConvLSTM temporal queue',
    layers: [
      { name: 'Eye-Centered Radiance Stem', shape: '256×256×4 ➔ 64×64×128', type: 'Input Stem' },
      { name: '7×7 Depthwise Convolutions', shape: 'Broad Curvature Feature Extraction', type: 'Backbone' },
      { name: 'Global Response Normalization', shape: 'Suppresses Inter-Channel Redundancy', type: 'GRN Block' },
      { name: 'Dual Regression & Classifier', shape: 'Wind (kts) + Pressure (hPa) + 7 Classes', type: 'Multi-Head' }
    ],
    details: [
      '7×7 depthwise convolutions model broad spiral rainband curvature',
      'Automates Vernon Dvorak subjective gradient analysis (Warm Eye vs Cold Eyewall)',
      '1024-dimensional shared latent representation simultaneously outputs speed & pressure',
      'Trained on 10+ years of INSAT-3D radiances coupled with NOAA IBTrACS consensus'
    ]
  },
  {
    id: 3,
    key: 'convlstm',
    stepNum: 'STAGE 03 // 04',
    name: 'ConvLSTM Spatiotemporal Forecaster',
    shortName: 'ConvLSTM',
    role: '48-Hour Track Forecasting',
    framework: 'PyTorch · Recurrent 2D Convolutions',
    icon: GitBranch,
    latency: '22.1 ms',
    memory: '2.1 GB VRAM',
    flops: '44.8 GFLOPs',
    benchmarkBadge: '88.4 km 24h Track Error',
    inputTensor: '(B, 4, 4, 256, 256) 4 Sequential 6h Timesteps',
    outputTensor: '+6h, +12h, +24h, +48h Coordinates & Cone Polygons',
    loss: 'L_track = Σ Haversine(predicted_coords, true_coords)',
    formula: 'H_t = ConvLSTM(X_t, H_t-1) ➔ LinearDecoder(H_4)',
    handoff: 'Outputs kinematic steering momentum vectors to XGBoost ensemble',
    layers: [
      { name: 'Temporal Sequence Queue', shape: '4× (256×256×4) Past 24h Windows', type: 'Temporal In' },
      { name: 'Bidirectional Spatiotemporal Cells', shape: 'Hidden State H_t & Cell State C_t', type: 'Recurrent Conv' },
      { name: 'Vortex Kinematic Autoencoder', shape: 'Preserves Internal Gyre Angular Momentum', type: 'Bottleneck' },
      { name: 'Haversine Multi-Step Projector', shape: '+6h, +12h, +24h, +48h Lat/Lon Vectors', type: 'Decoder' }
    ],
    details: [
      '2D convolutions replace flat matrix ops, preserving vortex rotation across time',
      'Retains internal atmospheric steering momentum throughout monsoon transitions',
      'Computes expanding cone of uncertainty polygons (+12h, +24h, +48h)',
      'Automates PostGIS ST_Intersects district landfall alerts in < 4.0 seconds'
    ]
  },
  {
    id: 4,
    key: 'xgboost',
    stepNum: 'STAGE 04 // 04',
    name: 'XGBoost Rapid Intensification (RI)',
    shortName: 'XGBoost RI',
    role: 'Sudden Burst Warning',
    framework: 'XGBoost · Gradient Boosted Ensemble',
    icon: Zap,
    latency: '1.9 ms',
    memory: '120 MB RAM',
    flops: '0.04 GFLOPs',
    benchmarkBadge: '0.78 F1-Score · 0.91 AUC-ROC',
    inputTensor: '7 Tabular Environmental & Thermal Radiance Features',
    outputTensor: 'RI Event Probability: 0% to 100% (High Risk Alert)',
    loss: 'Second-Order Gradient Boosted Binary Logloss',
    formula: 'P(RI) = σ(Σ Trees(ΔT, SST, VWS, Coriolis, Div850))',
    handoff: 'Generates final coastal evacuation alert trigger for disaster authority',
    layers: [
      { name: 'Thermal & Dynamic Feature Fusion', shape: 'Cloud-Top Cooling + SST + Shear Vectors', type: 'Feature Store' },
      { name: 'Scale-Weight Gradient Boosters', shape: '250 Trees, Max Depth 6, Learning Rate 0.05', type: 'Tree Ensemble' },
      { name: 'Class Imbalance Calibrator', shape: '10:1 Scale-Pos-Weight Compensation', type: 'Weighting' },
      { name: 'Sigmoidal Probability Gate', shape: 'Binary RI Threshold Trigger (≥ 30 kts / 24h)', type: 'Output' }
    ],
    details: [
      'Identifies critical rapid intensification bursts (≥ 30 knots jump within 24 hours)',
      'Fuses multi-spectral cloud-top cooling rates with ECMWF ERA5 Sea Surface Temp',
      'scale_pos_weight parameter counteracts the extreme 10:1 class rarity imbalance',
      'Provides emergency response commanders with critical early evacuation lead time'
    ]
  }
];

export default function ModelArchitectureSection() {
  const [selectedModelId, setSelectedModelId] = useState(1);

  const activeModel = models.find(m => m.id === selectedModelId) || models[0];
  const ActiveIcon = activeModel.icon;

  return (
    <section 
      id="models" 
      className="relative py-20 border-b border-zinc-300/90 bg-[#f8fafc] text-zinc-900 overflow-hidden"
    >
      {/* Precision Blueprint Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Clean Section Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-white border border-zinc-300 text-[10px] font-mono text-zinc-700 shadow-xs mb-2.5">
            <Binary className="w-3.5 h-3.5 text-zinc-900" />
            <span>THE 4 SCIENTIFIC PILLARS · END-TO-END PIPELINE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-950">
            Modular Deep Learning Stack.
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed font-sans">
            Four specialized neural architectures chained into a synchronized meteorological pipeline.
          </p>
        </div>

        {/* 4 Pipeline Stages in One Clean Compact Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative mb-6">
          {models.map((m, idx) => {
            const isSelected = selectedModelId === m.id;
            const MIcon = m.icon;
            return (
              <div key={m.id} className="relative flex flex-col">
                <button
                  onClick={() => setSelectedModelId(m.id)}
                  className={`text-left px-3.5 py-2.5 transition-all relative border flex items-center justify-between gap-2.5 h-full group ${
                    isSelected
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-md ring-1 ring-zinc-900/10'
                      : 'bg-white text-zinc-900 border-zinc-200/90 hover:border-zinc-400 hover:bg-zinc-50 shadow-xs'
                  }`}
                >
                  {/* Left: Icon + Stage 0X + Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 flex items-center justify-center shrink-0 border transition-colors ${
                      isSelected 
                        ? 'bg-white text-zinc-950 border-white' 
                        : 'bg-zinc-100 text-zinc-800 border-zinc-300 group-hover:border-zinc-500'
                    }`}>
                      <MIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold ${
                          isSelected ? 'text-zinc-400' : 'text-zinc-500'
                        }`}>
                          0{m.id}
                        </span>
                        <span className={`text-xs font-bold truncate ${
                          isSelected ? 'text-white' : 'text-zinc-950'
                        }`}>
                          {m.name}
                        </span>
                      </div>
                      <div className={`text-[10px] truncate ${
                        isSelected ? 'text-zinc-400' : 'text-zinc-500'
                      }`}>
                        {m.role}
                      </div>
                    </div>
                  </div>

                  {/* Right: Latency badge */}
                  <div className="text-right shrink-0 font-mono text-[10px]">
                    <span className={`px-1.5 py-0.5 border text-[10px] ${
                      isSelected 
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-300' 
                        : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                    }`}>
                      {m.latency}
                    </span>
                  </div>

                  {/* Active Indicator Bar */}
                  {isSelected && (
                    <div className="absolute -bottom-[1px] inset-x-0 h-0.5 bg-gradient-to-r from-emerald-400 via-white to-emerald-400" />
                  )}
                </button>

                {/* Flow Connector Arrow to next stage (Desktop) */}
                {idx < models.length - 1 && (
                  <div className="hidden lg:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-5 h-5 bg-white border border-zinc-300 rounded-full text-zinc-600 shadow-xs">
                    <ChevronRight className="w-3 h-3 text-zinc-700" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detailed Architecture Inspection Bay for Selected Node */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModel.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="p-6 bg-white border border-zinc-300 shadow-sm relative"
          >
            {/* Model Title & Tags Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-zinc-950 text-white flex items-center justify-center font-bold shadow-xs">
                  <ActiveIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                    {activeModel.stepNum} · {activeModel.role}
                  </div>
                  <h3 className="text-xl font-bold text-zinc-950 tracking-tight">
                    {activeModel.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 bg-zinc-100 border border-zinc-300 text-zinc-800 text-[11px] font-medium">
                  {activeModel.framework}
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold text-[11px] flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{activeModel.benchmarkBadge}</span>
                </span>
              </div>
            </div>

            {/* Two-Column Deep Inspection Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-start">
              {/* Left Column: Layer Hierarchy Anatomy */}
              <div className="lg:col-span-6 space-y-4">
                <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-zinc-800" />
                  <span>NEURAL LAYER BREAKDOWN & TENSOR FLOW</span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {activeModel.layers.map((layer, lIdx) => (
                    <div 
                      key={lIdx}
                      className="p-3 bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3 hover:border-zinc-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] text-zinc-400 font-bold">0{lIdx + 1}</span>
                        <div>
                          <div className="text-zinc-950 font-semibold">{layer.name}</div>
                          <div className="text-[10px] text-zinc-500">{layer.type}</div>
                        </div>
                      </div>
                      <span className="text-[11px] text-zinc-800 bg-white px-2.5 py-0.5 border border-zinc-300 font-mono shadow-xs truncate max-w-[200px]">
                        {layer.shape}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-zinc-100 border border-zinc-300 font-mono text-xs flex items-center justify-between text-zinc-600">
                  <span className="font-semibold text-zinc-800 text-[10px]">DOWNSTREAM HANDOFF:</span>
                  <span className="text-zinc-950 text-right text-[11px] max-w-sm truncate">{activeModel.handoff}</span>
                </div>
              </div>

              {/* Right Column: Mathematical Formulation & Telemetry */}
              <div className="lg:col-span-6 space-y-4">
                <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-zinc-800" />
                  <span>MATHEMATICAL LOSS & HARDWARE FOOTPRINT</span>
                </div>

                {/* Math Formula Card */}
                <div className="p-4 bg-zinc-50 border border-zinc-200 font-mono text-xs space-y-3">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase font-semibold">OBJECTIVE LOSS FUNCTION:</div>
                    <code className="block mt-1 text-zinc-900 text-xs bg-white p-2.5 border border-zinc-300 shadow-xs font-semibold">
                      {activeModel.loss}
                    </code>
                  </div>

                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase font-semibold">MATHEMATICAL FORMULATION:</div>
                    <code className="block mt-1 text-zinc-800 text-xs bg-white p-2.5 border border-zinc-300 shadow-xs font-semibold">
                      {activeModel.formula}
                    </code>
                  </div>
                </div>

                {/* Hardware Profiler Matrix */}
                <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
                  <div className="p-2.5 bg-zinc-50 border border-zinc-200">
                    <div className="text-[9px] text-zinc-500 uppercase font-semibold">GPU LATENCY</div>
                    <div className="text-zinc-950 font-bold text-sm mt-0.5">{activeModel.latency}</div>
                    <div className="text-[9px] text-zinc-400">FP16 TensorRT</div>
                  </div>
                  <div className="p-2.5 bg-zinc-50 border border-zinc-200">
                    <div className="text-[9px] text-zinc-500 uppercase font-semibold">MEMORY VRAM</div>
                    <div className="text-zinc-950 font-bold text-sm mt-0.5">{activeModel.memory}</div>
                    <div className="text-[9px] text-zinc-400">Batch Size = 1</div>
                  </div>
                  <div className="p-2.5 bg-zinc-50 border border-zinc-200">
                    <div className="text-[9px] text-zinc-500 uppercase font-semibold">COMPUTE FLOPs</div>
                    <div className="text-zinc-950 font-bold text-sm mt-0.5">{activeModel.flops}</div>
                    <div className="text-[9px] text-zinc-400">Per Frame Pass</div>
                  </div>
                </div>

                {/* Scientific Highlights */}
                <div className="space-y-2">
                  {activeModel.details.slice(0, 2).map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 text-xs text-zinc-700 bg-zinc-50 border border-zinc-200 p-2.5 font-sans leading-relaxed">
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
