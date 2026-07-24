interface AuthorizedShiftSelection {
  authorizedShiftIds: string[];
  currentShiftId: string | null;
  savedShiftId: string | null;
  requestedLegacyShiftId: string | null;
}

export const selectAuthorizedShiftId = ({
  authorizedShiftIds,
  currentShiftId,
  savedShiftId,
  requestedLegacyShiftId
}: AuthorizedShiftSelection): string | null => {
  const authorized = new Set(authorizedShiftIds);
  if (requestedLegacyShiftId && authorized.has(requestedLegacyShiftId)) {
    return requestedLegacyShiftId;
  }
  if (currentShiftId && authorized.has(currentShiftId)) {
    return currentShiftId;
  }
  if (savedShiftId && authorized.has(savedShiftId)) {
    return savedShiftId;
  }
  return authorizedShiftIds[0] ?? null;
};

interface WorkspaceProfile {
  approved?: unknown;
  email?: unknown;
  role?: unknown;
}

export const isApprovedWorkspaceProfile = (
  profile: WorkspaceProfile | undefined,
  verifiedEmail: string
): boolean =>
  profile?.approved === true &&
  typeof profile.email === 'string' &&
  profile.email.toLowerCase() === verifiedEmail.trim().toLowerCase() &&
  (profile.role === 'admin' || profile.role === 'user');
