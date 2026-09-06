/*
# Create audit_trail and patient_access_history tables (single-tenant, no auth)

1. New Tables
- `audit_trail` — logs every doctor access event (normal + emergency)
  - id (uuid, PK)
  - doctor_name (text)
  - hospital (text)
  - hospital_id (text)
  - patient_abha_id (text)
  - access_type (text: 'Normal' or 'Emergency')
  - timestamp (timestamptz)
  - expiry_time (timestamptz, nullable — only for emergency access)
  - suspicious (boolean, default false — flagged by fraud check)
  - created_at (timestamptz)

- `patient_access_history` — transparency log for patients: who accessed their records
  - id (uuid, PK)
  - patient_abha_id (text)
  - doctor_name (text)
  - hospital (text)
  - access_type (text: 'Normal' or 'Emergency')
  - timestamp (timestamptz)
  - reported (boolean, default false — true if patient flagged as misuse)

2. Security
- Enable RLS on both tables.
- This is a demo with mock auth (no Supabase auth), so allow anon + authenticated CRUD.
- All data is intentionally shared/public for the demo.
*/ 

CREATE TABLE IF NOT EXISTS audit_trail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_name text NOT NULL,
  hospital text NOT NULL,
  hospital_id text NOT NULL,
  patient_abha_id text NOT NULL,
  access_type text NOT NULL CHECK (access_type IN ('Normal','Emergency')),
  timestamp timestamptz NOT NULL DEFAULT now(),
  expiry_time timestamptz,
  suspicious boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_audit_trail" ON audit_trail;
CREATE POLICY "anon_select_audit_trail" ON audit_trail FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_audit_trail" ON audit_trail;
CREATE POLICY "anon_insert_audit_trail" ON audit_trail FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_audit_trail" ON audit_trail;
CREATE POLICY "anon_update_audit_trail" ON audit_trail FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_audit_trail" ON audit_trail;
CREATE POLICY "anon_delete_audit_trail" ON audit_trail FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS patient_access_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_abha_id text NOT NULL,
  doctor_name text NOT NULL,
  hospital text NOT NULL,
  access_type text NOT NULL CHECK (access_type IN ('Normal','Emergency')),
  timestamp timestamptz NOT NULL DEFAULT now(),
  reported boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE patient_access_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_patient_access_history" ON patient_access_history;
CREATE POLICY "anon_select_patient_access_history" ON patient_access_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_patient_access_history" ON patient_access_history;
CREATE POLICY "anon_insert_patient_access_history" ON patient_access_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_patient_access_history" ON patient_access_history;
CREATE POLICY "anon_update_patient_access_history" ON patient_access_history FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_patient_access_history" ON patient_access_history;
CREATE POLICY "anon_delete_patient_access_history" ON patient_access_history FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_audit_trail_doctor_timestamp ON audit_trail(doctor_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_patient ON audit_trail(patient_abha_id);
CREATE INDEX IF NOT EXISTS idx_patient_access_history_abha ON patient_access_history(patient_abha_id);