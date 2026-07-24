import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  buildPmdMigrationPlan,
  PMD_MIGRATION_BATCH_SIZE,
  PMD_MIGRATION_VERSION,
  validateCompletedManagedExport,
  validatePmdPrimaryAdminProfile
} from '../scripts/lib/pmd-migration-plan.mjs';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const legacyShift = (id, sessionId = 'ABC123') => ({
  id,
  data: {
    name: `Shift ${id}`,
    sessionId,
    startTime: { seconds: 1, nanoseconds: 0 },
    isActive: true,
    createdBy: `owner-${id}`
  }
});

test('PMD migration preserves legacy ownership and plans atomic shift-plus-invite writes', () => {
  const expiresAt = { seconds: 2, nanoseconds: 0 };
  const plan = buildPmdMigrationPlan({
    shifts: [
      legacyShift('legacy'),
      {
        ...legacyShift('secured', 'SEC123'),
        data: {
          ...legacyShift('secured', 'SEC123').data,
          memberUids: ['existing-member']
        }
      }
    ],
    invites: [],
    adminUid: 'primary-admin',
    expiresAt
  });

  assert.equal(plan.version, PMD_MIGRATION_VERSION);
  assert.equal(plan.legacyShiftCount, 1);
  assert.equal(plan.securedShiftCount, 1);
  assert.deepEqual(plan.records[0], {
    shiftId: 'legacy',
    sessionId: 'ABC123',
    shiftUpdate: { memberUids: ['primary-admin'] },
    invite: {
      shiftId: 'legacy',
      createdBy: 'owner-legacy',
      createdAt: { seconds: 1, nanoseconds: 0 },
      expiresAt,
      revoked: false
    }
  });
});

test('PMD migration rejects malformed and conflicting legacy records before writes', () => {
  assert.throws(
    () => buildPmdMigrationPlan({
      shifts: [
        legacyShift('first'),
        legacyShift('second'),
        legacyShift('invalid', 'not valid')
      ],
      invites: [{
        id: 'ABC123',
        data: { shiftId: 'different-shift' }
      }],
      adminUid: 'primary-admin',
      expiresAt: {}
    }),
    /preflight failed[\s\S]*Invite ABC123[\s\S]*duplicated[\s\S]*invalid sessionId/
  );
});

test('PMD migration chunks at 200 shifts to remain below Firestore batch limits', () => {
  const shifts = Array.from(
    { length: PMD_MIGRATION_BATCH_SIZE + 1 },
    (_, index) => legacyShift(
      `legacy-${index}`,
      index.toString(36).toUpperCase().padStart(6, '0')
    )
  );
  const plan = buildPmdMigrationPlan({
    shifts,
    invites: [],
    adminUid: 'primary-admin',
    expiresAt: {}
  });

  assert.equal(plan.batches.length, 2);
  assert.equal(plan.batches[0].length, PMD_MIGRATION_BATCH_SIZE);
  assert.equal(plan.batches[1].length, 1);
});

test('PMD migration verifies the exact primary administrator profile', () => {
  assert.doesNotThrow(() => validatePmdPrimaryAdminProfile(
    {
      email: 'Nickolas.Mancini@gmail.com',
      role: 'admin'
    },
    'verified-admin-uid'
  ));
  assert.throws(
    () => validatePmdPrimaryAdminProfile(
      {
        email: 'other@hospital.example',
        role: 'admin'
      },
      'mistyped-uid'
    ),
    /is not the nickolas\.mancini@gmail\.com administrator profile/
  );
});

test('PMD migration accepts only a completed full-database export at the exact URI', () => {
  const operation = {
    name: 'projects/project/databases/named/operations/export-123',
    done: true,
    metadata: {
      operationState: 'SUCCESSFUL',
      endTime: '2026-07-24T12:00:00Z',
      outputUriPrefix: 'gs://secure-backups/pmd/export-123',
      collectionIds: []
    },
    response: {
      outputUriPrefix: 'gs://secure-backups/pmd/export-123'
    }
  };

  assert.equal(
    validateCompletedManagedExport({
      operation,
      expectedProjectId: 'project',
      expectedDatabaseId: 'named',
      expectedOutputUri: 'gs://secure-backups/pmd/export-123/'
    }),
    'gs://secure-backups/pmd/export-123'
  );
  assert.throws(
    () => validateCompletedManagedExport({
      operation: {
        ...operation,
        done: false
      },
      expectedProjectId: 'project',
      expectedDatabaseId: 'named',
      expectedOutputUri: 'gs://secure-backups/pmd/export-123'
    }),
    /not a completed full-database export/
  );
  assert.throws(
    () => validateCompletedManagedExport({
      operation: {
        ...operation,
        metadata: {
          ...operation.metadata,
          collectionIds: ['shifts']
        }
      },
      expectedProjectId: 'project',
      expectedDatabaseId: 'named',
      expectedOutputUri: 'gs://secure-backups/pmd/export-123'
    }),
    /not a completed full-database export/
  );
});

test('PMD migration resolves export operations against the named database', async () => {
  const source = await readFile(
    path.join(mdRoot, 'scripts/migrate-pmd-legacy-shifts.mjs'),
    'utf8'
  );
  assert.match(source, /`--database=\$\{DATABASE_ID\}`/);
  assert.match(source, /validateCompletedManagedExport/);
});
