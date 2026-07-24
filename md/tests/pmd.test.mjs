import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(mdRoot, '..');
const pmdRoot = path.join(mdRoot, 'apps/pmd');

const read = (relativePath) =>
  readFile(path.join(pmdRoot, relativePath), 'utf8');

test('PMD is an isolated static workspace at its canonical provider route', async () => {
  const [packageJson, viteConfig] = await Promise.all([
    read('package.json').then(JSON.parse),
    read('vite.config.ts')
  ]);

  assert.equal(packageJson.name, '@closedose-md/pmd');
  assert.equal(packageJson.private, true);
  assert.equal(packageJson.type, 'module');
  assert.equal(packageJson.closedoseMd?.routeBase, '/PMD/');
  assert.deepEqual(packageJson.scripts, {
    dev: 'vite',
    build: 'vite build',
    preview: 'vite preview',
    typecheck: 'tsc --noEmit',
    test: 'node --test ../../tests/pmd.test.mjs'
  });
  assert.match(viteConfig, /base:\s*['"]\/PMD\/['"]/);
  assert.match(viteConfig, /outDir:\s*['"]\.\.\/\.\.\/dist\/PMD['"]/);
  assert.doesNotMatch(viteConfig, /loadEnv|process\.env|API_KEY|GEMINI/i);
});

test('PMD keeps its Firebase workflow while omitting analytics and AI scaffolding', async () => {
  const [app, firebase, indexHtml, packageJson] = await Promise.all([
    read('src/App.tsx'),
    read('src/firebase.ts'),
    read('index.html'),
    read('package.json').then(JSON.parse)
  ]);

  assert.match(app, /from ['"]firebase\/firestore['"]/);
  assert.match(app, /onSnapshot/);
  assert.match(app, /localStorage/);
  assert.match(firebase, /getAuth/);
  assert.match(firebase, /getFirestore/);
  assert.match(firebase, /GoogleAuthProvider/);
  assert.doesNotMatch(`${app}\n${firebase}\n${indexHtml}`, /gtag|googletagmanager|google-analytics|firebase\/analytics/i);
  assert.doesNotMatch(
    JSON.stringify(packageJson),
    /@google\/genai|dotenv|express|vite-plugin-pwa|API_KEY|GEMINI/i
  );
  await assert.rejects(stat(path.join(pmdRoot, 'server.ts')));
  await assert.rejects(stat(path.join(pmdRoot, 'src/lib/analytics.ts')));
});

test('PMD entry document and manifest are local, CSP-compatible, and canonical', async () => {
  const [indexHtml, manifest] = await Promise.all([
    read('index.html'),
    read('public/manifest.webmanifest').then(JSON.parse)
  ]);

  assert.doesNotMatch(indexHtml, /<script(?![^>]*type="module"[^>]*src=)|<style\b|\sstyle=/i);
  assert.doesNotMatch(indexHtml, /(?:https?:)?\/\//i);
  assert.match(indexHtml, /src="\/src\/main\.tsx"/);
  assert.equal(manifest.id, '/PMD/');
  assert.equal(manifest.start_url, '/PMD/');
  assert.equal(manifest.scope, '/PMD/');
  for (const icon of manifest.icons) {
    assert.match(icon.src, /^\/PMD\/images\//);
  }
});

test('PMD production public assets contain only the optimized runtime set', async () => {
  const imageNames = (await readdir(path.join(pmdRoot, 'public/images'))).sort();

  assert.deepEqual(imageNames, [
    'apple-touch-icon.png',
    'bear-head.png',
    'bear-mascot.png',
    'favicon-32.png',
    'icon-192.png',
    'icon-512.png',
    'icon-maskable-512.png',
    'wordmark.png'
  ]);
  for (const imageName of imageNames) {
    assert.ok((await stat(path.join(pmdRoot, 'public/images', imageName))).size > 100);
  }
});

test('legacy closedose.com PMD entry preserves query and hash while redirecting', async () => {
  const legacyEntry = await readFile(
    path.join(repositoryRoot, 'public/PMD/index.html'),
    'utf8'
  );

  assert.match(legacyEntry, /https:\/\/md\.closedose\.com\/PMD\//);
  assert.match(legacyEntry, /window\.location\.search/);
  assert.match(legacyEntry, /window\.location\.hash/);
  assert.match(legacyEntry, /window\.location\.replace/);
});
