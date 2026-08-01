import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const docsRoot = new URL('../../docs/provider-tools/', import.meta.url);
const plannedTools = {
  transfer: '/TRANSFER/',
  agitation: '/AGITATION/',
  newborn: '/NEWBORN/',
  chd: '/CHD/',
  ingestion: '/INGESTION/',
  clock: '/CLOCK/'
};

const readSpec = (tool, filename) =>
  readFile(new URL(`${tool}/${filename}`, docsRoot), 'utf8');

test('every planned module has bounded clinical and implementation specifications', async () => {
  for (const [tool, route] of Object.entries(plannedTools)) {
    const [clinical, implementation] = await Promise.all([
      readSpec(tool, 'clinical.md'),
      readSpec(tool, 'implementation.md')
    ]);

    for (const heading of [
      '## Intended population',
      '## Evidence baseline',
      '## Explicit non-goals',
      '## Questions requiring clinical resolution',
      '## Required named reviewers',
      '## Simulation acceptance cases',
      '## Release boundary'
    ]) {
      assert.match(clinical, new RegExp(heading), `${tool} ${heading}`);
    }

    for (const heading of [
      '## Proposed route and runtime',
      '## Identifier-free inputs',
      '## Deterministic output boundary',
      '## Interaction and accessibility',
      '## Tests',
      '## Release gates'
    ]) {
      assert.match(implementation, new RegExp(heading), `${tool} ${heading}`);
    }

    assert.match(implementation, new RegExp('`' + route.replaceAll('/', '\\/') + '`'));
    assert.doesNotMatch(`${clinical}\n${implementation}`, /\b\d+(?:\.\d+)?\s*(?:mg|mcg|mL)\b/i);
    assert.match(`${clinical}\n${implementation}`, /Remain Planned|no production document|before a production document/i);
  }
});
