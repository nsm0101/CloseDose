import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  REQUIRED_APPROVAL_ROLES,
  getBuildWorkspaceScripts,
  isPublicReleaseApproved,
  validateClinicalReleaseManifest
} from '../scripts/clinical-release-manifest.mjs';

const manifestUrl = new URL('../clinical-release-manifest.json', import.meta.url);

const approval = (role) => ({
  name: `Reviewer for ${role}`,
  role,
  approvalDate: '2026-07-29',
  scope: 'Reviewed the production application, evidence, warnings, calculations, and release boundaries.'
});

const approvedRecord = (tool) => ({
  status: 'Available',
  publicReleaseApproved: true,
  clinicalReviewDate: '2026-07-29',
  reviewers: REQUIRED_APPROVAL_ROLES[tool].map(approval)
});

test('checked-in manifest keeps both unapproved review applications private', async () => {
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));

  assert.deepEqual(manifest, {
    schemaVersion: 1,
    device: {
      status: 'Clinical review',
      publicReleaseApproved: false,
      clinicalReviewDate: null,
      reviewers: []
    },
    sedation: {
      status: 'Clinical review',
      publicReleaseApproved: false,
      clinicalReviewDate: null,
      reviewers: []
    }
  });
  assert.doesNotThrow(() => validateClinicalReleaseManifest(manifest));
  assert.equal(isPublicReleaseApproved(manifest, 'device'), false);
  assert.equal(isPublicReleaseApproved(manifest, 'sedation'), false);
});

test('public release requires every named role, date, and scope', () => {
  const approved = {
    schemaVersion: 1,
    device: approvedRecord('device'),
    sedation: approvedRecord('sedation')
  };

  assert.doesNotThrow(() => validateClinicalReleaseManifest(approved));
  assert.equal(isPublicReleaseApproved(approved, 'device'), true);
  assert.equal(isPublicReleaseApproved(approved, 'sedation'), true);

  for (const tool of ['device', 'sedation']) {
    for (const field of ['name', 'role', 'approvalDate', 'scope']) {
      const invalid = structuredClone(approved);
      invalid[tool].reviewers[0][field] = '';
      assert.throws(
        () => validateClinicalReleaseManifest(invalid),
        new RegExp(`${tool}.*${field}`, 'i')
      );
    }

    const missingRole = structuredClone(approved);
    missingRole[tool].reviewers.pop();
    assert.throws(
      () => validateClinicalReleaseManifest(missingRole),
      new RegExp(`${tool}.*required reviewer role`, 'i')
    );

    for (const field of ['clinicalReviewDate', 'approvalDate']) {
      const invalidDate = structuredClone(approved);
      if (field === 'clinicalReviewDate') invalidDate[tool][field] = '2026-99-99';
      else invalidDate[tool].reviewers[0][field] = '2026-02-30';
      assert.throws(
        () => validateClinicalReleaseManifest(invalidDate),
        new RegExp(`${tool}.*${field}`, 'i')
      );
    }

    const inconsistentStatus = structuredClone(approved);
    inconsistentStatus[tool].status = 'Clinical review';
    assert.throws(
      () => validateClinicalReleaseManifest(inconsistentStatus),
      new RegExp(`${tool}.*status must be Available`, 'i')
    );
  }
});

test('build order separates review applications from unapproved production', async () => {
  const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  const core = ['build:portal', 'build:pig', 'build:rsi', 'build:pmd'];

  assert.deepEqual(getBuildWorkspaceScripts('production', manifest), core);
  assert.deepEqual(getBuildWorkspaceScripts('review', manifest), [
    ...core,
    'build:device',
    'build:sedation'
  ]);
  assert.throws(() => getBuildWorkspaceScripts('preview', manifest), /build mode/i);
});
