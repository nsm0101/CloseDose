/**
 * Cloudflare Pages Function: /api/gemini
 *
 * Proxies requests to Google's Gemini API so the API key never reaches
 * the browser. Set the environment variable GEMINI_API_KEY in Cloudflare
 * Pages → Settings → Environment variables.
 */

const ALLOWED_MODELS = new Set(['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']);
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const ALLOWED_ORIGINS = new Set([
  'https://closedose.com',
  'https://www.closedose.com',
  'http://localhost',
  'http://127.0.0.1',
]);

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : 'https://closedose.com';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export async function onRequestOptions(context) {
  const origin = context.request.headers.get('Origin') || '';
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function onRequestPost(context) {
  const origin = context.request.headers.get('Origin') || '';
  const cors   = corsHeaders(origin);

  const apiKey = context.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json({ error: 'Service unavailable' }, 503, cors);
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, cors);
  }

  const { model, payload } = body;
  if (!model || !ALLOWED_MODELS.has(model)) {
    return json({ error: 'Invalid or unsupported model' }, 400, cors);
  }
  if (!payload) {
    return json({ error: 'Missing payload' }, 400, cors);
  }

  const upstream = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await upstream.json();
  return json(data, upstream.status, cors);
}

function json(data, status = 200, cors = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
