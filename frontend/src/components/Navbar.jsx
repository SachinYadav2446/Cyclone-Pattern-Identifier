import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

const navItems = [
  { id: 'dataset', label: 'DATASET' },
  { id: 'pipeline', label: 'PIPELINE' },
  { id: 'models', label: 'MODELS' },
  { id: 'doctor-mode', label: 'XAI AUDIT', badge: 'GRAD-CAM' },
  { id: 'benchmarks', label: 'BENCHMARKS' },
];

export default function Navbar({ onOpenConsole }) {
  const [activeSection, setActiveSection] = useState('');

  // Scrollspy: dynamically highlight active section based on scroll position (throttled with rAF)
  useEffect(() => {
    const sectionIds = navItems.map((item) => item.id);
    let ticking = false;

    const updateActiveSection = () => {
      const scrollPosition = window.scrollY + 180; // Offset for sticky navbar height

      let newActive = '';
      if (window.scrollY >= 300) {
        for (let i = sectionIds.length - 1; i >= 0; i--) {
          const el = document.getElementById(sectionIds[i]);
          if (el && scrollPosition >= el.offsetTop) {
            newActive = sectionIds[i];
            break;
          }
        }
      }

      setActiveSection((prev) => (prev !== newActive ? newActive : prev));
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateActiveSection);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateActiveSection(); // Initial evaluation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-black/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-8 h-8 rounded border border-zinc-700 bg-zinc-900 group-hover:border-zinc-500 transition-colors">
            {/* Minimalist cyclone vortex eye */}
            <div 
              className="w-3.5 h-3.5 rounded-full border border-white/80 border-t-transparent animate-spin" 
              style={{ animationDuration: '4s' }} 
            />
            <div className="absolute w-1 h-1 rounded-full bg-white" />
          </div>
          <div className="flex items-baseline">
            <span className="font-semibold text-sm tracking-tight text-white font-sans">
              DeepCyclone
            </span>
          </div>
        </a>

        {/* Center Nav Links with Active Section Highlight */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-mono tracking-wide">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`relative py-1 transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 font-medium'
                }`}
              >
                {item.isLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                )}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded border font-mono transition-colors ${
                      isActive
                        ? 'border-zinc-500 text-zinc-200 bg-zinc-800'
                        : 'border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right CTA: Open Dedicated Full-Screen GIS & Satellite Command Console */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenConsole}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs rounded border border-emerald-500/70 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 hover:text-white transition-all font-mono tracking-wide shadow-xs active:scale-95 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>GIS &amp; SATELLITE CONSOLE</span>
          </button>
        </div>
      </div>
    </header>
  );
}
