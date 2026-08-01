const deepFreeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
};

export const MONITORING_SOURCE = deepFreeze({
  organization:
    'American Academy of Pediatrics and American Academy of Pediatric Dentistry',
  title:
    'Guidelines for Monitoring and Management of Pediatric Patients Before, During, and After Sedation for Diagnostic and Therapeutic Procedures',
  originalPublication: 'June 1, 2019',
  reaffirmed: 'December 2025'
});

export const MEDICATION_OPTIONS = deepFreeze([
  {
    id: 'intranasal-midazolam',
    name: 'Midazolam',
    route: 'Intranasal',
    category: 'Anxiolysis',
    source: {
      organization: "Texas Children's Hospital",
      title: 'Procedural Sedation Guideline',
      date: 'February 2023'
    },
    calculationBasis: '0.2-0.4 mg/kg',
    units: 'mg',
    cap: {
      totalMaximum: '10 mg',
      perNarisMaximum: '5 mg per naris'
    },
    population: 'Infants and children',
    onset: '10-15 min',
    monitoringDepth:
      'Minimal sedation reference. Monitor the child according to the actual depth of sedation and be able to rescue from a deeper level.'
  },
  {
    id: 'intranasal-fentanyl',
    name: 'Fentanyl',
    route: 'Intranasal',
    category: 'Analgesia',
    source: {
      organization: "Texas Children's Hospital",
      title: 'Procedural Sedation Guideline',
      date: 'February 2023'
    },
    calculationBasis: '1.5-2 mcg/kg',
    units: 'mcg',
    cap: {
      totalMaximum: '100 mcg',
      perNarisMaximum: '50 mcg per naris'
    },
    population: 'Children age 12 months and older',
    onset: '7-20 min',
    monitoringDepth:
      'Analgesia reference. Monitor respiratory status and the actual depth of sedation, especially with interacting sedatives.'
  },
  {
    id: 'iv-ketamine',
    name: 'Ketamine',
    route: 'IV',
    category: 'Dissociative sedation',
    source: {
      organization: "Royal Children's Hospital Melbourne",
      title: 'Ketamine use for procedural sedation',
      date: 'December 2021'
    },
    calculationBasis:
      'Initial 1-1.5 mg/kg; repeat 0.25-0.5 mg/kg at 10 minutes if needed',
    units: 'mg',
    cap: {
      cumulativeMaximum: '4.5 mg/kg'
    },
    population: 'Children age 3 months and older',
    onset: '1 min',
    monitoringDepth:
      'Dissociative sedation. Use pulse oximetry and cardiac monitoring with continuous clinician attendance and close airway and chest observation.'
  },
  {
    id: 'im-ketamine',
    name: 'Ketamine',
    route: 'IM',
    category: 'Dissociative sedation',
    source: {
      organization: "Royal Children's Hospital Melbourne",
      title: 'Ketamine use for procedural sedation',
      date: 'December 2021'
    },
    calculationBasis:
      'Initial 4 mg/kg; repeat 2 mg/kg at 10 minutes if needed',
    units: 'mg',
    cap: {
      cumulativeMaximum: '6 mg/kg'
    },
    population: 'Children age 3 months and older',
    onset: '3-4 min',
    monitoringDepth:
      'Dissociative sedation. Use pulse oximetry and cardiac monitoring with continuous clinician attendance and close airway and chest observation.'
  }
]);

const optionsById = new Map(
  MEDICATION_OPTIONS.map((option) => [option.id, option])
);

const roundOneDecimal = (value) =>
  Math.round((value + Number.EPSILON) * 10) / 10;

const validateWeight = (weightKg) => {
  if (!Number.isFinite(weightKg) || weightKg < 0.5 || weightKg > 200) {
    throw new RangeError(
      'Weight must be a finite number from 0.5 kg through 200 kg'
    );
  }
};

const validateAge = (ageMonths) => {
  if (!Number.isFinite(ageMonths) || ageMonths < 0) {
    throw new RangeError('Age must be a finite nonnegative number of months');
  }
};

const baseResult = (option) => ({
  optionId: option.id,
  name: option.name,
  route: option.route,
  category: option.category,
  source: option.source,
  calculationBasis: option.calculationBasis,
  units: option.units,
  cap: option.cap,
  population: option.population,
  onset: option.onset,
  monitoringDepth: option.monitoringDepth
});

const populationExclusion = (option, ageMonths) => {
  if (option.id === 'intranasal-fentanyl' && ageMonths < 12) {
    return 'Source population starts at age 12 months';
  }
  if (
    (option.id === 'iv-ketamine' || option.id === 'im-ketamine') &&
    ageMonths < 3
  ) {
    return 'Source population starts at age 3 months';
  }
  return null;
};

export function calculateMedicationOption(optionId, weightKg, ageMonths) {
  const option = optionsById.get(optionId);
  if (!option) {
    throw new Error(`Unknown medication option: ${optionId}`);
  }

  validateWeight(weightKg);
  validateAge(ageMonths);

  const exclusionReason = populationExclusion(option, ageMonths);
  if (exclusionReason) {
    return {
      ...baseResult(option),
      excluded: true,
      exclusionReason
    };
  }

  if (option.id === 'intranasal-midazolam') {
    return {
      ...baseResult(option),
      excluded: false,
      doses: {
        initial: {
          minimum: roundOneDecimal(Math.min(weightKg * 0.2, 10)),
          maximum: roundOneDecimal(Math.min(weightKg * 0.4, 10))
        }
      }
    };
  }

  if (option.id === 'intranasal-fentanyl') {
    return {
      ...baseResult(option),
      excluded: false,
      doses: {
        initial: {
          minimum: roundOneDecimal(Math.min(weightKg * 1.5, 100)),
          maximum: roundOneDecimal(Math.min(weightKg * 2, 100))
        }
      }
    };
  }

  if (option.id === 'iv-ketamine') {
    return {
      ...baseResult(option),
      excluded: false,
      doses: {
        initial: {
          minimum: roundOneDecimal(weightKg),
          maximum: roundOneDecimal(weightKg * 1.5)
        },
        repeat: {
          minimum: roundOneDecimal(weightKg * 0.25),
          maximum: roundOneDecimal(weightKg * 0.5),
          intervalMinutes: 10
        },
        cumulativeCap: roundOneDecimal(weightKg * 4.5)
      }
    };
  }

  return {
    ...baseResult(option),
    excluded: false,
    doses: {
      initial: {
        value: roundOneDecimal(weightKg * 4)
      },
      repeat: {
        value: roundOneDecimal(weightKg * 2),
        intervalMinutes: 10
      },
      cumulativeCap: roundOneDecimal(weightKg * 6)
    }
  };
}
