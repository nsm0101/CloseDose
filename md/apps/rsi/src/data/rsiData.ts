/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Medication, Scenario, ParalyticComparison, PremedComparison, PostSedationAgent, TransportMed } from '../types';

export const INDUCTION_AGENTS: Medication[] = [
  {
    id: 'ketamine',
    name: 'Ketamine',
    class: 'induction',
    ivDose: '1.5 mg/kg (range 1–2 mg/kg over ≥60 seconds)',
    ivDosePerKg: 1.5, // Standard RSI calculator default
    ivDoseRangePerKg: { min: 1, max: 2 },
    imDose: '4–5 mg/kg (when IV access unavailable)',
    imDosePerKg: 4.5,
    onset: '~30 seconds (IV) | 3–5 min (IM)',
    duration: '5–10 minutes (IV) | 15–30 min (IM)',
    advantages: [
      'Provides sedation + analgesia + amnesia (unique)',
      'Bronchodilator (improves dynamic compliance)',
      'Sympathomimetic hemodynamic support',
      'No adrenal suppression'
    ],
    disadvantages: [
      'Direct myocardial depressant in catecholamine-depleted patients',
      'Increases oral secretions (consider glycopyrrolate)',
      'Emergence reactions (~8% in children, increases with age >10 years)',
      'Absolutely contraindicated <3 months per guidelines'
    ],
    contraindications: [
      'Age <3 months (absolute contraindication for procedural sedation)',
      'Severe active coronary artery disease',
      'Hypersensitivity'
    ],
    notes: 'Administer over ≥60 seconds; rapid push can cause apnea and enhanced vasopressor response. Schedule III controlled substance.',
    bulletPoints: [
      'NEAR4KIDS documents use in 32% of PICU intubations with fewer adverse events.',
      'Ketamine does not clinically raise ICP in ventilated pediatric patients.',
      'A great option for status asthmaticus and hemodynamic instability.'
    ],
    schedule: 'Schedule III'
  },
  {
    id: 'etomidate',
    name: 'Etomidate',
    class: 'induction',
    ivDose: '0.3 mg/kg (range 0.2–0.6 mg/kg) over 30–60 seconds',
    ivDosePerKg: 0.3,
    onset: '<1 minute',
    duration: '3–5 minutes',
    advantages: [
      'Exceptional hemodynamic stability (minimal SBP changes)',
      'Lowers intracranial pressure (ICP)',
      'Not a controlled substance'
    ],
    disadvantages: [
      'Single-dose adrenal suppression for 6–8 hours (inhibits 11β-hydroxylase)',
      'Absolutely avoid in septic shock',
      'No analgesic properties',
      'Myoclonus is common during induction'
    ],
    contraindications: [
      'Septic shock or suspected severe sepsis',
      'Adrenal insufficiency',
      'Known hypersensitivity'
    ],
    notes: 'FDA-approved for age ≥10 years only; widely used off-label in younger children with minimal hemodynamic changes.',
    bulletPoints: [
      '2022 SCCM and Surviving Sepsis guidelines recommend against routine use in septic shock.',
      'Associated with higher mortality in pediatric sepsis (pooled OR 4.51).',
      'Provides excellent stable blood pressure profiles in stable trauma or stable elevated ICP.'
    ]
  },
  {
    id: 'propofol',
    name: 'Propofol',
    class: 'induction',
    ivDose: '2.5–3.5 mg/kg (reduce to 1–1.5 mg/kg if hemodynamically compromised)',
    ivDosePerKg: 3.0,
    ivDoseRangePerKg: { min: 2.5, max: 3.5 },
    onset: '15–30 seconds',
    duration: '5–10 minutes',
    advantages: [
      'Extremely rapid onset and very clean, rapid offset',
      'Lowers intracranial pressure (ICP)',
      'Anticonvulsant properties'
    ],
    disadvantages: [
      'Significant dose-dependent hypotension (4× more likely than etomidate)',
      'Bradycardia risk (especially with co-administration of fentanyl)',
      'Apnea occurs in 27% of pediatric inductions',
      'Propofol Infusion Syndrome (PRIS) risk with prolonged use',
      'Contraindicated in mitochondrial disease'
    ],
    contraindications: [
      'Mitochondrial disease / suspected mitochondrial pathology',
      'Hemodynamic instability or shock',
      'Hypersensitivity to egg, soy, or propofol'
    ],
    notes: 'FDA-approved for induction in patients ≥3 years only. Neonates (off-label): 1–2.5 mg/kg (reduce to 1 mg/kg if ≤1000g).',
    bulletPoints: [
      'Causes rapid blood pressure drops due to vasodilation.',
      'Ideal for hemodynamically stable patients with status epilepticus or stable elevated ICP.',
      'Never use for prolonged sedation in the pediatric ICU due to PRIS risks.'
    ]
  },
  {
    id: 'midazolam',
    name: 'Midazolam',
    class: 'induction',
    ivDose: '0.2–0.3 mg/kg IV',
    ivDosePerKg: 0.3,
    ivDoseRangePerKg: { min: 0.2, max: 0.3 },
    onset: '1–5 minutes (~90 seconds with fentanyl co-administration)',
    duration: '15–60 minutes',
    advantages: [
      'Excellent anticonvulsant and amnestic properties',
      'Reversible with flumazenil (0.02 mg/kg)',
      'Multiple administration routes available (IV, IM, IN, oral, rectal)'
    ],
    disadvantages: [
      'Slowest onset of all RSI induction agents',
      'Unreliable sedation depth as a sole agent',
      'Dose-dependent hypotension',
      'No analgesia',
      'Paradoxical excitation possible in children'
    ],
    contraindications: [
      'Acute narrow-angle glaucoma',
      'Severe respiratory depression',
      'Hypersensitivity to benzodiazepines'
    ],
    notes: 'Neonates (<6 months) are highly vulnerable to airway obstruction; titrate slowly in small increments.',
    bulletPoints: [
      'Often used as an alternative agent when ketamine or etomidate are unavailable.',
      'Excellent as a primary induction agent in status epilepticus.',
      'Slow onset makes it less ideal for classic crash RSI unless co-administered with fentanyl.'
    ]
  }
];

export const SCENARIOS: Scenario[] = [
  {
    id: 'sepsis',
    name: 'Sepsis / Septic Shock',
    preferredInduction: ['ketamine'],
    alternativeInduction: ['midazolam'],
    avoidInduction: ['etomidate', 'propofol'],
    rationale: 'Ketamine provides essential sympathomimetic support with no adrenal suppression. Etomidate is associated with higher mortality in pediatric sepsis due to single-dose adrenal suppression (pooled OR 4.51). Propofol can cause severe cardiovascular collapse.',
    recommendedParalytic: ['rocuronium'],
    avoidParalytic: []
  },
  {
    id: 'trauma_stable',
    name: 'Trauma (Hemodynamically Stable)',
    preferredInduction: ['ketamine', 'etomidate'],
    alternativeInduction: [],
    avoidInduction: [],
    rationale: 'Both agents are hemodynamically favorable; clinical trials show no mortality differences in hemodynamically stable pediatric trauma patients.',
    recommendedParalytic: ['rocuronium', 'succinylcholine'],
    avoidParalytic: []
  },
  {
    id: 'trauma_hypotensive',
    name: 'Trauma (Hypotensive / Shock)',
    preferredInduction: ['ketamine'],
    alternativeInduction: ['etomidate'],
    avoidInduction: ['propofol'],
    rationale: 'Ketamine provides analgesia + hemodynamic support, but the dose should be reduced (e.g., 1 mg/kg) if the patient is catecholamine-depleted. Etomidate is an acceptable alternative. Propofol causes significant hypotension and should be avoided.',
    recommendedParalytic: ['rocuronium'],
    avoidParalytic: ['succinylcholine'] // succinylcholine carries hyperkalemia risk in crush/burns > 48h, but also in shock rocuronium is safer
  },
  {
    id: 'icp_stable',
    name: 'Elevated ICP (Stable BP)',
    preferredInduction: ['etomidate', 'propofol', 'ketamine'],
    alternativeInduction: [],
    avoidInduction: [],
    rationale: 'All lower ICP. Modern data shows ketamine does not clinically raise ICP in mechanically ventilated patients. Propofol lowers cerebral metabolic rate but should only be used if BP is stable.',
    recommendedParalytic: ['rocuronium', 'succinylcholine'],
    avoidParalytic: []
  },
  {
    id: 'icp_unstable',
    name: 'Elevated ICP (Unstable BP)',
    preferredInduction: ['etomidate', 'ketamine'],
    alternativeInduction: [],
    avoidInduction: ['propofol'],
    rationale: 'Propofol is 4× more likely to cause hypotension than etomidate, which would critically compromise cerebral perfusion pressure. Etomidate and ketamine preserve systemic perfusion.',
    recommendedParalytic: ['rocuronium'],
    avoidParalytic: []
  },
  {
    id: 'asthmaticus',
    name: 'Status Asthmaticus',
    preferredInduction: ['ketamine'],
    alternativeInduction: [],
    avoidInduction: [],
    rationale: 'Ketamine is a potent bronchodilator that improves dynamic compliance and airway resistance. IV Lidocaine premedication should be avoided as it can paradoxically worsen bronchospasm.',
    recommendedParalytic: ['rocuronium', 'succinylcholine'],
    avoidParalytic: []
  },
  {
    id: 'epilepticus',
    name: 'Status Epilepticus',
    preferredInduction: ['propofol', 'midazolam', 'ketamine'],
    alternativeInduction: [],
    avoidInduction: [],
    rationale: 'Propofol and midazolam provide dual seizure control + induction. Ketamine has been shown to terminate up to 51% of pediatric refractory status epilepticus (RSE) in meta-analyses.',
    recommendedParalytic: ['rocuronium', 'succinylcholine'],
    avoidParalytic: []
  },
  {
    id: 'chd',
    name: 'Congenital Heart Disease',
    preferredInduction: ['ketamine'],
    alternativeInduction: ['etomidate'],
    avoidInduction: ['propofol'],
    rationale: 'Ketamine maintains cardiac output; use caution with severe ventricular dysfunction. Avoid propofol due to systemic vasodilation and risk of profound hypotension.',
    recommendedParalytic: ['rocuronium'],
    avoidParalytic: ['succinylcholine'] // bradycardia susceptibility
  },
  {
    id: 'neonates',
    name: 'Neonates',
    preferredInduction: ['propofol'], // propofol 1-2.5 mg/kg (reduced dose)
    alternativeInduction: ['ketamine'], // caution < 3 months
    avoidInduction: ['etomidate'], // < 10 years not FDA approved, caution neonates
    rationale: 'Propofol (reduced dose) or Ketamine (with caution in <3 months) are used. Etomidate is not FDA-approved under 10 years and has limited safety data in neonates. Neonates have limited reserves for all agents.',
    recommendedParalytic: ['rocuronium'],
    avoidParalytic: ['succinylcholine']
  }
];

export const PARALYTICS_COMPARISON: ParalyticComparison[] = [
  {
    id: 'rocuronium',
    name: 'Rocuronium (Zemuron)',
    ivDoseInfo: 'All ages: 1.0 mg/kg (RSI Dose)',
    imDoseInfo: 'Not reliably effective IM (1.8 mg/kg studied but results in inconsistent intubating conditions)',
    onset: '60–90 seconds (comparable to succinylcholine at RSI doses ≥0.9 mg/kg)',
    duration: '30–90 minutes (highly dose- and age-dependent)',
    reversal: 'Sugammadex 2–4 mg/kg (FDA-approved from birth through adolescence; median recovery 1.4 minutes)',
    hyperkalemiaRisk: 'No hyperkalemia risk',
    malignantHyperthermiaRisk: 'Not a trigger',
    bradycardiaRisk: 'Minimal risk',
    contraindications: [
      'Anaphylaxis or known severe hypersensitivity to rocuronium or vecuronium'
    ],
    whenToChoose: [
      'Any contraindication to succinylcholine is present (e.g., myopathies, burns >48h, renal failure, high potassium)',
      'Unknown medical history (safer default clinical profile)',
      'Planned prolonged paralysis for procedures or transport',
      'Sugammadex is readily available for rapid reversal'
    ]
  },
  {
    id: 'succinylcholine',
    name: 'Succinylcholine (Anectine)',
    ivDoseInfo: 'Neonates/infants ≤6 mo: 2–3 mg/kg\n6 mo–2 yr: 1–2 mg/kg\n>2 yr: 1–1.5 mg/kg',
    imDoseInfo: '3–4 mg/kg (max 150 mg); onset 2–3 min',
    onset: '<45–60 seconds',
    duration: '6–10 minutes',
    reversal: 'Self-limited (no reversal agent needed due to rapid spontaneous recovery)',
    hyperkalemiaRisk: 'Yes (increases potassium by 0.3–1.0 mEq/L normally; can cause 5–10 mEq/L spikes in susceptible patients, leading to cardiac arrest)',
    malignantHyperthermiaRisk: 'Yes (potent triggering agent)',
    bradycardiaRisk: 'High risk in children (especially after the first dose, or with any second dose)',
    contraindications: [
      'Black Box Warning: Undiagnosed skeletal muscle myopathy (e.g., Duchenne, typical in males ≤8 yr)',
      'History of malignant hyperthermia',
      'Pre-existing hyperkalemia (K+ > 5.5 mEq/L)',
      'Major burns, denervation, crush injury, or severe sepsis >48 hours old',
      'Pseudocholinesterase deficiency'
    ],
    whenToChoose: [
      'Extremely short duration is desired (e.g. anticipated difficult airway with "can\'t intubate, can\'t ventilate" concern)',
      'Intramuscular route is required and IV access is unavailable (3-4 mg/kg)',
      'Early neurological assessment is critical post-intubation (wears off in 6–10 mins)'
    ]
  }
];

export const ROCURONIUM_DURATION_BY_AGE = [
  { ageGroup: 'Neonates (<28 days)', timeToMaxBlock: '1.0 min', clinicalDuration: '49.7 min', durationAtRSIDose: '114.4 min' },
  { ageGroup: 'Infants (28 days–3 mo)', timeToMaxBlock: '0.4 min', clinicalDuration: '59.8 min', durationAtRSIDose: '103.3 min' },
  { ageGroup: 'Toddlers (3 mo–2 yr)', timeToMaxBlock: '0.6 min', clinicalDuration: '44.2 min', durationAtRSIDose: '—' },
  { ageGroup: 'Children (2–11 yr)', timeToMaxBlock: '0.8 min', clinicalDuration: '36.7 min', durationAtRSIDose: '53.1 min' },
  { ageGroup: 'Adolescents (11–17 yr)', timeToMaxBlock: '0.9 min', clinicalDuration: '41.4 min', durationAtRSIDose: '—' }
];

export const PREMED_COMPARISON: PremedComparison[] = [
  {
    name: 'Atropine',
    ivDose: '0.02 mg/kg IV/IO (No minimum dose! Historical 0.1 mg minimum abandoned)',
    onset: 'Nearly immediate IV',
    vagalBlockDuration: '~4 minutes',
    antisialagogueDuration: 'Shorter',
    crossesBBB: true,
    pupilDilation: true,
    heartRateEffect: 'Greater tachycardia / elevation',
    secretionControl: 'Good',
    preferredIn: [
      'Emergency intubation following PALS guidelines',
      'Immediate vagolytic onset is needed',
      'Infants <1 year (highest vagal bradycardia risk)',
      'When succinylcholine is used (especially second dose)',
      'Pre-existing bradycardia prior to intubation',
      'Acute symptomatic bradycardia'
    ]
  },
  {
    name: 'Glycopyrrolate',
    ivDose: '0.004 mg/kg IV (Patients <2 years may require up to 0.009 mg/kg); Max single dose: 0.1 mg',
    onset: '~1 minute IV',
    vagalBlockDuration: '2–3 hours',
    antisialagogueDuration: 'Up to 7 hours',
    crossesBBB: false,
    pupilDilation: false,
    heartRateEffect: 'Smoother, less extreme heart rate fluctuations',
    secretionControl: 'Superior / Excellent',
    preferredIn: [
      'When neurological monitoring is critical (does NOT dilate pupils as it does not cross BBB)',
      'Ketamine is the induction agent (superior secretion control and longer duration)',
      'Prolonged vagolytic effect is desired'
    ]
  }
];

export const POST_SEDATION_AGENTS: PostSedationAgent[] = [
  {
    id: 'dexmedetomidine',
    name: 'Dexmedetomidine (Precedex)',
    loadingDose: '0.5–1 mcg/kg over 10 minutes (consider omitting to avoid hemodynamic effects)',
    loadingDosePerKg: 1, // mcg/kg
    infusionRate: '0.2–1.4 mcg/kg/hr (Typical 0.4–0.8 mcg/kg/hr)',
    neonatalAdjustment: '0.05–0.4 mcg/kg/hr (due to reduced clearance; half-life is 7.6h in preterms vs 3.2h in terms)',
    advantages: [
      'Preferred primary sedative over benzodiazepines (SCCM 2022)',
      'Sedation resembles natural sleep with preserved arousability',
      'Minimal respiratory depression',
      'Reduces delirium versus benzodiazepines (RR 0.59–0.63)',
      'Reduces mechanical ventilation duration'
    ],
    disadvantages: [
      'Bradycardia risk (incidence 2.6–42%, OR 6.14 vs other sedatives)',
      'Hypersensitivity or pooled hypotension (6.1%)',
      'Slow onset; may not achieve deep sedation alone',
      'Not FDA-approved for pediatric ICU sedation'
    ],
    sccmRole: 'First-line primary sedative for mechanically ventilated pediatric patients. Strongly recommended post-cardiac surgery.'
  },
  {
    id: 'fentanyl',
    name: 'Fentanyl',
    loadingDose: '1–2 mcg/kg IV (slow push)',
    loadingDosePerKg: 1.5, // mcg/kg
    infusionRate: '1–3 mcg/kg/hr (0.017–0.05 mcg/kg/min)',
    neonatalAdjustment: '1 mcg/kg/hr produces adequate analgesia; clearance is significantly reduced <6.6 months',
    advantages: [
      'Potent and immediate analgesia',
      'No histamine release (preferred over morphine in hemodynamic instability)',
      'No active metabolites (preferred in renal dysfunction)',
      'Minimal cardiovascular depression'
    ],
    disadvantages: [
      'Profound respiratory depression',
      'Chest wall rigidity ("rigid chest") with rapid bolus, especially in neonates',
      'Rapid tolerance development (can occur within 1 day of starting)',
      'No intrinsic sedative properties (analgesia only)'
    ],
    sccmRole: 'Primary analgesic of choice for moderate-to-severe pain in mechanically ventilated pediatric patients.'
  },
  {
    id: 'ketamine_sedation',
    name: 'Ketamine (Adjunct Sedation)',
    loadingDose: '0.5–2 mg/kg IV',
    loadingDosePerKg: 1, // mg/kg
    infusionRate: '5–15 mcg/kg/min (0.3–0.9 mg/kg/hr); up to 20-60 mcg/kg/min for refractory bronchospasm',
    neonatalAdjustment: 'Limited data; use with caution in patients <3 months',
    advantages: [
      'Provides both sedation and analgesia',
      'Excellent hemodynamic stability; maintains BP and cardiac output',
      'Potent bronchodilation (improves ventilation compliance in severe asthma)',
      'Preserves respiratory drive'
    ],
    disadvantages: [
      'Hypersalivation (may require glycopyrrolate co-administration)',
      'Emergence phenomena and delirium possible',
      'Tachycardia and systemic hypertension',
      'Neurotoxicity concerns in neonates based on animal data'
    ],
    sccmRole: 'Suggested as adjunct sedation when target depth is not achieved with primary agents, or as part of a drug rotation strategy.'
  },
  {
    id: 'midazolam_sedation',
    name: 'Midazolam (Adjunct Sedation)',
    loadingDose: '0.05–0.2 mg/kg IV over 2–3 minutes (non-neonatal; omit loading in neonates)',
    loadingDosePerKg: 0.1, // mg/kg
    infusionRate: '1–2 mcg/kg/min (0.06–0.12 mg/kg/hr); Neonates <32 wk: 0.5 mcg/kg/min; ≥32 wk: 1 mcg/kg/min',
    neonatalAdjustment: 'Preterms require lower infusion rates and absolutely no loading bolus due to risk of hypotension.',
    advantages: [
      'Well-established pediatric safety profile',
      'Reversible with flumazenil',
      'Excellent for concurrent seizure management',
      'FDA-labeled for pediatric ICU sedation'
    ],
    disadvantages: [
      'Independently associated with increased delirium (SCCM 2022 guidelines)',
      'Longer duration of mechanical ventilation compared to dexmedetomidine',
      'Profound respiratory depression when combined with opioids',
      'Significant tolerance and withdrawal risk'
    ],
    sccmRole: 'No longer first-line primary sedative. Reserved for rescue sedation, severe delirium, or seizure control.'
  },
  {
    id: 'propofol_sedation',
    name: 'Propofol (Short-Term Only)',
    loadingDose: '1–2 mg/kg IV',
    loadingDosePerKg: 1, // mg/kg
    infusionRate: '5–50 mcg/kg/min (keep <67 mcg/kg/min or <4 mg/kg/hr for <48 hours)',
    neonatalAdjustment: 'Not recommended for prolonged sedation in neonates.',
    advantages: [
      'Ultra-rapid onset and offset, facilitating rapid neurological assessments and extubation',
      'Excellent antiemetic and anticonvulsant',
      'Lowers ICP significantly'
    ],
    disadvantages: [
      'Propofol Infusion Syndrome (PRIS) risk (metabolic acidosis, rhabdomyolysis, hyperkalemia, cardiac failure)',
      'Higher mortality demonstrated in multicenter pediatric trial (9% vs 4%)',
      'Profound systemic hypotension and myocardial depression',
      'Contraindicated in mitochondrial disease'
    ],
    sccmRole: 'Suggested ONLY for short-term (<48 hr) sedation at low rates, particularly in the periextubation period. Monitor ECG, lactic acid, triglycerides, CK, creatinine, and LFTs.'
  }
];

export const TRANSPORT_KITS: TransportMed[] = [
  // Category A: Resuscitation
  {
    category: 'Resuscitation',
    name: 'Epinephrine (0.1 mg/mL)',
    indication: 'Cardiac arrest, symptomatic bradycardia',
    doseFormula: '0.01 mg/kg (0.1 mL/kg of 0.1 mg/mL solution) q3–5 min',
    dosePerKg: 0.01,
    maxDose: '1 mg per single dose',
    route: 'IV/IO',
    notes: 'Standard PALS cardiac arrest dosing. Ensure correct concentration (0.1 mg/mL, formerly 1:10,000).'
  },
  {
    category: 'Resuscitation',
    name: 'Atropine',
    indication: 'Symptomatic bradycardia, pre-intubation premedication',
    doseFormula: '0.02 mg/kg IV/IO',
    dosePerKg: 0.02,
    maxDose: '0.5 mg (<12 yr), 1.0 mg (≥12 yr)',
    route: 'IV/IO',
    notes: 'No minimum dose (historical 0.1 mg minimum has been abandoned).'
  },
  {
    category: 'Resuscitation',
    name: 'Amiodarone',
    indication: 'Shock-refractory VF / pulseless VT',
    doseFormula: '5 mg/kg bolus',
    dosePerKg: 5,
    maxDose: '15 mg/kg total maximum',
    route: 'IV/IO',
    notes: 'May repeat up to 3 times for refractory VF/pVT.'
  },
  {
    category: 'Resuscitation',
    name: 'Adenosine',
    indication: 'Supraventricular Tachycardia (SVT)',
    doseFormula: '0.1 mg/kg rapid push (1st dose); 0.2 mg/kg (2nd dose)',
    dosePerKg: 0.1,
    maxDose: '6 mg (1st dose) / 12 mg (2nd dose)',
    route: 'Rapid IV push',
    notes: 'Administer via immediate rapid flush technique as close to the hub as possible.'
  },
  {
    category: 'Resuscitation',
    name: 'Calcium Chloride 10%',
    indication: 'Hypocalcemia, hyperkalemia, calcium channel blocker overdose',
    doseFormula: '20 mg/kg (0.2 mL/kg) IV slow push',
    dosePerKg: 20,
    route: 'IV slow push',
    notes: 'Administer slowly. Central access preferred due to extravasation necrosis risk.'
  },
  {
    category: 'Resuscitation',
    name: 'Sodium Bicarbonate 8.4%',
    indication: 'Sodium channel blocker toxicity, severe metabolic acidosis, hyperkalemia',
    doseFormula: '1 mEq/kg IV slow push',
    dosePerKg: 1,
    route: 'IV',
    notes: 'Ensure adequate ventilation during administration to clear generated CO2.'
  },
  {
    category: 'Resuscitation',
    name: 'Dextrose (D10W / D25W)',
    indication: 'Acute hypoglycemia',
    doseFormula: '0.5–1 g/kg (D10W: 5–10 mL/kg; D25W: 2–4 mL/kg)',
    dosePerKg: 0.5,
    route: 'IV',
    notes: 'D10W preferred in neonates/infants to avoid hyperosmolality.'
  },

  // Category B: Vasopressors / Inotropes
  {
    category: 'Vasoactive',
    name: 'Epinephrine Infusion',
    indication: 'Fluid-refractory cold shock, severe myocardial dysfunction',
    doseFormula: '0.01–0.3 mcg/kg/min (titrate)',
    dosePerKg: 0.1, // standard titration mid-point for calculator
    route: 'Continuous IV/IO',
    notes: 'First-line for pediatric cold shock. Recommended over dopamine. Can be initiated via peripheral IV/IO.'
  },
  {
    category: 'Vasoactive',
    name: 'Norepinephrine Infusion',
    indication: 'Fluid-refractory warm vasodilatory shock',
    doseFormula: '0.01–0.3 mcg/kg/min (titrate)',
    dosePerKg: 0.1,
    route: 'Continuous IV/IO',
    notes: 'First-line for pediatric warm shock. Initiating peripherally is conditionally recommended over delaying for central line.'
  },
  {
    category: 'Vasoactive',
    name: 'Dopamine Infusion',
    indication: 'Alternative shock treatment (when epinephrine/norepinephrine are unavailable)',
    doseFormula: '2–20 mcg/kg/min (titrate)',
    dosePerKg: 10,
    route: 'Continuous IV/IO',
    notes: 'Second-line agent per Surviving Sepsis Guidelines. Epinephrine or norepinephrine is strongly preferred.'
  },
  {
    category: 'Vasoactive',
    name: 'Push-Dose Epinephrine',
    indication: 'Temporizing bridge for acute severe hypotension',
    doseFormula: '1–10 mcg/kg IV (dilute to 10 mcg/mL: mix 1 mL of 0.1 mg/mL epi with 9 mL sterile saline)',
    dosePerKg: 5, // mid-range
    route: 'IV push (dilute)',
    notes: 'Strict dilution check. Administer as an immediate temporizing bridge while establishing continuous infusion.'
  },

  // Category C: Sedation / Analgesia Transport
  {
    category: 'Sedation',
    name: 'Fentanyl Infusion',
    indication: 'Continuous analgesia during critical transport',
    doseFormula: '1–3 mcg/kg/hr',
    dosePerKg: 2,
    route: 'Continuous IV',
    notes: 'First-line analgesic; hemodynamically neutral. Check concentration of premixed syringes.'
  },
  {
    category: 'Sedation',
    name: 'Midazolam Infusion',
    indication: 'Continuous sedation during transport',
    doseFormula: '0.05–0.1 mg/kg/hr (bolus 0.05–0.1 mg/kg PRN)',
    dosePerKg: 0.075,
    route: 'Continuous IV',
    notes: 'Most commonly used transport sedative in surveys (72%). Watch for respiratory depression.'
  },
  {
    category: 'Sedation',
    name: 'Dexmedetomidine Infusion',
    indication: 'Preferred primary sedative during transport',
    doseFormula: '0.2–0.7 mcg/kg/hr (omit loading dose during transport)',
    dosePerKg: 0.45,
    route: 'Continuous IV',
    notes: 'SCCM-preferred. Avoid loading doses during transport to minimize bradycardia/hypotension.'
  },
  {
    category: 'Sedation',
    name: 'Ketamine Infusion / Bolus',
    indication: 'Sedation + analgesia, bronchospasm control',
    doseFormula: '0.5–2 mg/kg IV bolus; 0.5–2 mg/kg/hr infusion',
    dosePerKg: 1.25,
    route: 'Continuous IV / Bolus',
    notes: 'Maintains hemodynamics and respiratory drive. Excellent for transport of severe asthmatics.'
  }
];

export const TRANSPORT_EQUIPMENT_CHECKLIST = [
  {
    category: 'Monitoring',
    items: [
      { name: 'Continuous Pulse Oximetry', detail: 'Ensure spare pediatric/infant probes' },
      { name: 'Continuous ECG Monitor', detail: 'Check lead placement and securement' },
      { name: 'Continuous Capnography (EtCO2)', detail: 'Mandatory for all intubated patients (microstream or inline)' },
      { name: 'Automated Blood Pressure Monitor', detail: 'Appropriate sized cuffs (infant, toddler, child, adolescent)' }
    ]
  },
  {
    category: 'Ventilation & Oxygen',
    items: [
      { name: 'Portable Mechanical Ventilator', detail: 'Preferred over manual bagging (less tidal volume/rate variability); fully charged' },
      { name: 'Manual Bag-Valve-Mask (BVM)', detail: 'Check self-inflating bag and sizes (infant, child, adult sizes)' },
      { name: 'Primary & Backup Oxygen Sources', detail: 'Calculate projected transport usage plus a 30-minute reserve supply' },
      { name: 'Suction Equipment', detail: 'Battery-operated portable suction machine with Yankauer and flexible catheters' }
    ]
  },
  {
    category: 'Airway Supplies',
    items: [
      { name: 'Laryngoscope Handles & Blades', detail: 'Miller (straight) 0, 1, 2, 3 and Mac (curved) 1, 2, 3 blades with working bulbs/LEDs' },
      { name: 'Endotracheal Tubes (ETTs)', detail: 'Cuffed and uncuffed tubes in sizes matching patient weight/age + one size smaller + one size larger' },
      { name: 'Supraglottic Airway Devices', detail: 'Laryngeal Mask Airway (LMA) sizes 1, 1.5, 2, 2.5, 3, 4 as critical backups' },
      { name: 'ETT Stylets & Securing Material', detail: 'Appropriate sized stylets and ETT holders, adhesive tape, or cotton ties' },
      { name: 'Nasogastric (NG) Tube', detail: 'For active gastric decompression (crucial to prevent diaphragmatic splinting and aspiration)' }
    ]
  },
  {
    category: 'Vascular Access & Infusion',
    items: [
      { name: 'Peripheral IV Catheters', detail: 'Sizes 24G, 22G, 20G, 18G with securement dressings' },
      { name: 'Intraosseous (IO) Needle Kit', detail: 'Manual or drill-powered IO driver with pediatric (pink) and adolescent (blue) needles' },
      { name: 'Battery-operated Infusion Pumps', detail: 'Ensure all pumps are fully charged and have running pediatric drug libraries' },
      { name: 'Extension sets, stopcocks, flushes', detail: 'Three-way stopcocks and micro-bore extension tubings' }
    ]
  },
  {
    category: 'Other Emergencies',
    items: [
      { name: 'Defibrillator / Monitor with Pads', detail: 'Ensure pediatric paddles or multifunction pacing/defib adhesive pads are present' },
      { name: 'Broselow Tape / Weight Drug Reference', detail: 'Instantly accessible physical standard weight reference chart' },
      { name: 'Precalculated Code Sheet', detail: 'Standardized paper or digital sheet calculated exactly for the active patient weight' },
      { name: 'Active Warming / Temperature Monitor', detail: 'Warming blankets to prevent hypothermia, which exacerbates coagulopathy and acidosis' }
    ]
  }
];

export const TRANSPORT_PRINCIPLES = [
  'Stabilize before transport: secure and confirm the airway and breathing prior to departing. Never rush a critical airway en route.',
  'Precalculate all medication doses and emergency push-doses by weight before stepping foot out of the department.',
  'Use checklists systematically: they are clinically proven to drastically reduce preventable adverse airway events.',
  'Peripheral vasoactive initiation is completely acceptable: do not delay life-saving vasopressor support to obtain central access.',
  'Ensure adequate power, battery life, and oxygen reserves: calculate for expected duration plus a generous contingency buffer.',
  'Leverage specialized pediatric transport teams: they are associated with lower transit morbidity compared to general teams.'
];
