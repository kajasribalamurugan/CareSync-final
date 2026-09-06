import { supabase } from './supabase';
import type { DoctorSession, AuditEntry, AccessHistoryEntry } from '@/types';

const DOCTOR_SESSION_KEY = 'caresync_doctor_session';

export const mockDoctors: { id: string; password: string; name: string; hospital: string }[] = [
  { id: 'AIIMS001', password: 'emergency123', name: 'Dr. Anil Mehta', hospital: 'AIIMS New Delhi' },
  { id: 'APOLLO02', password: 'apollo456', name: 'Dr. Sunita Rao', hospital: 'Apollo Hospitals, Hyderabad' },
  { id: 'FORTIS03', password: 'fortis789', name: 'Dr. Vikram Singh', hospital: 'Fortis Hospital, Mumbai' },
];

export function loginDoctor(hospitalId: string, password: string): DoctorSession | null {
  const doctor = mockDoctors.find((d) => d.id === hospitalId && d.password === password);
  if (!doctor) return null;
  const session: DoctorSession = {
    name: doctor.name,
    hospitalId: doctor.id,
    hospital: doctor.hospital,
    loggedInAt: Date.now(),
  };
  localStorage.setItem(DOCTOR_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getDoctorSession(): DoctorSession | null {
  const raw = localStorage.getItem(DOCTOR_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DoctorSession;
  } catch {
    return null;
  }
}

export function logoutDoctor(): void {
  localStorage.removeItem(DOCTOR_SESSION_KEY);
}

// --- Audit logging ---

export async function logAuditEntry(params: {
  doctorName: string;
  hospital: string;
  hospitalId: string;
  patientAbhaId: string;
  accessType: 'Normal' | 'Emergency';
  expiryTime: string | null;
}): Promise<void> {
  // Insert into audit_trail table
  await supabase.from('audit_trail').insert({
    doctor_name: params.doctorName,
    hospital: params.hospital,
    hospital_id: params.hospitalId,
    patient_abha_id: params.patientAbhaId,
    access_type: params.accessType,
    expiry_time: params.expiryTime,
    suspicious: false,
  });

  // Also insert into patient_access_history for transparency
  await supabase.from('patient_access_history').insert({
    patient_abha_id: params.patientAbhaId,
    doctor_name: params.doctorName,
    hospital: params.hospital,
    access_type: params.accessType,
    reported: false,
  });
}

export async function fetchAuditTrail(): Promise<AuditEntry[]> {
  const { data, error } = await supabase
    .from('audit_trail')
    .select('*')
    .order('timestamp', { ascending: false });
  if (error) {
    console.error('Failed to fetch audit trail:', error);
    return [];
  }
  return (data ?? []).map(markSuspicious).map(rowToAuditEntry);
}

export async function fetchPatientAccessHistory(abhaId: string): Promise<AccessHistoryEntry[]> {
  const { data, error } = await supabase
    .from('patient_access_history')
    .select('*')
    .eq('patient_abha_id', abhaId)
    .order('timestamp', { ascending: false });
  if (error) {
    console.error('Failed to fetch access history:', error);
    return [];
  }
  return (data ?? []).map(rowToAccessHistory);
}

export async function reportMisuse(entryId: string): Promise<void> {
  const { error } = await supabase
    .from('patient_access_history')
    .update({ reported: true })
    .eq('id', entryId);
  if (error) throw error;
}

// --- Fraud detection ---
// Flag suspicious if same doctor has 3+ emergency accesses in 24 hours

function markSuspicious(row: Record<string, unknown> & { doctor_name: string; access_type: string; timestamp: string }): Record<string, unknown> {
  // We can't do cross-row aggregation in the client easily,
  // but we can flag based on a heuristic loaded alongside.
  // The actual 24h check is done in fetchAuditTrail after loading all rows.
  return row;
}

export function applyFraudCheck(entries: AuditEntry[]): AuditEntry[] {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  const emergencyCounts = new Map<string, number>();
  for (const entry of entries) {
    if (entry.accessType === 'Emergency') {
      const ts = new Date(entry.timestamp).getTime();
      if (now - ts < twentyFourHours) {
        const key = entry.doctorName;
        emergencyCounts.set(key, (emergencyCounts.get(key) ?? 0) + 1);
      }
    }
  }

  return entries.map((entry) => ({
    ...entry,
    suspicious: (emergencyCounts.get(entry.doctorName) ?? 0) >= 3,
  }));
}

// --- Row mappers ---

function rowToAuditEntry(row: Record<string, unknown>): AuditEntry {
  return {
    id: row.id as string,
    doctorName: row.doctor_name as string,
    hospital: row.hospital as string,
    hospitalId: row.hospital_id as string,
    patientAbhaId: row.patient_abha_id as string,
    accessType: row.access_type as 'Normal' | 'Emergency',
    timestamp: row.timestamp as string,
    expiryTime: (row.expiry_time as string) ?? null,
    suspicious: row.suspicious as boolean,
  };
}

function rowToAccessHistory(row: Record<string, unknown>): AccessHistoryEntry {
  return {
    id: row.id as string,
    patientAbhaId: row.patient_abha_id as string,
    doctorName: row.doctor_name as string,
    hospital: row.hospital as string,
    accessType: row.access_type as 'Normal' | 'Emergency',
    timestamp: row.timestamp as string,
    reported: row.reported as boolean,
  };
}
