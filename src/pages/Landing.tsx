import type { ReactNode } from 'react';
import { Shield, Lock, CheckCircle2, HeartPulse, QrCode, Zap, ArrowRight, Stethoscope, Activity } from 'lucide-react';

interface LandingProps {
  onNavigate: (page: string) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-sky-600 rounded-lg flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">CareSync</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-sky-600" /> ABDM Compliant</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-sky-600" /> Consent-Based</span>
          </div>
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors shadow-sm"
          >
            Doctor Login
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-100 text-sky-700 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Built on India's ABDM Framework
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight max-w-4xl mx-auto">
            One Health ID. <span className="text-sky-600">Instant Access.</span> Even in Emergencies.
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            AI-powered health records linked with ABHA. Doctors get critical patient information
            in seconds — with consent when conscious, and emergency override when every second counts.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate('login')}
              className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-all shadow-lg shadow-sky-200 flex items-center justify-center gap-2"
            >
              Access as Doctor <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('patient')}
              className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:border-sky-300 transition-all flex items-center justify-center gap-2"
            >
              Patient View
            </button>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<QrCode className="w-7 h-7" />}
            title="ABHA-Linked Records"
            description="Scan a patient's ABHA QR to instantly retrieve prescriptions, lab reports, and diagnoses — all linked to their unique 14-digit Health ID."
            color="sky"
          />
          <FeatureCard
            icon={<Zap className="w-7 h-7" />}
            title="Emergency Access"
            description="For unconscious patients, doctors can use biometric override to access critical data — blood group, allergies, medications — with full audit trail."
            color="rose"
          />
          <FeatureCard
            icon={<Activity className="w-7 h-7" />}
            title="AI Doctor Summary"
            description="One click generates a concise emergency cheat sheet from the patient's full record — red flags, allergies, and conditions doctors need to know instantly."
            color="emerald"
          />
        </div>
      </section>

      {/* Trust Badge Section */}
      <section className="bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Built on ABDM</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Ayushman Bharat Digital Mission — India's national framework for unified health records.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <TrustItem icon={<Shield />} title="Consent-Based Sharing" desc="Patients approve every access via OTP" />
            <TrustItem icon={<Lock />} title="Audit Trail" desc="Every access logged with doctor identity" />
            <TrustItem icon={<CheckCircle2 />} title="Emergency Override" desc="Accountable access for critical care" />
            <TrustItem icon={<Stethoscope />} title="Interoperable" desc="Works across all ABDM-linked hospitals" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <HeartPulse className="w-5 h-5 text-sky-500" />
            <span className="font-semibold text-white">CareSync</span>
          </div>
          <p>Demo project using ABDM Sandbox APIs with mock data. Not for clinical use.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: ReactNode; title: string; description: string; color: 'sky' | 'rose' | 'emerald' }) {
  const colorMap = {
    sky: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  };
  const c = colorMap[color];
  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
      <div className={`w-14 h-14 rounded-xl ${c.bg} ${c.text} flex items-center justify-center mb-5`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function TrustItem({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-11 h-11 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 text-sky-400">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-white text-sm mb-1">{title}</h4>
        <p className="text-sm text-slate-400">{desc}</p>
      </div>
    </div>
  );
}
