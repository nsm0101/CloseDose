import { readFile } from 'node:fs/promises';

const ROUTE_PATTERN = /^\/[A-Z0-9-]+\/$/;
const ID_PATTERN = /^[a-z0-9-]+$/;
const RELEASE_KINDS = new Set(['available', 'gated', 'planned']);

function fail(message) {
  throw new TypeError(`tool registry: ${message}`);
}

function requireNonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`${label} must be a non-empty string`);
  }
}

function requireStringArray(value, label, allowed) {
  if (!Array.isArray(value) || value.length === 0) {
    fail(`${label} must be a non-empty array`);
  }
  for (const entry of value) {
    requireNonEmptyString(entry, `${label} entry`);
    if (allowed && !allowed.includes(entry)) {
      fail(`${label} entry is not a declared value: ${entry}`);
    }
  }
}

/**
 * Validates the registry shape. Every derived artifact in the workspace is
 * produced from this structure, so a malformed registry must fail loudly
 * rather than silently emit an incomplete provider hub.
 */
export function validateToolRegistry(registry) {
  if (!registry || typeof registry !== 'object' || Array.isArray(registry)) {
    fail('registry must be an object');
  }
  if (registry.schemaVersion !== 1) {
    fail('schemaVersion must be 1');
  }

  requireStringArray(registry.categoryOrder, 'categoryOrder');
  requireStringArray(registry.audiences, 'audiences');
  requireStringArray(registry.platformTests, 'platformTests');

  const portal = registry.portal;
  if (!portal || typeof portal !== 'object') fail('portal must be an object');
  requireNonEmptyString(portal.workspace, 'portal workspace');
  requireNonEmptyString(portal.packageName, 'portal packageName');
  if (portal.routeBase !== '/') fail('portal routeBase must be "/"');

  if (!Array.isArray(registry.packages)) fail('packages must be an array');
  for (const entry of registry.packages) {
    requireNonEmptyString(entry.workspace, 'package workspace');
    requireNonEmptyString(entry.packageName, 'package packageName');
  }

  if (!Array.isArray(registry.tools) || registry.tools.length === 0) {
    fail('tools must be a non-empty array');
  }

  const seenIds = new Set();
  const seenRoutes = new Set();
  const seenWorkspaces = new Set();

  for (const tool of registry.tools) {
    if (!tool || typeof tool !== 'object' || Array.isArray(tool)) {
      fail('every tool must be an object');
    }

    requireNonEmptyString(tool.id, 'tool id');
    if (!ID_PATTERN.test(tool.id)) {
      fail(`tool id must be lowercase kebab-case: ${tool.id}`);
    }
    if (seenIds.has(tool.id)) fail(`duplicate tool id: ${tool.id}`);
    seenIds.add(tool.id);

    requireNonEmptyString(tool.route, `${tool.id} route`);
    if (!ROUTE_PATTERN.test(tool.route)) {
      fail(`${tool.id} route must be uppercase with a trailing slash: ${tool.route}`);
    }
    if (seenRoutes.has(tool.route)) fail(`duplicate route: ${tool.route}`);
    seenRoutes.add(tool.route);

    for (const field of ['shortTitle', 'title', 'task', 'category']) {
      requireNonEmptyString(tool[field], `${tool.id} ${field}`);
    }
    if (!registry.categoryOrder.includes(tool.category)) {
      fail(`${tool.id} category is not in categoryOrder: ${tool.category}`);
    }
    requireStringArray(tool.audience, `${tool.id} audience`, registry.audiences);

    if (tool.evidenceVersion !== null) {
      requireNonEmptyString(tool.evidenceVersion, `${tool.id} evidenceVersion`);
    }

    const release = tool.release;
    if (!release || typeof release !== 'object') fail(`${tool.id} release must be an object`);
    if (!RELEASE_KINDS.has(release.kind)) {
      fail(`${tool.id} release.kind must be available, gated, or planned`);
    }

    if (release.kind === 'planned') {
      if (tool.workspace != null) {
        fail(`${tool.id} is planned and must not declare a workspace`);
      }
    } else {
      requireNonEmptyString(tool.workspace, `${tool.id} workspace`);
      requireNonEmptyString(tool.packageName, `${tool.id} packageName`);
      if (seenWorkspaces.has(tool.workspace)) {
        fail(`duplicate workspace: ${tool.workspace}`);
      }
      seenWorkspaces.add(tool.workspace);
      if (tool.tests !== undefined && !Array.isArray(tool.tests)) {
        fail(`${tool.id} tests must be an array`);
      }
    }

    if (release.kind === 'gated') {
      requireNonEmptyString(release.manifestKey, `${tool.id} release.manifestKey`);
      requireStringArray(release.approvalRoles, `${tool.id} release.approvalRoles`);
      if (new Set(release.approvalRoles).size !== release.approvalRoles.length) {
        fail(`${tool.id} release.approvalRoles must be unique`);
      }
      if (!tool.modeAwareBuild) {
        fail(`${tool.id} is gated and must set modeAwareBuild so review builds can include it`);
      }
    }
  }

  return registry;
}

export async function readToolRegistry(
  registryUrl = new URL('../tools.registry.json', import.meta.url)
) {
  return validateToolRegistry(JSON.parse(await readFile(registryUrl, 'utf8')));
}

/** Tools that have a real application workspace, in build order. */
export function builtTools(registry) {
  return registry.tools.filter((tool) => tool.workspace != null);
}

/** Tools that are catalogued and specified but have no served route. */
export function plannedTools(registry) {
  return registry.tools.filter((tool) => tool.release.kind === 'planned');
}

/** Tools whose public release is withheld pending recorded named approvals. */
export function gatedTools(registry) {
  return registry.tools.filter((tool) => tool.release.kind === 'gated');
}

/** npm workspace directories, portal first, shared packages last. */
export function workspaceDirectories(registry) {
  return [
    registry.portal.workspace,
    ...builtTools(registry).map((tool) => tool.workspace),
    ...registry.packages.map((entry) => entry.workspace)
  ];
}

/** The `{ directory, name, routeBase }` contract every workspace must satisfy. */
export function workspaceContracts(registry) {
  return [
    {
      directory: registry.portal.workspace,
      name: registry.portal.packageName,
      routeBase: registry.portal.routeBase
    },
    ...builtTools(registry).map((tool) => ({
      directory: tool.workspace,
      name: tool.packageName,
      routeBase: tool.route
    }))
  ];
}

/** Short workspace suffix used to name npm scripts, e.g. `apps/pig` -> `pig`. */
export function scriptSuffix(workspace) {
  return workspace.replace(/^apps\//, '').replace(/^packages\//, '');
}

/** Approval roles required before a gated tool may be released publicly. */
export function requiredApprovalRoles(registry) {
  return Object.freeze(
    Object.fromEntries(
      gatedTools(registry).map((tool) => [
        tool.release.manifestKey,
        Object.freeze([...tool.release.approvalRoles])
      ])
    )
  );
}

/** Manifest keys for every gated tool, in registry order. */
export function gatedManifestKeys(registry) {
  return gatedTools(registry).map((tool) => tool.release.manifestKey);
}

/** Every served route, used for redirects and distribution contract checks. */
export function servedRoutes(registry) {
  return builtTools(registry).map((tool) => tool.route);
}

/** Every catalogued route including reserved planned routes. */
export function catalogRoutes(registry) {
  return registry.tools.map((tool) => tool.route);
}

/** Test files run by `npm run test:unit`, platform checks first. */
export function unitTestFiles(registry) {
  return [
    ...registry.platformTests,
    ...(registry.portal.tests ?? []),
    ...builtTools(registry).flatMap((tool) => tool.tests ?? [])
  ];
}

/** Workspaces whose build must receive the `--mode` flag from build.mjs. */
export function modeAwareBuildWorkspaces(registry) {
  return Object.fromEntries(
    builtTools(registry)
      .filter((tool) => tool.modeAwareBuild)
      .map((tool) => [`build:${scriptSuffix(tool.workspace)}`, tool.packageName])
  );
}
