export type MedicationOptionId =
  | 'intranasal-midazolam'
  | 'intranasal-fentanyl'
  | 'iv-ketamine'
  | 'im-ketamine';

export type MedicationSource = Readonly<{
  organization: string;
  title: string;
  date: string;
}>;

export type MedicationOption = Readonly<{
  id: MedicationOptionId;
  name: string;
  route: string;
  category: string;
  source: MedicationSource;
  calculationBasis: string;
  units: 'mg' | 'mcg';
  cap: Readonly<Record<string, string>>;
  population: string;
  onset: string;
  monitoringDepth: string;
}>;

type CommonMedicationResult = {
  optionId: MedicationOptionId;
  name: string;
  route: string;
  category: string;
  source: MedicationSource;
  calculationBasis: string;
  units: 'mg' | 'mcg';
  cap: Readonly<Record<string, string>>;
  population: string;
  onset: string;
  monitoringDepth: string;
};

export type IncludedMedicationResult = CommonMedicationResult & {
  excluded: false;
  doses: {
    initial:
      | { minimum: number; maximum: number }
      | { value: number };
    repeat?:
      | { minimum: number; maximum: number; intervalMinutes: number }
      | { value: number; intervalMinutes: number };
    cumulativeCap?: number;
  };
};

export type ExcludedMedicationResult = CommonMedicationResult & {
  excluded: true;
  exclusionReason: string;
};

export type MedicationResult =
  | IncludedMedicationResult
  | ExcludedMedicationResult;

export const MONITORING_SOURCE: Readonly<{
  organization: string;
  title: string;
  originalPublication: string;
  reaffirmed: string;
}>;

export const MEDICATION_OPTIONS: readonly MedicationOption[];

export function calculateMedicationOption(
  optionId: MedicationOptionId,
  weightKg: number,
  ageMonths: number
): MedicationResult;
