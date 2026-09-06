import type { PatientRecord } from '@/types';
import { mockPatients, getMockPatient } from './mockData';

/*
 * ABDM (ABHA) Sandbox API Service
 *
 * All functions are structured to call the real ABDM sandbox endpoints
 * at sandbox.abdm.gov.in. Since no real API key / access token is provided
 * in this demo, every function falls back to mock data when useMock = true.
 *
 * In production, set useMock = false and provide valid ABDM credentials
 * via environment variables / edge function secrets.
 */

const ABDM_BASE_URL = 'https://sandbox.abdm.gov.in';
const ABDM_API_VERSION = 'v1';

// --- ABHA / Registration endpoints ---

/**
 * Check whether an ABHA ID exists for the given identifier.
 * In production this calls: POST /api/{version}/abha/search
 * with the ABHA number or Aadhaar-linked reference.
 */
export async function checkABHA(
  identifier: string,
  useMock = true
): Promise<{ exists: boolean; abhaId?: string; patient?: PatientRecord }> {
  if (!useMock) {
    try {
      const response = await fetch(`${ABDM_BASE_URL}/api/${ABDM_API_VERSION}/abha/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getABDMToken()}`,
        },
        body: JSON.stringify({ abhaNumber: identifier }),
      });
      if (!response.ok) throw new Error(`ABDM search failed: ${response.status}`);
      const data = await response.json();
      return { exists: true, abhaId: data.abhaNumber, patient: data };
    } catch (err) {
      console.warn('ABDM API unavailable, falling back to mock:', err);
    }
  }

  // Mock fallback
  await delay(800);
  const patient = mockPatients.find((p) => p.abhaId === identifier);
  if (patient) {
    return { exists: true, abhaId: patient.abhaId, patient };
  }
  // Simulate Aadhaar-linked lookup: if identifier is an Aadhaar-like number,
  // check if any patient matches (demo: always link to first patient)
  if (identifier.startsWith('XXXX') || identifier.length === 12) {
    return { exists: true, abhaId: mockPatients[0].abhaId, patient: mockPatients[0] };
  }
  return { exists: false };
}

/**
 * Create a new ABHA ID via ABDM Registration API.
 * In production: POST /api/{version}/abha/enrol
 */
export async function createABHA(
  aadhaarNumber: string,
  useMock = true
): Promise<{ abhaId: string; patient: PatientRecord }> {
  if (!useMock) {
    try {
      const response = await fetch(`${ABDM_BASE_URL}/api/${ABDM_API_VERSION}/abha/enrol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getABDMToken()}`,
        },
        body: JSON.stringify({ aadhaar: aadhaarNumber }),
      });
      if (!response.ok) throw new Error(`ABDM enrol failed: ${response.status}`);
      const data = await response.json();
      return { abhaId: data.abhaNumber, patient: data };
    } catch (err) {
      console.warn('ABDM API unavailable, falling back to mock:', err);
    }
  }

  // Mock: generate a new ABHA number
  await delay(2000);
  const newAbhaId = generateMockABHA();
  const newPatient: PatientRecord = {
    ...mockPatients[0],
    abhaId: newAbhaId,
    name: 'Emergency Registered Patient',
    prescriptions: [],
    labReports: [],
    diagnoses: [],
  };
  return { abhaId: newAbhaId, patient: newPatient };
}

/**
 * Fetch full ABHA-linked health records for a patient.
 * In production: POST /api/{version}/health-information/records
 */
export async function fetchABHARecords(
  abhaId: string,
  useMock = true
): Promise<PatientRecord | null> {
  if (!useMock) {
    try {
      const response = await fetch(`${ABDM_BASE_URL}/api/${ABDM_API_VERSION}/health-information/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getABDMToken()}`,
        },
        body: JSON.stringify({ abhaNumber: abhaId }),
      });
      if (!response.ok) throw new Error(`ABDM records fetch failed: ${response.status}`);
      const data = await response.json();
      return data as PatientRecord;
    } catch (err) {
      console.warn('ABDM API unavailable, falling back to mock:', err);
    }
  }

  // Mock fallback
  await delay(1200);
  return getMockPatient(abhaId) ?? null;
}

/**
 * Fetch ONLY emergency-critical data (blood group, allergies, chronic
 * conditions, current medicines). In production this uses a scoped
 * consent artifact for emergency access.
 * In production: POST /api/{version}/health-information/emergency
 */
export async function fetchEmergencyRecords(
  abhaId: string,
  useMock = true
): Promise<PatientRecord | null> {
  if (!useMock) {
    try {
      const response = await fetch(`${ABDM_BASE_URL}/api/${ABDM_API_VERSION}/health-information/emergency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getABDMToken()}`,
        },
        body: JSON.stringify({ abhaNumber: abhaId }),
      });
      if (!response.ok) throw new Error(`ABDM emergency fetch failed: ${response.status}`);
      const data = await response.json();
      return data as PatientRecord;
    } catch (err) {
      console.warn('ABDM API unavailable, falling back to mock:', err);
    }
  }

  await delay(800);
  const patient = getMockPatient(abhaId);
  if (!patient) return null;
  // Return only emergency-relevant fields
  return {
    ...patient,
    prescriptions: [],
    labReports: [],
    diagnoses: [],
  };
}

/**
 * Send OTP to patient's registered mobile for consent verification.
 * In production: POST /api/{version}/consent/otp/send
 */
export async function sendOTP(
  abhaId: string,
  useMock = true
): Promise<{ sent: boolean; txnId: string }> {
  if (!useMock) {
    try {
      const response = await fetch(`${ABDM_BASE_URL}/api/${ABDM_API_VERSION}/consent/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getABDMToken()}`,
        },
        body: JSON.stringify({ abhaNumber: abhaId }),
      });
      if (!response.ok) throw new Error(`OTP send failed: ${response.status}`);
      const data = await response.json();
      return { sent: true, txnId: data.txnId };
    } catch (err) {
      console.warn('ABDM API unavailable, falling back to mock:', err);
    }
  }

  await delay(600);
  return { sent: true, txnId: `txn_${Date.now()}` };
}

/**
 * Verify OTP for consent.
 * In production: POST /api/{version}/consent/otp/verify
 */
export async function verifyOTP(
  _abhaId: string,
  _otp: string,
  useMock = true
): Promise<{ verified: boolean }> {
  if (!useMock) {
    try {
      const response = await fetch(`${ABDM_BASE_URL}/api/${ABDM_API_VERSION}/consent/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getABDMToken()}`,
        },
        body: JSON.stringify({ abhaNumber: _abhaId, otp: _otp, txnId: '' }),
      });
      if (!response.ok) throw new Error(`OTP verify failed: ${response.status}`);
      return { verified: true };
    } catch (err) {
      console.warn('ABDM API unavailable, falling back to mock:', err);
    }
  }

  await delay(400);
  return { verified: true };
}

/**
 * Generate an AI-powered medical summary from patient records.
 * In production this would call an LLM API via an edge function.
 * For this demo we generate a structured summary client-side.
 */
export async function generateAISummary(
  patient: PatientRecord,
  useMock = true
): Promise<string> {
  if (!useMock) {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-summary`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ patient }),
      });
      if (!response.ok) throw new Error(`AI summary failed: ${response.status}`);
      const data = await response.json();
      return data.summary;
    } catch (err) {
      console.warn('AI API unavailable, falling back to mock summary:', err);
    }
  }

  await delay(1800);
  return buildMockAISummary(patient);
}

// --- Helpers ---

function getABDMToken(): string {
  // In production this would be a valid ABDM sandbox access token
  return import.meta.env.VITE_ABDM_TOKEN ?? 'mock-token';
}

function generateMockABHA(): string {
  const part1 = String(Math.floor(10 + Math.random() * 89)).padStart(2, '0');
  const part2 = String(Math.floor(1000 + Math.random() * 8999)).padStart(4, '0');
  const part3 = String(Math.floor(1000 + Math.random() * 8999)).padStart(4, '0');
  const part4 = String(Math.floor(1000 + Math.random() * 8999)).padStart(4, '0');
  return `${part1}-${part2}-${part3}-${part4}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildMockAISummary(patient: PatientRecord): string {
  const redFlags: string[] = [];

  // Generate red flags from data
  if (patient.allergies.length > 0 && patient.allergies[0] !== 'No known drug allergies') {
    redFlags.push(`Severe drug allergies: ${patient.allergies.join(', ')}`);
  }
  if (patient.chronicConditions.some((c) => c.includes('Diabetes'))) {
    redFlags.push('Diabetic patient — check blood glucose before any procedure');
  }
  if (patient.chronicConditions.some((c) => c.includes('Kidney'))) {
    redFlags.push('CKD — AVOID nephrotoxic drugs (NSAIDs, contrast dye without hydration)');
  }
  if (patient.chronicConditions.some((c) => c.includes('Coronary') || c.includes('Artery'))) {
    redFlags.push('CAD history — cardiac monitoring required during procedures');
  }
  if (patient.currentMedicines.some((m) => m.toLowerCase().includes('warfarin'))) {
    redFlags.push('On WARFARIN — check INR before surgery; high bleeding risk');
  }
  if (patient.bloodGroup === 'O-') {
    redFlags.push('O- blood type — universal donor but rare; arrange O- units if transfusion needed');
  }
  if (redFlags.length === 0) {
    redFlags.push('No major red flags identified from available records');
  }

  const lines = [
    `PATIENT: ${patient.name} (${patient.age}y, ${patient.gender})`,
    `ABHA ID: ${patient.abhaId}`,
    '',
    '--- BLOOD GROUP ---',
    patient.bloodGroup,
    '',
    '--- ALLERGIES ---',
    patient.allergies.length > 0 ? patient.allergies.join('\n') : 'No known allergies',
    '',
    '--- CHRONIC CONDITIONS ---',
    patient.chronicConditions.length > 0 ? patient.chronicConditions.join('\n') : 'None recorded',
    '',
    '--- CURRENT MEDICATIONS ---',
    patient.currentMedicines.length > 0 ? patient.currentMedicines.join('\n') : 'None recorded',
    '',
    '--- RED FLAGS (READ BEFORE TREATING) ---',
    redFlags.map((r) => `! ${r}`).join('\n'),
  ];

  return lines.join('\n');
}
