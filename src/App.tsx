import { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ConsciousFlow from '@/pages/ConsciousFlow';
import EmergencyFlow from '@/pages/EmergencyFlow';
import AISummary from '@/pages/AISummary';
import AuditTrail from '@/pages/AuditTrail';
import PatientView from '@/pages/PatientView';

type Page = 'landing' | 'login' | 'dashboard' | 'conscious' | 'emergency' | 'ai-summary' | 'audit' | 'patient';

export default function App() {
  const [page, setPage] = useState<Page>('landing');

  const navigate = (p: string) => setPage(p as Page);

  return (
    <AuthProvider>
      {page === 'landing' && <Landing onNavigate={navigate} />}
      {page === 'login' && <Login onNavigate={navigate} />}
      {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
      {page === 'conscious' && <ConsciousFlow onNavigate={navigate} />}
      {page === 'emergency' && <EmergencyFlow onNavigate={navigate} />}
      {page === 'ai-summary' && <AISummary onNavigate={navigate} />}
      {page === 'audit' && <AuditTrail onNavigate={navigate} />}
      {page === 'patient' && <PatientView onNavigate={navigate} />}
    </AuthProvider>
  );
}
