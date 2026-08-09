# CloseDose MD

CloseDose MD is the assembled static provider platform for
`https://md.closedose.com/`. It builds independently from the parent-facing
`public/` site and does not read from or write to that deployment.

## Applications and routes

<!-- generated:route-table start -->
| Route | Workspace | Application |
| --- | --- | --- |
| `/` | `apps/portal` | CloseDose MD provider portal |
| `/PIG/` | `apps/pig` | Pediatric Airway Reference Calculator |
| `/RSI/` | `apps/rsi` | Pediatric RSI Medication Calculator |
| `/AIRWAY-SCENARIOS/` | `apps/airway-scenarios` | Pediatric Airway Scenario Guide |
| `/POST-INTUBATION/` | `apps/post-intubation` | Post-Intubation Sedation Reference |
| `/RSI-TIMELINE/` | `apps/rsi-timeline` | RSI Progression Timeline |
| `/AIRWAY-TRANSPORT/` | `apps/airway-transport` | Pediatric Airway Transport Kit |
| `/PMD/` | `apps/pmd` | PREtendingMD: PEM FlowMaster |
| `/DEVICE/` | `apps/device` | Peds Device Rescue |
| `/SEDATION/` | `apps/sedation` | Pediatric Comfort and Sedation Console |
<!-- generated:route-table end -->

This table is generated from [tools.registry.json](./tools.registry.json). See
[Adding a tool](#adding-a-tool).

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

## Adding a tool

[tools.registry.json](./tools.registry.json) is the single source of truth for
the provider hub. The npm workspace list and build/typecheck/test scripts, the
portal tool catalog, `static/_redirects`, the route table above, and the
governance table in [docs/provider-tools](../docs/provider-tools/README.md) are
all generated from it. `npm run sync:tools:check` runs in `test:unit` and fails
the build if any of them drifts, so a half-added tool cannot ship.

1. **Write the specifications first.** Create
   `docs/provider-tools/<id>/clinical.md` and `implementation.md`. A planned
   tool without both fails `tests/tool-registry.test.mjs`.
2. **Add one registry entry.** Give it an `id`, an uppercase `route` ending in
   a slash, `shortTitle`, `title`, `task`, a `category` from `categoryOrder`,
   an `audience`, and `evidenceVersion`. Start it as
   `"release": { "kind": "planned" }` while it is still a roadmap entry.
3. **Promote it when you start building.** Set `workspace`, `packageName`, and
   change `release` to `{"kind": "gated", "manifestKey": "<id>",
   "approvalRoles": [...]}` plus `"modeAwareBuild": true`. Gated tools are
   excluded from production builds until [clinical-release-manifest.json](./clinical-release-manifest.json)
   records every listed approval role.
4. **Scaffold it.** `npm run new:tool -- <id>` writes the Vite/React workspace,
   seeds a withheld release record, and re-runs `sync:tools`. Then
   `npm install` to link the workspace.
5. **Implement, verify, release.** Replace the placeholder `src/App.tsx`, run
   `npm run typecheck && npm run test:unit`, and only mark
   `publicReleaseApproved: true` once the named reviewers are recorded.

Only a tool whose clinical content is genuinely reviewed should ever reach
`{"kind": "available"}`, which bypasses the manifest gate entirely. Existing
`available` tools are byte-pinned imports recorded in [sources.json](./sources.json).

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
