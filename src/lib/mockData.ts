import type { PatientRecord } from '@/types';

export const mockPatients: PatientRecord[] = [
  {
    abhaId: '12-3456-7890-1234',
    name: 'Rajesh Kumar Sharma',
    age: 54,
    gender: 'Male',
    phone: '+91 98765 43210',
    bloodGroup: 'B+',
    allergies: ['Penicillin', 'Sulfa drugs', 'Peanuts'],
    chronicConditions: ['Type 2 Diabetes', 'Hypertension', 'Mild Asthma'],
    currentMedicines: ['Metformin 500mg (twice daily)', 'Amlodipine 5mg (once daily)', 'Insulin Glargine 15 units (night)', 'Salbutamol inhaler (SOS)'],
    emergencyContact: {
      name: 'Priya Sharma',
      phone: '+91 98765 11111',
      relation: 'Spouse',
    },
    address: '42, Green Park Avenue',
    city: 'New Delhi',
    state: 'Delhi',
    prescriptions: [
      { id: 'rx1', medication: 'Metformin', dosage: '500mg', frequency: 'Twice daily', prescribedBy: 'Dr. Anil Mehta', date: '2026-08-15', status: 'Active' },
      { id: 'rx2', medication: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', prescribedBy: 'Dr. Anil Mehta', date: '2026-08-15', status: 'Active' },
      { id: 'rx3', medication: 'Insulin Glargine', dosage: '15 units', frequency: 'At night', prescribedBy: 'Dr. Sunita Rao', date: '2026-07-22', status: 'Active' },
      { id: 'rx4', medication: 'Salbutamol Inhaler', dosage: '200mcg', frequency: 'As needed', prescribedBy: 'Dr. Vikram Singh', date: '2026-06-10', status: 'Active' },
      { id: 'rx5', medication: 'Atorvastatin', dosage: '10mg', frequency: 'Once daily', prescribedBy: 'Dr. Anil Mehta', date: '2026-03-05', status: 'Completed' },
    ],
    labReports: [
      { id: 'lr1', testName: 'HbA1c (Glycated Hemoglobin)', result: '8.2', normalRange: '< 5.7', unit: '%', date: '2026-08-20', status: 'Abnormal', lab: 'Dr. Lal PathLabs' },
      { id: 'lr2', testName: 'Fasting Blood Glucose', result: '142', normalRange: '70-100', unit: 'mg/dL', date: '2026-08-20', status: 'Abnormal', lab: 'Dr. Lal PathLabs' },
      { id: 'lr3', testName: 'Blood Pressure', result: '148/96', normalRange: '< 120/80', unit: 'mmHg', date: '2026-08-18', status: 'Abnormal', lab: 'AIIMS OPD' },
      { id: 'lr4', testName: 'Total Cholesterol', result: '210', normalRange: '< 200', unit: 'mg/dL', date: '2026-08-20', status: 'Abnormal', lab: 'Dr. Lal PathLabs' },
      { id: 'lr5', testName: 'Serum Creatinine', result: '1.1', normalRange: '0.6-1.2', unit: 'mg/dL', date: '2026-08-20', status: 'Normal', lab: 'Dr. Lal PathLabs' },
      { id: 'lr6', testName: 'CBC - Hemoglobin', result: '13.8', normalRange: '13-17', unit: 'g/dL', date: '2026-08-20', status: 'Normal', lab: 'Dr. Lal PathLabs' },
      { id: 'lr7', testName: 'ECG', result: 'Sinus rhythm, LVH noted', normalRange: 'Normal sinus rhythm', unit: '-', date: '2026-07-15', status: 'Abnormal', lab: 'AIIMS Cardiology' },
    ],
    diagnoses: [
      { id: 'd1', condition: 'Type 2 Diabetes Mellitus', icdCode: 'E11.9', diagnosedDate: '2021-03-12', severity: 'Moderate', status: 'Chronic', notes: 'Uncontrolled on current regimen. Consider insulin titration.' },
      { id: 'd2', condition: 'Essential Hypertension', icdCode: 'I10', diagnosedDate: '2019-06-08', severity: 'Moderate', status: 'Chronic', notes: 'Stage 2 hypertension, on dual therapy.' },
      { id: 'd3', condition: 'Mild Persistent Asthma', icdCode: 'J45.30', diagnosedDate: '2015-09-22', severity: 'Mild', status: 'Chronic', notes: 'Triggered by dust and cold air.' },
      { id: 'd4', condition: 'Hyperlipidemia', icdCode: 'E78.5', diagnosedDate: '2023-01-15', severity: 'Mild', status: 'Active', notes: 'On statin therapy, last LDL 132.' },
      { id: 'd5', condition: 'Left Ventricular Hypertrophy', icdCode: 'I51.7', diagnosedDate: '2026-07-15', severity: 'Moderate', status: 'Active', notes: 'Likely secondary to uncontrolled HTN. Cardiology referral pending.' },
    ],
    lastUpdated: '2026-08-20T14:30:00Z',
  },
  {
    abhaId: '14-9876-5432-0198',
    name: 'Aishwarya Reddy',
    age: 31,
    gender: 'Female',
    phone: '+91 90080 22334',
    bloodGroup: 'O-',
    allergies: ['No known drug allergies'],
    chronicConditions: ['Hypothyroidism'],
    currentMedicines: ['Levothyroxine 75mcg (once daily, morning)'],
    emergencyContact: {
      name: 'Karthik Reddy',
      phone: '+91 90080 99887',
      relation: 'Brother',
    },
    address: '15, Jubilee Hills Road No 36',
    city: 'Hyderabad',
    state: 'Telangana',
    prescriptions: [
      { id: 'rx1', medication: 'Levothyroxine', dosage: '75mcg', frequency: 'Once daily (morning)', prescribedBy: 'Dr. Lakshmi Iyer', date: '2026-07-01', status: 'Active' },
    ],
    labReports: [
      { id: 'lr1', testName: 'TSH (Thyroid Stimulating Hormone)', result: '3.8', normalRange: '0.4-4.0', unit: 'mIU/L', date: '2026-08-10', status: 'Normal', lab: 'Vijaya Diagnostic' },
      { id: 'lr2', testName: 'Free T4', result: '1.3', normalRange: '0.8-1.8', unit: 'ng/dL', date: '2026-08-10', status: 'Normal', lab: 'Vijaya Diagnostic' },
      { id: 'lr3', testName: 'CBC', result: 'Within normal limits', normalRange: '-', unit: '-', date: '2026-08-10', status: 'Normal', lab: 'Vijaya Diagnostic' },
    ],
    diagnoses: [
      { id: 'd1', condition: 'Primary Hypothyroidism', icdCode: 'E03.9', diagnosedDate: '2022-11-04', severity: 'Mild', status: 'Chronic', notes: 'Well controlled on Levothyroxine 75mcg.' },
    ],
    lastUpdated: '2026-08-10T09:15:00Z',
  },
  {
    abhaId: '10-2233-4455-6677',
    name: 'Mohammed Irfan Khan',
    age: 67,
    gender: 'Male',
    phone: '+91 98220 55667',
    bloodGroup: 'A+',
    allergies: ['Aspirin', 'NSAIDs (Ibuprofen, Diclofenac)'],
    chronicConditions: ['Coronary Artery Disease', 'Chronic Kidney Disease Stage 3', 'Atrial Fibrillation'],
    currentMedicines: ['Clopidogrel 75mg (once daily)', 'Atorvastatin 40mg (once daily)', 'Metoprolol 25mg (twice daily)', 'Warfarin 5mg (as per INR)'],
    emergencyContact: {
      name: 'Fatima Khan',
      phone: '+91 98220 33221',
      relation: 'Daughter',
    },
    address: '8, Marine Drive, Nariman Point',
    city: 'Mumbai',
    state: 'Maharashtra',
    prescriptions: [
      { id: 'rx1', medication: 'Clopidogrel', dosage: '75mg', frequency: 'Once daily', prescribedBy: 'Dr. Sanjay Deshpande', date: '2026-08-01', status: 'Active' },
      { id: 'rx2', medication: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily', prescribedBy: 'Dr. Sanjay Deshpande', date: '2026-08-01', status: 'Active' },
      { id: 'rx3', medication: 'Metoprolol', dosage: '25mg', frequency: 'Twice daily', prescribedBy: 'Dr. Sanjay Deshpande', date: '2026-08-01', status: 'Active' },
      { id: 'rx4', medication: 'Warfarin', dosage: '5mg', frequency: 'As per INR', prescribedBy: 'Dr. Sanjay Deshpande', date: '2026-07-15', status: 'Active' },
    ],
    labReports: [
      { id: 'lr1', testName: 'INR (International Normalized Ratio)', result: '3.2', normalRange: '2.0-3.0', unit: '-', date: '2026-08-25', status: 'Abnormal', lab: 'Metropolis Healthcare' },
      { id: 'lr2', testName: 'Serum Creatinine', result: '1.9', normalRange: '0.6-1.2', unit: 'mg/dL', date: '2026-08-25', status: 'Abnormal', lab: 'Metropolis Healthcare' },
      { id: 'lr3', testName: 'eGFR', result: '45', normalRange: '> 90', unit: 'mL/min', date: '2026-08-25', status: 'Abnormal', lab: 'Metropolis Healthcare' },
      { id: 'lr4', testName: 'Troponin I', result: '0.02', normalRange: '< 0.04', unit: 'ng/mL', date: '2026-06-18', status: 'Normal', lab: 'Lilavati Hospital' },
      { id: 'lr5', testName: 'ECG', result: 'Atrial fibrillation, rate controlled', normalRange: 'Normal sinus rhythm', unit: '-', date: '2026-08-20', status: 'Abnormal', lab: 'Lilavati Hospital' },
      { id: 'lr6', testName: 'Echocardiogram', result: 'LVEF 45%, RWMA in LAD territory', normalRange: 'LVEF > 55%', unit: '%', date: '2026-06-20', status: 'Abnormal', lab: 'Lilavati Hospital' },
    ],
    diagnoses: [
      { id: 'd1', condition: 'Coronary Artery Disease (post-PCI)', icdCode: 'I25.5', diagnosedDate: '2020-04-14', severity: 'Severe', status: 'Chronic', notes: 'Stent to LAD in 2020. On dual antiplatelet therapy.' },
      { id: 'd2', condition: 'Chronic Kidney Disease Stage 3', icdCode: 'N18.3', diagnosedDate: '2023-02-10', severity: 'Moderate', status: 'Chronic', notes: 'eGFR 45. Avoid nephrotoxic drugs including NSAIDs.' },
      { id: 'd3', condition: 'Atrial Fibrillation', icdCode: 'I48.0', diagnosedDate: '2021-08-20', severity: 'Moderate', status: 'Chronic', notes: 'On warfarin, INR target 2.0-3.0. Currently supratherapeutic.' },
    ],
    lastUpdated: '2026-08-25T16:00:00Z',
  },
];

export function getMockPatient(abhaId: string): PatientRecord | undefined {
  return mockPatients.find((p) => p.abhaId === abhaId);
}

export function getAnyPatient(): PatientRecord {
  return mockPatients[0];
}
