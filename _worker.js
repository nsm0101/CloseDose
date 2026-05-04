const ALLOWED_MODELS = new Set(['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']);
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== '/api/gemini') {
      return env.ASSETS.fetch(request);
    }

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: cors });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return json({ error: 'Service unavailable' }, 503, cors);
    }

    let body;
    try {
      body = await request.json();
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

    const upstream = await fetch(
      `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const data = await upstream.json();
    return json(data, upstream.status, cors);
  },
};

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}
