import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  buildTransferHandoff,
  DEVICE_ENUMERATIONS,
  getRescueGuidance
} from '../apps/device/src/deviceGuidance.mjs';

import { scanApplicationPrivacy } from './helpers/privacy-scan.mjs';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const deviceRoot = path.join(mdRoot, 'apps/device');

const baseContext = {
  upperAirwayPatency: 'patent',
  breathing: 'present',
  suctionPassage: 'passable',
  cuff: 'absent',
  innerCannula: 'absent',
  tracheostomyMaturity: 'established',
  ventilatorDependence: 'not-dependent'
};

const allGuidanceText = (guidance) =>
  JSON.stringify(guidance).replaceAll(/[[\]{}",:]/g, ' ');

test('every guidance branch begins with help, oxygen to face and stoma, and airway opening', () => {
  for (const upperAirwayPatency of DEVICE_ENUMERATIONS.upperAirwayPatency) {
    for (const breathing of DEVICE_ENUMERATIONS.breathing) {
      for (const suctionPassage of DEVICE_ENUMERATIONS.suctionPassage) {
        for (const cuff of DEVICE_ENUMERATIONS.cuff) {
          for (const innerCannula of DEVICE_ENUMERATIONS.innerCannula) {
            for (const tracheostomyMaturity of DEVICE_ENUMERATIONS.tracheostomyMaturity) {
              for (const ventilatorDependence of DEVICE_ENUMERATIONS.ventilatorDependence) {
                const guidance = getRescueGuidance({
                  upperAirwayPatency,
                  breathing,
                  suctionPassage,
                  cuff,
                  innerCannula,
                  tracheostomyMaturity,
                  ventilatorDependence
                });

                assert.deepEqual(guidance.immediateActions.slice(0, 3), [
                  'Call for help',
                  'Apply high-flow oxygen to both the face and tracheostomy or stoma',
                  'Open the airway'
                ]);
              }
            }
          }
        }
      }
    }
  }
});

test('a passable suction catheter reports a patent tube and continues ABCDE assessment', () => {
  const guidance = getRescueGuidance(baseContext);
  const text = allGuidanceText(guidance);

  assert.deepEqual(guidance.source, {
    organization: 'National Tracheostomy Safety Project',
    title: 'Pediatric emergency tracheostomy algorithm',
    reviewDate: 'January 2024',
    status: 'Clinical review / not approved for clinical use'
  });
  assert.equal(guidance.tubeStatus, 'patent');
  assert.match(text, /Continue ABCDE assessment/);
  assert.match(text, /partial obstruction/i);
});

test('unassessed observations do not report tube patency or a breathing conclusion', () => {
  const guidance = getRescueGuidance({
    ...baseContext,
    breathing: 'not-assessed',
    suctionPassage: 'not-assessed'
  });
  const text = allGuidanceText(guidance);

  assert.equal(guidance.tubeStatus, 'not-assessed');
  assert.deepEqual(guidance.troubleshooting, [
    'Record whether a suction catheter passes before assessing tube patency'
  ]);
  assert.deepEqual(guidance.breathingSupport, [
    'Record whether breathing is present before showing breathing support guidance'
  ]);
  assert.doesNotMatch(text, /\btube is patent\b/i);
  assert.doesNotMatch(text, /\bTube patent\b/i);
  assert.doesNotMatch(text, /Continue assessment of breathing/);
  assert.doesNotMatch(text, /Give five rescue breaths/);
});

test('a non-passable catheter follows attachment, cannula, suction, cuff, and trained tube-change boundaries', () => {
  const guidance = getRescueGuidance({
    ...baseContext,
    suctionPassage: 'not-passable',
    cuff: 'present',
    innerCannula: 'present'
  });
  const text = allGuidanceText(guidance);

  assert.match(text, /Remove attachments/);
  assert.match(text, /Remove the inner cannula/);
  assert.match(text, /Attempt suction/);
  assert.match(text, /Deflate the cuff/);
  assert.match(text, /Only a trained responder/);
  assert.match(text, /established tracheostomy/);
});

test('absent breathing surfaces five rescue breaths and CPR if there are no signs of life', () => {
  const guidance = getRescueGuidance({
    ...baseContext,
    breathing: 'absent'
  });
  const text = allGuidanceText(guidance);

  assert.match(text, /Give five rescue breaths/);
  assert.match(text, /Start CPR if there are no signs of life/);
});

test('upper-airway patency selects the correct ventilation route', () => {
  const patent = allGuidanceText(getRescueGuidance(baseContext));
  const obstructed = allGuidanceText(
    getRescueGuidance({
      ...baseContext,
      upperAirwayPatency: 'obstructed'
    })
  );
  const unknown = allGuidanceText(
    getRescueGuidance({
      ...baseContext,
      upperAirwayPatency: 'unknown'
    })
  );

  assert.match(patent, /Ventilate through the face while occluding the stoma/);
  assert.match(obstructed, /Ventilate through the stoma/);
  assert.match(unknown, /Advanced airway responder/);
  assert.match(unknown, /face ventilation with stoma occlusion/);
  assert.match(unknown, /stoma ventilation/);
});

test('fresh or uncertain tracheostomy state blocks blind reinsertion and calls for expert help', () => {
  for (const tracheostomyMaturity of ['fresh', 'uncertain']) {
    const text = allGuidanceText(
      getRescueGuidance({
        ...baseContext,
        tracheostomyMaturity
      })
    );

    assert.match(text, /Do not attempt blind reinsertion/);
    assert.match(text, /Get immediate expert airway help/);
    assert.doesNotMatch(text, /remove and change the tracheostomy tube/i);
  }
});

test('handoff is identifier-free and explicitly preserves unknown values', () => {
  const handoff = buildTransferHandoff({
    ...baseContext,
    cuff: 'unknown',
    ventilatorDependence: 'unknown',
    deviceDetails: {
      tubeType: 'unknown',
      tubeSize: '4.0',
      tubeLength: ''
    },
    caregiverConfirmedBaseline: '',
    observedFailure: 'Suction catheter would not pass',
    actionsTaken: [
      'Called for help',
      'Applied oxygen to face and stoma'
    ],
    currentOxygenationVentilationRoute: '',
    equipmentAccompanyingChild: [
      'Same-size spare tracheostomy tube',
      'Half-size-smaller spare tracheostomy tube'
    ]
  });

  assert.match(handoff, /Device details:/);
  assert.match(handoff, /Caregiver-confirmed baseline: unknown/);
  assert.match(handoff, /Observed failure: Suction catheter would not pass/);
  assert.match(handoff, /Actions taken: Called for help; Applied oxygen to face and stoma/);
  assert.match(handoff, /Current oxygenation and ventilation route: unknown/);
  assert.match(
    handoff,
    /Equipment accompanying the child: Same-size spare tracheostomy tube; Half-size-smaller spare tracheostomy tube/
  );
  assert.match(handoff, /tube type=unknown/);
  assert.match(handoff, /tube length=unknown/);
  assert.match(handoff, /cuff=unknown/);
  assert.match(handoff, /ventilator dependence=unknown/);
  assert.doesNotMatch(
    handoff,
    /\b(?:patient name|first name|last name|date of birth|DOB|MRN|medical record|patient ID)\b/i
  );
});

test('invalid enumerated inputs throw descriptive errors', () => {
  const fields = [
    'upperAirwayPatency',
    'breathing',
    'suctionPassage',
    'cuff',
    'innerCannula',
    'tracheostomyMaturity',
    'ventilatorDependence'
  ];

  for (const field of fields) {
    assert.throws(
      () => getRescueGuidance({ ...baseContext, [field]: 'invalid-value' }),
      new RegExp(`Invalid ${field}`)
    );
  }
});

test('Device app is review-gated, uses the canonical route, and has no privacy boundary violations', async () => {
  const [packageJsonSource, viteConfig, indexHtml, appSource, styles, releaseStateSource] =
    await Promise.all([
      readFile(path.join(deviceRoot, 'package.json'), 'utf8'),
      readFile(path.join(deviceRoot, 'vite.config.ts'), 'utf8'),
      readFile(path.join(deviceRoot, 'index.html'), 'utf8'),
      readFile(path.join(deviceRoot, 'src/App.tsx'), 'utf8'),
      readFile(path.join(deviceRoot, 'src/index.css'), 'utf8'),
      readFile(path.join(mdRoot, 'clinical-release-state.mjs'), 'utf8')
    ]);
  const packageJson = JSON.parse(packageJsonSource);

  assert.equal(packageJson.name, '@closedose-md/device');
  assert.equal(packageJson.closedoseMd?.routeBase, '/DEVICE/');
  assert.match(viteConfig, /base:\s*['"]\/DEVICE\/['"]/);
  assert.match(viteConfig, /outDir:\s*['"]\.\.\/\.\.\/dist\/DEVICE['"]/);
  assert.match(indexHtml, /src=["']\/src\/main\.tsx["']/);
  assert.match(appSource, /Start tracheostomy rescue/);
  assert.match(appSource, /Call for help/);
  assert.match(appSource, /Oxygen to face and stoma/);
  assert.match(appSource, /Act now/);
  assert.match(appSource, /Identify/);
  assert.match(appSource, /Troubleshoot/);
  assert.match(appSource, /Equipment/);
  assert.match(appSource, /Handoff/);
  assert.match(releaseStateSource, /Clinical review/);
  assert.match(releaseStateSource, /Not approved for clinical use/);
  assert.match(appSource, /breathing:\s*'not-assessed'/);
  assert.match(appSource, /suctionPassage:\s*'not-assessed'/);
  assert.match(appSource, /tubeStatus !== 'not-assessed'/);
  assert.match(appSource, /name=\{name\}/);
  assert.match(appSource, /name="breathing"/);
  assert.match(appSource, /name="suction-passage"/);
  assert.match(appSource, /catch\s*\{/);
  assert.match(
    appSource,
    /Copy failed\. Select and copy the handoff preview manually\./
  );
  assert.match(styles, /color-scheme:\s*light dark/);
  assert.match(styles, /--color-accent:\s*#18a78d/i);
  assert.match(styles, /--radius-control:/);
  assert.match(styles, /@media\s*\(prefers-color-scheme:\s*dark\)/);
  assert.match(styles, /@media\s*\(min-width:/);
  assert.doesNotMatch(styles, /@media\s*\(max-width:/);
  assert.match(styles, /\.choice:has\(input:focus-visible\)/);
  assert.doesNotMatch(styles, /#146b64/i);
  assert.doesNotMatch(appSource, /[–—]/);
  assert.deepEqual(await scanApplicationPrivacy(deviceRoot), []);
});

test('Device clinical specification requires a named mandatory PEM reviewer', async () => {
  const clinicalSource = await readFile(
    path.join(mdRoot, '..', 'docs/provider-tools/device/clinical.md'),
    'utf8'
  );

  assert.match(
    clinicalSource,
    /Named pediatric emergency medicine physician \(mandatory and not interchangeable with pediatric critical care\)/
  );
  assert.match(clinicalSource, /Pediatric otolaryngology/);
  assert.match(clinicalSource, /Pediatric respiratory therapy lead/);
  assert.match(clinicalSource, /Regulatory and quality-system owner/);
});
