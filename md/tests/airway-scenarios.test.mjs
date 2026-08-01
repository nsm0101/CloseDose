import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PATIENT_FACTORS,
  SCENARIO_CONTEXT,
  SOURCE_REFERENCES,
  deriveAgeFlags,
  describeAge,
  getPatientWarnings,
  normalizeAgeToDays
} from '../apps/airway-scenarios/src/scenarioFlow.mjs';

test('exact age normalization preserves pediatric boundary behavior', () => {
  assert.equal(normalizeAgeToDays(0, 'days'), 0);
  assert.equal(normalizeAgeToDays(28, 'days'), 28);
  assert.equal(normalizeAgeToDays(3, 'months'), 91.3125);
  assert.equal(normalizeAgeToDays(2, 'years'), 730.5);

  assert.deepEqual(deriveAgeFlags(28, 'days'), {
    days: 28,
    isNeonate: true,
    isYoungInfant: true,
    isInfant: true
  });
  assert.equal(deriveAgeFlags(29, 'days').isNeonate, false);
  assert.equal(deriveAgeFlags(2.99, 'months').isYoungInfant, true);
  assert.equal(deriveAgeFlags(3, 'months').isYoungInfant, false);
  assert.equal(deriveAgeFlags(11.99, 'months').isInfant, true);
  assert.equal(deriveAgeFlags(1, 'years').isInfant, false);

  assert.equal(describeAge(14, 'days'), '14 days (neonate)');
  assert.equal(describeAge(2, 'months'), '2 months (young infant)');
  assert.equal(describeAge(8, 'years'), '8 years');
});

test('age normalization rejects invalid or out-of-population inputs', () => {
  for (const [value, unit] of [
    [-1, 'days'],
    [Number.NaN, 'months'],
    [19, 'years'],
    [1, 'weeks'],
    ['2', 'years']
  ]) {
    assert.throws(() => normalizeAgeToDays(value, unit), /age|unit|population/i);
  }
});

test('patient warning composition is deterministic, source mapped, and qualitative', () => {
  const selection = {
    ageValue: 2,
    ageUnit: 'months',
    scenarioId: 'sepsis',
    factorIds: ['hyperkalemia', 'limited-mouth-opening']
  };
  const first = getPatientWarnings(selection);
  const second = getPatientWarnings(selection);

  assert.deepEqual(first, second);
  assert.ok(first.some(({ id }) => id === 'young-infant-airway'));
  assert.ok(first.some(({ id }) => id === 'sepsis-hemodynamics'));
  assert.ok(first.some(({ id }) => id === 'succinylcholine-hyperkalemia'));
  assert.ok(first.some(({ id }) => id === 'limited-mouth-opening'));
  assert.ok(first.every(({ sourceId }) => SOURCE_REFERENCES[sourceId]));
  assert.ok(first.every(({ detail }) => !/diagnos|best agent|recommended medication/i.test(detail)));

  const cleared = getPatientWarnings({ ...selection, factorIds: [] });
  assert.ok(!cleared.some(({ id }) => id === 'succinylcholine-hyperkalemia'));
  assert.ok(!cleared.some(({ id }) => id === 'limited-mouth-opening'));
  assert.throws(
    () => getPatientWarnings({ ...selection, factorIds: ['unknown-risk'] }),
    /unknown patient factor/i
  );
});

test('review context covers every imported scenario and uses stable evidence identifiers', () => {
  const expectedScenarios = [
    'sepsis',
    'trauma_stable',
    'trauma_hypotensive',
    'icp_stable',
    'icp_unstable',
    'asthmaticus',
    'epilepticus',
    'chd',
    'neonates'
  ];

  assert.deepEqual(Object.keys(SCENARIO_CONTEXT), expectedScenarios);
  for (const context of Object.values(SCENARIO_CONTEXT)) {
    assert.ok(context.protect.length >= 1);
    assert.ok(context.pearls.length >= 1);
    assert.ok(context.pitfalls.length >= 1);
    assert.ok(context.sourceIds.length >= 1);
    assert.ok(context.sourceIds.every((sourceId) => SOURCE_REFERENCES[sourceId]));
  }

  assert.equal(new Set(PATIENT_FACTORS.map(({ id }) => id)).size, PATIENT_FACTORS.length);
  assert.ok(PATIENT_FACTORS.every(({ sourceId }) => SOURCE_REFERENCES[sourceId]));
  assert.ok(Object.values(SOURCE_REFERENCES).every(({ citation }) => citation.length >= 8));
});
