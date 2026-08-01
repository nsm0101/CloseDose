const DAYS_PER_MONTH = 30.4375;
const DAYS_PER_YEAR = 365.25;
const MAX_AGE_DAYS = 18 * DAYS_PER_YEAR;

const freezeList = (values) => Object.freeze(values.map((value) => Object.freeze(value)));

export const SOURCE_REFERENCES = Object.freeze({
  'sccm-sepsis-2026': Object.freeze({
    title: 'Surviving Sepsis Campaign: pediatric sepsis and septic shock guideline',
    organization: 'Society of Critical Care Medicine',
    publication: '2026',
    citation: 'SCCM pediatric guideline, 2026'
  }),
  'btf-pediatric-tbi-3e': Object.freeze({
    title: 'Guidelines for the Management of Pediatric Severe TBI, Third Edition',
    organization: 'Brain Trauma Foundation',
    publication: '2019',
    citation: 'Brain Trauma Foundation, Third Edition'
  }),
  'fda-succinylcholine-2022': Object.freeze({
    title: 'QUELICIN succinylcholine chloride prescribing information',
    organization: 'US Food and Drug Administration',
    publication: '2022',
    citation: 'FDA reference ID 5069935'
  }),
  'esaic-bja-infant-airway-2023': Object.freeze({
    title: 'Airway management in neonates and infants: joint guideline',
    organization: 'ESAIC and British Journal of Anaesthesia',
    publication: '2023',
    citation: 'PMID 38065762'
  }),
  'near4kids-pediatric-ed-2021': Object.freeze({
    title: 'Intubation practice and outcomes among pediatric emergency departments',
    organization: 'NEAR4KIDS',
    publication: '2021',
    citation: 'PMID 34923705'
  }),
  'near4pem-attempts-2021': Object.freeze({
    title: 'Intubation attempts and adverse events in a pediatric emergency department',
    organization: 'Emergency Medicine Journal',
    publication: '2021',
    citation: 'PMID 34872932'
  }),
  'aha-aap-pals-2025': Object.freeze({
    title: 'Pediatric Advanced Life Support guideline',
    organization: 'American Heart Association and American Academy of Pediatrics',
    publication: '2025',
    citation: 'Circulation 2025;152(suppl 2):S479-S537'
  }),
  'aarc-palisi-asthma-2025': Object.freeze({
    title: 'AARC and PALISI clinical practice guideline: pediatric critical asthma',
    organization: 'AARC and PALISI',
    publication: '2025',
    citation: 'PMID 40323974'
  }),
  'aap-status-epilepticus-2024': Object.freeze({
    title: 'Status Epilepticus point-of-care quick reference',
    organization: 'American Academy of Pediatrics',
    publication: '2024',
    citation: 'AAP Pediatric Care Online, October 2024'
  }),
  'pinned-cc-rsi': Object.freeze({
    title: 'Imported CC-RSI scenario and medication reference',
    organization: 'CloseDose MD pinned source',
    publication: 'a309bda',
    citation: 'Commit a309bdaa7b7736051753a852b274b295ae00c67d'
  })
});

export const PATIENT_FACTORS = freezeList([
  {
    id: 'shock',
    label: 'Shock or poor perfusion now',
    sourceId: 'near4kids-pediatric-ed-2021',
    warningId: 'shock-adverse-event-risk',
    severity: 'critical',
    title: 'Physiologically difficult airway',
    detail: 'Shock was independently associated with adverse tracheal-intubation events in the pediatric ED registry. Review resuscitation, hemodynamic rescue, and the effect of positive-pressure ventilation before proceeding.'
  },
  {
    id: 'hyperkalemia',
    label: 'Known or suspected hyperkalemia',
    sourceId: 'fda-succinylcholine-2022',
    warningId: 'succinylcholine-hyperkalemia',
    severity: 'critical',
    title: 'Succinylcholine safety warning',
    detail: 'The FDA label warns that succinylcholine can cause serious dysrhythmia or cardiac arrest in patients with hyperkalemia or electrolyte abnormalities. Verify the current label and local contraindication policy.'
  },
  {
    id: 'myopathy',
    label: 'Known or suspected skeletal myopathy',
    sourceId: 'fda-succinylcholine-2022',
    warningId: 'succinylcholine-myopathy',
    severity: 'critical',
    title: 'Boxed pediatric warning',
    detail: 'The FDA label describes pediatric cardiac arrest from hyperkalemic rhabdomyolysis, often in children with previously unrecognized skeletal muscle disease, and lists skeletal muscle myopathy as a contraindication.'
  },
  {
    id: 'burns-denervation',
    label: 'Burn, denervation, upper motor neuron injury, or major trauma after the acute phase',
    sourceId: 'fda-succinylcholine-2022',
    warningId: 'succinylcholine-injury-phase',
    severity: 'critical',
    title: 'Injury-phase contraindication',
    detail: 'The FDA label contraindicates succinylcholine after the acute phase of major burns, multiple trauma, extensive denervation, or upper motor neuron injury because severe hyperkalemia and cardiac arrest may occur.'
  },
  {
    id: 'malignant-hyperthermia',
    label: 'Known or suspected malignant hyperthermia susceptibility',
    sourceId: 'fda-succinylcholine-2022',
    warningId: 'succinylcholine-mh',
    severity: 'critical',
    title: 'Malignant hyperthermia contraindication',
    detail: 'The FDA label contraindicates succinylcholine in patients with known or suspected genetic susceptibility to malignant hyperthermia.'
  },
  {
    id: 'limited-mouth-opening',
    label: 'Limited mouth opening',
    sourceId: 'near4kids-pediatric-ed-2021',
    warningId: 'limited-mouth-opening',
    severity: 'caution',
    title: 'Higher-risk airway feature',
    detail: 'Limited mouth opening was independently associated with adverse tracheal-intubation events in the pediatric ED registry. Revisit device choice, operator, backup oxygenation, and the attempt limit.'
  },
  {
    id: 'known-difficult-airway',
    label: 'Known difficult airway, airway anomaly, or prior airway surgery',
    sourceId: 'esaic-bja-infant-airway-2023',
    warningId: 'known-difficult-airway',
    severity: 'caution',
    title: 'Escalate the airway plan',
    detail: 'The neonatal and infant airway guideline emphasizes history and examination, age-adapted equipment, rescue oxygenation, attempt limitation, and confirmation with waveform end-tidal carbon dioxide.'
  },
  {
    id: 'chd-physiology-unknown',
    label: 'Known CHD but lesion, stage, or baseline saturation is unclear',
    sourceId: 'aha-aap-pals-2025',
    warningId: 'chd-physiology-unknown',
    severity: 'caution',
    title: 'Do not treat CHD as one physiology',
    detail: 'Clarify the lesion, repair stage, baseline oxygen saturation, ventricular function, and shunt dependence. Obtain pediatric cardiology or transport input before applying lesion-specific targets.'
  },
  {
    id: 'mitochondrial-disease',
    label: 'Known or suspected mitochondrial disease',
    sourceId: 'pinned-cc-rsi',
    warningId: 'mitochondrial-review-required',
    severity: 'caution',
    title: 'Specialist medication review required',
    detail: 'The imported source contains agent-specific mitochondrial-disease language that requires pediatric anesthesia and pharmacy review before it is used as a public patient-specific contraindication.'
  }
]);

const sharedAttemptPearl = 'Name the first operator, device, backup oxygenation method, and stop point before the first attempt.';
const sharedAttemptPitfall = 'Repeated attempts without a changed plan increase risk. In one pediatric ED study, adverse-event odds rose with the second and later attempts.';

export const SCENARIO_CONTEXT = Object.freeze({
  sepsis: Object.freeze({
    protect: freezeList([
      { title: 'Protect perfusion', detail: 'Anticipate hemodynamic deterioration during induction and the transition to positive-pressure ventilation.' },
      { title: 'Separate airway need from shock alone', detail: 'The 2026 guideline found insufficient evidence to recommend intubation solely for fluid-refractory, catecholamine-resistant shock without respiratory failure.' }
    ]),
    pearls: Object.freeze([
      'The 2026 SCCM guideline conditionally suggests against etomidate when intubating children with sepsis or septic shock.',
      sharedAttemptPearl
    ]),
    pitfalls: Object.freeze([
      'Proceeding before a hemodynamic rescue plan, vasoactive access, and post-intubation support are ready.',
      'Presenting one induction agent as universally best despite low-certainty pediatric evidence.'
    ]),
    sourceIds: Object.freeze(['sccm-sepsis-2026', 'near4kids-pediatric-ed-2021'])
  }),
  trauma_stable: Object.freeze({
    protect: freezeList([
      { title: 'Recheck stability at the bedside', detail: 'Confirm perfusion immediately before induction. A single earlier blood pressure does not establish current physiologic reserve.' },
      { title: 'Optimize first-attempt conditions', detail: 'Trauma may add cervical-motion limits, blood contamination, or an unexpectedly difficult view.' }
    ]),
    pearls: Object.freeze([sharedAttemptPearl, 'Keep suction, rescue oxygenation, and a changed second-attempt plan immediately available.']),
    pitfalls: Object.freeze(['Carrying the stable label forward after the child clinically changes.', sharedAttemptPitfall]),
    sourceIds: Object.freeze(['aha-aap-pals-2025', 'near4pem-attempts-2021'])
  }),
  trauma_hypotensive: Object.freeze({
    protect: freezeList([
      { title: 'Protect perfusion and hemorrhage control', detail: 'Coordinate airway timing with blood-product resuscitation, hemorrhage control, and immediate hemodynamic support.' },
      { title: 'Treat this as a physiologically difficult airway', detail: 'Shock was independently associated with adverse events during pediatric ED intubation.' }
    ]),
    pearls: Object.freeze(['AHA/AAP PALS states that blood products are reasonable instead of crystalloid for ongoing volume resuscitation in hypotensive hemorrhagic shock when available.', sharedAttemptPearl]),
    pitfalls: Object.freeze(['Allowing airway preparation to interrupt hemorrhage-control priorities.', 'Using a standard induction approach without accounting for depleted physiologic reserve.']),
    sourceIds: Object.freeze(['aha-aap-pals-2025', 'near4kids-pediatric-ed-2021'])
  }),
  icp_stable: Object.freeze({
    protect: freezeList([
      { title: 'Prevent secondary brain injury', detail: 'Avoid hypoxemia and hypotension while maintaining age-appropriate cerebral perfusion.' },
      { title: 'Do not exclude pressure risk from one early scan', detail: 'The pediatric severe TBI guideline advises that a normal initial CT does not exclude elevated intracranial pressure in a comatose child.' }
    ]),
    pearls: Object.freeze(['Plan ventilation targets and post-intubation sedation before paralysis.', sharedAttemptPearl]),
    pitfalls: Object.freeze(['Routine prophylactic severe hyperventilation in the first 48 hours.', 'Assuming stable blood pressure cannot deteriorate during induction.']),
    sourceIds: Object.freeze(['btf-pediatric-tbi-3e', 'near4pem-attempts-2021'])
  }),
  icp_unstable: Object.freeze({
    protect: freezeList([
      { title: 'Perfusion is part of brain protection', detail: 'The pediatric severe TBI guideline uses age-aware cerebral perfusion targets and emphasizes avoidance of cerebral hypoperfusion.' },
      { title: 'Coordinate the rescue pathway', detail: 'Airway, hemodynamic, hyperosmolar, neurosurgical, and transfer plans should not compete for the same team attention.' }
    ]),
    pearls: Object.freeze(['Assign one clinician to watch blood pressure and perfusion through induction.', 'Make the post-intubation ventilation target explicit before the first attempt.']),
    pitfalls: Object.freeze(['Treating hyperventilation as routine rather than a limited rescue strategy.', 'Using a medication choice that worsens already unstable perfusion without a rescue plan.']),
    sourceIds: Object.freeze(['btf-pediatric-tbi-3e', 'near4kids-pediatric-ed-2021'])
  }),
  asthmaticus: Object.freeze({
    protect: freezeList([
      { title: 'Confirm that invasive ventilation is the required escalation', detail: 'Continue critical-asthma therapy and obtain pediatric critical-care support while preparing for a high-risk transition if intubation is necessary.' },
      { title: 'Plan post-intubation ventilation before induction', detail: 'The ventilation strategy and risk of air trapping need an explicit team plan before the tube is placed.' }
    ]),
    pearls: Object.freeze(['Keep bronchodilator delivery and hemodynamic monitoring coordinated during airway preparation.', sharedAttemptPearl]),
    pitfalls: Object.freeze(['Focusing on the laryngoscopy while leaving the ventilation strategy undefined.', 'Interpreting one blood gas value without the child\'s trajectory and work of breathing.']),
    sourceIds: Object.freeze(['aarc-palisi-asthma-2025', 'near4pem-attempts-2021'])
  }),
  epilepticus: Object.freeze({
    protect: freezeList([
      { title: 'Continue seizure treatment through airway management', detail: 'Airway control does not replace timely treatment of the underlying status epilepticus.' },
      { title: 'Plan how ongoing seizure activity will be detected', detail: 'Neuromuscular blockade can remove visible motor activity while electrographic seizure activity persists.' }
    ]),
    pearls: Object.freeze(['Document the last observed seizure activity and medications before paralysis.', 'Arrange EEG-capable monitoring and neurology or critical-care support when available.']),
    pitfalls: Object.freeze(['Mistaking absence of motor activity after paralysis for seizure termination.', 'Delaying glucose and reversible-cause assessment during airway preparation.']),
    sourceIds: Object.freeze(['aap-status-epilepticus-2024', 'aha-aap-pals-2025'])
  }),
  chd: Object.freeze({
    protect: freezeList([
      { title: 'Name the physiology', detail: 'Capture lesion, repair stage, baseline saturation, ventricular function, medications, and known shunt or conduit before setting targets.' },
      { title: 'Call early', detail: 'Use pediatric cardiology, congenital cardiac critical care, or the receiving transport team to frame lesion-specific risk.' }
    ]),
    pearls: Object.freeze(['Baseline oxygen saturation may be intentionally different from a normal two-ventricle target.', 'Keep the caregiver and emergency plan in the information loop.']),
    pitfalls: Object.freeze(['Treating all congenital heart disease as the same hemodynamic problem.', 'Blindly normalizing saturation or ventilation without understanding shunt dependence.']),
    sourceIds: Object.freeze(['aha-aap-pals-2025', 'pinned-cc-rsi'])
  }),
  neonates: Object.freeze({
    protect: freezeList([
      { title: 'Use a neonatal airway plan', detail: 'Neonates and young infants have limited oxygen reserve and require age-adapted equipment, dosing, positioning, and rescue planning.' },
      { title: 'Limit attempts and preserve oxygenation', detail: 'The neonatal and infant guideline recommends age-adapted video laryngoscopy, apneic oxygenation, rescue supraglottic airway planning, attempt limitation, and waveform end-tidal carbon dioxide confirmation.' }
    ]),
    pearls: Object.freeze(['Put the most experienced available neonatal or pediatric airway clinician on the first attempt.', 'Prepare the full next-size-up and next-size-down equipment set before induction.']),
    pitfalls: Object.freeze(['Treating a neonate as a scaled-down older child.', 'Continuing repeated attempts without returning to oxygenation and changing the plan.']),
    sourceIds: Object.freeze(['esaic-bja-infant-airway-2023', 'near4pem-attempts-2021'])
  })
});

function assertAgeUnit(unit) {
  if (!['days', 'months', 'years'].includes(unit)) {
    throw new TypeError('age unit must be days, months, or years');
  }
}

export function normalizeAgeToDays(value, unit) {
  assertAgeUnit(unit);
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError('age must be a finite number');
  }
  if (value < 0) throw new RangeError('age cannot be negative');

  const multiplier = unit === 'days' ? 1 : unit === 'months' ? DAYS_PER_MONTH : DAYS_PER_YEAR;
  const days = value * multiplier;
  if (days > MAX_AGE_DAYS) throw new RangeError('age is outside the pediatric population');
  return days;
}

export function deriveAgeFlags(value, unit) {
  const days = normalizeAgeToDays(value, unit);
  return Object.freeze({
    days,
    isNeonate: days < 29,
    isYoungInfant: days < 3 * DAYS_PER_MONTH,
    isInfant: days < DAYS_PER_YEAR
  });
}

export function describeAge(value, unit) {
  const flags = deriveAgeFlags(value, unit);
  const formatted = Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
  const unitLabel = value === 1 ? unit.slice(0, -1) : unit;
  const suffix = flags.isNeonate ? ' (neonate)' : flags.isYoungInfant ? ' (young infant)' : '';
  return `${formatted} ${unitLabel}${suffix}`;
}

function warning(record) {
  return Object.freeze({
    id: record.warningId,
    severity: record.severity,
    title: record.title,
    detail: record.detail,
    sourceId: record.sourceId
  });
}

export function getPatientWarnings({ ageValue, ageUnit, scenarioId, factorIds }) {
  const ageFlags = deriveAgeFlags(ageValue, ageUnit);
  if (!Object.hasOwn(SCENARIO_CONTEXT, scenarioId)) {
    throw new TypeError(`unknown scenario: ${scenarioId}`);
  }
  if (!Array.isArray(factorIds)) throw new TypeError('factorIds must be an array');

  const factorMap = new Map(PATIENT_FACTORS.map((factor) => [factor.id, factor]));
  const selectedFactors = factorIds.map((factorId) => {
    const factor = factorMap.get(factorId);
    if (!factor) throw new TypeError(`unknown patient factor: ${factorId}`);
    return factor;
  });

  const warnings = [];
  if (ageFlags.isYoungInfant) {
    warnings.push(Object.freeze({
      id: 'young-infant-airway',
      severity: 'caution',
      title: ageFlags.isNeonate ? 'Neonatal airway considerations' : 'Young-infant airway considerations',
      detail: 'Use age-adapted equipment, preserve oxygenation, name rescue ventilation, limit attempts, and confirm placement with waveform end-tidal carbon dioxide. Medication and technique choices still require the current neonatal or pediatric airway protocol.',
      sourceId: 'esaic-bja-infant-airway-2023'
    }));
  }
  if (scenarioId === 'sepsis') {
    warnings.push(Object.freeze({
      id: 'sepsis-hemodynamics',
      severity: 'critical',
      title: 'Sepsis and the peri-intubation circulation',
      detail: 'The 2026 pediatric guideline found insufficient evidence for intubation based on refractory shock alone and conditionally suggests against etomidate when intubating children with sepsis or septic shock. Review hemodynamic support and local policy before agent selection.',
      sourceId: 'sccm-sepsis-2026'
    }));
  }
  if (scenarioId === 'trauma_hypotensive' || scenarioId === 'icp_unstable') {
    warnings.push(Object.freeze({
      id: 'scenario-shock-risk',
      severity: 'critical',
      title: 'Unstable physiology before induction',
      detail: 'Treat this as a physiologically difficult airway. Assign hemodynamic monitoring and rescue while the airway plan proceeds.',
      sourceId: 'near4kids-pediatric-ed-2021'
    }));
  }
  if (scenarioId === 'chd') {
    warnings.push(Object.freeze({
      id: 'chd-physiology-required',
      severity: 'caution',
      title: 'Congenital heart physiology required',
      detail: 'Do not apply lesion-specific targets until the lesion, repair stage, baseline saturation, ventricular function, and shunt dependence are known or reviewed with a congenital cardiac resource.',
      sourceId: 'aha-aap-pals-2025'
    }));
  }
  if (scenarioId === 'neonates' && !ageFlags.isNeonate) {
    warnings.push(Object.freeze({
      id: 'scenario-age-mismatch',
      severity: 'context',
      title: 'Recheck age and scenario',
      detail: 'The neonatal scenario is selected, but the entered age is older than 28 days. Confirm that both selections describe the same child.',
      sourceId: 'esaic-bja-infant-airway-2023'
    }));
  }

  warnings.push(...selectedFactors.map(warning));
  return Object.freeze(warnings);
}
