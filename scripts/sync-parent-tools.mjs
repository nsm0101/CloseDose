/**
 * Regenerates the parent-facing site menu and the index tool card grid from
 * public/tools.registry.json.
 *
 * Usage:
 *   node scripts/sync-parent-tools.mjs          # write derived blocks
 *   node scripts/sync-parent-tools.mjs --check  # fail if any block is stale
 *
 * The site menu is repeated on every parent page, so adding a tool used to mean
 * editing nine files by hand and hoping none drifted. Now the registry is the
 * only place a parent tool is declared.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(repoRoot, 'public');
const checkOnly = process.argv.includes('--check');

const START = (name) => `<!-- generated:${name} start -->`;
const END = (name) => `<!-- generated:${name} end -->`;

export function validateParentRegistry(registry) {
  const fail = (message) => {
    throw new TypeError(`parent tool registry: ${message}`);
  };

  if (!registry || typeof registry !== 'object') fail('registry must be an object');
  if (registry.schemaVersion !== 1) fail('schemaVersion must be 1');

  for (const key of ['nav', 'cards']) {
    if (!Array.isArray(registry[key]) || registry[key].length === 0) {
      fail(`${key} must be a non-empty array`);
    }
    const ids = new Set();
    for (const entry of registry[key]) {
      for (const field of ['id', 'page']) {
        if (typeof entry[field] !== 'string' || entry[field].trim() === '') {
          fail(`${key} entry ${field} must be a non-empty string`);
        }
      }
      if (ids.has(entry.id)) fail(`duplicate ${key} id: ${entry.id}`);
      ids.add(entry.id);
    }
  }

  if (!Array.isArray(registry.navPages) || registry.navPages.length === 0) {
    fail('navPages must be a non-empty array');
  }
  if (new Set(registry.navPages).size !== registry.navPages.length) {
    fail('navPages must not repeat a page');
  }

  for (const item of registry.nav) {
    if (typeof item.label !== 'string' || item.label.trim() === '') {
      fail(`nav entry ${item.id} needs a label`);
    }
  }
  for (const card of registry.cards) {
    for (const field of ['emoji', 'title', 'sub']) {
      if (typeof card[field] !== 'string' || card[field].trim() === '') {
        fail(`card ${card.id} needs a ${field}`);
      }
    }
  }

  return registry;
}

export async function readParentRegistry(
  registryUrl = new URL('../public/tools.registry.json', import.meta.url)
) {
  return validateParentRegistry(JSON.parse(await readFile(registryUrl, 'utf8')));
}

/** The menu for one page, marking that page as current where it appears. */
function renderNav(registry, page, indent) {
  return registry.nav
    .map((item) => {
      const current = item.page === page ? ' aria-current="page"' : '';
      return `${indent}<a href="${item.page}" class="nav-${item.id}"${current}>${item.label}</a>`;
    })
    .join('\n');
}

function renderCards(registry, indent) {
  return registry.cards
    .map((card) =>
      [
        `${indent}<a class="card cross-link-card calculator-expansion-card" href="${card.page}">`,
        `${indent}  <span class="cross-link-card__emoji" aria-hidden="true">${card.emoji}</span>`,
        `${indent}  <span class="cross-link-card__body">`,
        `${indent}    <span class="cross-link-card__title">${card.title}</span>`,
        `${indent}    <span class="cross-link-card__sub">${card.sub}</span>`,
        `${indent}  </span>`,
        `${indent}  <span class="cross-link-card__arrow" aria-hidden="true">→</span>`,
        `${indent}</a>`
      ].join('\n')
    )
    .join('\n');
}

/**
 * Replaces the block between generated markers. The indentation of the opening
 * marker is reused so generated markup keeps the surrounding file's formatting.
 */
function replaceMarkedBlock(source, name, render, filePath) {
  const startMarker = START(name);
  const endMarker = END(name);
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker);

  if (start === -1 || end === -1) {
    throw new Error(`${filePath} is missing the generated:${name} markers`);
  }

  const lineStart = source.lastIndexOf('\n', start) + 1;
  const indent = source.slice(lineStart, start);
  const head = source.slice(0, start + startMarker.length);
  const tail = source.slice(end);

  return `${head}\n${render(indent)}\n${indent}${tail}`;
}

export async function derivedParentFiles(registry) {
  const files = [];

  for (const page of registry.navPages) {
    const filePath = path.join(publicRoot, page);
    const source = await readFile(filePath, 'utf8');
    let contents = replaceMarkedBlock(
      source,
      'site-nav',
      (indent) => renderNav(registry, page, indent),
      filePath
    );

    if (page === 'index.html') {
      contents = replaceMarkedBlock(
        contents,
        'tool-cards',
        (indent) => renderCards(registry, indent),
        filePath
      );
    }

    files.push({ filePath, contents });
  }

  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const registry = await readParentRegistry();
  const files = await derivedParentFiles(registry);
  const stale = [];

  for (const { filePath, contents } of files) {
    const current = await readFile(filePath, 'utf8');
    if (current === contents) continue;
    if (checkOnly) {
      stale.push(path.relative(repoRoot, filePath));
    } else {
      await writeFile(filePath, contents, 'utf8');
      console.log(`updated ${path.relative(repoRoot, filePath)}`);
    }
  }

  if (checkOnly && stale.length > 0) {
    console.error(
      `Parent pages are stale against public/tools.registry.json:\n${stale
        .map((name) => `  ${name}`)
        .join('\n')}\n\nRun \`node scripts/sync-parent-tools.mjs\` and commit the result.`
    );
    process.exit(1);
  }

  if (!checkOnly) {
    console.log(
      `parent registry in sync: ${registry.nav.length} menu links, ` +
        `${registry.cards.length} cards, ${registry.navPages.length} pages`
    );
  }
}
