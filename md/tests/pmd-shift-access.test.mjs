import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  isApprovedWorkspaceProfile,
  selectAuthorizedShiftId
} from '../apps/pmd/src/lib/authorizedShift.ts';
import {
  createSessionId,
  SESSION_ID_LENGTH
} from '../apps/pmd/src/lib/sessionInvite.ts';

test('authorized shift selection rejects stale state after account switching', () => {
  assert.equal(
    selectAuthorizedShiftId({
      authorizedShiftIds: ['second-account-shift'],
      currentShiftId: 'first-account-shift',
      savedShiftId: 'first-account-shift',
      requestedLegacyShiftId: null
    }),
    'second-account-shift'
  );
});

test('authorized shift selection clears a revoked shift when no access remains', () => {
  assert.equal(
    selectAuthorizedShiftId({
      authorizedShiftIds: [],
      currentShiftId: 'revoked-shift',
      savedShiftId: 'revoked-shift',
      requestedLegacyShiftId: null
    }),
    null
  );
});

test('legacy shift links select only an already-authorized shift', () => {
  assert.equal(
    selectAuthorizedShiftId({
      authorizedShiftIds: ['authorized-legacy', 'another-shift'],
      currentShiftId: null,
      savedShiftId: null,
      requestedLegacyShiftId: 'authorized-legacy'
    }),
    'authorized-legacy'
  );
  assert.equal(
    selectAuthorizedShiftId({
      authorizedShiftIds: ['another-shift'],
      currentShiftId: null,
      savedShiftId: null,
      requestedLegacyShiftId: 'unauthorized-legacy'
    }),
    'another-shift'
  );
});

test('new share codes fit the manual join contract and use the unambiguous alphabet', () => {
  const sessionId = createSessionId();
  assert.equal(sessionId.length, SESSION_ID_LENGTH);
  assert.match(sessionId, /^[A-HJ-NP-Z2-9]{10}$/);
});

test('workspace profile revalidation fails closed on revocation or identity mismatch', () => {
  assert.equal(
    isApprovedWorkspaceProfile(
      { approved: true, email: 'member@hospital.example', role: 'user' },
      'MEMBER@hospital.example'
    ),
    true
  );
  assert.equal(
    isApprovedWorkspaceProfile(
      { approved: false, email: 'member@hospital.example', role: 'user' },
      'member@hospital.example'
    ),
    false
  );
  assert.equal(
    isApprovedWorkspaceProfile(
      { approved: true, email: 'other@hospital.example', role: 'user' },
      'member@hospital.example'
    ),
    false
  );
});
