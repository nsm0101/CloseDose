import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import { scanApplicationPrivacy } from './helpers/privacy-scan.mjs';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rsiRoot = path.join(mdRoot, 'apps/rsi');

const read = (relativePath) =>
  readFile(path.join(mdRoot, relativePath), 'utf8');

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
    })
  );

  return nestedFiles.flat();
}

const pinnedClinicalHashes = {
  'src/App.tsx':
    '6bfa6ec485027059cc619d0174953500e6ce280391caf94bb7ba75a2796ac459',
  'src/components/DosingCalculator.tsx':
    '7105fa533ee0587288b29385873617f8d0d1b022ea5bc4ce1e5a5e38819af086',
  'src/components/ProgressionTracker.tsx':
    '5ef2fc7400bc314ac6d04ab4bac6d7edd823dd20625f1152e7eaac5168d919b5',
  'src/components/ScenarioGuide.tsx':
    'dfc81a76fa6945397c1431d466463c845abf86157b6bfb9e0aa940a9e00a3a3d',
  'src/components/SedationReference.tsx':
    '03e5c0f3be48003cfe7754aa606feaca0691137f5c1e0278456346a74c2fe08f',
  'src/components/TransportKit.tsx':
    '01f3edf049b11a08b32cec22163cf0a8cdc91ad49e4eb07500d8d6bb179783cc',
  'src/data/rsiData.ts':
    '9b33eb1d3ecc0cf45e05f0d7f4acec0f5120ec0ed1f409df270c4a48d6b34d11',
  'src/types.ts':
    'c5ec2dac0382f5ab8266b88e36d4b8e96c7935331b045902735142312843e27d'
};

test('RSI package contains only its static browser runtime and build tooling', async () => {
  const packageJson = JSON.parse(await read('apps/rsi/package.json'));

  assert.equal(packageJson.name, '@closedose-md/rsi');
  assert.equal(packageJson.private, true);
  assert.equal(packageJson.type, 'module');
  assert.equal(packageJson.closedoseMd?.routeBase, '/RSI/');
  assert.deepEqual(packageJson.scripts, {
    dev: 'vite',
    build: 'vite build',
    typecheck: 'tsc --noEmit',
    test: 'node --test ../../tests/rsi.test.mjs'
  });
  assert.deepEqual(packageJson.dependencies, {
    'lucide-react': '^0.546.0',
    react: '^19.0.1',
    'react-dom': '^19.0.1'
  });

  const forbiddenPackages = [
    '@google/genai',
    '@types/express',
    '@types/node',
    'autoprefixer',
    'dotenv',
    'esbuild',
    'express',
    'motion',
    'tsx'
  ];
  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  for (const dependency of forbiddenPackages) {
    assert.equal(allDependencies[dependency], undefined);
  }
});

test('RSI uses the canonical base and standalone static output', async () => {
  const [viteConfig, indexHtml, main, styles] = await Promise.all([
    read('apps/rsi/vite.config.ts'),
    read('apps/rsi/index.html'),
    read('apps/rsi/src/main.tsx'),
    read('apps/rsi/src/index.css')
  ]);

  assert.match(viteConfig, /base:\s*['"]\/RSI\/['"]/);
  assert.match(viteConfig, /outDir:\s*['"]\.\.\/\.\.\/dist\/RSI['"]/);
  assert.doesNotMatch(
    viteConfig,
    /loadEnv|process\.env|import\.meta\.env|DISABLE_HMR|server\s*:/
  );
  assert.match(indexHtml, /src=['"]\/src\/main\.tsx['"]/);
  assert.match(main, /import App from ['"]\.\/App\.tsx['"]/);
  assert.match(main, /import ['"]\.\/index\.css['"]/);
  assert.doesNotMatch(styles, /@import\s+url|https?:\/\//);
});

test('RSI preserves every pinned clinical source file byte-for-byte', async () => {
  for (const [relativePath, expectedSha256] of Object.entries(
    pinnedClinicalHashes
  )) {
    const source = await read(`apps/rsi/${relativePath}`);
    const actualSha256 = createHash('sha256').update(source).digest('hex');

    assert.equal(actualSha256, expectedSha256, relativePath);
  }
});

test('RSI omits the AI Studio, API-key, server, and environment scaffold', async () => {
  const files = await listFiles(rsiRoot);
  const relativeFiles = files.map((file) => path.relative(rsiRoot, file));
  const sourceText = (
    await Promise.all(files.map((file) => readFile(file, 'utf8')))
  ).join('\n');

  for (const removedPath of [
    '.env.example',
    'README.md',
    'assets/.aistudio/.gitignore',
    'metadata.json',
    'server.js',
    'server.ts'
  ]) {
    assert.equal(relativeFiles.includes(removedPath), false, removedPath);
  }

  assert.doesNotMatch(
    sourceText,
    /@google\/genai|AI Studio|aistudio|GEMINI(?:_API_KEY)?|API_KEY|MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API|DISABLE_HMR|process\.env|import\.meta\.env|loadEnv/i
  );
});

test('RSI passes the shared source and privacy boundary scan', async () => {
  assert.deepEqual(await scanApplicationPrivacy(rsiRoot), []);
});

test('RSI imported calculation returns 20.0 mg rocuronium for 20 kg', async () => {
  const [calculatorSource, dataSource] = await Promise.all([
    read('apps/rsi/src/components/DosingCalculator.tsx'),
    read('apps/rsi/src/data/rsiData.ts')
  ]);
  const calculationMatch = calculatorSource.match(
    /const rocDose = \(([^;]+)\)\.toFixed\(1\);/
  );

  assert.ok(calculationMatch, 'expected the imported rocuronium calculation');
  assert.match(
    dataSource,
    /id:\s*['"]rocuronium['"][\s\S]*?ivDoseInfo:\s*['"]All ages: 1\.0 mg\/kg \(RSI Dose\)['"]/
  );

  const calculateRocuronium = vm.runInNewContext(
    `(weight) => (${calculationMatch[1]}).toFixed(1)`
  );

  assert.equal(calculateRocuronium(20), '20.0');
});
