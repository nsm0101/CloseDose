import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  derivedParentFiles,
  readParentRegistry,
  validateParentRegistry
} from '../scripts/sync-parent-tools.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = await readParentRegistry();

test('every parent page is in sync with the registry', async () => {
  const stale = [];

  for (const { filePath, contents } of await derivedParentFiles(registry)) {
    const current = await readFile(filePath, 'utf8');
    if (current !== contents) stale.push(path.relative(repoRoot, filePath));
  }

  assert.deepEqual(
    stale,
    [],
    'run `node scripts/sync-parent-tools.mjs` and commit the result'
  );
});

test('rejects a registry that would produce a broken menu', () => {
  const clone = () => JSON.parse(JSON.stringify(registry));

  const duplicateNavId = clone();
  duplicateNavId.nav[1].id = duplicateNavId.nav[0].id;
  assert.throws(() => validateParentRegistry(duplicateNavId), /duplicate nav id/);

  const duplicateCardId = clone();
  duplicateCardId.cards[1].id = duplicateCardId.cards[0].id;
  assert.throws(() => validateParentRegistry(duplicateCardId), /duplicate cards id/);

  const missingLabel = clone();
  delete missingLabel.nav[0].label;
  assert.throws(() => validateParentRegistry(missingLabel), /needs a label/);

  const missingSub = clone();
  delete missingSub.cards[0].sub;
  assert.throws(() => validateParentRegistry(missingSub), /needs a sub/);

  const repeatedPage = clone();
  repeatedPage.navPages.push(repeatedPage.navPages[0]);
  assert.throws(() => validateParentRegistry(repeatedPage), /must not repeat a page/);
});

test('every page the menu links to is a page that exists', async () => {
  for (const item of registry.nav) {
    const page = item.page.split('#')[0];
    await assert.doesNotReject(
      readFile(path.join(repoRoot, 'public', page), 'utf8'),
      `menu links to missing page: ${page}`
    );
  }

  for (const card of registry.cards) {
    await assert.doesNotReject(
      readFile(path.join(repoRoot, 'public', card.page), 'utf8'),
      `card links to missing page: ${card.page}`
    );
  }
});

test('every page that carries the menu is registered', async () => {
  // A page with a menu that is not in navPages would silently drift, so the
  // registry has to list every page carrying the generated block.
  const { globSync } = await import('node:fs');
  const pages = globSync('*.html', { cwd: path.join(repoRoot, 'public') });

  for (const page of pages) {
    const source = await readFile(path.join(repoRoot, 'public', page), 'utf8');
    if (!source.includes('class="menu-links"')) continue;
    assert.ok(
      registry.navPages.includes(page),
      `${page} carries the site menu but is missing from navPages`
    );
  }
});

test('the current page is marked exactly once per page', async () => {
  for (const { filePath, contents } of await derivedParentFiles(registry)) {
    const page = path.basename(filePath);
    const marked = (contents.match(/aria-current="page"/g) ?? []).length;
    const expected = registry.nav.some((item) => item.page === page) ? 1 : 0;
    assert.equal(marked, expected, page);
  }
});
