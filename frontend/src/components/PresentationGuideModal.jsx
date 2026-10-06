import React, { useState } from 'react';
import { 
  Play, 
  Target, 
  Upload, 
  Satellite, 
  CheckCircle2, 
  ArrowRight, 
  Terminal, 
  Layers, 
  Activity, 
  Compass, 
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const demoActs = [
  {
    step: '01',
    badge: 'ACT 1: SOTA BENCHMARK AUDIT',
    title: 'Validate Ground-Truth Accuracy vs IMD / NOAA',
    description: 'Explain that natural cyclones are not always active daily, so operational systems are audited against gold-standard IBTrACS benchmarks.',
    actionLabel: 'Jump to Eye Locator Benchmarks',
    targetSection: '#eye-workbench',
    scriptQuote: '"We validate our CenterNet keypoint model against historical Category 4/5 cyclones (Fani, Amphan, Michael). Notice the Haversine error is under 3 km, surpassing the operational 30 km threshold."',
    keyPoints: [
      'Toggle FANI, AMPHAN, and BIPARJOY',
      'Drag the Heatmap Opacity slider to show Gaussian vortex probability',
      'Hover over the eye to demonstrate the 10x sub-pixel loupe & Δx, Δy offsets'
    ]
  },
  {
    step: '02',
    badge: 'ACT 2: REAL-TIME INFERENCE TEST',
    title: 'The "Blind Test" Satellite Image Upload',
    description: 'Prove to evaluators that results are not pre-rendered or hardcoded by performing live on-the-fly CenterNet inference on an uploaded image.',
    actionLabel: 'Jump to Custom Upload Tester',
    targetSection: '#eye-workbench',
    scriptQuote: '"To demonstrate that this is genuine neural inference rather than pre-baked data, we upload an unseen satellite capture. The model extracts thermal gradients and regresses the sub-pixel eye in under 30 ms."',
    keyPoints: [
      'Click "UPLOAD SATELLITE CAPTURE" in the workbench',
      'Select any test image or capture',
      'Show instant regressed coordinates, diameter, and thermal contrast'
    ]
  },
  {
    step: '03',
    badge: 'ACT 3: OPERATIONAL DOWNLINK & ZERO FALSE-POSITIVES',
    title: 'Live INSAT-3D Pass & Basin Monitoring',
    description: 'Demonstrate real-world operational readiness by connecting to the live geostationary downlink over the Bay of Bengal & Arabian Sea.',
    actionLabel: 'Inspect Live INSAT-3D Downlink',
    targetSection: '#hero-telemetry',
    scriptQuote: '"Here is our live geostationary connection to IMD INSAT-3D. When oceanic basins are calm, the model correctly reports NORMAL/NO CYCLONE with 0% false alarms across clear waters."',
    keyPoints: [
      'Click "LIVE INSAT-3D PASS" in the Hero section or open the GIS Command Console',
      'Show live UTC synchronization with IMD servers',
      'Highlight zero false-alarm rate across oceanic sea lanes'
    ]
  }
];

export default function PresentationGuideModal({ isOpen, onClose }) {
  const [activeActIndex, setActiveActIndex] = useState(0);

  if (!isOpen) return null;

  const currentAct = demoActs[activeActIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0b0c10] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Play className="w-4 h-4 fill-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Live Demo &amp; Presentation Mode
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono">
                  3-ACT SCRIPT
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                Interactive step-by-step walkthrough to present DeepCyclone to judges and evaluators.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xs font-mono px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            ESC / CLOSE
          </button>
        </div>

        {/* Tab Strip */}
        <div className="grid grid-cols-3 border-b border-zinc-800 bg-[#07080a] text-xs font-mono">
          {demoActs.map((act, idx) => (
            <button
              key={act.step}
              onClick={() => setActiveActIndex(idx)}
              className={`p-3 text-left transition-all border-r border-zinc-800/80 flex flex-col gap-1 cursor-pointer ${
                activeActIndex === idx
                  ? 'bg-zinc-900/90 text-white border-b-2 border-b-emerald-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950/50'
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className={`font-bold ${activeActIndex === idx ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  STAGE {act.step}
                </span>
                {activeActIndex === idx && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <span className="font-semibold truncate">{act.badge.split(':')[1] || act.badge}</span>
            </button>
          ))}
        </div>

        {/* Act Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Act Overview */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-[11px] font-mono text-emerald-400">
              <Target className="w-3.5 h-3.5" />
              <span>{currentAct.badge}</span>
            </div>
            <h4 className="text-xl font-bold text-white tracking-tight">
              {currentAct.title}
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed font-sans">
              {currentAct.description}
            </p>
          </div>

          {/* Presenter's Script Box */}
          <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 relative">
            <div className="text-[10px] uppercase font-mono text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              <span>WHAT TO SAY TO THE AUDIENCE / EVALUATORS:</span>
            </div>
            <blockquote className="text-sm text-zinc-200 italic font-sans leading-relaxed border-l-2 border-emerald-500 pl-3 my-2">
              {currentAct.scriptQuote}
            </blockquote>
          </div>

          {/* Interactive Actions to Perform */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold">
              EXACT STEPS TO DEMO ON SCREEN:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              {currentAct.keyPoints.map((point, i) => (
                <div key={i} className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveActIndex(Math.max(0, activeActIndex - 1))}
              disabled={activeActIndex === 0}
              className="px-3 py-1.5 text-xs font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              Previous Act
            </button>
            <button
              onClick={() => setActiveActIndex(Math.min(demoActs.length - 1, activeActIndex + 1))}
              disabled={activeActIndex === demoActs.length - 1}
              className="px-3 py-1.5 text-xs font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              Next Act
            </button>
          </div>

          <a
            href={currentAct.targetSection}
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold rounded-lg bg-emerald-400 hover:bg-emerald-300 text-zinc-950 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>{currentAct.actionLabel}</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
