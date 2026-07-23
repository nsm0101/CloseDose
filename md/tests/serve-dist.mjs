import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const mdRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(mdRoot, 'dist');
const port = Number.parseInt(process.env.CLOSEDOSE_MD_PORT ?? '4173', 10);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2']
]);

function parseRedirects(source) {
  return new Map(
    source
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const [from, to, status] = line.split(/\s+/);
        return [from, { to, status: Number.parseInt(status, 10) }];
      })
  );
}

function parseHeaders(source) {
  const rules = [];
  let activeRule;

  for (const rawLine of source.split('\n')) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith('#')) continue;

    if (!/^\s/.test(rawLine)) {
      activeRule = { pattern: rawLine.trim(), headers: new Map() };
      rules.push(activeRule);
      continue;
    }

    const separator = rawLine.indexOf(':');
    activeRule.headers.set(
      rawLine.slice(0, separator).trim(),
      rawLine.slice(separator + 1).trim()
    );
  }

  return rules;
}

function matches(pattern, pathname) {
  if (pattern.endsWith('*')) return pathname.startsWith(pattern.slice(0, -1));
  return pattern === pathname;
}

async function resolveCaseSensitive(relativePath) {
  let currentPath = distRoot;

  for (const segment of relativePath.split('/').filter(Boolean)) {
    const entries = await readdir(currentPath);
    if (!entries.includes(segment)) throw new Error('path casing does not match');
    currentPath = path.join(currentPath, segment);
  }

  return currentPath;
}

const [redirects, headerRules] = await Promise.all([
  readFile(path.join(distRoot, '_redirects'), 'utf8').then(parseRedirects),
  readFile(path.join(distRoot, '_headers'), 'utf8').then(parseHeaders)
]);

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host}`);
  let pathname;

  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  const redirect = redirects.get(pathname);
  if (redirect) {
    response.writeHead(redirect.status, { Location: redirect.to }).end();
    return;
  }

  let relativePath = pathname.slice(1);
  if (!relativePath || pathname.endsWith('/')) relativePath += 'index.html';

  const resolvedRequestPath = path.resolve(distRoot, relativePath);
  let filePath;
  let statusCode = 200;

  if (!resolvedRequestPath.startsWith(`${distRoot}${path.sep}`)) {
    filePath = path.join(distRoot, '404.html');
    statusCode = 404;
  } else {
    try {
      filePath = await resolveCaseSensitive(relativePath);
      if (!(await stat(filePath)).isFile()) throw new Error('not a file');
    } catch {
      filePath = path.join(distRoot, '404.html');
      statusCode = 404;
    }
  }

  const headers = new Map();
  for (const rule of headerRules) {
    if (!matches(rule.pattern, pathname)) continue;
    for (const [name, value] of rule.headers) headers.set(name, value);
  }

  headers.set(
    'Content-Type',
    contentTypes.get(path.extname(filePath).toLowerCase()) ?? 'application/octet-stream'
  );

  const body = await readFile(filePath);
  headers.set('Content-Length', String(body.byteLength));
  response.writeHead(statusCode, Object.fromEntries(headers));
  response.end(request.method === 'HEAD' ? undefined : body);
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`CloseDose MD static server listening on http://127.0.0.1:${port}\n`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
