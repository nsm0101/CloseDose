# CloseDose MD static deployment

Deploy this workspace as a dedicated Cloudflare Pages project. Do not change
the existing Pages project or `public/` output that serves `closedose.com`.

| Setting | Value |
| --- | --- |
| Project name | `closedose-md` |
| Repository | `nsm0101/CloseDose` |
| Production branch | `main` |
| Root directory | `md` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `22` |
| Build watch include path | `md/*` |

The build removes only `md/dist/`, builds the portal first, then PIG and RSI,
and finally copies and validates the Cloudflare controls and provider 404.

## Security and caching

`static/_headers` applies one same-origin Content Security Policy to the whole
artifact. Scripts, fonts, images, connections, manifests, and workers are local
only. Inline scripts, external hosts, frames, objects, base overrides, and form
submissions are blocked.

The single exception is `style-src-attr 'unsafe-inline'`. The imported RSI
`ProgressionTracker` uses a React `style={{ width: ... }}` attribute for its
live timer progress width. `style-src 'self'` and `style-src-elem 'self'` still
block inline style elements. This exception must not expand to another
directive.

Canonical HTML, `404.html`, and the stable `/404.css` URL use
`public, max-age=0, must-revalidate`. Vite content-hashed assets under
`/assets/`, `/PIG/assets/`, and `/RSI/assets/` are immutable for one year.

## Local release gate

From `md/` on Node 22, run the exact CI sequence before publishing a preview:

```sh
npm ci
npm run typecheck
npm run test:unit
npm run build
npm run test:contract
npx playwright install --with-deps chromium
npm run test:smoke
```

The local smoke run uses `http://127.0.0.1:4173/` and starts
`tests/serve-dist.mjs`. That server resolves every file path case-sensitively,
including on macOS, so it matches the Pages route-casing contract.

## Pages preview gate

Publish the reviewed commit to the dedicated Pages project without attaching
the custom domain. Verify the production Pages hostname first:

```sh
curl -fsSIL https://closedose-md.pages.dev/
curl -fsSIL https://closedose-md.pages.dev/PIG/
curl -fsSIL https://closedose-md.pages.dev/RSI/
CLOSEDOSE_MD_BASE_URL=https://closedose-md.pages.dev npm run test:smoke
```

`CLOSEDOSE_MD_BASE_URL` must be an HTTP(S) site-root URL without credentials,
a query, or a fragment. When it is set, Playwright does not start the local
server. The same suite verifies redirects, lowercase 404 behavior, served
headers and cache controls, representative PIG and RSI interactions, and the
strict no-transmission runtime audit. Its negative probes use synthetic audit
values only.

Do not attach `md.closedose.com` until all of these gates are recorded on the
pull request:

- the exact commit passed the local Node 22 sequence and provider CI;
- the Pages smoke command passed against `closedose-md.pages.dev`;
- `/PIG` and `/RSI` redirect to the uppercase trailing-slash routes;
- `/pig`, `/pig/`, `/rsi`, and `/rsi/` return the provider 404;
- the browser console, page errors, request failures, unexpected requests, and
  unexpected popup audit are clean during normal flows;
- a named clinical owner approved the preview formulas, reference values,
  warnings, and representative outputs.

## Custom domain and production gate

In Cloudflare, open Workers & Pages, select `closedose-md`, add the custom
domain `md.closedose.com`, and allow the Pages flow to create or validate DNS.
Do not create only a manual CNAME without associating the hostname with the
Pages project.

After DNS and TLS become healthy, run:

```sh
dig +short md.closedose.com
curl -fsSIL https://md.closedose.com/
curl -fsSIL https://md.closedose.com/PIG/
curl -fsSIL https://md.closedose.com/RSI/
curl -sSI https://md.closedose.com/PIG | sed -n '1,8p'
curl -sSI https://md.closedose.com/RSI | sed -n '1,8p'
CLOSEDOSE_MD_BASE_URL=https://md.closedose.com npm run test:smoke
```

Production is accepted only when DNS resolves, TLS is valid, all three
canonical routes return a final HTTP 200, redirect/casing/header checks pass,
representative clinical interactions pass, and the normal-flow runtime audit
is clean.

## Rollback

If production verification fails, roll `closedose-md` back to its prior
successful Pages deployment. If no provider deployment is safe, remove only
`md.closedose.com` from the `closedose-md` custom domains. Do not alter the
existing `closedose.com` Pages project or its DNS records.
