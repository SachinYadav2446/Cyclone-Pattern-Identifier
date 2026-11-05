import React, { useState, useEffect, Component } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import DemoWorkbenchModal from './components/DemoWorkbenchModal';
import ResearchNoveltySection from './components/ResearchNoveltySection';
import PipelineSection from './components/PipelineSection';
import ModelArchitectureSection from './components/ModelArchitectureSection';
import DatasetSection from './components/DatasetSection';
import Footer from './components/Footer';
import GISConsoleModal from './components/GISConsoleModal';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 m-4 rounded border border-zinc-700 bg-zinc-950 text-zinc-300 font-mono text-xs">
          <div className="font-bold text-sm text-white mb-2">TELEMETRY MODULE RECOVERY</div>
          <div>Component error isolated: {this.state.error?.message}</div>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })} 
            className="mt-3 px-3 py-1 bg-white text-black font-semibold rounded hover:bg-zinc-200 transition-colors"
          >
            Retry Render
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [selectedWorkbenchStormId, setSelectedWorkbenchStormId] = useState('fani');
  const [livePassOverride, setLivePassOverride] = useState(null);

  const handleOpenInWorkbench = (liveData) => {
    setIsConsoleOpen(false);
    setSelectedWorkbenchStormId('live_insat');
    if (liveData) {
      setLivePassOverride(liveData);
    }
    setIsDemoOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#08050c] text-[#f8fafc] antialiased selection:bg-[#E04A31] selection:text-white relative">
      {/* Precision ambient background grid with deep thermal plum, coral and berry atmospheric lighting */}
      <div className="fixed inset-0 bg-grid-pattern opacity-45 pointer-events-none" />
      <div className="fixed top-1/2 left-1/4 w-[650px] h-[450px] bg-[#64104E]/20 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed top-3/4 -right-10 w-[450px] h-[450px] bg-[#E04A31]/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[400px] bg-[#B43067]/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-1/3 left-10 w-[450px] h-[450px] bg-[#C3864D]/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Navbar */}
      <Navbar 
        onOpenConsole={() => setIsConsoleOpen(true)} 
        onOpenDemo={() => setIsDemoOpen(true)}
      />

      <ErrorBoundary>
        <main>
          {/* 1. Hero Section: Overview of Research & Key Performance Targets */}
          <HeroSection 
            onOpenConsole={() => setIsConsoleOpen(true)} 
            onOpenDemo={() => setIsDemoOpen(true)}
          />

          {/* 2. Research Novelties & Methodological Breakthroughs (Horizontal Scroll Showcase) */}
          <ResearchNoveltySection />

          {/* 3. Deep Learning AI Architecture (CenterNet + ConvNeXt) */}
          <div id="models">
            <ModelArchitectureSection />
          </div>

          {/* 4. The 4-Step Operational Feature Cards Pipeline */}
          <div id="pipeline">
            <PipelineSection />
          </div>

          {/* 5. NOAA IBTrACS Ground Truth & Multi-Spectral Satellite Dataset */}
          <div id="dataset">
            <DatasetSection />
          </div>
        </main>
      </ErrorBoundary>

      {/* Footer with BibTeX Citation & Project Info */}
      <Footer />

      {/* Dedicated Interactive Cyclone Inference & Localization Demo Modal */}
      <DemoWorkbenchModal
        isOpen={isDemoOpen}
        onClose={() => {
          setIsDemoOpen(false);
          if (window.location.hash === '#demo') {
            history.replaceState(null, '', window.location.pathname);
          }
        }}
        onOpenConsole={() => {
          setIsDemoOpen(false);
          setIsConsoleOpen(true);
        }}
        externalStormId={selectedWorkbenchStormId}
        externalLiveData={livePassOverride}
        onSelectStormId={(id) => setSelectedWorkbenchStormId(id)}
      />

      {/* GIS Command Console Modal */}
      <GISConsoleModal
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        onOpenInWorkbench={handleOpenInWorkbench}
      />
    </div>
  );
}
