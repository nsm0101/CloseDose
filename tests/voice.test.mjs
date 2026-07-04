import assert from 'node:assert/strict';
import { parseDose } from '../public/voice.mjs';

const cases = [
  ['five mL', 5],
  ['5 milliliters', 5],
  ['give 7.5 ml', 7.5],
  ['seven point five ml', 7.5],
  ['5', null],
];

cases.forEach(([input, expected]) => {
  const result = parseDose(input);
  if (expected === null) {
    assert.equal(result, null, `Expected null for "${input}"`);
  } else {
    assert.ok(result, `Expected a result for "${input}"`);
    assert.equal(result.amount, expected, `Expected ${expected} for "${input}"`);
    assert.equal(result.unit, 'mL');
  }
});

console.log('voice parsing tests passed');
