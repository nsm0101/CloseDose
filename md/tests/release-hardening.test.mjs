import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  DEFAULT_CLOSEDOSE_MD_BASE_URL,
  resolveCloseDoseMdTarget
} from './helpers/target.mjs';

const read = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');

test('CI uses least privilege and reviewed immutable action pins', async () => {
  const workflow = await read('../.github/workflows/closedose-md.yml');

  assert.match(workflow, /^permissions:\n  contents: read$/m);
  assert.match(
    workflow,
    /uses: actions\/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5\s+# v4\.3\.1/
  );
  assert.match(workflow, /persist-credentials:\s*false/);
  assert.match(
    workflow,
    /uses: actions\/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020\s+# v4\.4\.0/
  );
  assert.doesNotMatch(workflow, /uses:\s*actions\/(?:checkout|setup-node)@v4/);
  assert.match(workflow, /name: Test Firestore authorization rules/);
  assert.match(workflow, /run: npm run test:rules/);
  assert.match(workflow, /name: Assemble and validate clinical review artifact/);
  assert.match(workflow, /run: npm run build:review/);
  assert.ok(
    workflow.indexOf('run: npm run build:review') < workflow.indexOf('run: npm run build\n'),
    'review artifact must be validated before production rebuilds dist'
  );
});

test('target resolver preserves local mode and normalizes an external origin', () => {
  assert.deepEqual(resolveCloseDoseMdTarget(''), {
    baseURL: DEFAULT_CLOSEDOSE_MD_BASE_URL,
    expectedOrigin: 'http://127.0.0.1:4173',
    external: false
  });
  assert.deepEqual(resolveCloseDoseMdTarget('https://preview.example/'), {
    baseURL: 'https://preview.example/',
    expectedOrigin: 'https://preview.example',
    external: true
  });
  assert.throws(() => resolveCloseDoseMdTarget('https://preview.example/path'));
  assert.throws(() => resolveCloseDoseMdTarget('https://preview.example/?probe=1'));
});

test('Playwright omits the local server only for an external target', async () => {
  const previous = process.env.CLOSEDOSE_MD_BASE_URL;
  const configUrl = new URL('../playwright.config.mjs', import.meta.url);

  try {
    delete process.env.CLOSEDOSE_MD_BASE_URL;
    const localConfig = (await import(`${configUrl.href}?mode=local`)).default;
    assert.equal(localConfig.use.baseURL, DEFAULT_CLOSEDOSE_MD_BASE_URL);
    assert.ok(localConfig.webServer);

    process.env.CLOSEDOSE_MD_BASE_URL = 'https://preview.example/';
    const externalConfig = (await import(`${configUrl.href}?mode=external`)).default;
    assert.equal(externalConfig.use.baseURL, 'https://preview.example/');
    assert.equal(externalConfig.webServer, undefined);
  } finally {
    if (previous === undefined) delete process.env.CLOSEDOSE_MD_BASE_URL;
    else process.env.CLOSEDOSE_MD_BASE_URL = previous;
  }
});
