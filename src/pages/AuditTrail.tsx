import { useState, useEffect } from 'react';
import { HeartPulse, ArrowLeft, LogOut, Flag, ShieldAlert, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchAuditTrail, applyFraudCheck } from '@/lib/auth';
import type { AuditEntry } from '@/types';

interface AuditProps {
  onNavigate: (page: string) => void;
}

export default function AuditTrail({ onNavigate }: AuditProps) {
  const { session, logout } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) onNavigate('login');
  }, [session, onNavigate]);

  useEffect(() => {
    if (!session) return;
    fetchAuditTrail().then((data) => {
      setEntries(applyFraudCheck(data));
      setLoading(false);
    });
  }, [session]);

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('dashboard')} className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
                <HeartPulse className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">CareSync</span>
            </div>
          </div>
          <button onClick={() => { logout(); onNavigate('landing'); }} className="text-sm text-slate-500 hover:text-rose-600">Logout</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Audit Trail</h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete log of all patient record access events. Emergency accesses are highlighted, and suspicious activity is automatically flagged.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500"></span>
            <span className="text-slate-600">Normal Access</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="text-slate-600">Emergency Access</span>
          </div>
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-amber-500" />
            <span className="text-slate-600">Suspicious (3+ emergencies in 24h)</span>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <p className="text-sm">Loading audit trail...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <ShieldAlert className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No access events recorded yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-left">
                    <th className="px-4 py-3 font-medium">Doctor Name</th>
                    <th className="px-4 py-3 font-medium">Hospital</th>
                    <th className="px-4 py-3 font-medium">Patient ABHA ID</th>
                    <th className="px-4 py-3 font-medium">Access Type</th>
                    <th className="px-4 py-3 font-medium">Timestamp</th>
                    <th className="px-4 py-3 font-medium">Expiry Time</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`hover:bg-slate-50 transition-colors ${entry.accessType === 'Emergency' ? 'bg-rose-50/40' : ''}`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-700">{entry.doctorName}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{entry.hospital}</td>
                      <td className="px-4 py-3 font-mono text-slate-600 text-xs">{entry.patientAbhaId}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.accessType === 'Emergency'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-sky-100 text-sky-700'
                        }`}>
                          {entry.accessType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{formatTimestamp(entry.timestamp)}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {entry.expiryTime ? formatTimestamp(entry.expiryTime) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {entry.suspicious ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <Flag className="w-3 h-3" /> Suspicious
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Normal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
