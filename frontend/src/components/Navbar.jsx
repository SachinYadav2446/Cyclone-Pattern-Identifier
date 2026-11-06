import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Menu, X, Upload, Radio, Sparkles } from 'lucide-react';

const navItems = [
  { id: 'novelty', label: 'Novelties' },
  { id: 'models', label: 'Architecture' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'dataset', label: 'Dataset' },
];

export default function Navbar({ onOpenConsole, onOpenDemo }) {
  const [activeSection, setActiveSection] = useState('novelty');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.id);
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const lastScrollY = lastScrollYRef.current;
          const diff = currentScrollY - lastScrollY;

          // Track whether user scrolled past the hero header baseline
          setIsScrolled(currentScrollY > 20);

          if (currentScrollY <= 60) {
            setIsVisible(true);
          } else if (diff > 6) {
            setIsVisible(false);
            setMobileMenuOpen(false);
          } else if (diff < -6) {
            setIsVisible(true);
          }
          lastScrollYRef.current = currentScrollY;

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
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    } ${
      isScrolled
        ? 'border-b border-[#64104E]/50 bg-[#08050c]/95 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.7)]'
        : 'border-b border-transparent bg-[#08050c] shadow-none'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4 relative">
        {/* Brand Logo - Shifted right with animated entrance */}
        <a href="#" className="flex items-center group shrink-0 pl-2 sm:pl-6 md:pl-8 z-10 animate-vortex-brand">
          <span className="font-black text-lg tracking-tight font-mono text-white group-hover:text-[#E04A31] transition-colors">
            vortex<span className="text-[#E04A31] drop-shadow-[0_0_10px_rgba(224,74,49,0.5)]">AI</span>
          </span>
        </a>

        {/* Desktop Nav Links - Clean Pill Capsule perfectly centered */}
        <nav className="hidden md:flex items-center gap-6 px-6 py-1.5 rounded-full border border-[#64104E]/50 bg-[#140b1e]/85 shadow-lg text-xs font-mono absolute left-1/2 -translate-x-1/2 z-10">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`relative py-0.5 transition-colors ${
                  isActive
                    ? 'text-[#E04A31] font-bold tracking-wide'
                    : 'text-slate-300 hover:text-white font-medium'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#E04A31] rounded-full shadow-[0_0_8px_#E04A31]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right CTA Actions - Sleek Pill Buttons matching wireframe */}
        <div className="flex items-center gap-2.5 font-mono">
          {/* Demo Pill (formerly Interactive Demo) */}
          <button
            onClick={onOpenDemo}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs bg-[#1a0f28] hover:bg-[#251538] text-slate-200 border border-[#B43067]/40 hover:border-[#B43067] font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            title="Launch Cyclone Inference & Localization Demo"
          >
            <Upload className="w-3.5 h-3.5 text-[#B43067]" />
            <span>Demo</span>
          </button>

          {/* GIS Console Pill without Arrow or gradient */}
          <button
            onClick={onOpenConsole}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#E04A31] hover:bg-[#CF2F4B] text-white shadow-[0_0_20px_rgba(224,74,49,0.35)] transition-all cursor-pointer active:scale-95"
            title="Launch Real-Time 4-Band Satellite GIS Mission Control"
          >
            <span>GIS Console</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg border border-[#64104E]/50 bg-[#140b1e] text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#64104E]/40 bg-[#0e0717]/98 px-4 py-3 space-y-1 font-mono text-xs shadow-2xl">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-2 rounded text-slate-300 hover:text-[#E04A31] hover:bg-[#64104E]/30 transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2.5 flex items-center gap-2 border-t border-[#64104E]/40">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemo();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#1a0f28] border border-[#B43067]/50 text-slate-200 font-bold text-xs"
            >
              <Upload className="w-3.5 h-3.5 text-[#B43067]" />
              <span>Demo</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConsole();
              }}
              className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-[#E04A31] to-[#CF2F4B] text-white text-xs font-bold flex items-center justify-center gap-2 shadow"
            >
              <Radio className="w-3.5 h-3.5 text-white" />
              <span>GIS Console</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
