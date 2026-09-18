import React, { useState, useEffect } from 'react';
import { Satellite, Database, Eye, Radio, Layers, HardDrive, CheckCircle2 } from 'lucide-react';

// Spectral channels configuration
const spectralChannels = [
  {
    id: 'vis',
    name: 'Visible Optical (VIS)',
    wavelength: '0.65 µm',
    resolution: '1.0 km Sub-Kilometer',
    cadence: 'Daytime Scan Loop',
    tempRange: '0.0 to 100.0% Albedo',
    role: 'Sub-Pixel Convective Eye Structure & Texture',
    description:
      'High-resolution solar reflectance channel revealing microscale cloud shadows, stadium-effect eyewall slants, pinhole eyes, and intense mesovortices within the core during daytime satellite passes.',
    bands: 'Channel 1 · INSAT-3D Imager',
    calibMethod: 'Solar Zenith Normalized Bidirectional Reflectance',
    image: '/images/visible_cyclone_image.png',
  },
  {
    id: 'tir1',
    name: 'Thermal Infrared 1 (TIR-1)',
    wavelength: '10.8 µm',
    resolution: '4.0 km Spatial Resolution',
    cadence: '30-minute Rapid Scan',
    tempRange: '190 K to 325 K',
    role: 'Primary Dvorak Eye & Eyewall Thermometry',
    description:
      'Measures longwave infrared emission from storm convective cloud tops. Provides primary thermal contrast (ΔT) between the warm eye core and the freezing (-80°C) surrounding eyewall thunderstorms to compute real-time central pressure and sustained wind velocity.',
    bands: 'Channel 4 · INSAT-3D Imager',
    calibMethod: 'Planck Inverse Inversion via MOSDAC Lookup Calibration',
    image: '/images/TIR1_cyclone.png',
  },
  {
    id: 'tir2',
    name: 'Thermal Infrared 2 (TIR-2)',
    wavelength: '12.0 µm',
    resolution: '4.0 km Spatial Resolution',
    cadence: '30-minute Rapid Scan',
    tempRange: '195 K to 320 K',
    role: 'Split-Window Water Vapor Attenuation Correction',
    description:
      'Differing absorption characteristics between TIR-1 and TIR-2 isolate low-tropospheric water vapor attenuation. Used in differential brightness temperature matrices (TIR1 - TIR2) to eliminate false cloud edges and calibrate boundary layer moisture.',
    bands: 'Channel 5 · INSAT-3D Imager',
    calibMethod: 'Differential Split-Window Radiative Transfer (RTTOV)',
    image: '/images/TIR2_cyclone.png',
  },
  {
    id: 'wv',
    name: 'Water Vapor (WV)',
    wavelength: '6.9 µm',
    resolution: '8.0 km Spatial Resolution',
    cadence: '30-minute Rapid Scan',
    tempRange: '210 K to 280 K',
    role: 'Tropospheric Moisture Flux & Synoptic Steering',
    description:
      'Captures mid-to-upper atmospheric moisture motion (300 hPa to 600 hPa). Traces dry air intrusions that disrupt cyclone symmetry, while mapping synoptic jet stream channels that steer the cyclone along its 48-hour trajectory.',
    bands: 'Channel 3 · INSAT-3D Imager',
    calibMethod: 'Mid-Tropospheric Water Vapor Radiance Integration',
    image: '/images/WV_image.png',
  },
];

const groundTruthSources = [
  {
    name: 'ISRO MOSDAC Archive',
    source: 'INSAT-3D & INSAT-3DR Geostationary Imager',
    specs: 'Bay of Bengal & Arabian Sea (0°–35°N, 45°–100°E)',
    format: 'HDF5 / NetCDF4 Standard L1B Radiance',
    volume: '2014 – 2024 Cyclone Archive (10+ Years)',
  },
  {
    name: 'NOAA IBTrACS (v04r00)',
    source: 'International Best Track Archive for Climate Stewardship',
    specs: '3-hourly cyclone center (lat/lon), MSW, and pressure deficit',
    format: 'Standardized IMD / JTWC consensus best-track records',
    volume: '85+ North Indian Ocean Named Cyclonic Storms',
  },
  {
    name: 'ECMWF ERA5 Reanalysis',
    source: 'European Centre for Medium-Range Weather Forecasts',
    specs: 'Sea Surface Temp (SST), 850–200 hPa Vertical Wind Shear',
    format: '0.25° Gridded Atmospheric Single-Levels',
    volume: 'Coupled Environmental Reanalysis Ensembles',
  },
];

export default function DatasetSection() {
  const [selectedChannel, setSelectedChannel] = useState('vis');
  const [isPaused, setIsPaused] = useState(false);
  const activeChannel = spectralChannels.find(c => c.id === selectedChannel) || spectralChannels[0];

  // Auto-cycle loop across all 4 channels every 2 seconds (Visible -> TIR1 -> TIR2 -> WV -> Visible)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setSelectedChannel(prev => {
        const currentIndex = spectralChannels.findIndex(c => c.id === prev);
        const nextIndex = (currentIndex + 1) % spectralChannels.length;
        return spectralChannels[nextIndex].id;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <section id="dataset" className="py-16 border-b border-zinc-800/80 bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 mb-2">
              <Satellite className="w-3 h-3 text-zinc-300" />
              <span>EARTH OBSERVATION & SATELLITE TELEMETRY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Multi-Spectral Radiometer Ingestion.
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-2xl">
              Real-time geostationary payload channels from INSAT-3D/3DR calibrated to physical Kelvin via MOSDAC radiance tables and coupled with NOAA IBTrACS.
            </p>
          </div>

          <div className="mt-4 md:mt-0 font-mono text-[11px] text-zinc-400 flex items-center gap-3">
            <div>
              ORBIT: <span className="text-white font-bold">74°E Geostationary</span>
            </div>
            <div className="h-3 w-px bg-zinc-800" />
            <div>
              DOMAIN: <span className="text-white font-bold">0°–35°N, 45°–100°E</span>
            </div>
          </div>
        </div>

        {/* Distinct Layout: Split Horizontal Interactive Spectrum Console with Auto-Looping */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 items-stretch">
          {/* Left Column: Interactive Band Selector Stack */}
          <div className="lg:col-span-5 flex flex-col justify-between border-y border-zinc-800 py-1 divide-y divide-zinc-850">
            {spectralChannels.map((channel, idx) => {
              const isSelected = selectedChannel === channel.id;
              return (
                <button
                  key={channel.id}
                  onClick={() => {
                    setSelectedChannel(channel.id);
                  }}
                  className={`w-full py-3.5 px-3 text-left transition-all flex items-center justify-between group ${
                    isSelected ? 'bg-zinc-900/80 pl-4 border-l-2 border-white' : 'hover:bg-zinc-950/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-6 transition-colors rounded-full ${
                      isSelected ? 'bg-white' : 'bg-zinc-800 group-hover:bg-zinc-600'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-semibold tracking-tight ${
                          isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                        }`}>
                          {channel.name}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        {channel.wavelength} · {channel.resolution.split(' ')[0]}
                      </div>
                    </div>
                  </div>

                  <span className={`font-mono text-[10px] px-2 py-0.5 border ${
                    isSelected
                      ? 'border-white text-white font-bold bg-white/10'
                      : 'border-zinc-800 text-zinc-400 group-hover:border-zinc-700'
                  }`}>
                    {channel.id.toUpperCase()}
                  </span>
                </button>
              );
            })}

            {/* Loop status bar */}
            <div className="pt-2 px-3 flex items-center justify-between font-mono text-[10px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`} />
                <span>{isPaused ? 'CYCLE PAUSED (HOVER/CLICK)' : 'AUTO-CYCLE ACTIVE (2s)'}</span>
              </span>
              <span>INSAT-3D 4-BAND SEQUENCE</span>
            </div>
          </div>

          {/* Right Column: Clean Satellite Imagery with Sleek Bottom Hover Telemetry */}
          <div 
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="lg:col-span-7 bg-black border border-zinc-800 relative overflow-hidden group/box min-h-[460px] flex flex-col justify-end shadow-2xl cursor-pointer"
          >
            {/* Pure Satellite Imagery (100% visible, no dark scrims blocking it) */}
            <div className="absolute inset-0 bg-black overflow-hidden flex items-center justify-center">
              <img
                src={activeChannel.image}
                alt={activeChannel.name}
                className="w-full h-full object-cover object-center filter contrast-105 brightness-100 transition-transform duration-300 ease-out group-hover/box:scale-105"
              />
            </div>

            {/* Minimal Channel Pill Tag in Top-Left (Non-intrusive) */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-black/80 backdrop-blur-md border border-zinc-700/80 text-white font-mono text-xs font-semibold shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{activeChannel.name}</span>
              </div>
            </div>

            {/* Minimal Channel Code Tag in Top-Right */}
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
              <span className="font-mono text-[10px] px-2 py-1 bg-black/80 backdrop-blur-md border border-zinc-700/80 text-zinc-300 font-bold">
                {activeChannel.id.toUpperCase()}
              </span>
            </div>

            {/* Bottom Hover Telemetry Drawer (Tucked away, slides up cleanly on hover) */}
            <div className="relative z-10 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 transition-all duration-300 overflow-hidden">
              {/* Default Bar: Just role & hover cue */}
              <div className="px-4 py-2.5 flex items-center justify-between font-mono text-xs text-zinc-300">
                <span className="font-medium text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  {activeChannel.role}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  HOVER FOR TELEMETRY ↑
                </span>
              </div>

              {/* Full Description & Physics (Only revealed when hovered) */}
              <div className="px-4 pb-4 max-h-0 opacity-0 group-hover/box:max-h-80 group-hover/box:opacity-100 transition-all duration-300 space-y-3 pt-1">
                <p className="text-xs text-zinc-300 leading-relaxed font-sans border-t border-zinc-800/80 pt-2">
                  {activeChannel.description}
                </p>

                <div className="grid grid-cols-2 gap-3 font-mono text-[11px] pt-2 border-t border-zinc-800/80">
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">SENSOR</span>
                    <span className="text-zinc-200">{activeChannel.bands}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase">RANGE</span>
                    <span className="text-zinc-200">{activeChannel.tempRange}</span>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-400 font-mono bg-black/60 p-2 border border-zinc-800 truncate">
                  <span className="text-zinc-500 uppercase mr-1">CALIB:</span>
                  {activeChannel.calibMethod}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Architecture Table View instead of 3 generic cards */}
        <div className="border-t border-zinc-800 pt-10">
          <div className="mb-6 flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-400" />
            <h4 className="text-xs font-mono tracking-wider text-zinc-400 uppercase">
              DATA ARCHIVE & GROUND TRUTH REGISTRY
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            {groundTruthSources.map((gt, i) => (
              <div key={i} className="border-l-2 border-zinc-700 pl-4 py-1">
                <div className="text-white font-bold text-sm tracking-tight mb-0.5">{gt.name}</div>
                <div className="text-zinc-400 text-[11px] mb-3">{gt.source}</div>
                
                <div className="space-y-1.5 text-[11px] text-zinc-400">
                  <div>
                    <span className="text-zinc-400">COVERAGE: </span>
                    <span className="text-zinc-300">{gt.specs}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">FORMAT: </span>
                    <span className="text-zinc-300">{gt.format}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400">VOLUME: </span>
                    <span className="text-white">{gt.volume}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
