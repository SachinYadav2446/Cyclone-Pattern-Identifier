import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, TrendingUp, BarChart3, Check, Filter, ShieldCheck, Zap } from 'lucide-react';

const stats = [
  { 
    value: '8.7 km', 
    label: 'Center Localization', 
    target: '< 30.0 km', 
    metric: 'Haversine Great-Circle', 
    gain: '+71% vs Baseline',
    progress: 71 
  },
  { 
    value: '4.8 kts', 
    label: 'Intensity Error (MAE)', 
    target: '< 7.5 kts', 
    metric: 'Mean Absolute Error', 
    gain: '+36% Accuracy Gain',
    progress: 64 
  },
  { 
    value: '88.4 km', 
    label: '24h Track Forecast', 
    target: '< 110.0 km', 
    metric: 'Mean Along-Track Error', 
    gain: '+20% Horizon Lead',
    progress: 58 
  },
  { 
    value: '0.78', 
    label: 'Rapid Intensification F1', 
    target: '≥ 0.75', 
    metric: 'Severe Imbalance Metric', 
    gain: 'High Event Recall',
    progress: 82 
  },
  { 
    value: '< 3.4 s', 
    label: 'Full Pipeline Latency', 
    target: '< 4.0 s', 
    metric: 'End-to-End GPU Ingestion', 
    gain: '90x Faster than Manual',
    progress: 92 
  },
];

const comparisons = [
  {
    category: 'speed',
    feature: 'Execution / Inference Latency',
    deepcyclone: '< 3.4s (Real-Time Autonomous Pass)',
    humanDvorak: '30 to 45 mins (Manual Image Inspection)',
    nwp: '4 to 6 hours (High-Performance Compute)',
    impact: 'Zero Decision Latency',
    badge: '90x FASTER',
    winner: 'deepcyclone',
  },
  {
    category: 'accuracy',
    feature: 'Center Pinpointing Precision',
    deepcyclone: '8.7 km (Sub-Pixel Keypoint Offset)',
    humanDvorak: '25 to 50 km (Subjective visual estimate)',
    nwp: '15 to 30 km (Coarse grid-bound cell)',
    impact: 'Pinpoint Evacuation Radar',
    badge: '8.7 km MAE',
    winner: 'deepcyclone',
  },
  {
    category: 'accuracy',
    feature: 'Nighttime & Obscured Tracking',
    deepcyclone: '24/7 Multi-Spectral (TIR-1, TIR-2 & WV)',
    humanDvorak: 'Degraded (Visible channels blind at night)',
    nwp: 'Physics extrapolation without raw observations',
    impact: 'Unbroken Night Ops',
    badge: '24/7 OPS',
    winner: 'deepcyclone',
  },
  {
    category: 'accuracy',
    feature: 'Rapid Intensification (RI) Alerting',
    deepcyclone: '0.78 F1 Score (Gradient-Boosted + SST / Shear)',
    humanDvorak: 'Reactive (Lagging satellite signature)',
    nwp: 'Frequently misses peak explosive bursts',
    impact: 'Early Warning Margin',
    badge: '0.78 F1',
    winner: 'deepcyclone',
  },
  {
    category: 'xai',
    feature: 'Scientific Interpretability (XAI)',
    deepcyclone: 'Grad-CAM Attention Heatmaps & Physics Grounding',
    humanDvorak: 'Subjective qualitative notes',
    nwp: 'Black-box Navier-Stokes fluid code',
    impact: 'Forecaster Trust & Audit',
    badge: 'GRAD-CAM',
    winner: 'deepcyclone',
  },
];

export default function BenchmarksSection() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredComparisons = selectedCategory === 'all'
    ? comparisons
    : comparisons.filter(c => c.category === selectedCategory);

  return (
    <section id="benchmarks" className="relative py-20 border-y border-[#64104E]/40 bg-[#08050c] text-white overflow-hidden">
      {/* Precision ambient background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-45 pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[450px] h-[450px] bg-[#64104E]/20 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tight text-white">
              Scientific Benchmark Verification.
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-sans">
              Rigorous empirical evaluation benchmarked across 35 years of held-out North Indian Ocean tropical cyclone best-track records and multi-agency consensus datasets.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3.5 py-1.5 bg-[#130b1c] border border-[#64104E]/50 text-slate-300 flex items-center gap-2 shadow-lg rounded-lg">
              <span className="w-2 h-2 rounded-full bg-[#E04A31] animate-pulse" />
              <span>AUDIT BENCHMARK: <strong className="text-white font-bold">NOAA IBTrACS v04r00</strong></span>
            </div>
          </div>
        </div>

        {/* Top 5 Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-10 font-mono">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              whileHover={{ y: -3, borderColor: '#E04A31' }}
              className="relative p-4 bg-[#120a1c] border border-[#64104E]/50 hover:border-[#E04A31] shadow-xl flex flex-col justify-between transition-all overflow-hidden group rounded-xl"
            >
              {/* Micro Corner Plus Marks */}
              <div className="absolute top-1.5 left-1.5 text-[8px] text-slate-600 select-none pointer-events-none">+</div>
              <div className="absolute top-1.5 right-1.5 text-[8px] text-slate-600 select-none pointer-events-none">+</div>

              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider truncate mb-1 font-semibold">
                  {s.label}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {s.value}
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] text-[#E04A31] font-bold bg-[#E04A31]/15 border border-[#E04A31]/30 px-2 py-0.5 rounded">
                  <TrendingUp className="w-2.5 h-2.5 text-[#E04A31]" />
                  <span>{s.gain}</span>
                </div>
              </div>

              {/* Progress Gauge Bar */}
              <div className="mt-4 pt-3 border-t border-[#64104E]/30 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-semibold">TARGET:</span>
                  <span className="text-[#C3864D] font-bold">{s.target}</span>
                </div>
                <div className="w-full h-1.5 bg-[#1b0f27] border border-[#64104E]/40 overflow-hidden rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${s.progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                    className="h-full bg-gradient-to-r from-[#E04A31] to-[#CF2F4B]"
                  />
                </div>
                <div className="text-[9px] text-slate-400 truncate pt-0.5">
                  {s.metric}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Side-by-Side Comparison Matrix Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="border border-[#64104E]/60 bg-[#120a1c] shadow-2xl overflow-hidden rounded-2xl"
        >
          {/* Terminal Header Bar */}
          <div className="p-3.5 sm:p-4 bg-[#0d0714] border-b border-[#64104E]/50 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-700" />
              <span className="w-2 h-2 rounded-full bg-[#B43067]" />
              <span className="w-2 h-2 rounded-full bg-[#E04A31]" />
              <span className="ml-1.5 font-bold text-white tracking-wider">
                CAPABILITY MATRIX: VORTEXAI vs LEGACY METHODS
              </span>
            </div>

            {/* Interactive Filter Pills */}
            <div className="flex items-center gap-1 bg-[#1a0f28] border border-[#64104E]/50 p-0.5 text-[11px] rounded-lg shadow-sm">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-0.5 transition-all rounded cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-[#E04A31] to-[#CF2F4B] text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ALL (5)
              </button>
              <button
                onClick={() => setSelectedCategory('accuracy')}
                className={`px-2.5 py-0.5 transition-all rounded cursor-pointer ${
                  selectedCategory === 'accuracy'
                    ? 'bg-gradient-to-r from-[#E04A31] to-[#CF2F4B] text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ACCURACY
              </button>
              <button
                onClick={() => setSelectedCategory('speed')}
                className={`px-2.5 py-0.5 transition-all rounded cursor-pointer ${
                  selectedCategory === 'speed'
                    ? 'bg-gradient-to-r from-[#E04A31] to-[#CF2F4B] text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                LATENCY
              </button>
              <button
                onClick={() => setSelectedCategory('xai')}
                className={`px-2.5 py-0.5 transition-all rounded cursor-pointer ${
                  selectedCategory === 'xai'
                    ? 'bg-gradient-to-r from-[#E04A31] to-[#CF2F4B] text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                XAI
              </button>
            </div>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#0a050f] border-b border-[#64104E]/50 text-[11px] text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-bold uppercase tracking-wider w-[24%]">
                    METEOROLOGICAL CAPABILITY
                  </th>
                  <th className="px-5 py-3 font-bold text-white bg-[#1c0e27]/90 border-x border-[#B43067]/40 w-[30%]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E04A31] animate-pulse" />
                        <span>vortexAI (OURS)</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#E04A31] text-white font-bold font-mono rounded shadow-xs">
                        SOTA
                      </span>
                    </div>
                  </th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider w-[23%] text-slate-400">
                    CLASSICAL HUMAN DVORAK
                  </th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider w-[23%] text-slate-400">
                    DYNAMICAL NWP (WRF/GFS)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#64104E]/30 text-slate-300">
                <AnimatePresence mode="popLayout">
                  {filteredComparisons.map((c, i) => (
                    <motion.tr 
                      key={c.feature}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="hover:bg-[#1a0f26]/60 transition-colors group"
                    >
                      <td className="px-5 py-3.5 font-sans font-medium text-white text-xs">
                        <div>{c.feature}</div>
                        <div className="font-mono text-[10px] text-[#C3864D] font-semibold mt-0.5">
                          ➔ {c.impact}
                        </div>
                      </td>

                      {/* vortexAI Column */}
                      <td className="px-5 py-3.5 font-bold text-white bg-[#1a0d24]/70 border-x border-[#B43067]/30 group-hover:bg-[#20102d]/80 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-[#E04A31] flex items-center justify-center text-white shrink-0 rounded shadow-[0_0_8px_#E04A31]">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                          <span className="leading-snug">{c.deepcyclone}</span>
                        </div>
                      </td>

                      {/* Human Dvorak Column */}
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px] leading-snug">
                        {c.humanDvorak}
                      </td>

                      {/* NWP Column */}
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px] leading-snug">
                        {c.nwp}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Table Footer Bar */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 font-mono text-[10px] text-slate-500 flex flex-wrap items-center justify-between gap-3">
            <span>AUDIT CONSENSUS: HELD-OUT 2014-2024 CYCLONE SEASONS BENCHMARKED AGAINST NOAA IBTRACS &amp; IMD ARCHIVES</span>
            <div className="flex items-center gap-2 text-orange-700 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
              <span>SUPERIOR BENCHMARK ACHIEVED ACROSS ALL 5 OPERATIONAL VECTORS</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
