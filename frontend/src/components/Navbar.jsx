import React from 'react';
import { Terminal } from 'lucide-react';

export default function Navbar({ onOpenConsole }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-8 h-8 rounded border border-zinc-700 bg-zinc-900 group-hover:border-zinc-500 transition-colors">
            {/* Minimalist cyclone vortex eye */}
            <div className="w-3.5 h-3.5 rounded-full border border-white/80 border-t-transparent animate-spin" style={{ animationDuration: '4s' }} />
            <div className="absolute w-1 h-1 rounded-full bg-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm tracking-tight text-white font-sans">
              DeepCyclone
            </span>
            <span className="text-[10px] font-mono text-zinc-400 tracking-wider">
              v2.1
            </span>
          </div>
        </a>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-wide text-zinc-400">
          <a href="#dataset" className="hover:text-white transition-colors">DATASET</a>
          <a href="#pipeline" className="hover:text-white transition-colors">PIPELINE</a>
          <a href="#models" className="hover:text-white transition-colors">MODELS</a>
          <a href="#doctor-mode" className="hover:text-white transition-colors flex items-center gap-1.5">
            <span>XAI AUDIT</span>
            <span className="text-[9px] px-1 py-0.2 rounded border border-zinc-800 text-zinc-400 font-mono">GRAD-CAM</span>
          </a>
          <a href="#benchmarks" className="hover:text-white transition-colors">BENCHMARKS</a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenConsole}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white transition-all font-mono tracking-wide shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>GIS CONSOLE</span>
          </button>
        </div>
      </div>
    </header>
  );
}
