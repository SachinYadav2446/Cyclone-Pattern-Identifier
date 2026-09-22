import React, { useState, Component } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import DatasetSection from './components/DatasetSection';
import PipelineSection from './components/PipelineSection';
import ModelArchitectureSection from './components/ModelArchitectureSection';
import DoctorModeSection from './components/DoctorModeSection';
import BenchmarksSection from './components/BenchmarksSection';
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
        <div className="p-8 m-4 rounded border border-red-800 bg-red-950/40 text-red-200 font-mono text-xs">
          <div className="font-bold text-sm text-red-400 mb-2">TELEMETRY MODULE RECOVERY</div>
          <div>Component error isolated: {this.state.error?.message}</div>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })} 
            className="mt-3 px-3 py-1 bg-red-900 border border-red-700 text-white rounded"
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

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] antialiased selection:bg-zinc-800 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenConsole={() => setIsConsoleOpen(true)} />

      <ErrorBoundary>
        <main>
          {/* 1. Hero Section with Live Animated Radar & Active Storm Telemetry */}
          <HeroSection onOpenConsole={() => setIsConsoleOpen(true)} />

          {/* 2. Multi-Spectral Satellite Telemetry & Ground Truth Dataset */}
          <DatasetSection />

          {/* 3. End-to-End Operational Pipeline (The 4 Transformations) */}
          <PipelineSection />

          {/* 4. The 4 Scientific AI Pillars (CenterNet, ConvNeXt, ConvLSTM, XGBoost) */}
          <ModelArchitectureSection />

          {/* 5. Explainable AI: Doctor Mode (Interactive Grad-CAM Attention Audit) */}
          <DoctorModeSection />

          {/* 6. Scientific Benchmark Verification (NOAA IBTrACS Gold Standard) */}
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
    </div>
  );
}
