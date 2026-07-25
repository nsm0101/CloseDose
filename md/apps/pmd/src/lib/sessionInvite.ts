export const INVITE_TTL_MS = 12 * 60 * 60 * 1000;
export const SESSION_ID_LENGTH = 10;
export const SESSION_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const createSessionId = (): string => {
  const bytes = new Uint8Array(SESSION_ID_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => SESSION_ALPHABET[byte & 31]).join('');
};
