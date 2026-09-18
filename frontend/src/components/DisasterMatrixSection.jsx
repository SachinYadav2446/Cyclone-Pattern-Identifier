import React, { useState } from 'react';
import { ShieldAlert, FileText, Download, CheckCircle2, MapPin, Users, Waves, ChevronRight } from 'lucide-react';

const districts = [
  {
    rank: 1,
    name: 'Puri',
    state: 'Odisha',
    surgeHeight: '3.4 m',
    populationAtRisk: '1.24 Million',
    windThreshold: '64 kts (Hurricane Force)',
    shelterCount: 148,
    status: 'RED ALERT',
    action: 'Immediate Coastal Evacuation',
  },
  {
    rank: 2,
    name: 'Jagatsinghpur',
    state: 'Odisha',
    surgeHeight: '3.1 m',
    populationAtRisk: '890,000',
    windThreshold: '64 kts (Hurricane Force)',
    shelterCount: 112,
    status: 'RED ALERT',
    action: 'Total Port & Fishing Evacuation',
  },
  {
    rank: 3,
    name: 'Kendrapara',
    state: 'Odisha',
    surgeHeight: '2.8 m',
    populationAtRisk: '780,000',
    windThreshold: '50 kts (Storm Force)',
    shelterCount: 96,
    status: 'ORANGE ALERT',
    action: 'Low-Lying Island Clearance',
  },
  {
    rank: 4,
    name: 'Balasore',
    state: 'Odisha',
    surgeHeight: '2.4 m',
    populationAtRisk: '650,000',
    windThreshold: '50 kts (Storm Force)',
    shelterCount: 104,
    status: 'ORANGE ALERT',
    action: 'Pre-position NDRF Battalions',
  },
];

export default function DisasterMatrixSection() {
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [simulatedWind, setSimulatedWind] = useState(115); // Knots (Category 4 VSCS)

  // Compute dynamic surge height based on simplified Jelesnianski SLOSH empirical scaling
  // Base formula: Surge ~ C * (V_max / 100)^2 + tidal component
  const calcSurge = (baseMeters) => {
    const factor = Math.pow(simulatedWind / 100, 1.85);
    return (baseMeters * factor).toFixed(1);
  };

  const getAlertLevel = (surge) => {
    const s = parseFloat(surge);
    if (s >= 3.0) return { label: 'RED ALERT', bg: 'bg-red-950/40 border-red-500/40 text-red-300', dot: 'bg-red-400 animate-pulse' };
    if (s >= 2.0) return { label: 'ORANGE ALERT', bg: 'bg-amber-950/40 border-amber-500/40 text-amber-300', dot: 'bg-amber-400' };
    return { label: 'YELLOW WATCH', bg: 'bg-zinc-900 border-zinc-700 text-zinc-300', dot: 'bg-zinc-400' };
  };

  return (
    <section id="disaster-matrix" className="py-16 border-b border-zinc-800/80 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 mb-2">
              <ShieldAlert className="w-3 h-3 text-white" />
              <span>POSTGIS SPATIAL RISK & ACTIONABLE LIFE-SAFETY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              District Vulnerability & Landfall Matrix.
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 max-w-xl">
              PostGIS spatial intersection queries match dynamic uncertainty cones with coastal census wards to rank evacuation urgency.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <button
              onClick={() => setShowBulletinModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800 transition-all font-mono text-xs font-semibold shadow-sm"
            >
              <FileText className="w-4 h-4 text-zinc-300" />
              <span>Generate Official IMD Bulletin (PDF)</span>
            </button>
          </div>
        </div>

        {/* Live Intensity & Inundation Simulator Bar */}
        <div className="mb-6 p-4 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-white">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <div className="text-white font-bold flex items-center gap-2">
                <span>SIMULATED LANDFALL INTENSITY</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                  SLOSH-INUNDATION MODEL
                </span>
              </div>
              <div className="text-zinc-400 text-[11px]">
                Adjust maximum sustained wind to observe dynamic peak surge elevation.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-80">
            <span className="text-zinc-400 text-[11px] whitespace-nowrap">65 kts</span>
            <input
              type="range"
              min="65"
              max="145"
              step="5"
              value={simulatedWind}
              onChange={(e) => setSimulatedWind(Number(e.target.value))}
              className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <span className="text-zinc-400 text-[11px] whitespace-nowrap">145 kts</span>
            <div className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 text-white font-bold min-w-[70px] text-center">
              {simulatedWind} kts
            </div>
          </div>
        </div>

        {/* District Table Card */}
        <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-zinc-900/70 border-b border-zinc-800 text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">PRIORITY</th>
                  <th className="px-6 py-4 font-semibold">COASTAL DISTRICT</th>
                  <th className="px-6 py-4 font-semibold">PROJECTED SURGE</th>
                  <th className="px-6 py-4 font-semibold">STATUS LEVEL</th>
                  <th className="px-6 py-4 font-semibold">POPULATION AT RISK</th>
                  <th className="px-6 py-4 font-semibold">SHELTERS</th>
                  <th className="px-6 py-4 font-semibold">DIRECTIVE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {districts.map(d => {
                  const baseMeters = parseFloat(d.surgeHeight);
                  const dynamicSurge = calcSurge(baseMeters);
                  const alert = getAlertLevel(dynamicSurge);
                  return (
                    <tr key={d.rank} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center font-bold text-[11px]">
                          0{d.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-sans font-bold text-white text-sm">{d.name}</div>
                        <div className="text-[11px] text-zinc-400">{d.state}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          <span>{dynamicSurge} m</span>
                          <span className="text-[10px] text-zinc-400 font-normal">
                            ({(parseFloat(dynamicSurge) * 3.28084).toFixed(1)} ft)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-bold ${alert.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${alert.dot}`} />
                          {alert.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">{d.populationAtRisk}</td>
                      <td className="px-6 py-4 text-zinc-300">{d.shelterCount} Units</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-white font-sans text-xs">
                          {d.action}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Action Summary */}
          <div className="p-4 bg-zinc-900/40 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>SPATIAL INTERSECTION QUERY: ST_Intersects(predicted_cone, district_boundary) EXECUTED IN 6.4ms</span>
            </div>
            <div className="text-zinc-400">TOTAL EVACUATION TARGET: ~3.56M CITIZENS</div>
          </div>
        </div>

        {/* Modal: Simulated IMD PDF Bulletin Preview */}
        {showBulletinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl font-mono text-xs relative">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-white" />
                  <span className="font-bold text-white text-sm">
                    INDIA METEOROLOGICAL DEPARTMENT CYCLONE ADVISORY BULLETIN #14
                  </span>
                </div>
                <button
                  onClick={() => setShowBulletinModal(false)}
                  className="text-zinc-400 hover:text-white text-base px-2 py-0.5 rounded bg-zinc-900"
                >
                  ✕
                </button>
              </div>

              <div className="mt-5 space-y-4 text-zinc-300 font-sans text-xs leading-relaxed max-h-96 overflow-y-auto pr-2">
                <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800 font-mono text-[11px] text-zinc-300">
                  <div>ISSUED BY: NATIONAL CYCLONE WARNING CENTRE, NEW DELHI</div>
                  <div>OBSERVATION TIME: 06:00 UTC (11:30 IST)</div>
                  <div>STORM NAME: VERY SEVERE CYCLONIC STORM (VSCS) 'FANI-II'</div>
                  <div>CURRENT POSITION: LAT 15.86°N / LON 75.07°E</div>
                </div>

                <p>
                  <strong>1. INTENSITY & TRACK SUMMARY:</strong> The system maintained its very severe intensity with Maximum Sustained Surface Wind speeds of 85 knots (158 km/h) gusting to 95 knots. The central pressure deficit stands at 41 hPa.
                </p>

                <p>
                  <strong>2. 48-HOUR FORECAST:</strong> The cyclone is moving north-northeastwards at 16 km/h. Landfall is projected between Puri and Balasore (Odisha) within the next 28 hours as an Extremely Severe Cyclonic Storm.
                </p>

                <p>
                  <strong>3. STORM SURGE WARNING:</strong> Storm surge of about 3.0 to 3.5 meters height above astronomical tide is very likely to inundate low lying coastal areas of Puri and Jagatsinghpur districts during landfall.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  onClick={() => setShowBulletinModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert('Official IMD Bulletin PDF generated and streamed (ReportLab)!');
                    setShowBulletinModal(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-950 font-bold hover:bg-zinc-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
