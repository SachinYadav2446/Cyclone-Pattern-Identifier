import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Menu, X, Upload } from 'lucide-react';

const navItems = [
  { id: 'workbench', label: 'Workbench' },
  { id: 'novelty', label: 'Novelties' },
  { id: 'models', label: 'Architecture' },
  { id: 'pipeline', label: 'Features' },
  { id: 'dataset', label: 'Dataset' },
  { id: 'benchmarks', label: 'Benchmarks' },
];

export default function Navbar({ onOpenConsole, onOpenDemo }) {
  const [activeSection, setActiveSection] = useState('workbench');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  // Auto-hide navbar on scroll down, reveal on scroll up + Scrollspy
  useEffect(() => {
    const sectionIds = navItems.map((item) => item.id);
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          // 1. Show/hide logic
          const lastScrollY = lastScrollYRef.current;
          const diff = currentScrollY - lastScrollY;

          if (currentScrollY <= 60) {
            // At the top of page, always show
            setIsVisible(true);
          } else if (diff > 6) {
            // Scrolling down -> hide navbar
            setIsVisible(false);
            setMobileMenuOpen(false);
          } else if (diff < -6) {
            // Scrolling up -> reveal navbar
            setIsVisible(true);
          }
          lastScrollYRef.current = currentScrollY;

          // 2. Scrollspy active section
          const scrollPosition = currentScrollY + 140;
          let newActive = '';
          if (currentScrollY >= 200) {
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
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-black/90 backdrop-blur-md transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand Logo - Minimal and clean */}
        <a href="#" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative flex items-center justify-center w-7 h-7 rounded border border-zinc-800 bg-zinc-950 group-hover:border-zinc-600 transition-colors">
            <div 
              className="w-3.5 h-3.5 rounded-full border border-white border-t-transparent animate-spin" 
              style={{ animationDuration: '3.5s' }} 
            />
            <div className="absolute w-1 h-1 rounded-full bg-white shadow-[0_0_4px_#ffffff]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-white font-mono">
              DeepCyclone
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-mono text-zinc-400 border border-zinc-800 bg-zinc-900/60">
              v2.0
            </span>
          </div>
        </a>

        {/* Desktop Nav Links - Clean without noisy badges */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`relative py-1 transition-colors ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-3.5 left-0 right-0 h-0.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right CTA Actions - Compact and uncluttered */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenConsole}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-300 hover:text-white transition-colors font-mono cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>GIS Console</span>
          </button>

          <a
            href="#workbench"
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-white hover:bg-zinc-200 text-black font-semibold transition-colors font-mono cursor-pointer"
          >
            <Upload className="w-3 h-3 text-black" />
            <span>Upload</span>
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-black/98 px-4 py-3 space-y-1 font-mono text-xs shadow-2xl">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-2 text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 flex items-center gap-2 border-t border-zinc-850">
            <a
              href="#workbench"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white text-black font-semibold text-xs"
            >
              <Upload className="w-3 h-3" />
              <span>Upload Pass</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConsole();
              }}
              className="py-1.5 px-3 border border-zinc-800 bg-zinc-950 text-zinc-300 text-xs flex items-center gap-1.5"
            >
              <Terminal className="w-3 h-3" />
              <span>GIS Console</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
