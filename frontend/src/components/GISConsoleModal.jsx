import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Layers, Compass, Wind, Gauge, Navigation, AlertTriangle, Download } from 'lucide-react';

export default function GISConsoleModal({ isOpen, onClose }) {
  const [selectedChannel, setSelectedChannel] = useState('tir1');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStep, setCurrentStep] = useState(3); // 0: T-18h, 1: T-12h, 2: T-6h, 3: T0 (now), 4: +6h, 5: +12h, 6: +24h, 7: +48h
  const canvasRef = useRef(null);

  const timeLabels = ['T - 18h', 'T - 12h', 'T - 6h', 'T0 (NOW)', '+ 6h', '+ 12h', '+ 24h', '+ 48h'];

  // Auto time scrubbing when play is on
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % timeLabels.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, timeLabels.length]);

  // Canvas map rendering simulation
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);

    // Track points across time
    const trackPoints = [
      { x: width * 0.38, y: height * 0.78, label: 'T-18h', msw: 55 },
      { x: width * 0.44, y: height * 0.65, label: 'T-12h', msw: 65 },
      { x: width * 0.50, y: height * 0.52, label: 'T-6h', msw: 75 },
      { x: width * 0.56, y: height * 0.40, label: 'T0 (NOW)', msw: 85.4 },
      { x: width * 0.61, y: height * 0.31, label: '+6h', msw: 90 },
      { x: width * 0.66, y: height * 0.23, label: '+12h', msw: 95 },
      { x: width * 0.72, y: height * 0.15, label: '+24h', msw: 105 },
      { x: width * 0.79, y: height * 0.08, label: '+48h (LANDFALL)', msw: 65 },
    ];

    let particlePhase = 0;

    const render = () => {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Map Grid Lat/Lon lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Simulated Indian Coastline Boundary
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width * 0.15, height * 0.95);
      ctx.bezierCurveTo(width * 0.25, height * 0.7, width * 0.35, height * 0.45, width * 0.55, height * 0.25);
      ctx.bezierCurveTo(width * 0.65, height * 0.18, width * 0.75, height * 0.12, width * 0.95, height * 0.05);
      ctx.stroke();

      // Coastline text tag
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText('EAST COAST OF INDIA (ODISHA / AP)', width * 0.18, height * 0.5);
      ctx.fillText('BAY OF BENGAL BASIN', width * 0.65, height * 0.6);

      // 3. Draw Cone of Uncertainty Polygon
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(trackPoints[3].x, trackPoints[3].y);
      ctx.lineTo(trackPoints[7].x - 60, trackPoints[7].y - 20);
      ctx.lineTo(trackPoints[7].x + 60, trackPoints[7].y + 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. Draw Solid Past Track & Dashed Forecast Track
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(trackPoints[0].x, trackPoints[0].y);
      for (let i = 1; i <= 3; i++) {
        ctx.lineTo(trackPoints[i].x, trackPoints[i].y);
      }
      ctx.stroke();

      // Dashed forecast
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.moveTo(trackPoints[3].x, trackPoints[3].y);
      for (let i = 4; i < trackPoints.length; i++) {
        ctx.lineTo(trackPoints[i].x, trackPoints[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // 5. Draw Track Points
      trackPoints.forEach((pt, i) => {
        const isCurrent = i === currentStep;
        ctx.fillStyle = isCurrent ? '#ffffff' : i <= 3 ? '#a1a1aa' : '#52525b';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isCurrent ? 6 : 3.5, 0, 2 * Math.PI);
        ctx.fill();

        if (isCurrent) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 14, 0, 2 * Math.PI);
          ctx.stroke();
        }

        ctx.fillStyle = isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(pt.label, pt.x + 10, pt.y + 3);
      });

      // 6. Draw Animated Wind Streamlines around the active center
      particlePhase += 0.05;
      const curPt = trackPoints[currentStep];
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      for (let r = 25; r <= 85; r += 20) {
        ctx.beginPath();
        ctx.arc(curPt.x, curPt.y, r, particlePhase, particlePhase + Math.PI * 1.3);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 font-mono">
      <div className="w-full h-full max-w-7xl max-h-[92vh] rounded-2xl border border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden shadow-2xl">
        {/* Console Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            <span className="font-bold text-white text-sm tracking-wider">
              GIS OPERATIONAL COMMAND CENTER · DEEPCYCLONE
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
              TARGET: FANI-II
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setSelectedChannel('tir1')}
                className={`px-2.5 py-1 rounded ${
                  selectedChannel === 'tir1' ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                TIR-1 (10.8µm)
              </button>
              <button
                onClick={() => setSelectedChannel('wv')}
                className={`px-2.5 py-1 rounded ${
                  selectedChannel === 'wv' ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                WV (6.8µm)
              </button>
              <button
                onClick={() => setSelectedChannel('vis')}
                className={`px-2.5 py-1 rounded ${
                  selectedChannel === 'vis' ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Visible
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Canvas / Map Simulation */}
        <div className="flex-1 relative overflow-hidden bg-zinc-950">
          <canvas ref={canvasRef} className="w-full h-full" />

          {/* Floating Telemetry Inspector Box */}
          <div className="absolute top-4 left-4 p-4 rounded-xl bg-zinc-900/85 backdrop-blur-md border border-zinc-800 text-xs text-zinc-300 space-y-2 max-w-xs shadow-xl">
            <div className="flex items-center justify-between text-white font-bold border-b border-zinc-800 pb-2">
              <span>LIVE TELEMETRY FIX</span>
              <span className="text-[10px] text-zinc-400">{timeLabels[currentStep]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">LAT / LON:</span>
              <span className="text-white font-bold">15.86°N / 75.07°E</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">WIND SPEED:</span>
              <span className="text-white font-bold">85.4 kts (158 km/h)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">CATEGORY:</span>
              <span className="text-zinc-200 font-bold">Very Severe (VSCS)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">RI RISK (XGB):</span>
              <span className="text-white font-bold">82% (High Risk)</span>
            </div>
          </div>
        </div>

        {/* Timeline Scrubber Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <span className="text-xs text-zinc-400">TIMELINE SCRUBBER:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {timeLabels.map((lbl, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentStep(idx);
                  setIsPlaying(false);
                }}
                className={`px-3 py-1.5 rounded text-xs transition-all ${
                  currentStep === idx
                    ? 'bg-white text-zinc-950 font-bold shadow'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
