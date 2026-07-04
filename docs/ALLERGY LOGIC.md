CALCULATOR LOGIC: MEDICATION-BY-MEDICATION
Global Inputs (Collected Once)
 
INPUT: age<em>months  → integer (0–215)   // 0 months to 17 years 11 months</em>
 
INPUT: weight<em>kg   → decimal (2.0–120.0)</em>
 
DERIVED: age<em>years  = floor(age</em>months / 12)
 

CALCULATOR 1: CETIRIZINE (Zyrtec)
Formulations available: Oral solution 1 mg/mL | Chewable 10 mg | Tablet 10 mg
 
FUNCTION cetirizine<em>dose(age</em>months, weight<em>kg):</em>
 
  IF age<em>months < 6:</em>
 
RETURN {
 
      dose<em>mg: NULL,</em>
 
message: "⛔ NOT RECOMMENDED under 6 months of age.",
 
action: "Consult your child's doctor."
 
}
 
  ELSE IF age<em>months >= 6 AND age</em>months <= 23:
 
// Weight gate: confirm ≥7 kg
 
    IF weight<em>kg < 7:</em>
 
RETURN {
 
        dose<em>mg: NULL,</em>
 
message: "⚠️ Weight below studied range (<7 kg). Consult doctor."
 
}
 
RETURN {
 
      dose<em>mg: 2.5,</em>
 
      volume<em>mL: 2.5,           // using 1 mg/mL solution</em>
 
frequency: "Once daily",
 
      max<em>daily</em>mg: 2.5,
 
formulation: "Oral solution ONLY (1 mg/mL)",
 
warning: "Physician-directed dosing only. OTC label says 'ask a doctor' under age 2."
 
}
 
  ELSE IF age<em>years >= 2 AND age</em>years <= 5:
 
RETURN {
 
      dose<em>mg: 2.5,</em>
 
      volume<em>mL: 2.5,</em>
 
frequency: "Once daily; may increase to TWICE daily if symptoms persist",
 
      max<em>daily</em>mg: 5,
 
formulation: "Oral solution (1 mg/mL)",
 
warning: NONE
 
}
 
  ELSE IF age<em>years >= 6 AND age</em>years <= 11:
 
// Weight-adjusted within bracket
 
    IF weight<em>kg < 25:</em>
 
recommended = 5
 
ELSE:
 
recommended = 10
 
RETURN {
 
      dose<em>mg: recommended,</em>
 
      volume<em>mL: recommended,   // 1 mg/mL</em>
 
frequency: "Once daily",
 
      max<em>daily</em>mg: 10,
 
formulation: "Oral solution, chewable tablet, OR tablet",
 
warning: NONE
 
}
 
  ELSE IF age<em>years >= 12 AND age</em>years <= 17:
 
RETURN {
 
      dose<em>mg: 10,</em>
 
      volume<em>mL: 10,            // if using solution</em>
 
frequency: "Once daily",
 
      max<em>daily</em>mg: 10,
 
formulation: "Any (solution, chewable, or tablet)",
 
warning: NONE
 
}
 

CALCULATOR 2: LORATADINE (Claritin)
Formulations available: Oral solution 5 mg/5 mL (1 mg/mL) | Chewable 5 mg | Tablet 10 mg | RediTab 10 mg
 
FUNCTION loratadine<em>dose(age</em>months, weight<em>kg):</em>
 
  IF age<em>months < 24:</em>
 
RETURN {
 
      dose<em>mg: NULL,</em>
 
message: "⛔ NOT APPROVED under 2 years. Consult your child's doctor."
 
}
 
  ELSE IF age<em>years >= 2 AND age</em>years <= 5:
 
RETURN {
 
      dose<em>mg: 5,</em>
 
      volume<em>mL: 5,             // 1 mg/mL solution</em>
 
frequency: "Once daily",
 
      max<em>daily</em>mg: 5,
 
formulation: "Oral solution (5 mg/5 mL) or 1 chewable tablet (5 mg)",
 
warning: NONE
 
}
 
  ELSE IF age<em>years >= 6 AND age</em>years <= 11:
 
RETURN {
 
      dose<em>mg: 10,</em>
 
      volume<em>mL: 10,            // 1 mg/mL solution</em>
 
frequency: "Once daily",
 
      max<em>daily</em>mg: 10,
 
formulation: "Oral solution (10 mL), 2 chewable tablets, or 1 tablet (10 mg)",
 
warning: NONE
 
}
 
  ELSE IF age<em>years >= 12 AND age</em>years <= 17:
 
RETURN {
 
      dose<em>mg: 10,</em>
 
frequency: "Once daily",
 
      max<em>daily</em>mg: 10,
 
formulation: "Tablet (10 mg) or RediTab (10 mg)",
 
warning: NONE
 
}
 

CALCULATOR 3: FEXOFENADINE (Allegra)
Formulations available: Oral suspension 30 mg/5 mL (6 mg/mL) | ODT 30 mg | Tablets 60 mg, 180 mg
 
FUNCTION fexofenadine<em>dose(age</em>months, weight<em>kg):</em>
 
  IF age<em>months < 24:</em>
 
RETURN {
 
      dose<em>mg: NULL,</em>
 
message: "⛔ NOT APPROVED under 2 years."
 
}
 
  ELSE IF age<em>years >= 2 AND age</em>years <= 5:
 
RETURN {
 
      dose<em>mg: 30,</em>
 
      volume<em>mL: 5,             // 6 mg/mL suspension</em>
 
frequency: "TWICE daily (every 12 hours)",
 
      max<em>daily</em>mg: 60,
 
formulation: "Oral suspension (30 mg/5 mL)",
 
warning: "OTC label says 'ask a doctor' under age 6. Physician-directed.",
 
special: "⚠️ Give on EMPTY STOMACH. Avoid fruit juices (apple, orange, grapefruit) — they reduce absorption by up to 70%."
 
}
 
  ELSE IF age<em>years >= 6 AND age</em>years <= 11:
 
RETURN {
 
      dose<em>mg: 30,</em>
 
      volume<em>mL: 5,</em>
 
frequency: "TWICE daily (every 12 hours)",
 
      max<em>daily</em>mg: 60,
 
formulation: "ODT (30 mg) or oral suspension (5 mL)",
 
special: "⚠️ Give on EMPTY STOMACH. Avoid fruit juices."
 
}
 
  ELSE IF age<em>years >= 12 AND age</em>years <= 17:
 
RETURN {
 
      dose<em>mg</em>option1: 60,      // BID option
 
      dose<em>mg</em>option2: 180,     // QD option
 
      frequency<em>option1: "Twice daily",</em>
 
      frequency<em>option2: "Once daily",</em>
 
      max<em>daily</em>mg: 180,
 
formulation: "Tablet (60 mg or 180 mg)",
 
special: "⚠️ Give on EMPTY STOMACH. Avoid fruit juices."
 
}
 

CALCULATOR 4: LEVOCETIRIZINE (Xyzal)
Formulations available: OTC oral solution 2.5 mg/5 mL (0.5 mg/mL) | Rx solution 0.5 mg/mL | Rx tablet 5 mg
 
FUNCTION levocetirizine<em>dose(age</em>months, weight<em>kg):</em>
 
  IF age<em>months < 6:</em>
 
RETURN {
 
      dose<em>mg: NULL,</em>
 
message: "⛔ NOT RECOMMENDED under 6 months."
 
}
 
  ELSE IF age<em>months >= 6 AND age</em>months <= 23:
 
    IF weight<em>kg < 7:</em>
 
RETURN {
 
        dose<em>mg: NULL,</em>
 
message: "⚠️ Weight below studied range. Consult doctor."
 
}
 
RETURN {
 
      dose<em>mg: 1.25,</em>
 
      volume<em>mL: 2.5,           // 0.5 mg/mL Rx solution</em>
 
frequency: "Once daily IN THE EVENING",
 
      max<em>daily</em>mg: 1.25,
 
formulation: "Rx oral solution ONLY (0.5 mg/mL)",
 
warning: "Physician-directed. OTC label says 'do not use' under 2."
 
}
 
  ELSE IF age<em>years >= 2 AND age</em>years <= 5:
 
RETURN {
 
      dose<em>mg: 1.25,</em>
 
      volume<em>mL: 2.5,           // OTC 0.5 mg/mL</em>
 
frequency: "Once daily IN THE EVENING",
 
      max<em>daily</em>mg: 1.25,
 
formulation: "OTC oral solution (2.5 mg/5 mL → give 2.5 mL)",
 
warning: NONE
 
}
 
  ELSE IF age<em>years >= 6 AND age</em>years <= 11:
 
RETURN {
 
      dose<em>mg: 2.5,</em>
 
      volume<em>mL: 5,             // OTC 0.5 mg/mL</em>
 
frequency: "Once daily IN THE EVENING",
 
      max<em>daily</em>mg: 2.5,
 
formulation: "OTC oral solution (2.5 mg/5 mL → give 5 mL)",
 
warning: "⚠️ Do NOT give 5 mg (adult dose) — produces ~2× adult blood levels in children 6–11."
 
}
 
  ELSE IF age<em>years >= 12 AND age</em>years <= 17:
 
RETURN {
 
      dose<em>mg: 5,</em>
 
      volume<em>mL: 10,            // OTC solution</em>
 
frequency: "Once daily IN THE EVENING",
 
      max<em>daily</em>mg: 5,
 
formulation: "OTC solution (10 mL) or Rx tablet (5 mg)",
 
warning: NONE
 
}
 

CALCULATOR 5: DIPHENHYDRAMINE (Benadryl)
Formulations available: Oral solution 12.5 mg/5 mL (2.5 mg/mL) | Chewable 12.5 mg | Capsule/Tablet 25 mg
 
FUNCTION diphenhydramine<em>dose(age</em>months, weight<em>kg):</em>
 
// GLOBAL WARNING appended to all outputs:
 
// "⚠️ FIRST-GENERATION: Causes drowsiness. May cause paradoxical
 
//  excitation in young children. Use a 2nd-generation antihistamine
 
//  (cetirizine, loratadine) if available."
 
  IF age<em>months < 24:</em>
 
RETURN {
 
      dose<em>mg: NULL,</em>
 
message: "🚫 DO NOT USE under 2 years. FDA advisory against OTC cough/cold/antihistamine use in children <2."
 
}
 
  ELSE IF age<em>years >= 2 AND age</em>years <= 3:
 
    IF weight<em>kg < 10:</em>
 
RETURN { message: "⚠️ Very low weight. Consult doctor for individualized dosing." }
 
// Weight-based: 1.25 mg/kg/dose
 
    calculated<em>dose = ROUND(1.25 * weight</em>kg, nearest 0.5)
 
    calculated<em>dose = MIN(calculated</em>dose, 12.5)  // cap at bracket max
 
    volume = calculated<em>dose / 2.5                 // 2.5 mg/mL</em>
 
RETURN {
 
      dose<em>mg: calculated</em>dose,
 
      volume<em>mL: ROUND(volume, 1),</em>
 
frequency: "Every 4–6 hours as needed",
 
      max<em>daily</em>mg: MIN(5 <em> weight_kg, 75),</em>
 
      max<em>doses</em>per<em>day: 6,</em>
 
formulation: "Oral solution ONLY (12.5 mg/5 mL)",
 
warning: "Physician-directed only. OTC labels say 'do not use' under age 4."
 
}
 
  ELSE IF age<em>years >= 4 AND age</em>years <= 5:
 
RETURN {
 
      dose<em>mg: 12.5,</em>
 
      volume<em>mL: 5,</em>
 
frequency: "Every 4–6 hours as needed",
 
      max<em>daily</em>mg: 75,
 
      max<em>doses</em>per<em>day: 6,</em>
 
formulation: "Oral solution (5 mL) or 1 chewable tablet (12.5 mg)",
 
warning: NONE
 
}
 
  ELSE IF age<em>years >= 6 AND age</em>years <= 11:
 
// Weight-tiered within bracket
 
    IF weight<em>kg < 25:</em>
 
dose = 12.5
 
ELSE:
 
dose = 25
 
RETURN {
 
      dose<em>mg: dose,</em>
 
      volume<em>mL: dose / 2.5,</em>
 
frequency: "Every 4–6 hours as needed",
 
      max<em>daily</em>mg: 150,
 
      max<em>doses</em>per<em>day: 6,</em>
 
formulation: "Oral solution, chewable, or capsule/tablet (if ≥25 mg dose)",
 
warning: NONE
 
}
 
  ELSE IF age<em>years >= 12 AND age</em>years <= 17:
 
RETURN {
 
      dose<em>mg: 25,              // can go up to 50</em>
 
      dose<em>range: "25–50 mg",</em>
 
frequency: "Every 4–6 hours as needed",
 
      max<em>daily</em>mg: 300,
 
      max<em>doses</em>per<em>day: 6,</em>
 
formulation: "Any (solution, chewable, capsule, or tablet)",
 
warning: NONE
 
}
 

CALCULATOR 6: CHLORPHENIRAMINE (Chlor-Trimeton)
Formulations available: Tablet 4 mg | Syrup 2 mg/5 mL (less commonly available as single-ingredient)
 
FUNCTION chlorpheniramine<em>dose(age</em>months, weight<em>kg):</em>
 
// GLOBAL WARNING: Same 1st-gen warning as diphenhydramine
 
  IF age<em>months < 24:</em>
 
RETURN {
 
      dose<em>mg: NULL,</em>
 
message: "🚫 DO NOT USE under 2 years."
 
}
 
  ELSE IF age<em>years >= 2 AND age</em>years <= 5:
 
RETURN {
 
      dose<em>mg: 1,</em>
 
      volume<em>mL: 2.5,           // if using 2 mg/5 mL syrup</em>
 
frequency: "Every 4–6 hours as needed",
 
      max<em>daily</em>mg: 6,
 
formulation: "Syrup (2 mg/5 mL) — give 2.5 mL",
 
warning: "OTC labels typically say 'ask a doctor' for this age group."
 
}
 
  ELSE IF age<em>years >= 6 AND age</em>years <= 11:
 
RETURN {
 
      dose<em>mg: 2,</em>
 
      volume<em>mL: 5,             // 2 mg/5 mL syrup</em>
 
frequency: "Every 4–6 hours as needed",
 
      max<em>daily</em>mg: 12,
 
formulation: "Syrup (5 mL) or ½ tablet (if scored 4 mg tablet available)",
 
warning: NONE
 
}
 
  ELSE IF age<em>years >= 12 AND age</em>years <= 17:
 
RETURN {
 
      dose<em>mg: 4,</em>
 
frequency: "Every 4–6 hours as needed",
 
      max<em>daily</em>mg: 24,
 
formulation: "Tablet (4 mg)",
 
warning: NONE
 
}
 

CALCULATOR 7: EPINEPHRINE AUTO-INJECTOR (EpiPen / Auvi-Q / neffy)
This calculator is WEIGHT-BASED ONLY (age is secondary).
 
FUNCTION epinephrine<em>dose(age</em>months, weight<em>kg):</em>
 
// GLOBAL MESSAGES (always displayed):
 
// "🚨 EPINEPHRINE is the ONLY first-line treatment for anaphylaxis."
 
// "Inject into MID-OUTER THIGH. Can inject through clothing."
 
// "CALL 911 AFTER administering. Do NOT delay epinephrine for antihistamines."
 
// "A second dose may be given after 5 minutes if symptoms persist."
 
// "Always carry TWO devices."
 
  IF weight<em>kg < 7.5:</em>
 
RETURN {
 
      dose<em>mg: NULL,</em>
 
message: "⚠️ No auto-injector approved for <7.5 kg. Requires physician-prepared drawn-up epinephrine (0.01 mg/kg IM). Discuss with allergist.",
 
      calculated<em>dose: ROUND(0.01 * weight</em>kg, 3)  // for reference
 
}
 
  ELSE IF weight<em>kg >= 7.5 AND weight</em>kg < 15:
 
RETURN {
 
      dose<em>mg: 0.15,</em>
 
devices:
 
"Auvi-Q 0.1 mg (FDA-approved for 7.5–<15 kg)",
 
"EpiPen Jr 0.15 mg (safe and acceptable per guidelines)",
 
"Auvi-Q 0.15 mg"
 
],
 
intranasal: NULL,          // neffy not approved <15 kg
 
site: "Mid-outer thigh, IM",
 
repeat: "May repeat × 1 after 5 minutes",
 
warning: "Either 0.1 mg or 0.15 mg is acceptable in this weight range per 2023 AAAAI guidelines."
 
}
 
  ELSE IF weight<em>kg >= 15 AND weight</em>kg < 25:
 
RETURN {
 
      dose<em>mg: 0.15,</em>
 
devices:
 
"EpiPen Jr 0.15 mg",
 
"Auvi-Q 0.15 mg",
 
"neffy 1 mg intranasal spray (needle-free option)"
 
],
 
      intranasal<em>instructions: "Spray into ONE nostril. Do NOT sniff. May repeat in same nostril after 5 min.",</em>
 
site: "Mid-outer thigh, IM (or intranasal if using neffy)",
 
repeat: "May repeat × 1 after 5 minutes"
 
}
 
  ELSE IF weight<em>kg >= 25 AND weight</em>kg < 30:
 
RETURN {
 
      dose<em>mg: 0.3,</em>
 
devices:
 
"EpiPen 0.3 mg",
 
"Auvi-Q 0.3 mg",
 
"neffy 2 mg intranasal spray"
 
],
 
      intranasal<em>instructions: "Spray into ONE nostril. Do NOT sniff. May repeat in same nostril after 5 min.",</em>
 
site: "Mid-outer thigh, IM (or intranasal if using neffy)",
 
repeat: "May repeat × 1 after 5 minutes",
 
note: "AAAAI/AAP/EAACI guidelines recommend 0.3 mg at ≥25 kg. FDA label threshold is 30 kg — either is acceptable."
 
}
 
  ELSE IF weight<em>kg >= 30:</em>
 
RETURN {
 
      dose<em>mg: 0.3,</em>
 
devices:
 
"EpiPen 0.3 mg",
 
"Auvi-Q 0.3 mg",
 
"neffy 2 mg intranasal spray"
 
],
 
      intranasal<em>instructions: "Spray into ONE nostril. Do NOT sniff. May repeat in same nostril after 5 min.",</em>
 
site: "Mid-outer thigh, IM (or intranasal if using neffy)",
 
repeat: "May repeat × 1 after 5 minutes"
 
}
 

CALCULATOR 8: FAMOTIDINE (Adjunctive H2 Blocker — Off-Label)
 
FUNCTION famotidine<em>dose(age</em>months, weight<em>kg):</em>
 
  IF age<em>months < 12:</em>
 
RETURN {
 
      dose<em>mg: NULL,</em>
 
message: "⚠️ Not typically used under 1 year for allergic reactions. Consult doctor."
 
}
 
  ELSE IF age<em>months >= 12 AND age</em>years < 12:
 
// Weight-based: 0.25–0.5 mg/kg
 
    dose<em>low  = ROUND(0.25 * weight</em>kg, nearest 1)
 
    dose<em>high = ROUND(0.5 * weight</em>kg, nearest 1)
 
    dose<em>high = MIN(dose</em>high, 20)   // cap single dose at 20 mg
 
RETURN {
 
      dose<em>range: dose</em>low + "–" + dose<em>high + " mg",</em>
 
frequency: "Once or twice daily",
 
      max<em>daily</em>mg: MIN(2 <em> dose_high, 40),</em>
 
formulation: "Rx oral suspension (8 mg/mL) for young children; OTC tablets (10 mg, 20 mg) for older children who can swallow",
 
warning: "Off-label for allergic reactions. Use as ADJUNCT to H1 antihistamine, not alone."
 
}
 
  ELSE IF age<em>years >= 12 AND age</em>years <= 17:
 
RETURN {
 
      dose<em>mg: "10–20 mg",</em>
 
frequency: "Once or twice daily",
 
      max<em>daily</em>mg: 40,
 
formulation: "OTC tablet (10 mg or 20 mg)",
 
warning: "Off-label for allergic reactions."
 
}
 

CALCULATOR 9: PREDNISOLONE / PREDNISONE (Rx Only — Adjunctive)
 
FUNCTION prednisolone<em>dose(age</em>months, weight<em>kg):</em>
 
// GLOBAL: "⚠️ PRESCRIPTION ONLY. Do not start without physician direction."
 
  IF age<em>months < 1:</em>
 
RETURN {
 
message: "⚠️ Neonatal dosing requires specialist guidance."
 
}
 
// Universal weight-based dosing for all pediatric ages
 
  dose<em>low  = ROUND(1.0 * weight</em>kg, nearest 1)
 
  dose<em>high = ROUND(2.0 * weight</em>kg, nearest 1)
 
  dose<em>high = MIN(dose</em>high, 60)     // absolute max 60 mg/day
 
  dose<em>low  = MIN(dose</em>low, 60)
 
  IF weight<em>kg < 10:</em>
 
formulation = "Prednisolone liquid (15 mg/5 mL or 3 mg/mL)"
 
  ELSE IF weight<em>kg < 30:</em>
 
formulation = "Prednisolone liquid preferred; ODT (Orapred) if available"
 
ELSE:
 
formulation = "Prednisone tablet (5 mg, 10 mg, 20 mg) or prednisolone liquid"
 
RETURN {
 
    dose<em>range: dose</em>low + "–" + dose<em>high + " mg/day",</em>
 
frequency: "Once daily (morning) or divided twice daily",
 
duration: "3–5 days (no taper needed for short courses)",
 
    max<em>daily</em>mg: 60,
 
formulation: formulation,
 
warning: "Rx only. Weak evidence for benefit in anaphylaxis. Commonly used for moderate-severe allergic reactions."
 
}
 

MASTER CONTROLLER LOGIC
This is the wrapper that ties all calculators together:
 
FUNCTION allergy<em>calculator(age</em>months, weight<em>kg, severity):</em>
 
// STEP 1: Validate inputs
 
  IF age<em>months < 0 OR age</em>months > 215:
 
ERROR "Age must be 0–17 years (0–215 months)"
 
  IF weight<em>kg < 2 OR weight</em>kg > 120:
 
ERROR "Please enter a valid weight"
 
// STEP 2: Determine severity tier
 
// severity = "mild" | "moderate" | "severe/anaphylaxis"
 
// STEP 3: Build output based on severity
 
IF severity == "mild":
 
OUTPUT SECTION "✅ Recommended: 2nd-Generation Antihistamine (choose one)"
 
      → cetirizine<em>dose(age</em>months, weight<em>kg)</em>
 
      → loratadine<em>dose(age</em>months, weight<em>kg)</em>
 
      → fexofenadine<em>dose(age</em>months, weight<em>kg)</em>
 
      → levocetirizine<em>dose(age</em>months, weight<em>kg)</em>
 
OUTPUT SECTION "⚠️ Alternative (if 2nd-gen unavailable)"
 
      → diphenhydramine<em>dose(age</em>months, weight<em>kg)</em>
 
ELSE IF severity == "moderate":
 
OUTPUT SECTION "✅ Recommended: 2nd-Generation Antihistamine (choose one)"
 
      → cetirizine<em>dose(age</em>months, weight<em>kg)</em>
 
      → loratadine<em>dose(age</em>months, weight<em>kg)</em>
 
      → fexofenadine<em>dose(age</em>months, weight<em>kg)</em>
 
      → levocetirizine<em>dose(age</em>months, weight<em>kg)</em>
 
OUTPUT SECTION "➕ Consider Adding: H2 Blocker"
 
      → famotidine<em>dose(age</em>months, weight<em>kg)</em>
 
OUTPUT SECTION "⚠️ Alternative H1 (if 2nd-gen unavailable)"
 
      → diphenhydramine<em>dose(age</em>months, weight<em>kg)</em>
 
OUTPUT WARNING "🔴 Monitor closely. If swelling involves lips/tongue/throat → treat as SEVERE."
 
ELSE IF severity == "severe" OR severity == "anaphylaxis":
 
OUTPUT SECTION "🚨 FIRST: EPINEPHRINE — Give IMMEDIATELY"
 
      → epinephrine<em>dose(age</em>months, weight<em>kg)</em>
 
OUTPUT SECTION "📞 CALL 911"
 
OUTPUT SECTION "➕ After Epinephrine: Antihistamine"
 
      → cetirizine<em>dose(age</em>months, weight<em>kg)   // preferred</em>
 
      → diphenhydramine<em>dose(age</em>months, weight<em>kg) // alternative</em>
 
OUTPUT SECTION "➕ Adjunctive (physician-directed)"
 
      → famotidine<em>dose(age</em>months, weight<em>kg)</em>
 
      → prednisolone<em>dose(age</em>months, weight<em>kg)</em>
 
OUTPUT WARNING "⚠️ Any use of epinephrine requires emergency department evaluation."
 
 
SECTION 5: WHEN TO CALL 911 — RED FLAGS FOR PARENTS
Administer epinephrine AND call 911 immediately if ANY of the following occur after allergen exposure: 
	•	Breathing difficulty: wheezing, stridor, throat tightness, hoarse voice, persistent cough
	•	Swelling of tongue, lips, or throat
	•	Dizziness, fainting, or limpness (especially in infants)
	•	Vomiting or severe abdominal pain combined with hives or breathing problems
	•	Two or more body systems involved: skin (hives/flushing) PLUS respiratory OR GI OR cardiovascular symptoms
	•	In infants: inconsolable crying, sudden limpness, pallor, or behavioral change after known allergen exposure 
Critical reminders for parents:
	•	Anaphylaxis can occur without hives — respiratory or GI symptoms alone can represent anaphylaxis 
	•	Give epinephrine FIRST, then call 911 — do not wait to see if antihistamines work 
	•	Any use of epinephrine should be followed by emergency evaluation 
	•	Biphasic reactions (recurrence of symptoms) occur in <5% of cases, typically within 4–8 hours — observation in an ED is recommended
 
 
 
