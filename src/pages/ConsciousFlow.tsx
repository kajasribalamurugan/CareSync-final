import { useState, useRef, useEffect } from 'react';
import { HeartPulse, QrCode, ArrowLeft, CheckCircle2, Loader2, ShieldCheck, FileText, Pill, FlaskConical, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { checkABHA, sendOTP, verifyOTP, fetchABHARecords } from '@/lib/abdm';
import { logAuditEntry } from '@/lib/auth';
import type { PatientRecord } from '@/types';

interface ConsciousProps {
  onNavigate: (page: string) => void;
}

type Step = 'qr' | 'found' | 'otp' | 'records';

export default function ConsciousFlow({ onNavigate }: ConsciousProps) {
  const { session, logout } = useAuth();
  const [step, setStep] = useState<Step>('qr');
  const [scanning, setScanning] = useState(false);
  const [abhaId, setAbhaId] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otp, setOtp] = useState('');
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!session) onNavigate('login');
  }, [session, onNavigate]);

  // Simulate QR scan
  const handleScan = () => {
    setScanning(true);
    setTimeout(async () => {
      const mockAbhaId = '12-3456-7890-1234';
      setAbhaId(mockAbhaId);
      const result = await checkABHA(mockAbhaId, true);
      setScanning(false);
      if (result.exists) {
        setStep('found');
      } else {
        setError('No ABHA record found for this QR code.');
      }
    }, 2500);
  };

  // Send OTP
  const handleSendOTP = async () => {
    setOtpSending(true);
    await sendOTP(abhaId, true);
    setOtpSending(false);
    setStep('otp');
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    setOtpVerifying(true);
    await verifyOTP(abhaId, otp, true);
    setOtpVerifying(false);
    setStep('records');
    setLoadingRecords(true);
    const records = await fetchABHARecords(abhaId, true);
    setLoadingRecords(false);
    if (records) {
      setPatient(records);
      // Log to audit trail
      if (session) {
        await logAuditEntry({
          doctorName: session.name,
          hospital: session.hospital,
          hospitalId: session.hospitalId,
          patientAbhaId: abhaId,
          accessType: 'Normal',
          expiryTime: null,
        });
      }
    } else {
      setError('Failed to fetch patient records.');
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const newOtp = otp.split('');
    newOtp[idx] = val;
    setOtp(newOtp.join(''));
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
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

      {/* Progress Steps */}
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <StepIndicator num={1} label="QR Scan" active={step === 'qr'} done={step !== 'qr'} />
          <StepLine done={step !== 'qr'} />
          <StepIndicator num={2} label="ABHA Found" active={step === 'found'} done={step === 'otp' || step === 'records'} />
          <StepLine done={step === 'otp' || step === 'records'} />
          <StepIndicator num={3} label="OTP Verify" active={step === 'otp'} done={step === 'records'} />
          <StepLine done={step === 'records'} />
          <StepIndicator num={4} label="Records" active={step === 'records'} done={false} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Step 1: QR Scan */}
        {step === 'qr' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Scan Patient QR Code</h2>
            <p className="text-slate-500 text-sm mb-6">Ask the patient to show their ABHA QR code. Position it within the scanner below.</p>

            {/* QR Scanner Frame */}
            <div className="relative w-64 h-64 mx-auto mb-6">
              <div className="absolute inset-0 bg-slate-900 rounded-2xl overflow-hidden">
                {/* QR placeholder pattern */}
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5 p-4 opacity-30">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className={`${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'} rounded-sm`} />
                  ))}
                </div>
                {/* Scan line */}
                {scanning && (
                  <div className="absolute left-0 right-0 h-1 bg-sky-400 shadow-lg shadow-sky-400/50"
                    style={{ animation: 'scanLine 2s ease-in-out infinite', top: '50%' }} />
                )}
              </div>
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-sky-500 rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-sky-500 rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-sky-500 rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-sky-500 rounded-br-lg" />
            </div>

            {scanning ? (
              <div className="flex items-center justify-center gap-2 text-sky-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Scanning QR code...</span>
              </div>
            ) : (
              <button
                onClick={handleScan}
                className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors shadow-lg shadow-sky-200 inline-flex items-center gap-2"
              >
                <QrCode className="w-5 h-5" /> Start QR Scan
              </button>
            )}

            <style>{`@keyframes scanLine { 0%, 100% { top: 10%; } 50% { top: 90%; } }`}</style>
          </div>
        )}

        {/* Step 2: ABHA Found */}
        {step === 'found' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">ABHA ID Found</h2>
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6 inline-block">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">ABHA ID</p>
              <p className="text-2xl font-mono font-bold text-sky-700 tracking-wider">{abhaId}</p>
            </div>
            <p className="text-slate-500 text-sm mb-6">
              Patient record verified via ABDM. To access full health records, patient must provide consent via OTP sent to their registered mobile number.
            </p>
            <button
              onClick={handleSendOTP}
              disabled={otpSending}
              className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors shadow-lg shadow-sky-200 inline-flex items-center gap-2 disabled:opacity-60"
            >
              {otpSending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Sending OTP...</>
              ) : (
                <><ShieldCheck className="w-5 h-5" /> Send OTP to Patient</>
              )}
            </button>
          </div>
        )}

        {/* Step 3: OTP Input */}
        {step === 'otp' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-sky-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Enter OTP</h2>
            <p className="text-slate-500 text-sm mb-6">
              An OTP has been sent to the patient's registered mobile number. Ask the patient to share the 6-digit code.
            </p>

            <div className="flex justify-center gap-2 sm:gap-3 mb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[i] ?? ''}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-11 h-14 sm:w-12 sm:h-14 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 mb-6">Demo: enter any 6 digits</p>

            <button
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || otpVerifying}
              className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors shadow-lg shadow-sky-200 inline-flex items-center gap-2 disabled:opacity-60"
            >
              {otpVerifying ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
              ) : (
                <>Verify & Access Records</>
              )}
            </button>
          </div>
        )}

        {/* Step 4: Records */}
        {step === 'records' && (
          <div>
            {loadingRecords ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Loader2 className="w-10 h-10 text-sky-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600 font-medium">Fetching ABHA-linked health records...</p>
                <p className="text-slate-400 text-sm mt-1">Connecting to ABDM health information gateway</p>
              </div>
            ) : patient ? (
              <PatientRecordsView patient={patient} onNavigate={onNavigate} />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
        done ? 'bg-emerald-500 text-white' : active ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-400'
      }`}>
        {done ? <CheckCircle2 className="w-5 h-5" /> : num}
      </div>
      <span className={`text-xs hidden sm:block ${active || done ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{label}</span>
    </div>
  );
}

function StepLine({ done }: { done: boolean }) {
  return <div className={`flex-1 h-0.5 max-w-[60px] ${done ? 'bg-emerald-500' : 'bg-slate-200'} transition-colors`} />;
}

function PatientRecordsView({ patient, onNavigate }: { patient: PatientRecord; onNavigate: (page: string) => void }) {
  return (
    <div className="space-y-5">
      {/* Patient Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{patient.name}</h2>
            <p className="text-slate-500 text-sm mt-1">
              {patient.age}y • {patient.gender} • ABHA: <span className="font-mono text-sky-600">{patient.abhaId}</span>
            </p>
            <p className="text-slate-400 text-xs mt-1">{patient.city}, {patient.state}</p>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-2 bg-rose-50 rounded-lg text-center">
              <p className="text-xs text-rose-500 font-medium">Blood Group</p>
              <p className="text-lg font-bold text-rose-700">{patient.bloodGroup}</p>
            </div>
          </div>
        </div>

        {/* Critical info badges */}
        <div className="grid sm:grid-cols-3 gap-3 mt-5">
          <InfoBadge label="Allergies" items={patient.allergies} color="rose" />
          <InfoBadge label="Chronic Conditions" items={patient.chronicConditions} color="amber" />
          <InfoBadge label="Current Medicines" items={patient.currentMedicines} color="sky" />
        </div>
      </div>

      {/* AI Summary button */}
      <button
        onClick={() => onNavigate('ai-summary')}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 rounded-2xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        <Activity className="w-5 h-5" /> Generate AI Doctor's Cheat Sheet
      </button>

      {/* Prescriptions */}
      <SectionCard title="Prescriptions" icon={<Pill className="w-5 h-5" />} count={patient.prescriptions.length}>
        <div className="space-y-2">
          {patient.prescriptions.map((rx) => (
            <div key={rx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-700 text-sm">{rx.medication} <span className="text-slate-500">{rx.dosage}</span></p>
                <p className="text-xs text-slate-400">{rx.frequency} • Prescribed by {rx.prescribedBy} on {rx.date}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                rx.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
              }`}>{rx.status}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Lab Reports */}
      <SectionCard title="Lab Reports" icon={<FlaskConical className="w-5 h-5" />} count={patient.labReports.length}>
        <div className="space-y-2">
          {patient.labReports.map((lr) => (
            <div key={lr.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-700 text-sm">{lr.testName}</p>
                <p className="text-xs text-slate-400">Result: {lr.result} {lr.unit} • Normal: {lr.normalRange} {lr.unit} • {lr.lab} • {lr.date}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                lr.status === 'Normal' ? 'bg-emerald-100 text-emerald-700' :
                lr.status === 'Abnormal' ? 'bg-amber-100 text-amber-700' :
                'bg-rose-100 text-rose-700'
              }`}>{lr.status}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Diagnoses */}
      <SectionCard title="Past Diagnoses" icon={<FileText className="w-5 h-5" />} count={patient.diagnoses.length}>
        <div className="space-y-2">
          {patient.diagnoses.map((d) => (
            <div key={d.id} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-slate-700 text-sm">{d.condition}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  d.status === 'Chronic' ? 'bg-rose-100 text-rose-700' :
                  d.status === 'Active' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>{d.status}</span>
              </div>
              <p className="text-xs text-slate-400">ICD: {d.icdCode} • Diagnosed: {d.diagnosedDate} • Severity: {d.severity}</p>
              {d.notes && <p className="text-xs text-slate-500 mt-1 italic">{d.notes}</p>}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function InfoBadge({ label, items, color }: { label: string; items: string[]; color: 'rose' | 'amber' | 'sky' }) {
  const colorMap = {
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    sky: 'bg-sky-50 border-sky-200 text-sky-700',
  };
  return (
    <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-1.5 opacity-70">{label}</p>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <span key={i} className="text-xs font-medium">{item}{i < items.length - 1 ? ',' : ''}</span>
        ))}
      </div>
    </div>
  );
}

function SectionCard({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sky-600 [&>svg]:w-5 [&>svg]:h-5">{icon}</span>
          <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">{count} records</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
