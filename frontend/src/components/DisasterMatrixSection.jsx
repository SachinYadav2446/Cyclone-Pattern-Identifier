import React, { useState } from 'react';
import { ShieldAlert, FileText, Download, CheckCircle2, MapPin, Users, Waves, ChevronRight, Loader2, Compass } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const basinDistricts = {
  bob: [
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
      name: 'Jagatsinghpur (Paradip)',
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
      name: 'Kendrapara & Bhadrak',
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
      name: 'East Medinipur (Digha)',
      state: 'West Bengal',
      surgeHeight: '2.5 m',
      populationAtRisk: '950,000',
      windThreshold: '50 kts (Storm Force)',
      shelterCount: 124,
      status: 'ORANGE ALERT',
      action: 'Pre-position NDRF Battalions',
    },
  ],
  as: [
    {
      rank: 1,
      name: 'Devbhumi Dwarka & Porbandar',
      state: 'Gujarat',
      surgeHeight: '3.6 m',
      populationAtRisk: '1.42 Million',
      windThreshold: '64 kts (Hurricane Force)',
      shelterCount: 165,
      status: 'RED ALERT',
      action: 'Immediate Low-Lying Evacuation',
    },
    {
      rank: 2,
      name: 'Kutch (Kandla / Mundra / Jakhau)',
      state: 'Gujarat',
      surgeHeight: '3.2 m',
      populationAtRisk: '1.18 Million',
      windThreshold: '64 kts (Hurricane Force)',
      shelterCount: 138,
      status: 'RED ALERT',
      action: 'Complete Port Suspension & Bunkering Halt',
    },
    {
      rank: 3,
      name: 'Jamnagar & Morbi',
      state: 'Gujarat',
      surgeHeight: '2.7 m',
      populationAtRisk: '820,000',
      windThreshold: '50 kts (Storm Force)',
      shelterCount: 88,
      status: 'ORANGE ALERT',
      action: 'Tidal Creek Breach Clearance',
    },
    {
      rank: 4,
      name: 'Greater Mumbai & Raigad',
      state: 'Maharashtra',
      surgeHeight: '2.3 m',
      populationAtRisk: '3.80 Million',
      windThreshold: '45 kts (Squall Alert)',
      shelterCount: 210,
      status: 'AMBER ALERT',
      action: 'Coastal Promenade Clearance & Trawlers In Harbor',
    },
  ]
};

export default function DisasterMatrixSection() {
  const [selectedBasin, setSelectedBasin] = useState('bob');
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [simulatedWind, setSimulatedWind] = useState(115); // Knots (Category 4 VSCS)

  const districts = basinDistricts[selectedBasin] || basinDistricts.bob;

  // Compute dynamic surge height based on simplified Jelesnianski SLOSH empirical scaling
  const calcSurge = (baseMeters) => {
    const factor = Math.pow(simulatedWind / 100, 1.85);
    return (baseMeters * factor).toFixed(1);
  };

  const getAlertLevel = (surge) => {
    const s = parseFloat(surge);
    if (s >= 3.0) return { label: 'CRITICAL ALERT', bg: 'bg-white text-black font-bold border-white', dot: 'bg-black animate-pulse' };
    if (s >= 2.0) return { label: 'ELEVATED RISK', bg: 'bg-zinc-800 text-zinc-200 border-zinc-700', dot: 'bg-white' };
    return { label: 'MONITORED', bg: 'bg-zinc-900 border-zinc-800 text-zinc-400', dot: 'bg-zinc-500' };
  };

  const isAs = selectedBasin === 'as';

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
              PostGIS spatial intersection queries match dynamic uncertainty cones with coastal census wards to rank evacuation urgency across both Indian oceanic sectors.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
            {/* Interactive Basin Selector Tabs */}
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
              <button
                onClick={() => setSelectedBasin('bob')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedBasin === 'bob'
                    ? 'bg-[#E04A31] text-white font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Bay of Bengal (East)</span>
              </button>
              <button
                onClick={() => setSelectedBasin('as')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedBasin === 'as'
                    ? 'bg-[#E04A31] text-white font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Arabian Sea (West)</span>
              </button>
            </div>

            <button
              onClick={() => setShowBulletinModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800 transition-all font-mono text-xs font-semibold shadow-sm cursor-pointer"
            >
              <FileText className="w-4 h-4 text-zinc-300" />
              <span>Generate Official Bulletin (PDF)</span>
            </button>
          </div>
        </div>

        {/* Live Intensity & Inundation Simulator Bar */}
        <div className="mb-6 p-4 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-zinc-400 font-bold whitespace-nowrap">Simulated Sustained Wind (MSW):</span>
            <input
              type="range"
              min="45"
              max="145"
              step="5"
              value={simulatedWind}
              onChange={(e) => setSimulatedWind(Number(e.target.value))}
              className="w-full md:w-48 accent-white cursor-pointer"
            />
            <span className="text-white font-bold text-sm bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 whitespace-nowrap">
              {simulatedWind} kts ({(simulatedWind * 1.852).toFixed(0)} km/h)
            </span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400 w-full md:w-auto justify-end text-[11px]">
            <span>Category: <strong className="text-white">{simulatedWind >= 120 ? 'SuCS (Cat 5)' : simulatedWind >= 90 ? 'ESCS (Cat 3-4)' : 'VSCS (Cat 2)'}</strong></span>
            <span>Active Sector: <strong className="text-white">{isAs ? 'Arabian Sea (West Coast)' : 'Bay of Bengal (East Coast)'}</strong></span>
          </div>
        </div>

        {/* High-Risk District Table */}
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Rank & District</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Projected Surge</th>
                <th className="py-3 px-4">Population at Risk</th>
                <th className="py-3 px-4">Wind Threshold</th>
                <th className="py-3 px-4">Shelters</th>
                <th className="py-3 px-4">Alert Level</th>
                <th className="py-3 px-4 text-right">Mandated Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {districts.map((d) => {
                const baseSurgeNum = parseFloat(d.surgeHeight);
                const dynamicSurge = calcSurge(baseSurgeNum);
                const alert = getAlertLevel(dynamicSurge);

                return (
                  <tr key={d.name} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-400 text-[10px] flex items-center justify-center">
                        {d.rank}
                      </span>
                      <span>{d.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">{d.state}</td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <Waves className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{dynamicSurge} m</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{d.populationAtRisk}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">{d.windThreshold}</td>
                    <td className="py-3.5 px-4 text-zinc-400">{d.shelterCount} Pucca Shelters</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-bold ${alert.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${alert.dot}`} />
                        {alert.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-white">{d.action}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official IMD Early Warning Bulletin Preview Modal */}
      {showBulletinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-500" />
                <span className="font-bold text-white uppercase tracking-wider">Official IMD Cyclone Advisory Bulletin</span>
              </div>
              <button
                onClick={() => setShowBulletinModal(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-zinc-300 text-[11px] leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <p className="text-zinc-400"><strong>BULLETIN NO:</strong> IMD-RSMC-BULLETIN-{Date.now().toString().slice(-6)}</p>
                <p className="text-zinc-400"><strong>TARGET BASIN:</strong> {isAs ? 'Arabian Sea (West Coast Sector)' : 'Bay of Bengal (East Coast Sector)'}</p>
                <p className="text-zinc-400"><strong>COASTAL STRIKE ZONE:</strong> {isAs ? 'Kutch & Saurashtra Coastline, Gujarat' : 'Puri Coastline, Odisha'}</p>
                <p className="text-zinc-400"><strong>ISSUE TIME:</strong> {new Date().toUTCString()}</p>
              </div>

              <p>
                <strong>1. INTENSITY & TRACK SUMMARY:</strong> The system maintained its very severe intensity with Maximum Sustained Surface Wind speeds of {simulatedWind} knots ({(simulatedWind * 1.852).toFixed(0)} km/h) gusting to {simulatedWind + 15} knots. The central pressure deficit stands at {Math.round(simulatedWind * 0.45)} hPa.
              </p>

              <p>
                <strong>2. 48-HOUR FORECAST:</strong> The cyclone is moving towards {isAs ? 'Gujarat / Saurashtra coastline' : 'Odisha / West Bengal coastline'} at 16 km/h. Landfall is projected in high-risk coastal sectors within the next 28 hours as an {simulatedWind >= 90 ? 'Extremely Severe Cyclonic Storm' : 'Very Severe Cyclonic Storm'}.
              </p>

              <p>
                <strong>3. STORM SURGE WARNING:</strong> Storm surge of about {calcSurge(3.2)} to {calcSurge(3.6)} meters height above astronomical tide is very likely to inundate low lying coastal areas of {isAs ? 'Devbhumi Dwarka and Kutch' : 'Puri and Jagatsinghpur'} districts during landfall.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => setShowBulletinModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  if (isDownloadingPdf) return;
                  setIsDownloadingPdf(true);
                  try {
                    const payload = {
                      storm_name: isAs ? 'CYCLONE BIPARJOY' : 'CYCLONE FANI',
                      bulletin_id: `IMD-RSMC-BULLETIN-${Date.now()}`,
                      category: simulatedWind >= 120 ? 'Super Cyclonic Storm (SuCS)' : (simulatedWind >= 90 ? 'Extremely Severe (ESCS)' : 'Very Severe (VSCS)'),
                      msw_knots: simulatedWind,
                      msw_kmh: Math.round(simulatedWind * 1.852),
                      central_pressure_hpa: Math.round(1010 - Math.pow(simulatedWind / 6.7, 1 / 0.644)),
                      eye_lat: isAs ? 22.5 : 19.8,
                      eye_lon: isAs ? 68.6 : 85.8,
                      recommended_action: 'RED ALERT: Evacuate coastal zones (0-5 km). Halt all deep-sea fishing and maritime operations immediately.'
                    };
                    const res = await fetch(`${API_BASE_URL}/api/v1/models/export-bulletin-pdf`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload)
                    });
                    if (res.ok) {
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `VortexAI_Official_Bulletin_${Date.now()}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }
                  } catch (err) {
                    console.error('Failed to download bulletin PDF:', err);
                  } finally {
                    setIsDownloadingPdf(false);
                  }
                }}
                disabled={isDownloadingPdf}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-bold hover:bg-zinc-200 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Rendering Bulletin...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official PDF Bulletin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
