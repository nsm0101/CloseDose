export const PMD_MIGRATION_VERSION = 'pmd-shift-membership-v1';
export const PMD_MIGRATION_BATCH_SIZE = 200;
export const PMD_PRIMARY_ADMIN_EMAIL = 'nickolas.mancini@gmail.com';

const validSessionId = (value) =>
  typeof value === 'string' && /^[A-Z0-9]{6,12}$/.test(value);

export const validatePmdPrimaryAdminProfile = (profile, adminUid) => {
  if (typeof adminUid !== 'string' || adminUid.trim().length < 1) {
    throw new Error('A non-empty administrator UID is required.');
  }
  if (
    !profile ||
    typeof profile.email !== 'string' ||
    profile.email.trim().toLowerCase() !== PMD_PRIMARY_ADMIN_EMAIL ||
    profile.role !== 'admin'
  ) {
    throw new Error(
      `User ${adminUid} is not the ${PMD_PRIMARY_ADMIN_EMAIL} administrator profile.`
    );
  }
};

export const validateCompletedManagedExport = ({
  operation,
  expectedProjectId,
  expectedDatabaseId,
  expectedOutputUri
}) => {
  const expectedPrefix =
    `projects/${expectedProjectId}/databases/${expectedDatabaseId}/operations/`;
  const outputUri =
    operation?.response?.outputUriPrefix ??
    operation?.metadata?.outputUriPrefix;
  const collectionIds = operation?.metadata?.collectionIds ?? [];
  const normalizedExpectedUri = expectedOutputUri?.replace(/\/+$/, '');
  const normalizedOutputUri =
    typeof outputUri === 'string' ? outputUri.replace(/\/+$/, '') : outputUri;

  if (
    operation?.done !== true ||
    operation?.error ||
    operation?.metadata?.operationState !== 'SUCCESSFUL' ||
    typeof operation?.name !== 'string' ||
    !operation.name.startsWith(expectedPrefix) ||
    !operation?.metadata?.endTime ||
    !Array.isArray(collectionIds) ||
    collectionIds.length > 0 ||
    typeof normalizedExpectedUri !== 'string' ||
    !normalizedExpectedUri.startsWith('gs://') ||
    normalizedOutputUri !== normalizedExpectedUri
  ) {
    throw new Error(
      'The managed export is not a completed full-database export for the expected PMD database and URI.'
    );
  }

  return normalizedOutputUri;
};

export const buildPmdMigrationPlan = ({
  shifts,
  invites,
  adminUid,
  expiresAt
}) => {
  if (typeof adminUid !== 'string' || adminUid.trim().length < 1) {
    throw new Error('A non-empty administrator UID is required.');
  }

  const inviteById = new Map(invites.map(invite => [invite.id, invite]));
  const sessionOwners = new Map();
  const errors = [];
  const records = [];

  for (const shift of shifts) {
    const data = shift.data;
    if (!shift.id || !data || typeof data !== 'object') {
      errors.push(`Shift ${shift.id || '<missing id>'} is not a valid document.`);
      continue;
    }
    if (!validSessionId(data.sessionId)) {
      errors.push(`Shift ${shift.id} has an invalid sessionId.`);
      continue;
    }

    const priorOwner = sessionOwners.get(data.sessionId);
    if (priorOwner && priorOwner !== shift.id) {
      errors.push(
        `Session ${data.sessionId} is duplicated by shifts ${priorOwner} and ${shift.id}.`
      );
      continue;
    }
    sessionOwners.set(data.sessionId, shift.id);

    if (Array.isArray(data.memberUids)) {
      if (data.memberUids.length < 1) {
        errors.push(`Shift ${shift.id} has an empty memberUids array.`);
      }
      continue;
    }
    if (
      typeof data.name !== 'string' ||
      typeof data.createdBy !== 'string' ||
      typeof data.isActive !== 'boolean' ||
      !data.startTime
    ) {
      errors.push(`Shift ${shift.id} is missing required legacy shift fields.`);
      continue;
    }

    const existingInvite = inviteById.get(data.sessionId);
    if (
      existingInvite &&
      existingInvite.data?.shiftId &&
      existingInvite.data.shiftId !== shift.id
    ) {
      errors.push(
        `Invite ${data.sessionId} points to ${existingInvite.data.shiftId}, not ${shift.id}.`
      );
      continue;
    }

    records.push({
      shiftId: shift.id,
      sessionId: data.sessionId,
      shiftUpdate: { memberUids: [adminUid] },
      invite: {
        shiftId: shift.id,
        createdBy: data.createdBy,
        createdAt: data.startTime,
        expiresAt,
        revoked: false
      }
    });
  }

  if (errors.length > 0) {
    throw new Error(`PMD migration preflight failed:\n- ${errors.join('\n- ')}`);
  }

  const batches = [];
  for (let index = 0; index < records.length; index += PMD_MIGRATION_BATCH_SIZE) {
    batches.push(records.slice(index, index + PMD_MIGRATION_BATCH_SIZE));
  }

  return {
    version: PMD_MIGRATION_VERSION,
    legacyShiftCount: records.length,
    securedShiftCount: shifts.length - records.length,
    records,
    batches
  };
};
