export { default as DosingCalculator } from './components/DosingCalculator';
export { default as ProgressionTracker } from './components/ProgressionTracker';
export { default as ScenarioGuide } from './components/ScenarioGuide';
export { default as SedationReference } from './components/SedationReference';
export { default as TransportKit } from './components/TransportKit';
export { StandaloneToolShell } from './StandaloneToolShell';
export { WeightControl } from './WeightControl';
export { INDUCTION_AGENTS, PARALYTICS_COMPARISON, SCENARIOS } from './data/rsiData';
export type { Medication, ParalyticComparison, Scenario } from './types';

export type AgeGroup = 'infant' | 'toddler' | 'child' | 'adolescent';

export interface RsiStandaloneTool {
  id: 'rsi-medications' | 'airway-scenarios' | 'post-intubation' | 'rsi-timeline' | 'airway-transport';
  route: '/RSI/' | '/AIRWAY-SCENARIOS/' | '/POST-INTUBATION/' | '/RSI-TIMELINE/' | '/AIRWAY-TRANSPORT/';
  title: string;
  purpose: string;
  requiresWeight: boolean;
}

export const RSI_STANDALONE_TOOLS = {
  'rsi-medications': {
    id: 'rsi-medications',
    route: '/RSI/',
    title: 'Pediatric RSI Medication Calculator',
    purpose: 'Calculate the imported induction and paralysis medication reference for one verified weight.',
    requiresWeight: true
  },
  'airway-scenarios': {
    id: 'airway-scenarios',
    route: '/AIRWAY-SCENARIOS/',
    title: 'Pediatric Airway Scenario Guide',
    purpose: 'Combine exact age, verified weight, scenario, patient factors, cautions, and imported medication considerations.',
    requiresWeight: true
  },
  'post-intubation': {
    id: 'post-intubation',
    route: '/POST-INTUBATION/',
    title: 'Post-Intubation Sedation Reference',
    purpose: 'Review imported post-intubation sedation and analgesia calculations by weight and age group.',
    requiresWeight: true
  },
  'rsi-timeline': {
    id: 'rsi-timeline',
    route: '/RSI-TIMELINE/',
    title: 'RSI Progression Timeline',
    purpose: 'Run the imported local procedure timeline and interval aids in this tab only.',
    requiresWeight: true
  },
  'airway-transport': {
    id: 'airway-transport',
    route: '/AIRWAY-TRANSPORT/',
    title: 'Pediatric Airway Transport Kit',
    purpose: 'Prepare the imported transport medication and equipment reference for one verified weight.',
    requiresWeight: true
  }
} as const satisfies Record<RsiStandaloneTool['id'], RsiStandaloneTool>;
