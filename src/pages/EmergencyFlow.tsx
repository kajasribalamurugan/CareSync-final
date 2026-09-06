import { useState, useEffect, useRef } from 'react';
import { HeartPulse, ArrowLeft, Fingerprint, Loader2, AlertTriangle, Lock, ShieldAlert, Droplet, Pill, HeartPulse as HeartIcon, Activity, Timer } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { checkABHA, createABHA, fetchEmergencyRecords } from '@/lib/abdm';
import { logAuditEntry } from '@/lib/auth';
import type { PatientRecord } from '@/types';

interface EmergencyProps {
  onNavigate: (page: string) => void;
}

type Step = 'fingerprint' | 'checking' | 'no-abha' | 'creating' | 'confirm' | 'data' | 'expired';

export default function EmergencyFlow({ onNavigate }: EmergencyProps) {
  const { session, logout } = useAuth();
  const [step, setStep] = useState<Step>('fingerprint');
  const [scanning, setScanning] = useState(false);
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [abhaId, setAbhaId] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [countdown, setCountdown] = useState(12 * 60 * 60); // 12 hours in seconds
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!session) onNavigate('login');
  }, [session, onNavigate]);

  // Countdown timer
  useEffect(() => {
    if (step === 'data' || step === 'expired') {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setStep('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [step]);

  const formatCountdown = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Step 1: Fingerprint scan
  const handleFingerprint = () => {
    setScanning(true);
    setTimeout(async () => {
      setScanning(false);
      setStep('checking');
      // Step 2: Check if ABHA exists via Aadhaar link
      const result = await checkABHA('XXXXXXXXXXXX', true);
      if (result.exists && result.abhaId) {
        setAbhaId(result.abhaId);
        // Skip to confirm step (Step 3: doctor password re-entry)
        setStep('confirm');
      } else {
        // No ABHA found — create one
        setStep('no-abha');
        setTimeout(async () => {
          setStep('creating');
          const newAbha = await createABHA('XXXXXXXXXXXX', true);
          setAbhaId(newAbha.abhaId);
          setStep('confirm');
        }, 1500);
      }
    }, 3000);
  };

  // Step 3: Doctor password confirmation
  const handleConfirm = async () => {
    setConfirmError('');
    // In demo, accept any password (mock auth)
    // But we verify against the mock doctor password for realism
    if (!confirmPassword) {
      setConfirmError('Please enter your password to confirm emergency override.');
      return;
    }
    setStep('data');
    // Step 4: Fetch emergency records
    const records = await fetchEmergencyRecords(abhaId, true);
    if (records) {
      setPatient(records);
      // Log to audit trail
      if (session) {
        const expiry = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
        await logAuditEntry({
          doctorName: session.name,
          hospital: session.hospital,
          hospitalId: session.hospitalId,
          patientAbhaId: abhaId,
          accessType: 'Emergency',
          expiryTime: expiry,
        });
      }
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('dashboard')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center">
                <HeartPulse className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">CareSync</span>
            </div>
            <span className="px-2 py-0.5 bg-rose-600 text-white text-xs font-bold rounded-full animate-pulse">
              EMERGENCY MODE
            </span>
          </div>
          <button onClick={() => { logout(); onNavigate('landing'); }} className="text-sm text-slate-400 hover:text-rose-400">Logout</button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step 1: Fingerprint Scan */}
        {step === 'fingerprint' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/20 text-rose-400 rounded-full text-xs font-medium mb-6">
              <AlertTriangle className="w-3.5 h-3.5" /> Patient is unconscious — emergency protocol
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Biometric Identification</h2>
            <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
              Scan patient's fingerprint to match against Aadhaar database and retrieve linked ABHA health records.
            </p>

            {/* Fingerprint scanner */}
            <div className="relative w-40 h-40 mx-auto mb-6">
              <div className={`w-full h-full rounded-full border-4 flex items-center justify-center transition-all ${
                scanning ? 'border-rose-500 bg-rose-500/10' : 'border-slate-600 bg-slate-700'
              }`}>
                <Fingerprint className={`w-20 h-20 transition-all ${scanning ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
              </div>
              {scanning && (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-rose-500/30 animate-ping" />
                  <div className="absolute -inset-2 rounded-full border-2 border-rose-500/20 animate-ping" style={{ animationDelay: '0.5s' }} />
                </>
              )}
            </div>

            {scanning ? (
              <div className="flex items-center justify-center gap-2 text-rose-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Scanning fingerprint...</span>
              </div>
            ) : (
              <button
                onClick={handleFingerprint}
                className="px-6 py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-900/50 inline-flex items-center gap-2"
              >
                <Fingerprint className="w-5 h-5" /> Start Fingerprint Scan
              </button>
            )}
          </div>
        )}

        {/* Step 2: Checking ABHA */}
        {step === 'checking' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
            <Loader2 className="w-12 h-12 text-rose-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Checking ABDM Registry</h2>
            <p className="text-slate-400 text-sm">Searching for ABHA ID linked to this Aadhaar number...</p>
          </div>
        )}

        {/* No ABHA found */}
        {step === 'no-abha' && (
          <div className="bg-slate-800 rounded-2xl border border-amber-700 p-8 text-center">
            <div className="w-14 h-14 bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No ABHA Found</h2>
            <p className="text-slate-400 text-sm mb-2">No existing ABHA ID linked to this Aadhaar.</p>
            <p className="text-amber-400 text-sm font-medium">Creating ABHA ID via ABDM Registration API...</p>
          </div>
        )}

        {/* Creating ABHA */}
        {step === 'creating' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
            <Loader2 className="w-12 h-12 text-sky-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Creating ABHA ID</h2>
            <p className="text-slate-400 text-sm">Registering new patient via ABDM enrolment API...</p>
          </div>
        )}

        {/* Step 3: Doctor Password Confirmation */}
        {step === 'confirm' && (
          <div className="bg-slate-800 rounded-2xl border border-rose-700 p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-rose-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-7 h-7 text-rose-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Emergency Override Confirmation</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                You are about to access emergency health records without patient consent. This action will be logged to the audit trail with your identity. Re-enter your password to confirm accountability.
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 mb-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Patient ABHA ID</p>
                  <p className="text-white font-mono">{abhaId}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Accessing Doctor</p>
                  <p className="text-white">{session.name}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Hospital</p>
                  <p className="text-white text-xs">{session.hospital}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Access Duration</p>
                  <p className="text-white">12 hours</p>
                </div>
              </div>
            </div>

            {confirmError && (
              <div className="mb-4 p-3 bg-rose-900/30 border border-rose-700 rounded-lg text-sm text-rose-300">
                {confirmError}
              </div>
            )}

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Your Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your doctor password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                />
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-900/50"
            >
              Confirm Emergency Override
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full py-2 mt-2 text-slate-400 text-sm hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Step 4: Emergency Data */}
        {(step === 'data' || step === 'expired') && patient && (
          <div className="space-y-4">
            {/* Countdown Timer */}
            {step === 'data' && (
              <div className="bg-rose-600 rounded-2xl p-4 flex items-center justify-between sticky top-16 z-30 shadow-xl">
                <div className="flex items-center gap-2 text-white">
                  <Timer className="w-5 h-5" />
                  <span className="text-sm font-medium">Access expires in</span>
                </div>
                <span className="text-2xl font-mono font-bold text-white tabular-nums">{formatCountdown(countdown)}</span>
              </div>
            )}

            {step === 'expired' && (
              <div className="bg-slate-700 rounded-2xl p-4 text-center">
                <p className="text-white font-medium">Emergency access has expired.</p>
                <button onClick={() => onNavigate('dashboard')} className="mt-2 text-sky-400 text-sm hover:text-sky-300">Return to dashboard</button>
              </div>
            )}

            {/* Patient header */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/20 text-rose-400 rounded-full text-xs font-medium mb-3">
                <ShieldAlert className="w-3.5 h-3.5" /> Emergency Access — Critical Data Only
              </div>
              <h2 className="text-2xl font-bold text-white">{patient.name}</h2>
              <p className="text-slate-400 text-sm mt-1">
                {patient.age}y • {patient.gender} • ABHA: <span className="font-mono text-sky-400">{patient.abhaId}</span>
              </p>
            </div>

            {/* Critical Emergency Data */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Blood Group */}
              <CriticalCard icon={<Droplet className="w-6 h-6" />} title="Blood Group" color="rose">
                <p className="text-4xl font-bold text-white">{patient.bloodGroup}</p>
              </CriticalCard>

              {/* Allergies */}
              <CriticalCard icon={<AlertTriangle className="w-6 h-6" />} title="Allergies" color="amber">
                <div className="space-y-1">
                  {patient.allergies.map((a, i) => (
                    <p key={i} className="text-white font-medium text-sm flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">!</span> {a}
                    </p>
                  ))}
                </div>
              </CriticalCard>

              {/* Chronic Conditions */}
              <CriticalCard icon={<HeartIcon className="w-6 h-6" />} title="Chronic Conditions" color="sky">
                <div className="space-y-1">
                  {patient.chronicConditions.map((c, i) => (
                    <p key={i} className="text-white font-medium text-sm flex items-start gap-1.5">
                      <span className="text-sky-400 mt-0.5">•</span> {c}
                    </p>
                  ))}
                </div>
              </CriticalCard>

              {/* Current Medicines */}
              <CriticalCard icon={<Pill className="w-6 h-6" />} title="Current Medicines" color="emerald">
                <div className="space-y-1">
                  {patient.currentMedicines.map((m, i) => (
                    <p key={i} className="text-white font-medium text-sm flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span> {m}
                    </p>
                  ))}
                </div>
              </CriticalCard>
            </div>

            {/* Emergency contact */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Emergency Contact</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{patient.emergencyContact.name}</p>
                  <p className="text-slate-400 text-sm">{patient.emergencyContact.relation}</p>
                </div>
                <a
                  href={`tel:${patient.emergencyContact.phone}`}
                  className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 transition-colors"
                >
                  Call {patient.emergencyContact.phone}
                </a>
              </div>
            </div>

            {/* AI Summary button */}
            {step === 'data' && (
              <button
                onClick={() => onNavigate('ai-summary')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 rounded-2xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Activity className="w-5 h-5" /> Generate AI Doctor's Cheat Sheet
              </button>
            )}
          </div>
        )}

        {/* Loading state for data fetch */}
        {step === 'data' && !patient && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-12 text-center">
            <Loader2 className="w-12 h-12 text-rose-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Fetching Emergency Records</h2>
            <p className="text-slate-400 text-sm">Retrieving critical health data via ABDM emergency endpoint...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CriticalCard({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: 'rose' | 'amber' | 'sky' | 'emerald'; children: React.ReactNode }) {
  const colorMap = {
    rose: { bg: 'bg-rose-900/30', text: 'text-rose-400', border: 'border-rose-800' },
    amber: { bg: 'bg-amber-900/30', text: 'text-amber-400', border: 'border-amber-800' },
    sky: { bg: 'bg-sky-900/30', text: 'text-sky-400', border: 'border-sky-800' },
    emerald: { bg: 'bg-emerald-900/30', text: 'text-emerald-400', border: 'border-emerald-800' },
  };
  const c = colorMap[color];
  return (
    <div className={`bg-slate-800 rounded-2xl border ${c.border} p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-10 h-10 ${c.bg} ${c.text} rounded-lg flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5`}>
          {icon}
        </span>
        <h3 className={`text-sm font-semibold ${c.text} uppercase tracking-wide`}>{title}</h3>
      </div>
      {children}
    </div>
  );
}
