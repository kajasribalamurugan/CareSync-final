export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  date: string;
  status: 'Active' | 'Completed' | 'Discontinued';
}

export interface LabReport {
  id: string;
  testName: string;
  result: string;
  normalRange: string;
  unit: string;
  date: string;
  status: 'Normal' | 'Abnormal' | 'Critical';
  lab: string;
}

export interface Diagnosis {
  id: string;
  condition: string;
  icdCode: string;
  diagnosedDate: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  status: 'Active' | 'Resolved' | 'Chronic';
  notes: string;
}

export interface PatientRecord {
  abhaId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedicines: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  address: string;
  city: string;
  state: string;
  prescriptions: Prescription[];
  labReports: LabReport[];
  diagnoses: Diagnosis[];
  lastUpdated: string;
}

export interface AuditEntry {
  id: string;
  doctorName: string;
  hospital: string;
  hospitalId: string;
  patientAbhaId: string;
  accessType: 'Normal' | 'Emergency';
  timestamp: string;
  expiryTime: string | null;
  suspicious: boolean;
}

export interface AccessHistoryEntry {
  id: string;
  patientAbhaId: string;
  doctorName: string;
  hospital: string;
  accessType: 'Normal' | 'Emergency';
  timestamp: string;
  reported: boolean;
}

export interface DoctorSession {
  name: string;
  hospitalId: string;
  hospital: string;
  loggedInAt: number;
}
