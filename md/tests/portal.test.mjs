import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const portalRoot = path.join(mdRoot, 'apps/portal');

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

function relativeLuminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4
    );

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background)
  );
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background)
  );

  return (lighter + 0.05) / (darker + 0.05);
}

test('portal package is a typed static React and Vite application', async () => {
  const packageJson = JSON.parse(await read('apps/portal/package.json'));

  assert.equal(packageJson.name, '@closedose-md/portal');
  assert.equal(packageJson.private, true);
  assert.equal(packageJson.type, 'module');
  assert.equal(packageJson.closedoseMd?.routeBase, '/');
  assert.deepEqual(packageJson.scripts, {
    dev: 'vite',
    build: 'vite build',
    typecheck: 'tsc --noEmit',
    test: 'node --test ../../tests/portal.test.mjs'
  });
  assert.deepEqual(packageJson.dependencies, {
    '@fontsource-variable/public-sans': '^5.2.7',
    react: '^19.0.1',
    'react-dom': '^19.0.1'
  });
});

test('typed catalog preserves the canonical clinical tool routes', async () => {
  const [catalog, app] = await Promise.all([
    read('apps/portal/src/toolCatalog.ts'),
    read('apps/portal/src/App.tsx')
  ]);

  assert.match(catalog, /export type ToolRoute = ['"]\/PIG\/['"] \| ['"]\/RSI\/['"]/);
  assert.match(catalog, /satisfies readonly ToolCatalogEntry\[\]/);
  assert.equal((catalog.match(/route:\s*['"]\/PIG\/['"]/g) ?? []).length, 1);
  assert.equal((catalog.match(/route:\s*['"]\/RSI\/['"]/g) ?? []).length, 1);
  assert.match(app, /toolCatalog\.map\(\(tool\) =>/);
  assert.match(app, /href=\{tool\.route\}/);
});

test('portal includes the required provider copy and release boundaries', async () => {
  const app = await read('apps/portal/src/App.tsx');
  const ledeMatch = app.match(/const HERO_LEDE = ['"]([^'"]+)['"]/);

  assert.ok(ledeMatch, 'expected a testable hero lede constant');
  assert.ok(ledeMatch[1].trim().split(/\s+/).length <= 20);

  for (const requiredCopy of [
    'CloseDose MD',
    'Provider tools',
    'View provider tools',
    'Local browser calculation',
    'No patient identifiers',
    'No AI runtime',
    'institutional protocols',
    'Decision support only'
  ]) {
    assert.match(app, new RegExp(requiredCopy));
  }

  assert.doesNotMatch(
    app,
    /FDA|approved|certified|guaranteed|more accurate|better outcomes|trusted by|testimonial/i
  );
});

test('portal owns the verified CloseDose mark and lossless editorial image', async () => {
  const [app, logo, hero, heroStats] = await Promise.all([
    read('apps/portal/src/App.tsx'),
    readFile(path.join(portalRoot, 'src/assets/closedose-mark-teal.png')),
    readFile(path.join(portalRoot, 'src/assets/clinical-preparation-room.webp')),
    stat(path.join(portalRoot, 'src/assets/clinical-preparation-room.webp'))
  ]);

  assert.match(app, /\.\/assets\/closedose-mark-teal\.png/);
  assert.match(app, /\.\/assets\/clinical-preparation-room\.webp/);
  assert.equal(
    createHash('sha256').update(logo).digest('hex'),
    'a9736e0d0ddfaaa81731e7bcfa36f8c2575bf0a0462f30f5c75f13a86a657d86'
  );
  assert.equal(hero.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(hero.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(heroStats.size > 100_000);
  assert.match(app, /alt=""/);
  assert.doesNotMatch(app, /dashboard|interface preview|product screen/i);
});

test('portal has local fonts, system theme parity, focus, and reduced motion', async () => {
  const [main, styles, indexHtml] = await Promise.all([
    read('apps/portal/src/main.tsx'),
    read('apps/portal/src/index.css'),
    read('apps/portal/index.html')
  ]);

  assert.match(main, /@fontsource-variable\/public-sans\/wght\.css/);
  assert.match(styles, /font-family:\s*['"]Public Sans Variable['"]/);
  assert.match(styles, /color-scheme:\s*light dark/);
  assert.match(styles, /#18a78d/i);
  assert.match(styles, /@media \(prefers-color-scheme:\s*dark\)/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /outline:\s*3px solid var\(--focus\)/);
  assert.match(styles, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(styles, /@media \(max-width:\s*767px\)/);
  assert.match(indexHtml, /width=device-width, initial-scale=1\.0/);

  assert.ok(contrastRatio('#f8fbfa', '#0c6c5d') >= 4.5);
  assert.ok(contrastRatio('#10201c', '#70d6c0') >= 4.5);
  assert.ok(contrastRatio('#18211f', '#f6f5f0') >= 4.5);
  assert.ok(contrastRatio('#eff5f2', '#111917') >= 4.5);
});

test('portal source contains no remote requests, remote font imports, or forbidden visible dashes', async () => {
  const files = (await listFiles(portalRoot)).filter((file) =>
    /\.(?:css|html|json|ts|tsx)$/.test(file)
  );
  const sourceByFile = await Promise.all(
    files.map(async (file) => [file, await readFile(file, 'utf8')])
  );

  for (const [file, source] of sourceByFile) {
    assert.doesNotMatch(source, /https?:\/\//i, file);
    assert.doesNotMatch(source, /@import\s+url|fonts\.googleapis|fonts\.gstatic/i, file);
  }

  for (const relativePath of [
    'apps/portal/index.html',
    'apps/portal/src/App.tsx',
    'apps/portal/src/toolCatalog.ts'
  ]) {
    assert.doesNotMatch(await read(relativePath), /[\u2013\u2014]/, relativePath);
  }
});
