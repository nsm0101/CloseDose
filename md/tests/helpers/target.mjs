export const DEFAULT_CLOSEDOSE_MD_BASE_URL = 'http://127.0.0.1:4173/';

export function resolveCloseDoseMdTarget(
  rawBaseUrl = process.env.CLOSEDOSE_MD_BASE_URL
) {
  const external = typeof rawBaseUrl === 'string' && rawBaseUrl.trim().length > 0;
  const url = new URL(external ? rawBaseUrl.trim() : DEFAULT_CLOSEDOSE_MD_BASE_URL);

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('CLOSEDOSE_MD_BASE_URL must use http or https');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('CLOSEDOSE_MD_BASE_URL must not contain credentials, a query, or a fragment');
  }
  if (url.pathname !== '/') {
    throw new Error('CLOSEDOSE_MD_BASE_URL must point to the site root');
  }

  return Object.freeze({
    baseURL: url.href,
    expectedOrigin: url.origin,
    external
  });
}
