/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Medication {
  id: string;
  name: string;
  class: 'induction' | 'paralytic' | 'premed' | 'post-intubation' | 'transport';
  ivDose: string;
  ivDosePerKg?: number; // base mg/kg dose
  ivDoseRangePerKg?: { min: number; max: number };
  imDose?: string;
  imDosePerKg?: number;
  onset: string;
  duration: string;
  advantages: string[];
  disadvantages: string[];
  contraindications: string[];
  notes: string;
  bulletPoints?: string[];
  fdaLimit?: string;
  schedule?: string;
}

export interface Scenario {
  id: string;
  name: string;
  preferredInduction: string[]; // references medication ids
  alternativeInduction: string[];
  avoidInduction: string[];
  rationale: string;
  recommendedParalytic?: string[];
  avoidParalytic?: string[];
}

export interface ParalyticComparison {
  id: string;
  name: string;
  ivDoseInfo: string;
  imDoseInfo: string;
  onset: string;
  duration: string;
  reversal: string;
  hyperkalemiaRisk: string;
  malignantHyperthermiaRisk: string;
  bradycardiaRisk: string;
  contraindications: string[];
  whenToChoose: string[];
}

export interface PremedComparison {
  name: string;
  ivDose: string;
  onset: string;
  vagalBlockDuration: string;
  antisialagogueDuration: string;
  crossesBBB: boolean;
  pupilDilation: boolean;
  heartRateEffect: string;
  secretionControl: string;
  preferredIn: string[];
}

export interface PostSedationAgent {
  id: string;
  name: string;
  loadingDose: string;
  loadingDosePerKg?: number;
  infusionRate: string;
  neonatalAdjustment: string;
  advantages: string[];
  disadvantages: string[];
  sccmRole: string;
  monitoringDetails?: string;
}

export interface TransportMed {
  category: 'Resuscitation' | 'Vasoactive' | 'Sedation' | 'Emergency Re-intubation' | 'Additional';
  name: string;
  indication: string;
  doseFormula: string;
  dosePerKg?: number;
  maxDose?: string;
  route: string;
  notes?: string;
}

export interface TrackerEvent {
  id: string;
  time: string; // MM:SS elapsed or clock time
  title: string;
  description: string;
  category: 'prep' | 'induction' | 'paralysis' | 'post-intubation' | 'transport';
  completed: boolean;
}

export interface TimerInterval {
  id: string;
  label: string;
  durationSeconds: number;
  elapsedSeconds: number;
  isActive: boolean;
  type: 'medication' | 'cpr' | 'custom';
  color: string;
}
