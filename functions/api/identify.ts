interface Env {
  GEMINI_API_KEY: string;
}

interface RequestBody {
  model: string;
  payload: unknown;
}

const ALLOWED_MODELS = new Set(['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']);
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestPost({
  request,
  env,
}: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return json({ error: 'Service unavailable' }, 503);
  }

  let body: RequestBody;
  try {
    body = await request.json();
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

  const upstream = await fetch(
    `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  const data = await upstream.json();
  return json(data, upstream.status);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
