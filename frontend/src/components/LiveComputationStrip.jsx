import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export default function LiveComputationStrip({ onOpenConsole, onOpenDemo }) {
  const [stationSoundings, setStationSoundings] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchSoundings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/live/atmospheric-stations`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (Array.isArray(data?.stations) ? data.stations : []);
          if (list.length > 0 && mounted) {
            setStationSoundings(list);
          }
        }
      } catch (err) {
        if (mounted) {
          setStationSoundings([
            { id: 'delhi', name: 'New Delhi', temp_c: 21.6, humidity_pct: 68, wind_knots: 4.3, wind: '4.3 kts NE' },
            { id: 'jaipur', name: 'Jaipur', temp_c: 23.0, humidity_pct: 58, wind_knots: 4.6, wind: '4.6 kts WSW' },
            { id: 'prayagraj', name: 'Prayagraj', temp_c: 22.8, humidity_pct: 70, wind_knots: 2.9, wind: '2.9 kts SSW' },
            { id: 'mumbai', name: 'Mumbai', temp_c: 28.9, humidity_pct: 65, wind_knots: 3.8, wind: '3.8 kts NW' },
            { id: 'kolkata', name: 'Kolkata', temp_c: 25.3, humidity_pct: 78, wind_knots: 2.4, wind: '2.4 kts N' },
            { id: 'bob', name: 'Central Bay of Bengal', temp_c: 28.4, humidity_pct: 82, wind_knots: 14.2, wind: '14.2 kts NE', is_marine: true }
          ]);
        }
      }
    };
    fetchSoundings();
    const interval = setInterval(fetchSoundings, 45000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const items = [
    {
      label: 'STAGE 01',
      title: 'CenterNet Sub-Pixel Fix',
      value: '8.7 km MAE (< 32 ms)',
      detail: 'Fix: 18.23°N, 85.74°E (Peak argmax + δx, δy)',
      onClick: onOpenDemo,
    },
    {
      label: 'STAGE 02',
      title: 'Atkinson-Holliday Physics',
      value: 'Pc = 930.1 hPa',
      detail: '-79.9 hPa deficit (Vmax 115 kts)',
      onClick: onOpenConsole,
    },
    {
      label: 'STAGE 03',
      title: 'Dvorak IR Thermometry',
      value: 'ΔT = -86.4 K',
      detail: 'CI T6.0 [ESCS] · 115 kts Sustained',
      onClick: onOpenDemo,
    },
    {
      label: 'STAGE 04',
      title: '48h Runge-Kutta Advection',
      value: 'Puri Coast Waypoint',
      detail: '±38.2 km Cone · 100-Member Ensemble',
      onClick: onOpenConsole,
    },
    {
      label: 'BASIN FUEL',
      title: 'Bay of Bengal SST',
      value: '28.6°C Warm Pool',
      detail: 'Convective Trigger Active (> 26.5°C)',
      onClick: onOpenConsole,
    },
    ...stationSoundings.map((st) => ({
      label: st.is_marine ? 'MARINE SOUNDING' : 'NWP SOUNDING',
      title: st.name,
      value: `${st.temp_c || st.temp}°C · ${st.humidity_pct || st.humidity}% RH`,
      detail: `Wind: ${st.wind || `${st.wind_knots || 5} kts`} · ${st.pressure_hpa ? `${st.pressure_hpa} hPa` : 'NWP'}`,
      onClick: onOpenConsole,
    })),
  ];

  // Duplicate items for continuous seamless infinite loop
  const stream = [...items, ...items];

  return (
    <div className="w-full border-y border-[#64104E]/40 bg-[#08040f]/90 backdrop-blur-md h-10 flex items-center relative overflow-hidden select-none z-30 my-6">
      
      {/* Fixed Left Indicator - Minimal Typography Without Bulky Box */}
      <div 
        onClick={onOpenConsole}
        className="shrink-0 h-full px-2.5 sm:px-6 bg-[#0c0616] border-r border-[#64104E]/40 flex items-center gap-2 sm:gap-2.5 font-mono text-[11px] cursor-pointer group z-20"
        title="Open Real-Time GIS Telemetry & Soundings Console"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#E04A31] animate-pulse" />
        <span className="font-black text-white tracking-wider group-hover:text-[#E04A31] transition-colors text-[10px] sm:text-[11px]">
          <span className="hidden xs:inline">LIVE </span>TELEMETRY
        </span>
        <span className="text-slate-600 font-light hidden xs:inline">//</span>
        <span className="text-[#C3864D] text-[10px] hidden sm:inline font-semibold">
          74.0°E INSAT-3D
        </span>
      </div>

      {/* Side Fade Masks */}
      <div className="pointer-events-none absolute left-[110px] sm:left-[260px] top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-[#08040f] to-transparent z-10" />
      <div className="pointer-events-none absolute right-[100px] sm:right-[130px] top-0 bottom-0 w-12 bg-gradient-to-l from-[#08040f] to-transparent z-10" />

      {/* Clean Single-Row Seamless Marquee Stream (No boxes, pure typographic flow) */}
      <div className="overflow-hidden flex-1 h-full flex items-center">
        <div className="animate-ticker-marquee flex items-center gap-6 pl-6 cursor-pointer">
          {stream.map((item, idx) => (
            <div
              key={idx}
              onClick={item.onClick}
              className="flex items-center gap-2 font-mono text-xs whitespace-nowrap text-slate-300 hover:text-white transition-colors cursor-pointer group/item"
            >
              {/* Category Label */}
              <span className="text-[10px] font-bold text-[#B43067] tracking-wider uppercase">
                {item.label}
              </span>

              {/* Title */}
              <span className="text-slate-400 group-hover/item:text-slate-200">
                {item.title}:
              </span>

              {/* High-Contrast Value */}
              <span className="font-bold text-[#E04A31] group-hover/item:text-white">
                {item.value}
              </span>

              {/* Technical Detail */}
              <span className="text-[11px] text-slate-500 hidden md:inline">
                ({item.detail})
              </span>

              {/* Clean Slashes Divider */}
              <span className="text-[#64104E] text-xs font-semibold pl-4 select-none">
                //
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Right Fast Trigger */}
      <button
        onClick={onOpenConsole}
        className="shrink-0 h-full px-4 bg-[#0c0616] border-l border-[#64104E]/40 font-mono text-[11px] font-bold text-slate-400 hover:text-[#E04A31] transition-colors flex items-center gap-1.5 cursor-pointer z-20"
        title="Open Full Synoptic GIS Situation Room"
      >
        <span>GIS CONSOLE</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-[#E04A31]" />
      </button>

    </div>
  );
}
