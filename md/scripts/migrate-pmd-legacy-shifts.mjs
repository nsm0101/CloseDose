import { writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

import { Firestore, Timestamp } from '@google-cloud/firestore';

import {
  buildPmdMigrationPlan,
  PMD_MIGRATION_VERSION,
  validateCompletedManagedExport,
  validatePmdPrimaryAdminProfile
} from './lib/pmd-migration-plan.mjs';

const PROJECT_ID = 'gen-lang-client-0217325418';
const DATABASE_ID = 'ai-studio-2f1b1ed6-35b2-4162-bac6-1fbc2d599b35';
const INVITE_TTL_MS = 12 * 60 * 60 * 1000;
const execFileAsync = promisify(execFile);

const args = new Map(
  process.argv.slice(2).map(argument => {
    const [key, ...value] = argument.replace(/^--/, '').split('=');
    return [key, value.join('=') || true];
  })
);

const apply = args.has('apply');
const adminUid = args.get('admin-uid');
const backupPath = args.get('backup');
const exportOperation = args.get('export-operation');
const exportUri = args.get('export-uri');
const confirmation = args.get('confirm');

if (typeof adminUid !== 'string') {
  throw new Error('Dry-run and apply both require --admin-uid=PRIMARY_ADMIN_UID.');
}

if (apply) {
  if (
    typeof backupPath !== 'string' ||
    typeof exportOperation !== 'string' ||
    typeof exportUri !== 'string' ||
    confirmation !== PMD_MIGRATION_VERSION
  ) {
    throw new Error(
      `Apply requires --admin-uid=UID --backup=/new/path.json ` +
      `--export-operation=OPERATION_ID --export-uri=gs://BUCKET/PREFIX ` +
      `--confirm=${PMD_MIGRATION_VERSION}.`
    );
  }
}

const db = new Firestore({
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID
});
const [shiftSnapshot, inviteSnapshot] = await Promise.all([
  db.collection('shifts').get(),
  db.collection('shiftInvites').get()
]);
const adminProfileSnapshot = await db.collection('users').doc(adminUid).get();
validatePmdPrimaryAdminProfile(
  adminProfileSnapshot.exists ? adminProfileSnapshot.data() : undefined,
  adminUid
);
const shifts = shiftSnapshot.docs.map(document => ({
  id: document.id,
  data: document.data()
}));
const invites = inviteSnapshot.docs.map(document => ({
  id: document.id,
  data: document.data()
}));
const expiresAt = Timestamp.fromMillis(Date.now() + INVITE_TTL_MS);
const plan = buildPmdMigrationPlan({
  shifts,
  invites,
  adminUid,
  expiresAt
});

console.log(
  JSON.stringify(
    {
      mode: apply ? 'apply' : 'dry-run',
      version: plan.version,
      projectId: PROJECT_ID,
      databaseId: DATABASE_ID,
      totalShifts: shifts.length,
      legacyShifts: plan.legacyShiftCount,
      securedShifts: plan.securedShiftCount,
      batches: plan.batches.length,
      shiftIds: plan.records.map(record => record.shiftId)
    },
    null,
    2
  )
);

if (!apply) {
  process.exit(0);
}

const { stdout: exportOperationJson } = await execFileAsync(
  'gcloud',
  [
    'firestore',
    'operations',
    'describe',
    exportOperation,
    `--project=${PROJECT_ID}`,
    `--database=${DATABASE_ID}`,
    '--format=json'
  ],
  { maxBuffer: 2 * 1024 * 1024 }
);
const verifiedExportUri = validateCompletedManagedExport({
  operation: JSON.parse(exportOperationJson),
  expectedProjectId: PROJECT_ID,
  expectedDatabaseId: DATABASE_ID,
  expectedOutputUri: exportUri
});

const backup = {
  version: PMD_MIGRATION_VERSION,
  createdAt: new Date().toISOString(),
  projectId: PROJECT_ID,
  databaseId: DATABASE_ID,
  managedExportOperation: exportOperation,
  managedExportUri: verifiedExportUri,
  shifts,
  invites
};
await writeFile(
  path.resolve(backupPath),
  `${JSON.stringify(backup, null, 2)}\n`,
  { encoding: 'utf8', flag: 'wx', mode: 0o600 }
);

for (const records of plan.batches) {
  const batch = db.batch();
  for (const record of records) {
    batch.update(db.collection('shifts').doc(record.shiftId), record.shiftUpdate);
    batch.set(
      db.collection('shiftInvites').doc(record.sessionId),
      record.invite
    );
  }
  await batch.commit();
}

console.log(`Applied ${plan.legacyShiftCount} legacy shift migrations.`);
