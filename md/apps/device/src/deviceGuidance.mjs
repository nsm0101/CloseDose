import releaseManifest from '../../../clinical-release-manifest.json' with { type: 'json' };
import { resolveClinicalReleaseState } from '../../../clinical-release-state.mjs';

const buildMode =
  typeof __CLOSEDOSE_MD_BUILD_MODE__ === 'string'
    ? __CLOSEDOSE_MD_BUILD_MODE__
    : 'production';

export const DEVICE_RELEASE_STATE = resolveClinicalReleaseState(
  releaseManifest.device,
  buildMode
);

export const DEVICE_GUIDANCE_SOURCE = Object.freeze({
  organization: 'National Tracheostomy Safety Project',
  title: 'Pediatric emergency tracheostomy algorithm',
  reviewDate: 'January 2024',
  status: DEVICE_RELEASE_STATE.applicationLabel
});

export const DEVICE_ENUMERATIONS = Object.freeze({
  upperAirwayPatency: Object.freeze(['patent', 'obstructed', 'unknown']),
  breathing: Object.freeze(['not-assessed', 'present', 'absent']),
  suctionPassage: Object.freeze([
    'not-assessed',
    'passable',
    'not-passable'
  ]),
  cuff: Object.freeze(['present', 'absent', 'unknown']),
  innerCannula: Object.freeze(['present', 'absent', 'unknown']),
  tracheostomyMaturity: Object.freeze([
    'established',
    'fresh',
    'uncertain'
  ]),
  ventilatorDependence: Object.freeze([
    'dependent',
    'not-dependent',
    'unknown'
  ])
});

function validateContext(context) {
  if (!context || typeof context !== 'object' || Array.isArray(context)) {
    throw new TypeError('Device rescue context must be an object');
  }

  for (const [field, allowedValues] of Object.entries(DEVICE_ENUMERATIONS)) {
    if (!allowedValues.includes(context[field])) {
      throw new TypeError(
        `Invalid ${field}: expected one of ${allowedValues.join(', ')}`
      );
    }
  }
}

function ventilationGuidance(upperAirwayPatency) {
  if (upperAirwayPatency === 'patent') {
    return [
      'Ventilate through the face while occluding the stoma'
    ];
  }

  if (upperAirwayPatency === 'obstructed') {
    return ['Ventilate through the stoma'];
  }

  return [
    'Advanced airway responder: prepare both face ventilation with stoma occlusion and stoma ventilation routes until upper-airway patency is established'
  ];
}

function maturityWarnings(tracheostomyMaturity) {
  if (tracheostomyMaturity === 'established') return [];

  return [
    'Do not attempt blind reinsertion',
    'Get immediate expert airway help'
  ];
}

export function getRescueGuidance(context) {
  validateContext(context);

  const immediateActions = [
    'Call for help',
    'Apply high-flow oxygen to both the face and tracheostomy or stoma',
    'Open the airway'
  ];
  const warnings = maturityWarnings(context.tracheostomyMaturity);
  const breathingSupport =
    context.breathing === 'not-assessed'
      ? [
          'Record whether breathing is present before showing breathing support guidance'
        ]
      : context.breathing === 'absent'
        ? [
            'Give five rescue breaths',
            'Start CPR if there are no signs of life'
          ]
        : ['Continue assessment of breathing'];

  if (context.suctionPassage === 'not-assessed') {
    return {
      source: DEVICE_GUIDANCE_SOURCE,
      immediateActions,
      tubeStatus: 'not-assessed',
      troubleshooting: [
        'Record whether a suction catheter passes before assessing tube patency'
      ],
      breathingSupport,
      ventilationRoutes: ventilationGuidance(context.upperAirwayPatency),
      warnings
    };
  }

  if (context.suctionPassage === 'passable') {
    return {
      source: DEVICE_GUIDANCE_SOURCE,
      immediateActions,
      tubeStatus: 'patent',
      troubleshooting: [
        'Suction catheter passes: the tracheostomy tube is patent',
        'Continue ABCDE assessment'
      ],
      breathingSupport,
      ventilationRoutes: ventilationGuidance(context.upperAirwayPatency),
      warnings: [
        'A suction catheter may pass when partial obstruction remains',
        ...warnings
      ]
    };
  }

  const troubleshooting = [
    'Remove attachments from the tracheostomy tube'
  ];

  if (context.innerCannula !== 'absent') {
    troubleshooting.push('Remove the inner cannula if present');
  }

  troubleshooting.push('Attempt suction');

  if (context.cuff !== 'absent') {
    troubleshooting.push('Deflate the cuff if present');
  }

  if (context.tracheostomyMaturity === 'established') {
    troubleshooting.push(
      'Only a trained responder should remove and change the tracheostomy tube when the child has an established tracheostomy'
    );
  }

  return {
    source: DEVICE_GUIDANCE_SOURCE,
    immediateActions,
    tubeStatus: 'not-confirmed-patent',
    troubleshooting,
    breathingSupport,
    ventilationRoutes: ventilationGuidance(context.upperAirwayPatency),
    warnings
  };
}

function textOrUnknown(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : 'unknown';
}

function listOrUnknown(value) {
  if (!Array.isArray(value)) return 'unknown';
  const values = value
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim());
  return values.length ? values.join('; ') : 'unknown';
}

export function buildTransferHandoff(context) {
  validateContext(context);

  const deviceDetails = context.deviceDetails ?? {};

  return [
    `Device details: tube type=${textOrUnknown(deviceDetails.tubeType)}; tube size=${textOrUnknown(deviceDetails.tubeSize)}; tube length=${textOrUnknown(deviceDetails.tubeLength)}; cuff=${context.cuff}; inner cannula=${context.innerCannula}; tracheostomy maturity=${context.tracheostomyMaturity}; ventilator dependence=${context.ventilatorDependence}`,
    `Caregiver-confirmed baseline: ${textOrUnknown(context.caregiverConfirmedBaseline)}`,
    `Observed failure: ${textOrUnknown(context.observedFailure)}`,
    `Actions taken: ${listOrUnknown(context.actionsTaken)}`,
    `Current oxygenation and ventilation route: ${textOrUnknown(context.currentOxygenationVentilationRoute)}`,
    `Equipment accompanying the child: ${listOrUnknown(context.equipmentAccompanyingChild)}`
  ].join('\n');
}
