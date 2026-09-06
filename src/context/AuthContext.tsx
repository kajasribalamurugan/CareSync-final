import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { DoctorSession } from '@/types';
import { getDoctorSession, loginDoctor as doLogin, logoutDoctor as doLogout } from '@/lib/auth';

interface AuthContextValue {
  session: DoctorSession | null;
  login: (hospitalId: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DoctorSession | null>(() => getDoctorSession());

  const login = useCallback((hospitalId: string, password: string) => {
    const s = doLogin(hospitalId, password);
    if (s) {
      setSession(s);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    doLogout();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
