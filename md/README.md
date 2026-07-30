# CloseDose MD

CloseDose MD is the assembled static provider platform for
`https://md.closedose.com/`. It builds independently from the parent-facing
`public/` site and does not read from or write to that deployment.

## Applications and routes

| Route | Workspace | Application |
| --- | --- | --- |
| `/` | `apps/portal` | CloseDose MD provider portal |
| `/PIG/` | `apps/pig` | Pediatric Airway Reference Calculator |
| `/RSI/` | `apps/rsi` | Pediatric RSI Medication Calculator |
| `/AIRWAY-SCENARIOS/` | `apps/airway-scenarios` | Pediatric Airway Scenario Guide |
| `/POST-INTUBATION/` | `apps/post-intubation` | Post-Intubation Sedation Reference |
| `/RSI-TIMELINE/` | `apps/rsi-timeline` | RSI Progression Timeline |
| `/AIRWAY-TRANSPORT/` | `apps/airway-transport` | Pediatric Airway Transport Kit |
| `/PMD/` | `apps/pmd` | PREtendingMD PEM FlowMaster |
| `/DEVICE/` | `apps/device` | Peds Device Rescue review application |
| `/SEDATION/` | `apps/sedation` | Pediatric Comfort and Sedation review application |

Every available no-slash application route redirects permanently to its uppercase trailing-slash route, including `/RSI`, `/AIRWAY-SCENARIOS`, `/POST-INTUBATION`, `/RSI-TIMELINE`, and `/AIRWAY-TRANSPORT`.
Route casing is intentional; lowercase variants return the provider 404.

The production build writes one ignored `dist/` artifact containing the portal,
PIG, all five RSI tools, PMD, Cloudflare Pages controls, and the static provider 404. Device
and Sedation are built into that artifact only when
[clinical-release-manifest.json](./clinical-release-manifest.json) records every
required named approval. `npm run build:review` includes both review applications
for local clinical review without changing their public release state. Import
provenance remains pinned in [sources.json](./sources.json).

The catalog also reserves `/TRANSFER/`, `/AGITATION/`, `/NEWBORN/`, `/CHD/`,
`/INGESTION/`, and `/CLOCK/`. These planned routes have specifications but no
served clinical application.

## Release boundary

PIG, RSI, Device, and Sedation remain local-only tools with no patient-identifier fields,
persistence, analytics, AI runtime, API keys, backend, or unneeded network
transport. Their clinical sources remain byte-pinned to reviewed imports.
PREtendingMD is restricted to verified, administrator-approved identities.
Within that workspace, access to patient and operational data is further
limited to shift members. PREtendingMD intentionally persists patient first
name and last initial, room, complaint, workflow notes, vitals, provider
contact details, labs, imaging, and shift-team data in the existing Firebase
project; browser storage holds user preferences. Its migrated build removes
the old analytics and unused AI server scaffolding. Provider output is
decision support and must be checked against current institutional protocols.

## Local verification

Use Node 22 and run the same clean sequence as CI from this directory:

```sh
npm ci
npx playwright install --with-deps chromium
npm run typecheck
npm run test:unit
npm run test:rules
npm run build:review
npm run build
npm run test:contract
npm run test:smoke
```

The smoke command starts the local case-sensitive static server by default.
For Pages preview, production smoke commands, approval gates, and rollback, see
[DEPLOYMENT.md](./DEPLOYMENT.md).
