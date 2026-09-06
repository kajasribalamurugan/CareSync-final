import { useState, useEffect } from 'react';
import { HeartPulse, ArrowLeft, Loader2, Activity, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchABHARecords, generateAISummary } from '@/lib/abdm';

interface AISummaryProps {
  onNavigate: (page: string) => void;
}

export default function AISummary({ onNavigate }: AISummaryProps) {
  const { session, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session) onNavigate('login');
  }, [session, onNavigate]);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch the default patient's records
      const patient = await fetchABHARecords('12-3456-7890-1234', true);
      if (!patient) {
        setError('Could not load patient records to generate summary.');
        setLoading(false);
        return;
      }
      const result = await generateAISummary(patient, true);
      setSummary(result);
    } catch {
      setError('Failed to generate AI summary. Please try again.');
    }
    setLoading(false);
  };

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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">AI Doctor's Cheat Sheet</h1>
          <p className="text-slate-500 text-sm mt-1">
            Generates a concise emergency summary from the patient's full health record. Designed for fast reading in critical situations.
          </p>
        </div>

        {/* Generate button */}
        {!summary && !loading && !error && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Generate Emergency Cheat Sheet</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              AI will analyze the patient's complete health record — prescriptions, lab reports, diagnoses — and produce a concise summary with red flags a doctor should know before treating.
            </p>
            <button
              onClick={handleGenerate}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              <Activity className="w-5 h-5" /> Generate Doctor's Cheat Sheet
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">AI is analyzing records...</h2>
            <div className="max-w-md mx-auto text-left space-y-2 mt-4">
              <LoadingStep text="Parsing patient prescriptions" />
              <LoadingStep text="Cross-referencing lab reports" />
              <LoadingStep text="Identifying drug interactions" />
              <LoadingStep text="Generating red flags" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <p className="text-slate-700 mb-4">{error}</p>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Summary Display */}
        {summary && !loading && (
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-slate-800">Emergency Cheat Sheet</h2>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">AI Generated</span>
              </div>
              <div className="p-6">
                <pre className="font-mono text-base text-slate-800 whitespace-pre-wrap leading-relaxed">{summary}</pre>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleGenerate}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:border-sky-300 transition-colors"
              >
                Regenerate
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2.5 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-400 italic">
              Disclaimer: AI-generated summary for demonstration only. Always verify against full patient records before clinical decisions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingStep({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
      <span>{text}...</span>
    </div>
  );
}
