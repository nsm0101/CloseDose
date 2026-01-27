/**
 * OAuth Configuration for CloseDose
 * Handles Supabase OAuth2 flow with PKCE
 */

const OAUTH_CONFIG = {
  // These will be set from environment variables
  clientId: import.meta.env.VITE_OAUTH_CLIENT_ID || 'your_client_id_here',
  clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET || 'your_client_secret_here',
  redirectUri: `${window.location.origin}/oauth/callback`,
  authorizeUri: 'https://api.supabase.com/v1/oauth/authorize',
  tokenUri: 'https://api.supabase.com/v1/oauth/token',
  scope: 'all',
};

/**
 * Generate a random code verifier for PKCE flow
 */
export function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate code challenge from verifier (SHA256)
 */
export async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate state parameter for CSRF protection
 */
export function generateState() {
  return btoa(JSON.stringify({
    timestamp: Date.now(),
    nonce: crypto.randomUUID(),
    returnTo: window.location.pathname + window.location.search,
  }));
}

/**
 * Validate state parameter
 */
export function validateState(state) {
  try {
    const decoded = JSON.parse(atob(state));
    const age = Date.now() - decoded.timestamp;
    // State is valid for 10 minutes
    return age < 10 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * Build authorization URL
 */
export async function buildAuthorizationUrl() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Store verifier and state in sessionStorage (cleared when tab closes)
  sessionStorage.setItem('oauth_code_verifier', codeVerifier);
  sessionStorage.setItem('oauth_state', state);

  const url = new URL(OAUTH_CONFIG.authorizeUri);
  url.searchParams.set('client_id', OAUTH_CONFIG.clientId);
  url.searchParams.set('redirect_uri', OAUTH_CONFIG.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('scope', OAUTH_CONFIG.scope);

  return url.toString();
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForToken(code, state) {
  const codeVerifier = sessionStorage.getItem('oauth_code_verifier');
  const storedState = sessionStorage.getItem('oauth_state');

  if (!codeVerifier || !storedState) {
    throw new Error('OAuth session invalid. Please try again.');
  }

  if (!validateState(state) || state !== storedState) {
    throw new Error('Invalid state parameter. Possible CSRF attack.');
  }

  const response = await fetch('/api/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      codeVerifier,
      redirectUri: OAUTH_CONFIG.redirectUri,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to exchange code for token');
  }

  // Clear session data
  sessionStorage.removeItem('oauth_code_verifier');
  sessionStorage.removeItem('oauth_state');

  return data;
}

export default OAUTH_CONFIG;
