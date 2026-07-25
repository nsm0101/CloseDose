export type UpperAirwayPatency = 'patent' | 'obstructed' | 'unknown';
export type Breathing = 'not-assessed' | 'present' | 'absent';
export type SuctionPassage = 'not-assessed' | 'passable' | 'not-passable';
export type Cuff = 'present' | 'absent' | 'unknown';
export type InnerCannula = 'present' | 'absent' | 'unknown';
export type TracheostomyMaturity = 'established' | 'fresh' | 'uncertain';
export type VentilatorDependence = 'dependent' | 'not-dependent' | 'unknown';

export interface DeviceDetails {
  tubeType?: string;
  tubeSize?: string;
  tubeLength?: string;
}

export interface DeviceRescueContext {
  upperAirwayPatency: UpperAirwayPatency;
  breathing: Breathing;
  suctionPassage: SuctionPassage;
  cuff: Cuff;
  innerCannula: InnerCannula;
  tracheostomyMaturity: TracheostomyMaturity;
  ventilatorDependence: VentilatorDependence;
  deviceDetails?: DeviceDetails;
  caregiverConfirmedBaseline?: string;
  observedFailure?: string;
  actionsTaken?: string[];
  currentOxygenationVentilationRoute?: string;
  equipmentAccompanyingChild?: string[];
}

export interface RescueGuidance {
  source: typeof DEVICE_GUIDANCE_SOURCE;
  immediateActions: string[];
  tubeStatus: 'not-assessed' | 'patent' | 'not-confirmed-patent';
  troubleshooting: string[];
  breathingSupport: string[];
  ventilationRoutes: string[];
  warnings: string[];
}

export const DEVICE_GUIDANCE_SOURCE: Readonly<{
  organization: 'National Tracheostomy Safety Project';
  title: 'Pediatric emergency tracheostomy algorithm';
  reviewDate: 'January 2024';
  status: 'Clinical review / not approved for clinical use';
}>;

export const DEVICE_ENUMERATIONS: Readonly<{
  upperAirwayPatency: readonly UpperAirwayPatency[];
  breathing: readonly Breathing[];
  suctionPassage: readonly SuctionPassage[];
  cuff: readonly Cuff[];
  innerCannula: readonly InnerCannula[];
  tracheostomyMaturity: readonly TracheostomyMaturity[];
  ventilatorDependence: readonly VentilatorDependence[];
}>;

export function getRescueGuidance(
  context: DeviceRescueContext
): RescueGuidance;

export function buildTransferHandoff(context: DeviceRescueContext): string;
