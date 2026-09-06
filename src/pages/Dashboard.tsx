import { useState, useEffect } from 'react';
import { HeartPulse, QrCode, Zap, Clock, LogOut, FileText, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchAuditTrail, applyFraudCheck } from '@/lib/auth';
import type { AuditEntry } from '@/types';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { session, logout } = useAuth();
  const [recentAccess, setRecentAccess] = useState<AuditEntry[]>([]);

  useEffect(() => {
    fetchAuditTrail().then((entries) => {
      setRecentAccess(applyFraudCheck(entries).slice(0, 5));
    });
  }, []);

  if (!session) {
    onNavigate('login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-sky-600 rounded-lg flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">CareSync</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-700">{session.name}</p>
              <p className="text-xs text-slate-500">{session.hospital}</p>
            </div>
            <button
              onClick={() => { logout(); onNavigate('landing'); }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Welcome, {session.name}</h1>
          <p className="text-slate-500 text-sm mt-1">{session.hospital} • Hospital ID: {session.hospitalId}</p>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          <button
            onClick={() => onNavigate('conscious')}
            className="group bg-white rounded-2xl border border-slate-200 p-8 text-left hover:border-sky-400 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <QrCode className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Scan Patient QR</h2>
            <p className="text-slate-500 text-sm mb-4">Patient is conscious and can provide consent. Scan their ABHA QR code and verify via OTP.</p>
            <span className="inline-flex items-center gap-1 text-sky-600 text-sm font-medium">
              Start consent flow <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button
            onClick={() => onNavigate('emergency')}
            className="group bg-white rounded-2xl border-2 border-rose-200 p-8 text-left hover:border-rose-400 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 px-3 py-1 bg-rose-500 text-white text-xs font-bold rounded-bl-lg">
              EMERGENCY
            </div>
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Emergency Access</h2>
            <p className="text-slate-500 text-sm mb-4">Patient is unconscious. Use biometric override to access critical emergency data immediately.</p>
            <span className="inline-flex items-center gap-1 text-rose-600 text-sm font-medium">
              Emergency override <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <QuickLink icon={<FileText />} label="Audit Trail" onClick={() => onNavigate('audit')} />
          <QuickLink icon={<ShieldCheck />} label="Patient View" onClick={() => onNavigate('patient')} />
          <QuickLink icon={<Clock />} label="Recent Access" onClick={() => onNavigate('audit')} />
        </div>

        {/* Recent Access History */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">Recent Access History</h2>
            <button onClick={() => onNavigate('audit')} className="text-sm text-sky-600 hover:text-sky-700 font-medium">
              View all
            </button>
          </div>
          {recentAccess.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent access records</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-left">
                    <th className="px-6 py-3 font-medium">Patient ABHA ID</th>
                    <th className="px-6 py-3 font-medium">Access Type</th>
                    <th className="px-6 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAccess.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-mono text-slate-700">{entry.patientAbhaId}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.accessType === 'Emergency'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-sky-100 text-sky-700'
                        }`}>
                          {entry.accessType}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-500">{formatTimestamp(entry.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickLink({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-sky-300 hover:shadow-md transition-all text-slate-600 hover:text-sky-600"
    >
      <span className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
        {icon}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
