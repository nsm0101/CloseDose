import { readFile } from 'node:fs/promises';

import {
  builtTools,
  gatedManifestKeys,
  readToolRegistry,
  requiredApprovalRoles,
  scriptSuffix
} from './tool-registry.mjs';

const registry = await readToolRegistry();

/**
 * Approval roles that must all be recorded before a gated tool is publicly
 * released. Sourced from tools.registry.json so a new gated tool cannot reach
 * production without declaring who has to sign it off.
 */
export const REQUIRED_APPROVAL_ROLES = requiredApprovalRoles(registry);

const tools = Object.freeze(gatedManifestKeys(registry));
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

function isIsoCalendarDate(value) {
  if (typeof value !== 'string' || !isoDate.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function requireNonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${label} must be a non-empty string`);
  }
}

export function validateClinicalReleaseManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new TypeError('clinical release manifest must be an object');
  }
  if (manifest.schemaVersion !== 1) {
    throw new TypeError('clinical release manifest schemaVersion must be 1');
  }

  for (const tool of tools) {
    const record = manifest[tool];
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      throw new TypeError(`${tool} release record must be an object`);
    }
    if (typeof record.publicReleaseApproved !== 'boolean') {
      throw new TypeError(`${tool} publicReleaseApproved must be boolean`);
    }
    const expectedStatus = record.publicReleaseApproved ? 'Available' : 'Clinical review';
    if (record.status !== expectedStatus) {
      throw new TypeError(`${tool} status must be ${expectedStatus}`);
    }
    if (
      record.clinicalReviewDate !== null &&
      !isIsoCalendarDate(record.clinicalReviewDate)
    ) {
      throw new TypeError(`${tool} clinicalReviewDate must be null or a valid YYYY-MM-DD date`);
    }
    if (!Array.isArray(record.reviewers)) {
      throw new TypeError(`${tool} reviewers must be an array`);
    }

    const roles = new Set();
    for (const reviewer of record.reviewers) {
      if (!reviewer || typeof reviewer !== 'object' || Array.isArray(reviewer)) {
        throw new TypeError(`${tool} reviewer must be an object`);
      }
      for (const field of ['name', 'role', 'approvalDate', 'scope']) {
        requireNonEmptyString(reviewer[field], `${tool} reviewer ${field}`);
      }
      if (!isIsoCalendarDate(reviewer.approvalDate)) {
        throw new TypeError(`${tool} reviewer approvalDate must be a valid YYYY-MM-DD date`);
      }
      if (roles.has(reviewer.role)) {
        throw new TypeError(`${tool} reviewer role must be unique: ${reviewer.role}`);
      }
      roles.add(reviewer.role);
    }

    if (record.publicReleaseApproved) {
      if (record.clinicalReviewDate === null) {
        throw new TypeError(`${tool} clinicalReviewDate is required for public release`);
      }
      for (const role of REQUIRED_APPROVAL_ROLES[tool]) {
        if (!roles.has(role)) {
          throw new TypeError(`${tool} missing required reviewer role: ${role}`);
        }
      }
    }
  }

  return manifest;
}

export async function readClinicalReleaseManifest(
  manifestUrl = new URL('../clinical-release-manifest.json', import.meta.url)
) {
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  return validateClinicalReleaseManifest(manifest);
}

export function isPublicReleaseApproved(manifest, tool) {
  validateClinicalReleaseManifest(manifest);
  if (!tools.includes(tool)) throw new TypeError(`unknown clinical review tool: ${tool}`);
  return manifest[tool].publicReleaseApproved;
}

export function getBuildWorkspaceScripts(mode, manifest) {
  validateClinicalReleaseManifest(manifest);
  if (mode !== 'production' && mode !== 'review') {
    throw new TypeError('build mode must be production or review');
  }

  const scripts = [`build:${scriptSuffix(registry.portal.workspace)}`];
  for (const tool of builtTools(registry)) {
    const script = `build:${scriptSuffix(tool.workspace)}`;
    if (tool.release.kind !== 'gated') {
      scripts.push(script);
    } else if (mode === 'review' || isPublicReleaseApproved(manifest, tool.release.manifestKey)) {
      scripts.push(script);
    }
  }
  return scripts;
}
