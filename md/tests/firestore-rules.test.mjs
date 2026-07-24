import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { after, before, beforeEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectId = 'demo-closedose-md';
const primaryAdminEmail = 'nickolas.mancini@gmail.com';
const verifiedToken = (email) => ({
  email,
  email_verified: true,
  firebase: { sign_in_provider: 'google.com' }
});

let testEnv;

const userProfile = (email, approved = true, role = 'user') => ({
  email,
  displayName: '',
  approved,
  role,
  lastLogin: Timestamp.fromMillis(1_000)
});

const shiftRecord = (createdBy, memberUids) => ({
  name: 'Rules test shift',
  sessionId: 'ABC123',
  startTime: Timestamp.fromMillis(1_000),
  isActive: true,
  createdBy,
  memberUids
});

const inviteRecord = (shiftId, createdBy, revoked = false) => ({
  shiftId,
  createdBy,
  createdAt: Timestamp.fromMillis(1_000),
  expiresAt: Timestamp.fromMillis(Date.now() + 12 * 60 * 60 * 1000),
  revoked
});

const patientRecord = () => ({
  initials: 'TS',
  firstName: 'Test',
  lastInitial: 'S',
  age: '4',
  room: '12',
  status: 'Work-up',
  seenState: 'Seen by Fellow',
  lastAssessmentAt: Timestamp.fromMillis(1_000),
  createdAt: Timestamp.fromMillis(1_000),
  updatedAt: Timestamp.fromMillis(1_000)
});

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: await readFile(
        path.join(mdRoot, 'apps/pmd/firestore.rules'),
        'utf8'
      )
    }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(
        doc(db, 'users', 'member'),
        userProfile('member@hospital.example')
      ),
      setDoc(
        doc(db, 'users', 'outsider'),
        userProfile('outsider@hospital.example')
      ),
      setDoc(
        doc(db, 'users', 'pending'),
        userProfile('pending@hospital.example', false)
      ),
      setDoc(
        doc(db, 'shifts', 'shift-a'),
        shiftRecord('member', ['member'])
      ),
      setDoc(
        doc(db, 'shifts', 'legacy-shift'),
        {
          name: 'Legacy shift',
          sessionId: 'OLD123',
          startTime: Timestamp.fromMillis(1_000),
          isActive: true,
          createdBy: 'retired-anonymous-user'
        }
      ),
      setDoc(
        doc(db, 'shiftInvites', 'ABC123'),
        inviteRecord('shift-a', 'member')
      ),
      setDoc(
        doc(db, 'shifts', 'shift-a', 'patients', 'patient-a'),
        patientRecord()
      )
    ]);
  });
});

after(async () => {
  await testEnv?.cleanup();
});

test('anonymous, unverified, and unapproved identities cannot read shift data', async () => {
  const patientPath = ['shifts', 'shift-a', 'patients', 'patient-a'];
  const anonymous = testEnv.authenticatedContext('anonymous', {
    firebase: { sign_in_provider: 'anonymous' }
  });
  const unverified = testEnv.authenticatedContext(
    'unverified',
    {
      email: 'unverified@hospital.example',
      email_verified: false,
      firebase: { sign_in_provider: 'google.com' }
    }
  );
  const pending = testEnv.authenticatedContext(
    'pending',
    verifiedToken('pending@hospital.example')
  );

  await assertFails(
    getDoc(doc(testEnv.unauthenticatedContext().firestore(), ...patientPath))
  );
  await assertFails(getDoc(doc(anonymous.firestore(), ...patientPath)));
  await assertFails(getDoc(doc(unverified.firestore(), ...patientPath)));
  await assertFails(getDoc(doc(pending.firestore(), ...patientPath)));
  await assertFails(
    getDocs(
      query(
        collection(pending.firestore(), 'shifts'),
        where('memberUids', 'array-contains', 'pending')
      )
    )
  );
});

test('approved users can access only shifts where they are members', async () => {
  const member = testEnv.authenticatedContext(
    'member',
    verifiedToken('member@hospital.example')
  );
  const outsider = testEnv.authenticatedContext(
    'outsider',
    verifiedToken('outsider@hospital.example')
  );

  await assertSucceeds(
    getDoc(doc(member.firestore(), 'shifts', 'shift-a', 'patients', 'patient-a'))
  );
  await assertSucceeds(
    getDocs(
      query(
        collection(member.firestore(), 'shifts'),
        where('memberUids', 'array-contains', 'member')
      )
    )
  );
  await assertFails(getDocs(collection(member.firestore(), 'shifts')));
  await assertFails(
    getDoc(doc(outsider.firestore(), 'shifts', 'shift-a', 'patients', 'patient-a'))
  );
  await assertFails(
    getDoc(doc(outsider.firestore(), 'shifts', 'shift-a'))
  );
});

test('the primary administrator can secure and access a legacy shift', async () => {
  const admin = testEnv.authenticatedContext(
    'admin',
    verifiedToken(primaryAdminEmail)
  );

  await assertSucceeds(getDoc(doc(admin.firestore(), 'shifts', 'legacy-shift')));
  const batch = writeBatch(admin.firestore());
  batch.update(doc(admin.firestore(), 'shifts', 'legacy-shift'), {
    memberUids: ['admin']
  });
  batch.set(
    doc(admin.firestore(), 'shiftInvites', 'OLD123'),
    inviteRecord('legacy-shift', 'retired-anonymous-user')
  );
  await assertSucceeds(batch.commit());
  await assertSucceeds(
    getDoc(doc(admin.firestore(), 'shiftInvites', 'OLD123'))
  );
});

test('a verified user can request access but cannot self-approve', async () => {
  const applicant = testEnv.authenticatedContext(
    'applicant',
    verifiedToken('applicant@hospital.example')
  );

  await assertSucceeds(
    setDoc(
      doc(applicant.firestore(), 'users', 'applicant'),
      userProfile('applicant@hospital.example', false)
    )
  );
  await assertFails(
    updateDoc(doc(applicant.firestore(), 'users', 'applicant'), {
      approved: true
    })
  );
  await assertFails(
    setDoc(
      doc(applicant.firestore(), 'users', 'another-applicant'),
      userProfile('applicant@hospital.example', false)
    )
  );
});

test('session invites are get-only and add only the caller as a member', async () => {
  const outsider = testEnv.authenticatedContext(
    'outsider',
    verifiedToken('outsider@hospital.example')
  );
  const db = outsider.firestore();

  await assertSucceeds(getDoc(doc(db, 'shiftInvites', 'ABC123')));
  await assertFails(getDocs(collection(db, 'shiftInvites')));
  await assertSucceeds(
    updateDoc(doc(db, 'shifts', 'shift-a'), {
      memberUids: ['member', 'outsider']
    })
  );
  await assertFails(
    updateDoc(doc(db, 'shifts', 'shift-a'), {
      memberUids: ['member', 'different-user']
    })
  );

  const joinedShift = await getDoc(doc(db, 'shifts', 'shift-a'));
  assert.deepEqual(joinedShift.data().memberUids, ['member', 'outsider']);

  const admin = testEnv.authenticatedContext(
    'admin',
    verifiedToken(primaryAdminEmail)
  );
  const revokeBatch = writeBatch(admin.firestore());
  revokeBatch.update(doc(admin.firestore(), 'shifts', 'shift-a'), {
    memberUids: ['member']
  });
  revokeBatch.update(doc(admin.firestore(), 'shiftInvites', 'ABC123'), {
    revoked: true
  });
  await assertSucceeds(revokeBatch.commit());
  await assertFails(
    updateDoc(doc(db, 'shifts', 'shift-a'), {
      memberUids: ['member', 'outsider']
    })
  );

  await assertSucceeds(
    updateDoc(doc(admin.firestore(), 'shiftInvites', 'ABC123'), {
      revoked: false,
      expiresAt: Timestamp.fromMillis(Date.now() - 1_000)
    })
  );
  await assertFails(
    updateDoc(doc(db, 'shifts', 'shift-a'), {
      memberUids: ['member', 'outsider']
    })
  );
});

test('new invite creation cannot exceed the 12-hour sharing window', async () => {
  const member = testEnv.authenticatedContext(
    'member',
    verifiedToken('member@hospital.example')
  );
  const db = member.firestore();
  const createdAt = Timestamp.now();

  const validBatch = writeBatch(db);
  validBatch.set(
    doc(db, 'shifts', 'new-shift'),
    {
      ...shiftRecord('member', ['member']),
      sessionId: 'VALID23456',
      startTime: createdAt
    }
  );
  validBatch.set(
    doc(db, 'shiftInvites', 'VALID23456'),
    {
      shiftId: 'new-shift',
      createdBy: 'member',
      createdAt,
      expiresAt: Timestamp.fromMillis(
        createdAt.toMillis() + 12 * 60 * 60 * 1000
      ),
      revoked: false
    }
  );
  await assertSucceeds(validBatch.commit());

  const tooLongBatch = writeBatch(db);
  tooLongBatch.set(
    doc(db, 'shifts', 'too-long-shift'),
    {
      ...shiftRecord('member', ['member']),
      sessionId: 'LONGER2345',
      startTime: createdAt
    }
  );
  tooLongBatch.set(
    doc(db, 'shiftInvites', 'LONGER2345'),
    {
      shiftId: 'too-long-shift',
      createdBy: 'member',
      createdAt,
      expiresAt: Timestamp.fromMillis(
        createdAt.toMillis() + 13 * 60 * 60 * 1000
      ),
      revoked: false
    }
  );
  await assertFails(tooLongBatch.commit());
});

test('a removed creator cannot delete a shift or its invite', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(
      doc(db, 'shifts', 'revoked-creator-shift'),
      {
        ...shiftRecord('outsider', ['member']),
        sessionId: 'REVOKE1'
      }
    );
    await setDoc(
      doc(db, 'shiftInvites', 'REVOKE1'),
      inviteRecord('revoked-creator-shift', 'outsider', true)
    );
  });

  const outsider = testEnv.authenticatedContext(
    'outsider',
    verifiedToken('outsider@hospital.example')
  );
  await assertFails(
    deleteDoc(doc(outsider.firestore(), 'shifts', 'revoked-creator-shift'))
  );
  await assertFails(
    deleteDoc(doc(outsider.firestore(), 'shiftInvites', 'REVOKE1'))
  );
});
