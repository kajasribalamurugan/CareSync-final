import { useState } from 'react';
import { HeartPulse, Lock, Building2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { mockDoctors } from '@/lib/auth';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const { login } = useAuth();
  const [hospitalId, setHospitalId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(hospitalId, password);
    if (success) {
      onNavigate('dashboard');
    } else {
      setError('Invalid Hospital ID or password. Try the demo credentials below.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex flex-col">
      {/* Nav */}
      <nav className="h-16 border-b border-sky-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <button onClick={() => onNavigate('landing')} className="flex items-center gap-2 text-slate-600 hover:text-sky-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <HeartPulse className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">CareSync</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-sky-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Doctor Login</h1>
              <p className="text-slate-500 text-sm mt-1">Sign in with your Hospital ID to access patient records</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-rose-700">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Hospital ID</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={hospitalId}
                    onChange={(e) => setHospitalId(e.target.value)}
                    placeholder="e.g. AIIMS001"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors shadow-md"
              >
                Sign In
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Demo Credentials</p>
              <div className="space-y-1.5">
                {mockDoctors.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setHospitalId(d.id); setPassword(d.password); }}
                    className="w-full text-left p-2 bg-slate-50 hover:bg-sky-50 rounded-lg transition-colors flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-600">{d.name}</span>
                    <span className="text-slate-400 font-mono">{d.id} / {d.password}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
