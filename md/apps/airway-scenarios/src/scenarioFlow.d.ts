export type AgeUnit = 'days' | 'months' | 'years';
export type WarningSeverity = 'critical' | 'caution' | 'context';

export interface SourceReference {
  title: string;
  organization: string;
  publication: string;
  citation: string;
}

export interface PatientFactor {
  id: string;
  label: string;
  sourceId: string;
  warningId: string;
  severity: WarningSeverity;
  title: string;
  detail: string;
}

export interface ScenarioContext {
  protect: readonly { title: string; detail: string }[];
  pearls: readonly string[];
  pitfalls: readonly string[];
  sourceIds: readonly string[];
}

export interface PatientWarning {
  id: string;
  severity: WarningSeverity;
  title: string;
  detail: string;
  sourceId: string;
}

export const SOURCE_REFERENCES: Readonly<Record<string, SourceReference>>;
export const PATIENT_FACTORS: readonly PatientFactor[];
export const SCENARIO_CONTEXT: Readonly<Record<string, ScenarioContext>>;

export function normalizeAgeToDays(value: number, unit: AgeUnit): number;
export function deriveAgeFlags(value: number, unit: AgeUnit): Readonly<{
  days: number;
  isNeonate: boolean;
  isYoungInfant: boolean;
  isInfant: boolean;
}>;
export function describeAge(value: number, unit: AgeUnit): string;
export function getPatientWarnings(selection: {
  ageValue: number;
  ageUnit: AgeUnit;
  scenarioId: string;
  factorIds: string[];
}): readonly PatientWarning[];
