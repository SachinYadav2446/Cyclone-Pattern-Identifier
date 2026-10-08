import React, { useState, useEffect } from 'react';
import { Terminal, Menu, X, ShieldAlert, Cpu } from 'lucide-react';

const navItems = [
  { id: 'dataset', label: 'DATASET' },
  { id: 'eye-workbench', label: 'EYE LOCATOR', badge: 'CENTERNET' },
  { id: 'pipeline', label: 'PIPELINE' },
  { id: 'models', label: 'AI MODELS' },
  { id: 'doctor-mode', label: 'XAI AUDIT', badge: 'GRAD-CAM' },
  { id: 'disaster-matrix', label: 'DISASTER MATRIX', badge: 'SURGE' },
  { id: 'benchmarks', label: 'BENCHMARKS' },
];

export default function Navbar({ onOpenConsole, onOpenDemo }) {
  const [activeSection, setActiveSection] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scrollspy: dynamically highlight active section based on scroll position
  useEffect(() => {
    const sectionIds = navItems.map((item) => item.id);
    let ticking = false;

    const updateActiveSection = () => {
      const scrollPosition = window.scrollY + 180; // Offset for sticky navbar height

      let newActive = '';
      if (window.scrollY >= 200) {
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
    updateActiveSection();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Satellite Status */}
        <a href="#" className="flex items-center gap-3 group shrink-0">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-800 bg-zinc-950 group-hover:border-zinc-600 transition-colors shadow-xs">
            {/* Minimalist cyclone vortex eye */}
            <div 
              className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" 
              style={{ animationDuration: '3.5s' }} 
            />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white font-mono uppercase">
                DeepCyclone
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800">
                v2.0
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
              INSAT-3D / NOAA INTELLIGENCE
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-6 text-[11px] font-mono tracking-wider">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`relative py-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-zinc-400 hover:text-white font-medium'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[8px] px-1 py-0.5 rounded border font-mono transition-colors tracking-tight ${
                      isActive
                        ? 'border-zinc-700 text-white bg-zinc-800'
                        : 'border-zinc-800 text-zinc-500 bg-zinc-900/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Compact Nav Links for medium laptops (1024px - 1280px) */}
        <nav className="hidden md:flex xl:hidden items-center gap-4 text-[11px] font-mono">
          {navItems.slice(0, 5).map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`py-1 transition-all ${
                  isActive ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right CTA & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all font-mono tracking-wide shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span>DEMO MODE</span>
          </button>

          <button 
            onClick={onOpenConsole}
            className="flex items-center gap-2 px-3 sm:px-3.5 py-1.5 text-xs rounded-md border border-white bg-white hover:bg-zinc-200 text-black font-bold transition-all font-mono tracking-wide shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
            <Terminal className="w-3.5 h-3.5 text-black shrink-0" />
            <span className="hidden sm:inline">GIS COMMAND CONSOLE</span>
            <span className="sm:hidden">CONSOLE</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-[#09090b]/98 px-4 py-4 space-y-2 font-mono text-xs shadow-2xl">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-md hover:bg-zinc-900 text-zinc-300 hover:text-white transition-colors"
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
