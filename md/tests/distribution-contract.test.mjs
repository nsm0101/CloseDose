import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(mdRoot, 'dist');

const readDist = (relativePath) =>
  readFile(path.join(distRoot, relativePath), 'utf8');

function parseHeaderRules(source) {
  const rules = new Map();
  let activePath;

  for (const rawLine of source.split('\n')) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith('#')) continue;

    if (!/^\s/.test(rawLine)) {
      activePath = rawLine.trim();
      rules.set(activePath, new Map());
      continue;
    }

    assert.ok(activePath, `header without a route: ${rawLine}`);
    if (rawLine.trim().startsWith('! ')) {
      rules
        .get(activePath)
        .set(`! ${rawLine.trim().slice(2).toLowerCase()}`, '');
      continue;
    }
    const separator = rawLine.indexOf(':');
    assert.ok(separator > 0, `invalid header declaration: ${rawLine}`);
    rules
      .get(activePath)
      .set(
        rawLine.slice(0, separator).trim().toLowerCase(),
        rawLine.slice(separator + 1).trim()
      );
  }

  return rules;
}

function parseCsp(source) {
  return new Map(
    source
      .split(';')
      .map((directive) => directive.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name, ...values]) => [name, values])
  );
}

function htmlAssetUrls(source) {
  const urls = [];

  for (const match of source.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    urls.push(match[1]);
  }

  for (const match of source.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const candidate of match[1].split(',')) {
      urls.push(candidate.trim().split(/\s+/)[0]);
    }
  }

  return [...new Set(urls)];
}

test('assembled artifact contains all canonical applications and control files', async () => {
  const expectedTopLevel = [
    '404.css',
    '404.html',
    'PIG',
    'PMD',
    'RSI',
    '_headers',
    '_redirects',
    'assets',
    'index.html'
  ];
  const actualTopLevel = (await readdir(distRoot)).sort();

  assert.deepEqual(actualTopLevel, expectedTopLevel);

  for (const relativePath of ['index.html', 'PIG/index.html', 'RSI/index.html', 'PMD/index.html']) {
    assert.ok((await stat(path.join(distRoot, relativePath))).size > 100, relativePath);
  }
});

test('hashed application assets remain rooted at their canonical route', async () => {
  const applications = [
    { html: 'index.html', assetRoot: '/assets/' },
    { html: 'PIG/index.html', assetRoot: '/PIG/assets/' },
    { html: 'RSI/index.html', assetRoot: '/RSI/assets/' },
    {
      html: 'PMD/index.html',
      assetRoot: '/PMD/assets/',
      publicAssets: new Set([
        '/PMD/images/favicon-32.png',
        '/PMD/images/icon-512.png',
        '/PMD/images/apple-touch-icon.png',
        '/PMD/images/bear-mascot.png',
        '/PMD/images/wordmark.png',
        '/PMD/manifest.webmanifest'
      ])
    }
  ];

  for (const application of applications) {
    const html = await readDist(application.html);
    const assetUrls = htmlAssetUrls(html);

    assert.ok(assetUrls.length >= 2, `${application.html} should load built assets`);

    for (const assetUrl of assetUrls) {
      assert.doesNotMatch(assetUrl, /^(?:https?:)?\/\//, assetUrl);
      const isHashedAsset = assetUrl.startsWith(application.assetRoot);
      const isPublicAsset = application.publicAssets?.has(assetUrl) ?? false;
      assert.ok(isHashedAsset || isPublicAsset, `${application.html} emitted non-canonical asset URL ${assetUrl}`);
      if (!isHashedAsset) {
        assert.ok(
          (await stat(path.join(distRoot, assetUrl.slice(1)))).isFile(),
          `${assetUrl} does not resolve in dist`
        );
        continue;
      }
      assert.match(
        path.basename(assetUrl),
        /-[A-Za-z0-9_-]{8,}\.[A-Za-z0-9]+$/,
        `${assetUrl} is not content hashed`
      );
      assert.ok(
        (await stat(path.join(distRoot, assetUrl.slice(1)))).isFile(),
        `${assetUrl} does not resolve in dist`
      );
    }
  }
});

test('Cloudflare redirects enforce uppercase trailing-slash canonical routes', async () => {
  const redirects = (await readDist('_redirects'))
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  assert.deepEqual(redirects, [
    '/PIG /PIG/ 301',
    '/RSI /RSI/ 301',
    '/PMD /PMD/ 301'
  ]);
});

test('security headers keep runtime capabilities local and HTML revalidated', async () => {
  const headerSource = await readDist('_headers');
  const rules = parseHeaderRules(headerSource);
  const rootHeaders = rules.get('/*');
  const rootCspSource = rootHeaders.get('content-security-policy');
  const rootCsp = parseCsp(rootCspSource);

  for (const directive of ['default-src', 'script-src', 'font-src']) {
    assert.deepEqual(rootCsp.get(directive), ["'self'"], directive);
  }

  assert.deepEqual(rootCsp.get('img-src'), ["'self'", 'data:']);
  assert.deepEqual(rootCsp.get('connect-src'), ["'self'"]);
  assert.deepEqual(rootCsp.get('frame-src'), ["'none'"]);
  assert.deepEqual(rootCsp.get('style-src'), ["'self'"]);
  assert.deepEqual(rootCsp.get('style-src-elem'), ["'self'"]);
  assert.deepEqual(rootCsp.get('style-src-attr'), ["'unsafe-inline'"]);
  assert.deepEqual(
    [...rootCsp]
      .filter(([, values]) => values.includes("'unsafe-inline'"))
      .map(([directive]) => directive),
    ['style-src-attr']
  );
  assert.deepEqual(rootCsp.get('frame-ancestors'), ["'none'"]);
  assert.deepEqual(rootCsp.get('object-src'), ["'none'"]);
  assert.deepEqual(rootCsp.get('base-uri'), ["'none'"]);
  assert.deepEqual(rootCsp.get('form-action'), ["'none'"]);
  assert.doesNotMatch(
    rootCspSource,
    /googletagmanager|google-analytics|gstatic|gemini|unsafe-eval|script-src[^;]*unsafe-inline/i
  );

  const pmdHeaders = rules.get('/PMD/*');
  assert.ok(pmdHeaders.has('! content-security-policy'));
  assert.ok(pmdHeaders.has('! cross-origin-opener-policy'));
  const pmdCsp = parseCsp(pmdHeaders.get('content-security-policy'));
  assert.deepEqual(pmdCsp.get('connect-src'), [
    "'self'",
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
    'https://firestore.googleapis.com'
  ]);
  assert.deepEqual(pmdCsp.get('frame-src'), [
    'https://gen-lang-client-0217325418.firebaseapp.com'
  ]);
  assert.equal(
    pmdHeaders.get('cross-origin-opener-policy'),
    'same-origin-allow-popups'
  );

  assert.equal(rootHeaders.get('x-content-type-options'), 'nosniff');
  assert.equal(rootHeaders.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(rootHeaders.get('x-frame-options'), 'DENY');
  assert.equal(rootHeaders.get('cross-origin-opener-policy'), 'same-origin');
  assert.equal(rootHeaders.get('cross-origin-resource-policy'), 'same-origin');
  assert.match(rootHeaders.get('permissions-policy'), /camera=\(\)/);
  assert.match(rootHeaders.get('permissions-policy'), /microphone=\(\)/);
  assert.match(rootHeaders.get('permissions-policy'), /geolocation=\(\)/);

  for (const route of ['/', '/PIG/', '/RSI/', '/PMD/', '/404.html', '/404.css']) {
    assert.equal(
      rules.get(route).get('cache-control'),
      'public, max-age=0, must-revalidate',
      route
    );
  }

  for (const route of [
    '/assets/*',
    '/PIG/assets/*',
    '/RSI/assets/*',
    '/PMD/assets/*',
    '/PMD/images/*'
  ]) {
    assert.equal(
      rules.get(route).get('cache-control'),
      'public, max-age=31536000, immutable',
      route
    );
  }
});

test('static 404 is standalone, local-only, and links to canonical destinations', async () => {
  const [notFound, styles, deployment] = await Promise.all([
    readDist('404.html'),
    readDist('404.css'),
    readFile(path.join(mdRoot, 'DEPLOYMENT.md'), 'utf8')
  ]);

  assert.match(notFound, /That provider page was not found/);
  assert.match(notFound, /href="\/"/);
  assert.match(notFound, /href="\/PIG\/"/);
  assert.match(notFound, /href="\/RSI\/"/);
  assert.match(notFound, /href="\/PMD\/"/);
  assert.match(notFound, /href="\/404\.css"/);
  assert.doesNotMatch(notFound, /<script\b|<style\b|\sstyle=/i);
  assert.doesNotMatch(`${notFound}\n${styles}`, /https?:\/\//i);
  assert.match(deployment, /ProgressionTracker/);
  assert.match(deployment, /style=\{\{ width:/);
  assert.match(deployment, /single exception is `style-src-attr 'unsafe-inline'`/);
  assert.match(deployment, /style-src-elem 'self'/);
});
