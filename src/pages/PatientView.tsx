import { useState, useEffect } from 'react';
import { HeartPulse, ArrowLeft, History, Flag, Eye, Clock, ShieldCheck } from 'lucide-react';
import { fetchPatientAccessHistory, reportMisuse } from '@/lib/auth';
import { mockPatients } from '@/lib/mockData';
import type { AccessHistoryEntry } from '@/types';

interface PatientViewProps {
  onNavigate: (page: string) => void;
}

export default function PatientView({ onNavigate }: PatientViewProps) {
  const [selectedAbha, setSelectedAbha] = useState(mockPatients[0].abhaId);
  const [history, setHistory] = useState<AccessHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState<string | null>(null);

  const patient = mockPatients.find((p) => p.abhaId === selectedAbha)!;

  useEffect(() => {
    setLoading(true);
    fetchPatientAccessHistory(selectedAbha).then((data) => {
      setHistory(data);
      setLoading(false);
    });
  }, [selectedAbha]);

  const handleReport = async (entryId: string) => {
    setReporting(entryId);
    try {
      await reportMisuse(entryId);
      setHistory((prev) => prev.map((e) => e.id === entryId ? { ...e, reported: true } : e));
    } catch {
      // ignore for demo
    }
    setReporting(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('landing')} className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
                <HeartPulse className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">CareSync</span>
            </div>
            <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs font-medium rounded-full">Patient View</span>
          </div>
          <button onClick={() => onNavigate('landing')} className="text-sm text-slate-500 hover:text-slate-700">Back to Home</button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Patient selector (demo) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Patient (Demo)</label>
          <select
            value={selectedAbha}
            onChange={(e) => setSelectedAbha(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {mockPatients.map((p) => (
              <option key={p.abhaId} value={p.abhaId}>{p.name} — {p.abhaId}</option>
            ))}
          </select>
        </div>

        {/* ABHA Card with QR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* QR Code */}
            <div className="flex-shrink-0">
              <div className="w-44 h-44 bg-white border-2 border-slate-200 rounded-2xl p-3">
                <MockQR abhaId={patient.abhaId} />
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">Your ABHA QR Code</p>
            </div>

            {/* Patient info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
              <p className="text-slate-500 text-sm mt-1">{patient.age}y • {patient.gender} • {patient.bloodGroup}</p>
              <div className="mt-3 inline-block bg-sky-50 border border-sky-200 rounded-lg px-4 py-2">
                <p className="text-xs text-slate-500 uppercase tracking-wide">ABHA ID</p>
                <p className="text-lg font-mono font-bold text-sky-700">{patient.abhaId}</p>
              </div>
              <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>ABHA verified via ABDM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Access History */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-slate-800">Access History</h3>
            <span className="text-xs text-slate-400">({history.length} entries)</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              <p className="text-sm">Loading access history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hospitals or doctors have accessed your records yet.</p>
              <p className="text-xs mt-1">When a doctor views your ABHA records, it will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map((entry) => (
                <div key={entry.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      entry.accessType === 'Emergency' ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'
                    }`}>
                      {entry.accessType === 'Emergency' ? <ShieldCheck className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">{entry.doctorName}</p>
                      <p className="text-xs text-slate-400">{entry.hospital}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          entry.accessType === 'Emergency' ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
                        }`}>
                          {entry.accessType}
                        </span>
                        <span className="text-xs text-slate-400">{formatTimestamp(entry.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {entry.reported ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg">
                        <Flag className="w-3.5 h-3.5" /> Reported
                      </span>
                    ) : (
                      <button
                        onClick={() => handleReport(entry.id)}
                        disabled={reporting === entry.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-rose-200 text-rose-600 text-xs font-medium rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-60"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        {reporting === entry.id ? 'Reporting...' : 'Report Misuse'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info note */}
        <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-xl">
          <p className="text-sm text-sky-800">
            <strong>Transparency feature:</strong> You can see every doctor and hospital that has accessed your health records through ABHA. If you notice any unauthorized access, use the "Report Misuse" button to flag it for investigation.
          </p>
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Deterministic mock QR code pattern from ABHA ID
function MockQR({ abhaId }: { abhaId: string }) {
  // Generate a pseudo-random grid from the ABHA string
  const grid = 21;
  const cells: boolean[] = [];
  let hash = 0;
  for (let i = 0; i < abhaId.length; i++) {
    hash = ((hash << 5) - hash + abhaId.charCodeAt(i)) | 0;
  }
  for (let i = 0; i < grid * grid; i++) {
    hash = ((hash << 5) - hash + i) | 0;
    cells.push((hash & 1) === 1);
  }

  // Finder patterns (corners) — 7x7 blocks
  const isFinder = (r: number, c: number) => {
    const inBlock = (br: number, bc: number) => r >= br && r < br + 7 && c >= bc && c < bc + 7;
    return inBlock(0, 0) || inBlock(0, grid - 7) || inBlock(grid - 7, 0);
  };
  const isFinderInner = (r: number, c: number) => {
    const inInner = (br: number, bc: number) => r >= br + 2 && r < br + 5 && c >= bc + 2 && c < bc + 5;
    return inInner(0, 0) || inInner(0, grid - 7) || inInner(grid - 7, 0);
  };
  const isFinderRing = (r: number, c: number) => {
    const inRing = (br: number, bc: number) => r >= br && r < br + 7 && c >= bc && c < bc + 7 &&
      !(r >= br + 1 && r < br + 6 && c >= bc + 1 && c < bc + 6);
    return inRing(0, 0) || inRing(0, grid - 7) || inRing(grid - 7, 0);
  };

  return (
    <div className="w-full h-full grid" style={{ gridTemplateColumns: `repeat(${grid}, 1fr)`, gridTemplateRows: `repeat(${grid}, 1fr)` }}>
      {Array.from({ length: grid * grid }).map((_, i) => {
        const r = Math.floor(i / grid);
        const c = i % grid;
        let fill = cells[i];
        if (isFinder(r, c)) {
          fill = isFinderRing(r, c) || isFinderInner(r, c);
        }
        return (
          <div key={i} className={fill ? 'bg-slate-900' : 'bg-white'} />
        );
      })}
    </div>
  );
}
