import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  builtTools,
  catalogRoutes,
  gatedTools,
  plannedTools,
  readToolRegistry,
  requiredApprovalRoles,
  servedRoutes,
  validateToolRegistry,
  workspaceDirectories
} from '../scripts/tool-registry.mjs';
import { getBuildWorkspaceScripts } from '../scripts/clinical-release-manifest.mjs';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registry = await readToolRegistry();

const readJson = async (relativePath) =>
  JSON.parse(await readFile(path.join(mdRoot, relativePath), 'utf8'));

test('every derived file is in sync with the registry', () => {
  const result = spawnSync(process.execPath, ['scripts/sync-tools.mjs', '--check'], {
    cwd: mdRoot,
    encoding: 'utf8'
  });

  assert.equal(
    result.status,
    0,
    `derived files are stale; run \`npm run sync:tools\`\n${result.stderr}`
  );
});

test('rejects a registry that would ship an unroutable or colliding tool', () => {
  const clone = () => JSON.parse(JSON.stringify(registry));

  const duplicateRoute = clone();
  duplicateRoute.tools[1].route = duplicateRoute.tools[0].route;
  assert.throws(() => validateToolRegistry(duplicateRoute), /duplicate route/);

  const duplicateId = clone();
  duplicateId.tools[1].id = duplicateId.tools[0].id;
  assert.throws(() => validateToolRegistry(duplicateId), /duplicate tool id/);

  const lowercaseRoute = clone();
  lowercaseRoute.tools[0].route = '/pig/';
  assert.throws(() => validateToolRegistry(lowercaseRoute), /uppercase with a trailing slash/);

  const missingSlash = clone();
  missingSlash.tools[0].route = '/PIG';
  assert.throws(() => validateToolRegistry(missingSlash), /uppercase with a trailing slash/);

  const plannedWithWorkspace = clone();
  plannedWithWorkspace.tools.at(-1).workspace = 'apps/ingestion';
  assert.throws(() => validateToolRegistry(plannedWithWorkspace), /must not declare a workspace/);

  const unknownCategory = clone();
  unknownCategory.tools[0].category = 'Made up';
  assert.throws(() => validateToolRegistry(unknownCategory), /not in categoryOrder/);

  const unknownAudience = clone();
  unknownAudience.tools[0].audience = ['Veterinary'];
  assert.throws(() => validateToolRegistry(unknownAudience), /not a declared value/);
});

test('a gated tool must declare its approval roles and stay out of production builds', async () => {
  const clone = JSON.parse(JSON.stringify(registry));
  const gated = clone.tools.find((tool) => tool.release.kind === 'gated');

  delete gated.release.approvalRoles;
  assert.throws(() => validateToolRegistry(clone), /approvalRoles must be a non-empty array/);

  const withoutModeAware = JSON.parse(JSON.stringify(registry));
  const target = withoutModeAware.tools.find((tool) => tool.release.kind === 'gated');
  delete target.modeAwareBuild;
  assert.throws(() => validateToolRegistry(withoutModeAware), /must set modeAwareBuild/);

  // The live manifest withholds both gated tools, so production must exclude them
  // while a review build includes them for clinical validation.
  const manifest = await readJson('clinical-release-manifest.json');
  const production = getBuildWorkspaceScripts('production', manifest);
  const review = getBuildWorkspaceScripts('review', manifest);

  for (const tool of gatedTools(registry)) {
    const script = `build:${tool.workspace.replace('apps/', '')}`;
    assert.equal(production.includes(script), manifest[tool.release.manifestKey].publicReleaseApproved, script);
    assert.equal(review.includes(script), true, script);
  }
});

test('approval roles are sourced from the registry, not a second hardcoded list', () => {
  const roles = requiredApprovalRoles(registry);

  assert.deepEqual(Object.keys(roles).sort(), ['device', 'sedation']);
  assert.ok(roles.device.includes('Regulatory'));
  assert.ok(roles.sedation.includes('Pediatric pharmacy'));
  for (const tool of gatedTools(registry)) {
    assert.deepEqual(roles[tool.release.manifestKey], tool.release.approvalRoles);
  }
});

test('every built workspace exists on disk with a matching package identity', async () => {
  for (const directory of workspaceDirectories(registry)) {
    const manifest = await readJson(path.join(directory, 'package.json'));
    assert.equal(manifest.private, true, directory);
  }

  for (const tool of builtTools(registry)) {
    const manifest = await readJson(path.join(tool.workspace, 'package.json'));
    assert.equal(manifest.name, tool.packageName, tool.id);
    assert.equal(manifest.closedoseMd?.routeBase, tool.route, tool.id);
  }
});

test('every planned tool reserves a route and keeps a written specification', async () => {
  const repoRoot = path.resolve(mdRoot, '..');

  // Governance requires a clinical specification and an implementation
  // specification before a planned tool can move toward release.
  for (const tool of plannedTools(registry)) {
    assert.ok(tool.specDirectory, `${tool.id} must declare a specDirectory`);
    for (const specFile of ['clinical.md', 'implementation.md']) {
      await assert.doesNotReject(
        readFile(path.join(repoRoot, tool.specDirectory, specFile), 'utf8'),
        `${tool.id} is planned but has no ${specFile} in ${tool.specDirectory}`
      );
    }
  }
});

test('served routes and reserved routes stay disjoint and complete', () => {
  const served = servedRoutes(registry);
  const all = catalogRoutes(registry);

  assert.equal(new Set(all).size, all.length);
  assert.equal(served.length, builtTools(registry).length);
  for (const tool of plannedTools(registry)) {
    assert.equal(served.includes(tool.route), false, tool.route);
  }
});

test('redirects cover every served route exactly once', async () => {
  const redirects = await readFile(path.join(mdRoot, 'static/_redirects'), 'utf8');
  const lines = redirects.trim().split('\n');

  assert.equal(lines.length, servedRoutes(registry).length);
  for (const route of servedRoutes(registry)) {
    assert.equal(
      lines.filter((line) => line === `${route.slice(0, -1)} ${route} 301`).length,
      1,
      route
    );
  }
});
