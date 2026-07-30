import { readFile } from 'node:fs/promises';

export const REQUIRED_APPROVAL_ROLES = Object.freeze({
  device: Object.freeze([
    'PEM',
    'Pediatric airway specialty',
    'Institutional',
    'Regulatory'
  ]),
  sedation: Object.freeze([
    'PEM',
    'Pediatric pharmacy',
    'Pediatric sedation or anesthesia',
    'Institutional',
    'Regulatory'
  ])
});

const tools = Object.freeze(['device', 'sedation']);
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

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
    if (record.status !== 'Clinical review') {
      throw new TypeError(`${tool} status must be Clinical review`);
    }
    if (typeof record.publicReleaseApproved !== 'boolean') {
      throw new TypeError(`${tool} publicReleaseApproved must be boolean`);
    }
    if (
      record.clinicalReviewDate !== null &&
      (typeof record.clinicalReviewDate !== 'string' || !isoDate.test(record.clinicalReviewDate))
    ) {
      throw new TypeError(`${tool} clinicalReviewDate must be null or YYYY-MM-DD`);
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
      if (!isoDate.test(reviewer.approvalDate)) {
        throw new TypeError(`${tool} reviewer approvalDate must be YYYY-MM-DD`);
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

  const scripts = ['build:portal', 'build:pig', 'build:rsi', 'build:pmd'];
  for (const tool of tools) {
    if (mode === 'review' || isPublicReleaseApproved(manifest, tool)) {
      scripts.push(`build:${tool}`);
    }
  }
  return scripts;
}
