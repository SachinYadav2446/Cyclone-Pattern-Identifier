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
    webp: '/images/visible_cyclone_image.webp',
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
    webp: '/images/TIR1_cyclone.webp',
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
    webp: '/images/TIR2_cyclone.webp',
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
    webp: '/images/WV_image.webp',
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
    <section id="dataset" className="py-16 border-b border-[#64104E]/40 bg-[#08050c] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              Multi-Spectral Radiometer Ingestion.
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl">
              Real-time geostationary payload channels from INSAT-3D/3DR calibrated to physical Kelvin via MOSDAC radiance tables and coupled with NOAA IBTrACS.
            </p>
          </div>

          <div className="mt-4 md:mt-0 font-mono text-[11px] text-slate-400 flex items-center gap-3">
            <div>
              ORBIT: <span className="text-[#C3864D] font-bold">74°E Geostationary</span>
            </div>
            <div className="h-3 w-px bg-[#64104E]/60" />
            <div>
              DOMAIN: <span className="text-[#C3864D] font-bold">0°–35°N, 45°–100°E</span>
            </div>
          </div>
        </div>

        {/* Split Horizontal Interactive Spectrum Console with Auto-Looping */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 items-stretch">
          {/* Left Column: Interactive Band Selector Stack */}
          <div className="lg:col-span-5 flex flex-col justify-between border border-[#64104E]/50 py-1 divide-y divide-[#64104E]/30 bg-[#120a1c] rounded-2xl overflow-hidden shadow-2xl">
            {spectralChannels.map((channel) => {
              const isSelected = selectedChannel === channel.id;

              return (
                <button
                  key={channel.id}
                  onClick={() => {
                    setSelectedChannel(channel.id);
                  }}
                  className={`w-full py-4 px-4 text-left transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected ? 'bg-[#241233]/90 pl-5 border-l-4 border-l-[#E04A31]' : 'hover:bg-[#1a0f26]/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-2 h-7 transition-all rounded-full ${
                      isSelected ? 'bg-[#E04A31] shadow-[0_0_8px_#E04A31]' : 'bg-[#64104E]/40 group-hover:bg-[#64104E]'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-bold tracking-tight ${
                          isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                        }`}>
                          {channel.name}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#E04A31] animate-ping" />
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        <span className={isSelected ? 'text-[#C3864D] font-bold' : 'text-slate-400'}>λ {channel.wavelength}</span>
                        <span className="mx-1.5 text-slate-600">·</span>
                        <span>{channel.resolution.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`font-mono text-[10px] px-2.5 py-0.5 border rounded-md ${
                    isSelected
                      ? 'border-[#E04A31] text-white font-bold bg-[#E04A31] shadow-xs'
                      : 'border-[#64104E]/50 text-slate-400 group-hover:border-[#B43067]/60'
                  }`}>
                    {channel.id.toUpperCase()}
                  </span>
                </button>
              );
            })}

            {/* Loop status bar */}
            <div className="pt-2 px-3 flex items-center justify-between font-mono text-[10px] text-slate-400 bg-[#0a050f]">
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-slate-600' : 'bg-[#E04A31] animate-ping'}`} />
                <span>{isPaused ? 'CYCLE PAUSED (HOVER/CLICK)' : 'AUTO-CYCLE ACTIVE (2s)'}</span>
              </span>
              <span className="text-[#C3864D] font-bold">INSAT-3D 4-BAND SEQUENCE</span>
            </div>
          </div>

          {/* Right Column: Clean Satellite Imagery with Sleek Bottom Hover Telemetry */}
          <div 
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="lg:col-span-7 bg-[#020104] border border-[#64104E]/60 rounded-2xl relative overflow-hidden group/box min-h-[280px] sm:min-h-[460px] flex flex-col justify-end shadow-2xl cursor-pointer"
          >
            {/* Pure Satellite Imagery */}
            <div className="absolute inset-0 bg-[#020408] overflow-hidden flex items-center justify-center">
              <picture className="w-full h-full select-none">
                {activeChannel.webp && (
                  <source srcSet={activeChannel.webp} type="image/webp" />
                )}
                <img
                  src={activeChannel.image}
                  alt={activeChannel.name}
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    if (e.currentTarget.src !== activeChannel.image) {
                      e.currentTarget.src = activeChannel.image;
                    }
                  }}
                  className="w-full h-full object-cover object-center filter contrast-105 brightness-100 transition-transform duration-300 ease-out group-hover/box:scale-105"
                />
              </picture>
            </div>

            {/* Minimal Channel Pill Tag in Top-Left */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#0d0714]/90 backdrop-blur-md border border-[#64104E]/80 text-white font-mono text-xs font-semibold shadow-lg rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E04A31] animate-pulse shadow-[0_0_6px_#E04A31]" />
                <span>{activeChannel.name}</span>
              </div>
            </div>

            {/* Minimal Channel Code Tag in Top-Right */}
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
              <span className="font-mono text-[10px] px-2 py-1 bg-[#0d0714]/90 backdrop-blur-md border border-[#B43067]/60 text-[#fbcfe8] font-bold rounded-lg">
                {activeChannel.id.toUpperCase()}
              </span>
            </div>

            {/* Bottom Hover Telemetry Drawer in Theme Glass Styling */}
            <div className="relative z-10 bg-[#0c0714]/95 backdrop-blur-xl border-t border-[#64104E]/80 transition-all duration-300 overflow-hidden text-slate-200 shadow-2xl">
              {/* Default Bar */}
              <div className="px-4 py-2.5 flex items-center justify-between font-mono text-xs text-slate-200">
                <span className="font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E04A31] shadow-[0_0_8px_#E04A31]" />
                  {activeChannel.role}
                </span>
                <span className="text-[10px] text-[#C3864D] font-mono font-bold tracking-wider">
                  HOVER FOR TELEMETRY ↑
                </span>
              </div>

              {/* Full Description & Physics */}
              <div className="px-4 pb-4 max-h-0 opacity-0 group-hover/box:max-h-80 group-hover/box:opacity-100 transition-all duration-300 space-y-3 pt-1">
                <p className="text-xs text-slate-300 leading-relaxed font-sans border-t border-[#64104E]/50 pt-2.5">
                  {activeChannel.description}
                </p>

                <div className="grid grid-cols-2 gap-3 font-mono text-[11px] pt-2.5 border-t border-[#64104E]/50">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-semibold tracking-wider">SENSOR</span>
                    <span className="text-white font-bold">{activeChannel.bands}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-semibold tracking-wider">RANGE</span>
                    <span className="text-white font-bold">{activeChannel.tempRange}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-300 font-mono bg-[#140a1d] p-2.5 border border-[#64104E]/60 truncate rounded-xl shadow-inner">
                  <span className="text-[#E04A31] uppercase mr-1.5 font-bold">CALIB:</span>
                  {activeChannel.calibMethod}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Architecture Table View */}
        <div className="border-t border-[#64104E]/40 pt-10">
          <div className="mb-6 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#E04A31]" />
            <h4 className="text-xs font-mono tracking-wider text-slate-400 uppercase font-bold">
              DATA ARCHIVE &amp; GROUND TRUTH REGISTRY
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            {groundTruthSources.map((gt, i) => (
              <div key={i} className="border-l-2 border-[#E04A31] pl-4 py-1">
                <div className="text-white font-bold text-sm tracking-tight mb-0.5">{gt.name}</div>
                <div className="text-[#C3864D] text-[11px] mb-3 font-semibold">{gt.source}</div>
                
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-500 font-medium">COVERAGE: </span>
                    <span className="text-slate-200 font-semibold">{gt.specs}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">FORMAT: </span>
                    <span className="text-slate-200 font-semibold">{gt.format}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">VOLUME: </span>
                    <span className="text-white font-bold">{gt.volume}</span>
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
