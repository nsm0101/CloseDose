import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { findPrivacyViolations } from './helpers/privacy-scan.mjs';
import { scanApplicationPrivacy } from './helpers/privacy-scan.mjs';

test('shared privacy scanner covers every release-boundary category', () => {
  const probes = new Map([
    ['browser transport', [
      'fetch("/")',
      'new XMLHttpRequest()',
      'new WebSocket("/")',
      'new EventSource("/")',
      'navigator.sendBeacon("/")',
      'axios.post("/")'
    ]],
    ['browser persistence', [
      'localStorage.setItem("x", "y")',
      'sessionStorage.clear()',
      'indexedDB.open("x")',
      'document.cookie = "x=y"',
      'cookieStore.set("x", "y")'
    ]],
    ['analytics API', [
      'gtag("event", "probe")',
      'Sentry.captureException(error)',
      'dataLayer.push({ event: "probe" })',
      'import analytics from "@vercel/analytics"'
    ]],
    ['external URL or asset', ['<img src="https://example.com/pixel.gif">']],
    ['environment or API key plumbing', [
      'const secret = import.meta.env.VITE_API_KEY',
      'const apiKey = value'
    ]],
    ['patient identifier plumbing', [
      'const patientName = value',
      'const medical_record_number = value'
    ]],
    ['patient identifier field', ['<input name="patient_id">']]
  ]);

  for (const [category, sources] of probes) {
    for (const source of sources) {
      assert.ok(
        findPrivacyViolations(source).some((violation) => violation.category === category),
        `${category}: ${source}`
      );
    }
  }
});

test('shared privacy scanner permits the portal explanatory boundary copy', () => {
  const explanatoryCopy = `
    No patient identifiers
    The tools do not request names, dates of birth, medical record numbers,
    or other patient identifiers. There is no analytics or persistence.
  `;

  assert.deepEqual(findPrivacyViolations(explanatoryCopy), []);
});

test('new review applications stay inside the local identifier-free boundary', async () => {
  for (const directory of ['device', 'sedation']) {
    const root = fileURLToPath(new URL(`../apps/${directory}/`, import.meta.url));
    assert.deepEqual(await scanApplicationPrivacy(root), [], directory);
  }
});

test('standalone RSI applications and shared clinical package stay local-only', async () => {
  for (const directory of [
    'apps/rsi',
    'apps/airway-scenarios',
    'apps/post-intubation',
    'apps/rsi-timeline',
    'apps/airway-transport',
    'packages/rsi-reference'
  ]) {
    const root = fileURLToPath(new URL(`../${directory}/`, import.meta.url));
    assert.deepEqual(await scanApplicationPrivacy(root), [], directory);
  }
});
