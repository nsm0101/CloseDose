import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { scanApplicationPrivacy } from './helpers/privacy-scan.mjs';
import { catalogRoutes, readToolRegistry } from '../scripts/tool-registry.mjs';

const registry = await readToolRegistry();
const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const portalRoot = path.join(mdRoot, 'apps/portal');

const read = (relativePath) =>
  readFile(path.join(mdRoot, relativePath), 'utf8');

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

function webpDimensions(buffer) {
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP');

  const vp8Chunk = buffer.indexOf(Buffer.from('VP8 '));
  assert.ok(vp8Chunk >= 0, 'expected a lossy VP8 WebP image');

  const frame = vp8Chunk + 8;
  assert.equal(buffer.subarray(frame + 3, frame + 6).toString('hex'), '9d012a');

  return {
    width: buffer.readUInt16LE(frame + 6) & 0x3fff,
    height: buffer.readUInt16LE(frame + 8) & 0x3fff
  };
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

test('typed catalog preserves roadmap metadata, statuses, and canonical routes', async () => {
  const [catalog, app] = await Promise.all([
    read('apps/portal/src/toolCatalog.ts'),
    read('apps/portal/src/App.tsx')
  ]);

  assert.match(catalog, /export type ToolStatus = 'Planned' \| 'Clinical review' \| 'Available'/);
  for (const field of [
    'audience',
    'category',
    'evidenceVersion',
    'clinicalReviewDate',
    'canonicalRoute',
    'publiclyAccessible'
  ]) {
    assert.match(catalog, new RegExp(`${field}:`), field);
  }

  // The catalog is derived from the registry rather than hand-written, so the
  // contract is that it reads both sources and never hardcodes a route.
  assert.match(catalog, /from '\.\.\/\.\.\/\.\.\/tools\.registry\.json'/);
  assert.match(catalog, /from '\.\.\/\.\.\/\.\.\/clinical-release-manifest\.json'/);
  assert.match(catalog, /registry\.tools\.map/);
  for (const route of catalogRoutes(registry)) {
    assert.equal(
      catalog.includes(`'${route}'`),
      false,
      `${route} must come from the registry, not a literal in toolCatalog.ts`
    );
  }

  // Gated tools must take their status from the release manifest, never from a
  // literal, so an unapproved tool cannot be published by editing the registry.
  assert.match(catalog, /release\.kind === 'gated'/);
  assert.match(catalog, /publiclyAccessible: record\.publicReleaseApproved/);
  assert.equal(
    registry.tools.filter((tool) => tool.release.kind === 'available').length,
    7
  );
  assert.equal(registry.tools.filter((tool) => tool.release.kind === 'planned').length, 6);
  assert.deepEqual(
    registry.tools.filter((tool) => tool.release.kind === 'gated').map((tool) => tool.id),
    ['device', 'sedation']
  );
  assert.match(app, /const actionLabels =/);
  assert.match(app, /Available:\s*'Open tool'/);
  assert.match(app, /'Clinical review':\s*'Awaiting approval'/);
  assert.match(app, /Planned:\s*'Planned module'/);
  assert.match(app, /groupedTools\.map/);
  assert.match(app, /href=\{tool\.canonicalRoute\}/);
  assert.match(app, /tool\.publiclyAccessible/);
  assert.match(app, /Awaiting approval/);
  assert.match(app, /Planned module/);
});

test('provider suite offers searchable audience and status discovery controls', async () => {
  const app = await read('apps/portal/src/App.tsx');

  for (const requiredControl of [
    'Search provider tools',
    'All clinicians',
    'Community EM',
    'PEM',
    'All statuses',
    'Available',
    'Clinical review',
    'Planned',
    'Reset filters',
    'No tools match these filters'
  ]) {
    assert.match(app, new RegExp(requiredControl));
  }

  assert.match(app, /aria-pressed=/);
  assert.match(app, /aria-live="polite"/);
  assert.match(app, /tool\.title\.toLowerCase\(\)/);
  assert.match(app, /tool\.audience\.includes\(audienceFilter\)/);
  assert.match(app, /tool\.status === statusFilter/);
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
    'PIG and RSI: local calculation',
    'No patient identifiers',
    'PREtendingMD: approved Firebase workspace',
    'Administrator-approved users synchronize patient first name and last initial',
    'No AI runtime',
    'institutional protocols',
    'Decision support only'
  ]) {
    assert.match(app, new RegExp(requiredCopy));
  }

  assert.doesNotMatch(
    app,
    /FDA|certified|guaranteed|more accurate|better outcomes|trusted by|testimonial/i
  );
});

test('portal owns the verified mark and responsive editorial images', async () => {
  const [app, logo, hero640, hero960, heroFull, stats640, stats960, statsFull] = await Promise.all([
    read('apps/portal/src/App.tsx'),
    readFile(path.join(portalRoot, 'src/assets/closedose-mark-teal.png')),
    readFile(path.join(portalRoot, 'src/assets/clinical-preparation-room-640.webp')),
    readFile(path.join(portalRoot, 'src/assets/clinical-preparation-room-960.webp')),
    readFile(path.join(portalRoot, 'src/assets/clinical-preparation-room.webp')),
    stat(path.join(portalRoot, 'src/assets/clinical-preparation-room-640.webp')),
    stat(path.join(portalRoot, 'src/assets/clinical-preparation-room-960.webp')),
    stat(path.join(portalRoot, 'src/assets/clinical-preparation-room.webp'))
  ]);

  assert.match(app, /\.\/assets\/closedose-mark-teal\.png/);
  assert.match(app, /\.\/assets\/clinical-preparation-room-640\.webp/);
  assert.match(app, /\.\/assets\/clinical-preparation-room-960\.webp/);
  assert.match(app, /\.\/assets\/clinical-preparation-room\.webp/);
  assert.match(app, /<picture>/);
  assert.match(app, /srcSet=\{`\$\{clinicalPreparationRoom640\} 640w, \$\{clinicalPreparationRoom960\} 960w`\}/);
  assert.match(app, /media="\(max-width: 767px\)"/);
  assert.match(app, /sizes="calc\(100vw - 1\.5rem\)"/);
  assert.match(app, /width="1586"/);
  assert.match(app, /height="992"/);
  assert.equal(
    createHash('sha256').update(logo).digest('hex'),
    'a9736e0d0ddfaaa81731e7bcfa36f8c2575bf0a0462f30f5c75f13a86a657d86'
  );
  assert.deepEqual(webpDimensions(hero640), { width: 640, height: 401 });
  assert.deepEqual(webpDimensions(hero960), { width: 960, height: 601 });
  assert.deepEqual(webpDimensions(heroFull), { width: 1586, height: 992 });
  assert.ok(stats640.size > 10_000 && stats640.size < 30_000);
  assert.ok(stats960.size > 20_000 && stats960.size < 50_000);
  assert.ok(statsFull.size > 50_000 && statsFull.size < 110_000);
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
  assert.match(
    indexHtml,
    /name="theme-color"[\s\S]*?content="#f6f5f0"[\s\S]*?media="\(prefers-color-scheme: light\)"/
  );
  assert.match(
    indexHtml,
    /name="theme-color"[\s\S]*?content="#111917"[\s\S]*?media="\(prefers-color-scheme: dark\)"/
  );

  assert.ok(contrastRatio('#f8fbfa', '#0c6c5d') >= 4.5);
  assert.ok(contrastRatio('#10201c', '#70d6c0') >= 4.5);
  assert.ok(contrastRatio('#18211f', '#f6f5f0') >= 4.5);
  assert.ok(contrastRatio('#eff5f2', '#111917') >= 4.5);
});

test('portal passes the shared privacy scan without rejecting its explanatory copy', async () => {
  assert.deepEqual(await scanApplicationPrivacy(portalRoot), []);

  for (const relativePath of [
    'apps/portal/index.html',
    'apps/portal/src/App.tsx',
    'apps/portal/src/toolCatalog.ts'
  ]) {
    assert.doesNotMatch(await read(relativePath), /[\u2013\u2014]/, relativePath);
  }
});
