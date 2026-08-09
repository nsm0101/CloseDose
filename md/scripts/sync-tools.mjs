/**
 * Regenerates every file derived from tools.registry.json.
 *
 * Usage:
 *   node scripts/sync-tools.mjs          # write derived files
 *   node scripts/sync-tools.mjs --check  # fail if any derived file is stale
 *
 * The --check mode is what keeps the registry honest: CI and `test:unit` run it,
 * so a tool added to only half the workspace fails before it can ship.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  builtTools,
  readToolRegistry,
  scriptSuffix,
  servedRoutes,
  unitTestFiles
} from './tool-registry.mjs';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(mdRoot, '..');
const checkOnly = process.argv.includes('--check');

const START = (name) => `<!-- generated:${name} start -->`;
const END = (name) => `<!-- generated:${name} end -->`;

/** Replaces the block between generated markers, leaving prose untouched. */
function replaceMarkedBlock(source, name, body, filePath) {
  const start = source.indexOf(START(name));
  const end = source.indexOf(END(name));
  if (start === -1 || end === -1) {
    throw new Error(
      `${filePath} is missing the generated:${name} markers; add ${START(name)} and ${END(name)}`
    );
  }
  const head = source.slice(0, start + START(name).length);
  const tail = source.slice(end);
  return `${head}\n${body}\n${tail}`;
}

function buildScripts(registry) {
  const tools = builtTools(registry);
  const portalSuffix = scriptSuffix(registry.portal.workspace);
  const scripts = {};

  scripts.build = 'node scripts/build.mjs production';
  scripts['build:review'] = 'node scripts/build.mjs review';
  scripts[`build:${portalSuffix}`] =
    `npm run build --workspace ${registry.portal.packageName}`;
  for (const tool of tools) {
    scripts[`build:${scriptSuffix(tool.workspace)}`] =
      `npm run build --workspace ${tool.packageName}`;
  }

  const typecheckTargets = [
    portalSuffix,
    ...tools.map((tool) => scriptSuffix(tool.workspace)),
    ...registry.packages.map((entry) => scriptSuffix(entry.workspace))
  ];
  scripts.typecheck = typecheckTargets.map((name) => `npm run typecheck:${name}`).join(' && ');
  scripts[`typecheck:${portalSuffix}`] =
    `npm run typecheck --workspace ${registry.portal.packageName}`;
  for (const tool of tools) {
    scripts[`typecheck:${scriptSuffix(tool.workspace)}`] =
      `npm run typecheck --workspace ${tool.packageName}`;
  }
  for (const entry of registry.packages) {
    scripts[`typecheck:${scriptSuffix(entry.workspace)}`] =
      `npm run typecheck --workspace ${entry.packageName}`;
  }

  scripts[`test:${portalSuffix}`] = `npm run test --workspace ${registry.portal.packageName}`;
  for (const tool of tools) {
    const suffix = scriptSuffix(tool.workspace);
    if (tool.workspaceTestScript) {
      scripts[`test:${suffix}`] = `npm run test --workspace ${tool.packageName}`;
    } else if ((tool.tests ?? []).length > 0) {
      scripts[`test:${suffix}`] = `node --test ${tool.tests.join(' ')}`;
    }
  }

  scripts['test:rules'] =
    'npx --yes --package=firebase-tools@15.24.0 -- firebase emulators:exec --project demo-closedose-md --only firestore "node --test tests/firestore-rules.test.mjs"';
  scripts['test:unit'] = `node --test ${unitTestFiles(registry).join(' ')}`;
  scripts['test:contract'] = 'node --test tests/distribution-contract.test.mjs';
  scripts['test:smoke'] = 'playwright test';
  scripts['sync:tools'] = 'node scripts/sync-tools.mjs';
  scripts['sync:tools:check'] = 'node scripts/sync-tools.mjs --check';
  scripts['new:tool'] = 'node scripts/new-tool.mjs';
  scripts['migrate:pmd'] = 'node scripts/migrate-pmd-legacy-shifts.mjs';

  return scripts;
}

function renderRedirects(registry) {
  return `${servedRoutes(registry)
    .map((route) => `${route.slice(0, -1)} ${route} 301`)
    .join('\n')}\n`;
}

function renderReadmeTable(registry) {
  const rows = [
    `| \`/\` | \`${registry.portal.workspace}\` | CloseDose MD provider portal |`,
    ...builtTools(registry).map(
      (tool) => `| \`${tool.route}\` | \`${tool.workspace}\` | ${tool.title} |`
    )
  ];
  return ['| Route | Workspace | Application |', '| --- | --- | --- |', ...rows].join('\n');
}

function renderGovernanceTable(registry) {
  const statusFor = (tool) =>
    ({ available: 'Available', gated: 'Clinical review', planned: 'Planned' })[tool.release.kind];
  const rows = registry.tools
    .filter((tool) => tool.release.kind !== 'available')
    .map((tool) => `| ${tool.title} | \`${tool.route}\` | ${statusFor(tool)} |`);
  return ['| Tool | Route | Status |', '| --- | --- | --- |', ...rows].join('\n');
}

async function derivedFiles(registry) {
  const packageJsonPath = path.join(mdRoot, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  packageJson.workspaces = [
    registry.portal.workspace,
    ...builtTools(registry).map((tool) => tool.workspace),
    ...registry.packages.map((entry) => entry.workspace)
  ];
  packageJson.scripts = buildScripts(registry);

  const readmePath = path.join(mdRoot, 'README.md');
  const governancePath = path.join(repoRoot, 'docs/provider-tools/README.md');

  return [
    {
      filePath: packageJsonPath,
      contents: `${JSON.stringify(packageJson, null, 2)}\n`
    },
    {
      filePath: path.join(mdRoot, 'static/_redirects'),
      contents: renderRedirects(registry)
    },
    {
      filePath: readmePath,
      contents: replaceMarkedBlock(
        await readFile(readmePath, 'utf8'),
        'route-table',
        renderReadmeTable(registry),
        readmePath
      )
    },
    {
      filePath: governancePath,
      contents: replaceMarkedBlock(
        await readFile(governancePath, 'utf8'),
        'governance-table',
        renderGovernanceTable(registry),
        governancePath
      )
    }
  ];
}

const registry = await readToolRegistry();
const files = await derivedFiles(registry);
const stale = [];

for (const { filePath, contents } of files) {
  const current = await readFile(filePath, 'utf8').catch(() => null);
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
    `Derived files are stale against md/tools.registry.json:\n${stale
      .map((name) => `  ${name}`)
      .join('\n')}\n\nRun \`npm run sync:tools\` from md/ and commit the result.`
  );
  process.exit(1);
}

if (!checkOnly) {
  console.log(`registry in sync: ${registry.tools.length} tools`);
}
