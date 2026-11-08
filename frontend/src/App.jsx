import React, { useState, useEffect, Component } from 'react';
import Navbar from './components/Navbar';
import LiveComputationStrip from './components/LiveComputationStrip';
import HeroSection from './components/HeroSection';
import DemoWorkbenchModal from './components/DemoWorkbenchModal';
import ResearchNoveltySection from './components/ResearchNoveltySection';
import PipelineSection from './components/PipelineSection';
import ModelArchitectureSection from './components/ModelArchitectureSection';
import DatasetSection from './components/DatasetSection';
import Footer from './components/Footer';
import GISConsoleModal from './components/GISConsoleModal';
import CycloneBulletinModal from './components/CycloneBulletinModal';
import NotificationCenterModal from './components/NotificationCenterModal';
import SatelliteTimelapsePlayer from './components/SatelliteTimelapsePlayer';

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
  const [unreadAlertCount, setUnreadAlertCount] = useState(2);
  const [isBulletinOpen, setIsBulletinOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeBulletinData, setActiveBulletinData] = useState(null);
  const [isTimelapseOpen, setIsTimelapseOpen] = useState(false);
  const [timelapseInitialSeq, setTimelapseInitialSeq] = useState('live_insat');
  const handleOpenTimelapse = (seqId) => { setTimelapseInitialSeq(seqId || 'live_insat'); setIsTimelapseOpen(true); };

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/notifications');
        if (res.ok) {
          const data = await res.json();
          setUnreadAlertCount(data.unread_count || 0);
        }
      } catch (e) {
        // quiet fallback
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);
  const [selectedWorkbenchStormId, setSelectedWorkbenchStormId] = useState('fani');
  const [livePassOverride, setLivePassOverride] = useState(null);

    const handleOpenBulletinForStorm = async (stormId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/forecast/wnc-ensemble/${stormId}`);
      if (res.ok) {
        const data = await res.json();
        const t0 = data.t0_analysis || {};
        const curWp = data.consensus_track?.[0] || {};
        setActiveBulletinData({
          stormName: data.storm_name || 'TROPICAL CYCLONE',
          bulletinId: `VORTEX-RSMC-${(data.storm_name || 'SYSTEM').toUpperCase().replace(/\s+/g, '-')}-20261107`,
          issueTime: new Date().toUTCString(),
          category: curWp.category_name || 'Severe Cyclonic Storm',
          eyeLat: t0.lat || 19.5,
          eyeLon: t0.lon || 85.8,
          mswKnots: t0.msw_kts || 65.0,
          mswKmh: Math.round((t0.msw_kts || 65.0) * 1.852),
          pressureHpa: t0.central_pressure_hpa || 980.0,
          pressureDeficit: Math.max(0, Math.round(1013.25 - (t0.central_pressure_hpa || 980.0))),
          dvorakT: 4.5,
          vortexStageName: 'Mature Cyclonic Eye Monitored',
          cyclogenesisRiskScore: 92.0,
          leadTimeToEye: 'Eye Formed & Monitored',
          recommendedAction: 'Maintain mandatory evacuation along coastal belt. Total suspension of marine operations.',
          imageSrc: '/images/TIR1_cyclone.png',
          waypoints: data.consensus_track || [],
          quadrantRadii: curWp.quadrant_wind_radii || null
        });
        setIsBulletinOpen(true);
      }
    } catch (e) {
      console.error('Bulletin error:', e);
    }
  };

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
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenTimelapse={handleOpenTimelapse}
        unreadCount={unreadAlertCount}
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

          {/* Real-Time Live Computation Telemetry Strip */}
          <LiveComputationStrip
            onOpenConsole={() => setIsConsoleOpen(true)}
            onOpenDemo={() => setIsDemoOpen(true)}
          />

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

            {/* Meteorological Alarm & Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onSelectStorm={(stormId) => {
          setSelectedWorkbenchStormId(stormId);
          setIsDemoOpen(true);
        }}
        onOpenBulletin={handleOpenBulletinForStorm}
        onOpenTimelapse={handleOpenTimelapse}
      />

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

            {/* Official White-Theme Cyclone Bulletin Modal (WMO/IMD Standard) */}
      <CycloneBulletinModal
        isOpen={isBulletinOpen}
        onClose={() => setIsBulletinOpen(false)}
        reportData={activeBulletinData}
      />

      {/* GIS Command Console Modal */}
      <GISConsoleModal
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        onOpenInWorkbench={handleOpenInWorkbench}
        onOpenTimelapse={handleOpenTimelapse}
      />


    
      {/* 4D Satellite Timelapse & Kinematics Loop Player */}
      <SatelliteTimelapsePlayer
        isOpen={isTimelapseOpen}
        onClose={() => setIsTimelapseOpen(false)}
        initialSequence={timelapseInitialSeq}
      />

    </div>
  );
}
