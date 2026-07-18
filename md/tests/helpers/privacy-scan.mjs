import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const sourceExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.json',
  '.mjs',
  '.ts',
  '.tsx'
]);

const privacyRules = [
  {
    category: 'browser transport',
    pattern:
      /\bfetch\s*\(|\b(?:new\s+)?XMLHttpRequest\b|\b(?:new\s+)?WebSocket\b|\b(?:new\s+)?EventSource\b|\b(?:navigator\s*\.\s*)?sendBeacon\s*\(|\baxios\s*\.|(?:from\s*|require\s*\(\s*)['"]axios["']/i
  },
  {
    category: 'browser persistence',
    pattern:
      /\b(?:window\s*\.\s*)?(?:localStorage|sessionStorage|indexedDB)\b|\b(?:document\s*\.\s*cookie|cookieStore|CookieStore)\b/i
  },
  {
    category: 'analytics API',
    pattern:
      /\b(?:gtag|ga|fbq|plausible|posthog|amplitude)\s*\(|\b(?:analytics|mixpanel|Sentry|posthog|amplitude)\s*\.\s*(?:init|track|identify|capture(?:Exception|Message)?|page|push|logEvent)\s*\(|\b(?:dataLayer|_paq)\s*\.\s*push\s*\(|(?:from\s*|require\s*\(\s*)['"](?:@sentry(?:\/[^'"]+)?|@vercel\/analytics|@segment\/analytics-next|mixpanel-browser|segment|amplitude-js|posthog-js|react-ga4?|firebase\/analytics)/i
  },
  {
    category: 'external URL or asset',
    pattern: /(?:https?:)?\/\/[A-Za-z0-9]/i
  },
  {
    category: 'environment or API key plumbing',
    pattern:
      /\bprocess\s*\.\s*env\b|\bimport\s*\.\s*meta\s*\.\s*env\b|\bDeno\s*\.\s*env\b|\bloadEnv\s*\(|\b(?:VITE|NEXT_PUBLIC|REACT_APP)_[A-Z0-9_]+\b|(?:^|[^A-Za-z0-9])(?:API|SECRET|ACCESS)[_-]?KEY(?:[^A-Za-z0-9]|$)/im
  },
  {
    category: 'patient identifier plumbing',
    pattern:
      /\b(?:patient[_-]?(?:name|id|identifier|email|phone|address)|first[_-]?name|last[_-]?name|date[_-]?of[_-]?birth|dob|mrn|medical[_-]?record(?:[_-]?(?:number|id))?)\b\s*(?::|=|\)|,|\])/i
  },
  {
    category: 'patient identifier field',
    pattern:
      /\b(?:id|name|autocomplete)\s*=\s*['"](?:patient[_-]?(?:name|id|identifier|email|phone|address)|first[_-]?name|last[_-]?name|date[_-]?of[_-]?birth|dob|mrn|medical[_-]?record(?:[_-]?(?:number|id))?)["']/i
  }
];

async function listSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return listSourceFiles(entryPath);
      return sourceExtensions.has(path.extname(entry.name)) ? [entryPath] : [];
    })
  );

  return nestedFiles.flat();
}

export function findPrivacyViolations(source, file = '<source>') {
  return privacyRules
    .filter(({ pattern }) => pattern.test(source))
    .map(({ category }) => ({ category, file }));
}

export async function scanApplicationPrivacy(applicationRoot) {
  const files = await listSourceFiles(applicationRoot);
  const violations = await Promise.all(
    files.map(async (file) =>
      findPrivacyViolations(await readFile(file, 'utf8'), path.relative(applicationRoot, file))
    )
  );

  return violations.flat();
}
