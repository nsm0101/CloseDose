# CloseDose MD

CloseDose MD is the assembled static provider platform for
`https://md.closedose.com/`. It builds independently from the parent-facing
`public/` site and does not read from or write to that deployment.

## Applications and routes

| Route | Workspace | Application |
| --- | --- | --- |
| `/` | `apps/portal` | CloseDose MD provider portal |
| `/PIG/` | `apps/pig` | Pediatric Airway Reference Calculator |
| `/RSI/` | `apps/rsi` | Pediatric Emergency RSI Reference and Calculator |
| `/PMD/` | `apps/pmd` | PREtendingMD PEM FlowMaster |

`/PIG`, `/RSI`, and `/PMD` redirect permanently to the trailing-slash routes.
Route casing is intentional; lowercase variants return the provider 404.

The production build writes one ignored `dist/` artifact containing all four
applications, Cloudflare Pages redirects and headers, and the static provider
404. Import provenance remains pinned in [sources.json](./sources.json).

## Release boundary

PIG and RSI remain local-only calculators with no patient-identifier fields,
persistence, analytics, AI runtime, API keys, backend, or unneeded network
transport. Their clinical sources remain byte-pinned to reviewed imports.
PREtendingMD is an authenticated workflow board and intentionally uses the
existing Firebase project for real-time shift data plus browser storage for
user preferences. Its migrated build removes the old analytics and unused AI
server scaffolding. Provider output is decision support and must be checked
against current institutional protocols.

## Local verification

Use Node 22 and run the same clean sequence as CI from this directory:

```sh
npm ci
npm run typecheck
npm run test:unit
npm run build
npm run test:contract
npx playwright install --with-deps chromium
npm run test:smoke
```

The smoke command starts the local case-sensitive static server by default.
For Pages preview, production smoke commands, approval gates, and rollback, see
[DEPLOYMENT.md](./DEPLOYMENT.md).
