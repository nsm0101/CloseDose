import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import { scanApplicationPrivacy } from './helpers/privacy-scan.mjs';
import { modeAwareBuildWorkspaces, readToolRegistry } from '../scripts/tool-registry.mjs';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFile(path.join(mdRoot, relativePath), 'utf8');

const tools = [
  {
    directory: 'rsi',
    packageName: '@closedose-md/rsi',
    route: '/RSI/',
    output: 'RSI',
    component: 'DosingCalculator'
  },
  {
    directory: 'airway-scenarios',
    packageName: '@closedose-md/airway-scenarios',
    route: '/AIRWAY-SCENARIOS/',
    output: 'AIRWAY-SCENARIOS',
    component: 'IntegratedScenarioGuide'
  },
  {
    directory: 'post-intubation',
    packageName: '@closedose-md/post-intubation',
    route: '/POST-INTUBATION/',
    output: 'POST-INTUBATION',
    component: 'SedationReference'
  },
  {
    directory: 'rsi-timeline',
    packageName: '@closedose-md/rsi-timeline',
    route: '/RSI-TIMELINE/',
    output: 'RSI-TIMELINE',
    component: 'ProgressionTracker'
  },
  {
    directory: 'airway-transport',
    packageName: '@closedose-md/airway-transport',
    route: '/AIRWAY-TRANSPORT/',
    output: 'AIRWAY-TRANSPORT',
    component: 'TransportKit'
  }
];

const pinnedClinicalHashes = {
  'packages/rsi-reference/src/components/DosingCalculator.tsx':
    '7105fa533ee0587288b29385873617f8d0d1b022ea5bc4ce1e5a5e38819af086',
  'packages/rsi-reference/src/components/ProgressionTracker.tsx':
    '5ef2fc7400bc314ac6d04ab4bac6d7edd823dd20625f1152e7eaac5168d919b5',
  'packages/rsi-reference/src/components/ScenarioGuide.tsx':
    'dfc81a76fa6945397c1431d466463c845abf86157b6bfb9e0aa940a9e00a3a3d',
  'packages/rsi-reference/src/components/SedationReference.tsx':
    '03e5c0f3be48003cfe7754aa606feaca0691137f5c1e0278456346a74c2fe08f',
  'packages/rsi-reference/src/components/TransportKit.tsx':
    '01f3edf049b11a08b32cec22163cf0a8cdc91ad49e4eb07500d8d6bb179783cc',
  'packages/rsi-reference/src/data/rsiData.ts':
    '9b33eb1d3ecc0cf45e05f0d7f4acec0f5120ec0ed1f409df270c4a48d6b34d11',
  'packages/rsi-reference/src/types.ts':
    'c5ec2dac0382f5ab8266b88e36d4b8e96c7935331b045902735142312843e27d'
};

test('RSI clinical source moves byte-for-byte into the shared reference package', async () => {
  for (const [relativePath, expectedSha256] of Object.entries(pinnedClinicalHashes)) {
    const source = await read(relativePath);
    assert.equal(createHash('sha256').update(source).digest('hex'), expectedSha256, relativePath);
  }
});

test('shared package exposes the exact standalone-tool metadata contract', async () => {
  const [manifestSource, indexSource, shellSource] = await Promise.all([
    read('packages/rsi-reference/package.json'),
    read('packages/rsi-reference/src/index.ts'),
    read('packages/rsi-reference/src/StandaloneToolShell.tsx')
  ]);
  const manifest = JSON.parse(manifestSource);

  assert.equal(manifest.name, '@closedose-md/rsi-reference');
  assert.equal(manifest.private, true);
  assert.match(indexSource, /interface RsiStandaloneTool/);
  for (const value of [
    'rsi-medications',
    'airway-scenarios',
    'post-intubation',
    'rsi-timeline',
    'airway-transport',
    '/RSI/',
    '/AIRWAY-SCENARIOS/',
    '/POST-INTUBATION/',
    '/RSI-TIMELINE/',
    '/AIRWAY-TRANSPORT/'
  ]) assert.match(indexSource, new RegExp(value.replaceAll('/', '\\/')));
  assert.match(shellSource, /href=["']\/["']/);
  assert.match(shellSource, /Reset local tool/);
  assert.match(shellSource, /Verify against current institutional protocols/);
  assert.doesNotMatch(shellSource, /SYS ONLINE|v4\.2|animate-pulse/);
});

test('five canonical documents each render exactly one workflow', async () => {
  const componentNames = tools.map(({ component }) => component);

  for (const tool of tools) {
    const root = `apps/${tool.directory}`;
    const [manifestSource, viteConfig, appSource, mainSource, styles] = await Promise.all([
      read(`${root}/package.json`),
      read(`${root}/vite.config.ts`),
      read(`${root}/src/App.tsx`),
      read(`${root}/src/main.tsx`),
      read(`${root}/src/index.css`)
    ]);
    const manifest = JSON.parse(manifestSource);

    assert.equal(manifest.name, tool.packageName);
    assert.equal(manifest.closedoseMd?.routeBase, tool.route);
    assert.match(viteConfig, new RegExp(`base:\\s*['"]${tool.route.replaceAll('/', '\\/')}['"]`));
    assert.match(viteConfig, new RegExp(`outDir:\\s*['"]\\.\\.\\/\\.\\.\\/dist\\/${tool.output}['"]`));
    assert.match(appSource, new RegExp(`\\b${tool.component}\\b`));
    for (const otherComponent of componentNames.filter((name) => name !== tool.component)) {
      assert.doesNotMatch(appSource, new RegExp(`\\b${otherComponent}\\b`), `${tool.route}: ${otherComponent}`);
    }
    assert.doesNotMatch(appSource, /activeTab|tab-btn|localStorage|sessionStorage/);
    assert.match(appSource, /onReset/);
    assert.match(mainSource, /<StrictMode>/);
    assert.match(styles, /@import\s+["']tailwindcss["']/);
  }
});

test('all five routes and the shared package remain identifier-free and local-only', async () => {
  for (const directory of [
    ...tools.map(({ directory }) => `apps/${directory}`),
    'packages/rsi-reference'
  ]) {
    assert.deepEqual(
      await scanApplicationPrivacy(path.join(mdRoot, directory)),
      [],
      directory
    );
  }
});

test('moved calculation still returns 20.0 mg rocuronium for 20 kg', async () => {
  const [calculatorSource, dataSource] = await Promise.all([
    read('packages/rsi-reference/src/components/DosingCalculator.tsx'),
    read('packages/rsi-reference/src/data/rsiData.ts')
  ]);
  const calculationMatch = calculatorSource.match(/const rocDose = \(([^;]+)\)\.toFixed\(1\);/);

  assert.ok(calculationMatch, 'expected the imported rocuronium calculation');
  assert.match(dataSource, /id:\s*['"]rocuronium['"][\s\S]*?ivDoseInfo:\s*['"]All ages: 1\.0 mg\/kg \(RSI Dose\)['"]/);
  const calculateRocuronium = vm.runInNewContext(
    `(weight) => (${calculationMatch[1]}).toFixed(1)`
  );
  assert.equal(calculateRocuronium(20), '20.0');
});

test('legacy combined tab controller and duplicate clinical files are removed', async () => {
  const rsiSourceFiles = await readdir(path.join(mdRoot, 'apps/rsi/src'));
  assert.equal(rsiSourceFiles.includes('components'), false);
  assert.equal(rsiSourceFiles.includes('data'), false);
  const appSource = await read('apps/rsi/src/App.tsx');
  assert.doesNotMatch(appSource, /ActiveTab|Main Tab Controller|SYS ONLINE/);
});

test('airway scenario redesign is the public workflow and keeps the imported source pinned', async () => {
  const [appSource, styles, buildSource] = await Promise.all([
    read('apps/airway-scenarios/src/App.tsx'),
    read('apps/airway-scenarios/src/index.css'),
    read('scripts/build.mjs')
  ]);

  assert.match(appSource, /\bIntegratedScenarioGuide\b/);
  assert.doesNotMatch(appSource, /\bScenarioGuide\b|\bWeightControl\b/);
  assert.doesNotMatch(appSource, /__CLOSEDOSE_MD_BUILD_MODE__|airway-scenario-legacy/);
  assert.match(styles, /\.scenario-review-flow/);
  assert.match(styles, /prefers-color-scheme:\s*dark/);

  // The build receives the mode flag from the registry rather than a hardcoded
  // map, so assert the resolved behaviour instead of the literal script name.
  const registry = await readToolRegistry();
  assert.equal(
    modeAwareBuildWorkspaces(registry)['build:airway-scenarios'],
    '@closedose-md/airway-scenarios'
  );
  assert.match(buildSource, /modeAwareBuildWorkspaces/);
  assert.match(buildSource, /--mode/);
});
