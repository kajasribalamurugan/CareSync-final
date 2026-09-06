const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PatientRecord {
  abhaId: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedicines: string[];
  prescriptions: unknown[];
  labReports: unknown[];
  diagnoses: unknown[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { patient } = (await req.json()) as { patient: PatientRecord };

    const redFlags: string[] = [];
    if (patient.allergies.length > 0 && patient.allergies[0] !== "No known drug allergies") {
      redFlags.push(`Severe drug allergies: ${patient.allergies.join(", ")}`);
    }
    if (patient.chronicConditions.some((c) => c.includes("Diabetes"))) {
      redFlags.push("Diabetic patient — check blood glucose before any procedure");
    }
    if (patient.chronicConditions.some((c) => c.includes("Kidney"))) {
      redFlags.push("CKD — AVOID nephrotoxic drugs (NSAIDs, contrast dye without hydration)");
    }
    if (patient.chronicConditions.some((c) => c.includes("Coronary") || c.includes("Artery"))) {
      redFlags.push("CAD history — cardiac monitoring required during procedures");
    }
    if (patient.currentMedicines.some((m) => m.toLowerCase().includes("warfarin"))) {
      redFlags.push("On WARFARIN — check INR before surgery; high bleeding risk");
    }
    if (patient.bloodGroup === "O-") {
      redFlags.push("O- blood type — universal donor but rare; arrange O- units if transfusion needed");
    }
    if (redFlags.length === 0) {
      redFlags.push("No major red flags identified from available records");
    }

    const summary = [
      `PATIENT: ${patient.name} (${patient.age}y, ${patient.gender})`,
      `ABHA ID: ${patient.abhaId}`,
      "",
      "--- BLOOD GROUP ---",
      patient.bloodGroup,
      "",
      "--- ALLERGIES ---",
      patient.allergies.length > 0 ? patient.allergies.join("\n") : "No known allergies",
      "",
      "--- CHRONIC CONDITIONS ---",
      patient.chronicConditions.length > 0 ? patient.chronicConditions.join("\n") : "None recorded",
      "",
      "--- CURRENT MEDICATIONS ---",
      patient.currentMedicines.length > 0 ? patient.currentMedicines.join("\n") : "None recorded",
      "",
      "--- RED FLAGS (READ BEFORE TREATING) ---",
      redFlags.map((r) => `! ${r}`).join("\n"),
    ].join("\n");

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
