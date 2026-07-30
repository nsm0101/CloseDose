import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(mdRoot, relativePath), 'utf8'));
}

const workspaces = [
  { directory: 'apps/portal', name: '@closedose-md/portal', routeBase: '/' },
  { directory: 'apps/pig', name: '@closedose-md/pig', routeBase: '/PIG/' },
  { directory: 'apps/rsi', name: '@closedose-md/rsi', routeBase: '/RSI/' },
  { directory: 'apps/pmd', name: '@closedose-md/pmd', routeBase: '/PMD/' },
  { directory: 'apps/device', name: '@closedose-md/device', routeBase: '/DEVICE/' },
  { directory: 'apps/sedation', name: '@closedose-md/sedation', routeBase: '/SEDATION/' }
];

test('declares the six isolated MD npm workspaces', async () => {
  const manifest = await readJson('package.json');

  assert.deepEqual(manifest.workspaces, workspaces.map(({ directory }) => directory));
});

test('gives every workspace its package identity and canonical route base', async () => {
  for (const workspace of workspaces) {
    const manifest = await readJson(path.join(workspace.directory, 'package.json'));

    assert.equal(manifest.name, workspace.name);
    assert.equal(manifest.private, true);
    assert.equal(manifest.closedoseMd?.routeBase, workspace.routeBase);
  }
});

test('documents the canonical routes and pinned import provenance', async () => {
  const [readme, sources] = await Promise.all([
    readFile(path.join(mdRoot, 'README.md'), 'utf8'),
    readJson('sources.json')
  ]);

  for (const { routeBase } of workspaces) {
    assert.match(readme, new RegExp('`' + routeBase.replace('/', '\\/') + '`'));
  }

  assert.deepEqual(sources.sources, [
    {
      tool: 'PIG',
      repository: 'nsm0101/PIG-CAR',
      commit: 'ef67724eccc4e0cfb8b291871147fdd22b9fa811',
      role: 'primary'
    },
    {
      tool: 'PIG',
      repository: 'nsm0101/PIGCAR',
      commit: 'c02d529d63d69798d081178b5537913392304541',
      role: 'comparison-only'
    },
    {
      tool: 'RSI',
      repository: 'nsm0101/CC-RSI',
      commit: 'a309bdaa7b7736051753a852b274b295ae00c67d',
      role: 'primary'
    }
  ]);
});
