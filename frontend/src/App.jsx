import React, { useState, Component } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import DatasetSection from './components/DatasetSection';
import PipelineSection from './components/PipelineSection';
import ModelArchitectureSection from './components/ModelArchitectureSection';
import DoctorModeSection from './components/DoctorModeSection';
import DisasterMatrixSection from './components/DisasterMatrixSection';
import BenchmarksSection from './components/BenchmarksSection';
import EyeLocalizationWorkbench from './components/EyeLocalizationWorkbench';
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

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] antialiased selection:bg-zinc-800 selection:text-white">
      {/* Top Navbar */}
      <Navbar 
        onOpenConsole={() => setIsConsoleOpen(true)} 
        onOpenDemo={() => setIsDemoGuideOpen(true)}
      />

      <ErrorBoundary>
        <main>
          {/* 1. Hero Section with Live Animated Radar & Active Storm Telemetry */}
          <HeroSection 
            onOpenConsole={() => setIsConsoleOpen(true)} 
            onOpenDemo={() => setIsDemoGuideOpen(true)}
          />

          {/* 2. Multi-Spectral Satellite Telemetry & Ground Truth Dataset */}
          <DatasetSection />

          {/* Interactive Eye Localization Workbench (CenterNet Keypoint & Sub-Pixel Regression) */}
          <EyeLocalizationWorkbench />

          {/* 3. End-to-End Operational Pipeline (The 4 Transformations) */}
          <PipelineSection />

          {/* 4. The 4 Scientific AI Pillars (CenterNet, ConvNeXt, ConvLSTM, XGBoost) */}
          <ModelArchitectureSection />

          {/* 5. Explainable AI: Doctor Mode (Interactive Grad-CAM Attention Audit) */}
          <DoctorModeSection />

          {/* 6. PostGIS Life-Safety & Coastal Evacuation Vulnerability Matrix */}
          <DisasterMatrixSection />

          {/* 7. Scientific Benchmark Verification (NOAA IBTrACS Gold Standard) */}
          <BenchmarksSection />
        </main>
      </ErrorBoundary>

      {/* Footer with BibTeX Citation & Documentation Links */}
      <Footer />

      {/* Interactive GIS Command Center Modal Simulation */}
      <GISConsoleModal
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
      />

      {/* 3-Act Live Audience Presentation & Demo Guide Modal */}
      <PresentationGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
      />
    </div>
  );
}
