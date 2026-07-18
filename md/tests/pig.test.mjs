import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

const read = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const expectedAppSha256 =
  '279effee8f08517cdf5d46405b29d7512601dddde5ada3f8ac376fb47c07523c';

test('PIG package contains only the static React and Vite runtime', async () => {
  const packageJson = JSON.parse(await read('apps/pig/package.json'));

  assert.equal(packageJson.name, '@closedose-md/pig');
  assert.equal(packageJson.private, true);
  assert.equal(packageJson.type, 'module');
  assert.equal(packageJson.closedoseMd?.routeBase, '/PIG/');
  assert.deepEqual(packageJson.scripts, {
    dev: 'vite',
    build: 'vite build',
    typecheck: 'tsc --noEmit',
    test: 'node --test ../../tests/pig.test.mjs'
  });
  assert.deepEqual(packageJson.dependencies, {
    'lucide-react': '^0.546.0',
    react: '^19.0.1',
    'react-dom': '^19.0.1'
  });

  const forbiddenPackages = [
    '@google/genai',
    'axios',
    'dotenv',
    'express',
    'firebase',
    'openai'
  ];
  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  for (const dependency of forbiddenPackages) {
    assert.equal(allDependencies[dependency], undefined);
  }
});

test('PIG uses its canonical base and repaired browser entrypoint', async () => {
  const [viteConfig, indexHtml, main] = await Promise.all([
    read('apps/pig/vite.config.ts'),
    read('apps/pig/index.html'),
    read('apps/pig/src/main.tsx')
  ]);

  assert.match(viteConfig, /base:\s*['"]\/PIG\/['"]/);
  assert.match(viteConfig, /outDir:\s*['"]\.\.\/\.\.\/dist\/PIG['"]/);
  assert.doesNotMatch(viteConfig, /loadEnv|process\.env|GEMINI|server\s*:/);
  assert.match(indexHtml, /src=['"]\/src\/main\.tsx['"]/);
  assert.match(main, /import App from ['"]\.\/App\.tsx['"]/);
  assert.match(main, /import ['"]\.\/index\.css['"]/);
});

test('PIG preserves the pinned clinical source without network or persistence calls', async () => {
  const source = await read('apps/pig/src/App.tsx');
  const actualSha256 = createHash('sha256').update(source).digest('hex');

  assert.equal(actualSha256, expectedAppSha256);
  assert.doesNotMatch(
    source,
    /fetch\s*\(|XMLHttpRequest|axios|localStorage|sessionStorage|process\.env|GEMINI|https?:\/\//
  );
});

test('PIG backup ETT calculation handles a representative ranged size', async () => {
  const source = await read('apps/pig/src/App.tsx');
  const match = source.match(
    /const getEttBackupSizes = \(sizeStr: string\) => (\{[\s\S]*?\n  \});/
  );

  assert.ok(match, 'expected the imported getEttBackupSizes calculation');

  const calculation = vm.runInNewContext(`(sizeStr) => ${match[1]}`);

  assert.deepEqual(
    { ...calculation('6.0-7.0') },
    { main: '6.0-7.0', smaller: '5.5', larger: '7.5' }
  );
});
