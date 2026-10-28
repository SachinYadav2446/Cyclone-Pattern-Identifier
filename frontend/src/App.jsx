import React, { useState, Component } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import EyeLocalizationWorkbench from './components/EyeLocalizationWorkbench';
import ResearchNoveltySection from './components/ResearchNoveltySection';
import PipelineSection from './components/PipelineSection';
import ModelArchitectureSection from './components/ModelArchitectureSection';
import DatasetSection from './components/DatasetSection';
import BenchmarksSection from './components/BenchmarksSection';
import Footer from './components/Footer';
import GISConsoleModal from './components/GISConsoleModal';
import PresentationGuideModal from './components/PresentationGuideModal';

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
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);
  const [selectedWorkbenchStormId, setSelectedWorkbenchStormId] = useState('fani');
  const [livePassOverride, setLivePassOverride] = useState(null);

  const handleOpenInWorkbench = (liveData) => {
    setIsConsoleOpen(false);
    setSelectedWorkbenchStormId('live_insat');
    if (liveData) {
      setLivePassOverride(liveData);
    }
    setTimeout(() => {
      const elem = document.getElementById('workbench');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] antialiased selection:bg-zinc-800 selection:text-white">
      {/* Top Navbar */}
      <Navbar 
        onOpenConsole={() => setIsConsoleOpen(true)} 
        onOpenDemo={() => setIsDemoGuideOpen(true)}
      />

      <ErrorBoundary>
        <main>
          {/* 1. Hero Section: Overview of Research & Key Performance Targets */}
          <HeroSection 
            onOpenConsole={() => setIsConsoleOpen(true)} 
            onOpenDemo={() => setIsDemoGuideOpen(true)}
          />

          {/* 2. Unified Live Cyclone Inference & Eye Localization Workbench (Presets + Upload) */}
          <EyeLocalizationWorkbench 
            externalStormId={selectedWorkbenchStormId}
            externalLiveData={livePassOverride}
            onSelectStormId={(id) => setSelectedWorkbenchStormId(id)}
          />

          {/* 3. Research Novelties & Methodological Breakthroughs (Horizontal Scroll Showcase) */}
          <ResearchNoveltySection />

          {/* 4. Deep Learning AI Architecture (CenterNet + ConvNeXt-V2) */}
          <div id="models">
            <ModelArchitectureSection />
          </div>

          {/* 5. The 4-Step Operational Feature Cards Pipeline */}
          <div id="pipeline">
            <PipelineSection />
          </div>

          {/* 5. NOAA IBTrACS Ground Truth & Multi-Spectral Satellite Dataset */}
          <div id="dataset">
            <DatasetSection />
          </div>

          {/* 6. Scientific Benchmark Verification & Examiner Defense Guide */}
          <div id="benchmarks">
            <BenchmarksSection />
          </div>
        </main>
      </ErrorBoundary>

      {/* Footer with BibTeX Citation & Project Info */}
      <Footer />

      {/* GIS Command Console Modal */}
      <GISConsoleModal
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        onOpenInWorkbench={handleOpenInWorkbench}
      />

      {/* 3-Act Presentation Walkthrough Modal */}
      <PresentationGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
      />
    </div>
  );
}
