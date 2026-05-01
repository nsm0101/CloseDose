/**
 * Cloudflare Pages Function: /api/gemini
 *
 * Proxies requests to Google's Gemini API so the API key never reaches
 * the browser. Deploy to Cloudflare Pages and set the environment variable:
 *
 *   GEMINI_API_KEY = <your Google AI Studio key>
 *
 * The EnteralID page automatically uses this proxy when it is available
 * (detected via OPTIONS probe). On GitHub Pages (no CF function), the page
 * falls back to the user's session-stored key.
 *
 * Setup:
 *   1. Connect the CloseDose repo to Cloudflare Pages
 *   2. Add GEMINI_API_KEY in Settings → Environment variables
 *   3. Deploy — the proxy becomes active at https://closedose.com/api/gemini
 */

const ALLOWED_MODELS = new Set(['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']);
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://closedose.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  const apiKey = context.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json({ error: 'Server proxy not configured' }, 503);
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { model, payload } = body;
  if (!model || !ALLOWED_MODELS.has(model)) {
    return json({ error: 'Invalid or unsupported model' }, 400);
  }
  if (!payload) {
    return json({ error: 'Missing payload' }, 400);
  }

  const upstream = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await upstream.json();
  return json(data, upstream.status);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
