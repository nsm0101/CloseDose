# CloseDose MD Provider Suite Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a polished CloseDose MD provider hub, integrate the reviewed roadmap work safely, and replace the monolithic RSI tab interface with five standalone clinical tools on canonical URLs.

**Architecture:** Preserve the current Cloudflare Pages platform, PMD Firebase boundary, PIG behavior, and pinned RSI clinical content. Move the existing RSI clinical components and data byte-for-byte into one internal reference package, then render each workflow through a small standalone Vite application. A checked-in release manifest keeps Device Rescue and Pediatric Comfort and Sedation out of the production artifact until the required named approvals are recorded, while a separate review build keeps both applications fully testable.

**Tech Stack:** Node 22, npm workspaces, React 19, TypeScript 5.8, Vite 6, Tailwind 4 where already used, Lucide React where already used, native CSS tokens, Node test runner, Playwright, Cloudflare Pages, GitHub Actions.

## Global Constraints

- Preserve `/PIG/`, `/RSI/`, and `/PMD/` as exact uppercase canonical routes with trailing slashes.
- Add `/AIRWAY-SCENARIOS/`, `/POST-INTUBATION/`, `/RSI-TIMELINE/`, and `/AIRWAY-TRANSPORT/` as exact uppercase canonical routes with trailing slashes.
- `/RSI/` becomes the standalone Pediatric RSI Medication Calculator and remains the backward-compatible RSI entry route.
- Existing RSI medication values, scenario statements, post-intubation content, timer defaults, transport content, warnings, and source data move byte-for-byte and remain `Available`.
- Device Rescue and Pediatric Comfort and Sedation remain exactly `Clinical review` until the checked-in release manifest contains named PEM, specialty, pediatric-pharmacy where dose-containing, institutional, and regulatory approvals.
- Production `npm run build` must omit unapproved clinical-review route documents. `npm run build:review` must build them for local and preview verification with an unmistakable not-approved status.
- Never invent a reviewer, approval date, evidence version, clinical-review date, or institutional authorization.
- PMD remains the existing authenticated Firebase exception. All other tools remain identifier-free, client-only, local-memory-only, and free of analytics, accounts, AI runtime, external runtime calls, storage, cookies, environment keys, or cross-tool patient state.
- The five RSI tools may share source code and design tokens but may not share browser state. Each opens with a fresh local context.
- Use one CloseDose teal accent, Public Sans where already present, soft 12-16 px surfaces with 8 px inputs, automatic light/dark parity, visible focus, reduced-motion behavior, and phone-first layouts.
- The hub is a compact semantic catalog with search and audience/status filters, not a generic equal-card wall.
- Do not add en dashes or em dashes in new interface copy. Existing hash-pinned RSI clinical ranges retain their reviewed punctuation byte-for-byte until a clinical content review authorizes a change.
- Do not add a new third-party runtime dependency.
- The production artifact keeps the current strict CSP, exact request allowlist, cache controls, case-sensitive 404 behavior, and PMD-specific Firebase exceptions.
- No production claim is valid until local, Pages-hostname, and custom-domain browser gates pass for the exact merged commit.

---

### Task 1: Finish roadmap integration on the current production baseline

**Files:**
- Modify: `md/package.json`
- Modify: `md/package-lock.json`
- Modify: `md/scripts/build.mjs`
- Create: `md/clinical-release-manifest.json`
- Modify: `md/apps/portal/src/toolCatalog.ts`
- Modify: `md/static/_redirects`
- Modify: `md/static/_headers`
- Modify: `md/static/404.html`
- Modify: `md/tests/workspace-contract.test.mjs`
- Modify: `md/tests/distribution-contract.test.mjs`
- Modify: `md/tests/privacy-scanner.test.mjs`
- Modify: `md/tests/release-hardening.test.mjs`
- Modify: `md/README.md`
- Modify: `md/DEPLOYMENT.md`
- Modify: `docs/architecture/closedose-md-provider-platform.md`
- Create: `docs/provider-tools/README.md`
- Create: `docs/provider-tools/transfer/clinical.md`
- Create: `docs/provider-tools/transfer/implementation.md`
- Create: `docs/provider-tools/agitation/clinical.md`
- Create: `docs/provider-tools/agitation/implementation.md`
- Create: `docs/provider-tools/newborn/clinical.md`
- Create: `docs/provider-tools/newborn/implementation.md`
- Create: `docs/provider-tools/chd/clinical.md`
- Create: `docs/provider-tools/chd/implementation.md`
- Create: `docs/provider-tools/ingestion/clinical.md`
- Create: `docs/provider-tools/ingestion/implementation.md`
- Create: `docs/provider-tools/clock/clinical.md`
- Create: `docs/provider-tools/clock/implementation.md`

**Interfaces:**
- Consumes: the completed Device and Sedation review applications, current PMD production workspace, and `ClinicalReleaseManifest` approval records.
- Produces: `readClinicalReleaseManifest()`, production-safe and review build modes, all eight roadmap specifications, and a catalog that distinguishes public availability from clinical-review state.

- [ ] **Step 1: Write failing release-manifest and integration tests**

Require this exact manifest shape and initial state:

```json
{
  "schemaVersion": 1,
  "device": {
    "status": "Clinical review",
    "publicReleaseApproved": false,
    "clinicalReviewDate": null,
    "reviewers": []
  },
  "sedation": {
    "status": "Clinical review",
    "publicReleaseApproved": false,
    "clinicalReviewDate": null,
    "reviewers": []
  }
}
```

Tests must reject `publicReleaseApproved: true` unless every required role has a non-empty name, role, approval date, and scope. Production distribution tests must assert that unapproved `/DEVICE/` and `/SEDATION/` documents are absent, while review distribution tests assert that both are present and visibly not approved.

- [ ] **Step 2: Run the focused tests and confirm the red state**

Run:

```sh
node --test tests/workspace-contract.test.mjs tests/distribution-contract.test.mjs tests/release-hardening.test.mjs
```

Expected: failures because the manifest, dual build modes, and new workspaces are not integrated.

- [ ] **Step 3: Integrate the review apps without weakening PMD**

Add Device and Sedation workspaces and focused scripts. Refactor `scripts/build.mjs` to accept an explicit checked-in mode through separate npm scripts, never a runtime environment variable:

```json
{
  "build": "node scripts/build.mjs production",
  "build:review": "node scripts/build.mjs review"
}
```

Both modes build the portal, PIG, RSI, and PMD. Review mode also builds Device and Sedation. Production mode builds either review app only when its manifest record satisfies every release requirement.

- [ ] **Step 4: Add the six planned specification pairs**

Each clinical specification records target population, explicit non-goals, source baseline, clinical-risk questions, required specialty and pharmacy reviewers, regulatory implications, and simulated acceptance cases. Each implementation specification records its reserved route, identifier-free inputs, deterministic-output boundary, client-only state, phone interaction target, test categories, and release gates. Do not include unreviewed medication formulas or time-critical treatment directives.

- [ ] **Step 5: Verify and commit**

Run:

```sh
node --test tests/device.test.mjs tests/sedation.test.mjs tests/workspace-contract.test.mjs tests/privacy-scanner.test.mjs tests/release-hardening.test.mjs
npm run typecheck --prefix apps/device
npm run typecheck --prefix apps/sedation
npm run build:review
npm run build
npm run test:contract
```

Commit message: `feat(md): integrate provider roadmap release gates`

---

### Task 2: Split RSI into five standalone tools

**Files:**
- Create: `md/packages/rsi-reference/package.json`
- Create: `md/packages/rsi-reference/tsconfig.json`
- Create: `md/packages/rsi-reference/src/index.ts`
- Create: `md/packages/rsi-reference/src/StandaloneToolShell.tsx`
- Create: `md/packages/rsi-reference/src/WeightControl.tsx`
- Create: `md/packages/rsi-reference/src/reference.css`
- Move: `md/apps/rsi/src/components/DosingCalculator.tsx` to `md/packages/rsi-reference/src/components/DosingCalculator.tsx`
- Move: `md/apps/rsi/src/components/ScenarioGuide.tsx` to `md/packages/rsi-reference/src/components/ScenarioGuide.tsx`
- Move: `md/apps/rsi/src/components/SedationReference.tsx` to `md/packages/rsi-reference/src/components/SedationReference.tsx`
- Move: `md/apps/rsi/src/components/ProgressionTracker.tsx` to `md/packages/rsi-reference/src/components/ProgressionTracker.tsx`
- Move: `md/apps/rsi/src/components/TransportKit.tsx` to `md/packages/rsi-reference/src/components/TransportKit.tsx`
- Move: `md/apps/rsi/src/data/rsiData.ts` to `md/packages/rsi-reference/src/data/rsiData.ts`
- Move: `md/apps/rsi/src/types.ts` to `md/packages/rsi-reference/src/types.ts`
- Modify: `md/apps/rsi/src/App.tsx`
- Modify: `md/apps/rsi/src/index.css`
- Create: `md/apps/airway-scenarios/`
- Create: `md/apps/post-intubation/`
- Create: `md/apps/rsi-timeline/`
- Create: `md/apps/airway-transport/`
- Modify: `md/package.json`
- Modify: `md/package-lock.json`
- Modify: `md/scripts/build.mjs`
- Modify: `md/static/_redirects`
- Modify: `md/static/_headers`
- Modify: `md/tests/rsi.test.mjs`
- Modify: `md/tests/workspace-contract.test.mjs`
- Modify: `md/tests/distribution-contract.test.mjs`
- Modify: `md/tests/privacy-scanner.test.mjs`
- Modify: `md/tests/smoke/platform.spec.mjs`

**Interfaces:**
- Consumes: the currently pinned RSI clinical files and existing `/RSI/` behavior.
- Produces: `@closedose-md/rsi-reference` plus five independent documents at `/RSI/`, `/AIRWAY-SCENARIOS/`, `/POST-INTUBATION/`, `/RSI-TIMELINE/`, and `/AIRWAY-TRANSPORT/`.

- [ ] **Step 1: Extend characterization tests before moving source**

Pin SHA-256 hashes for every clinical component, `rsiData.ts`, and `types.ts`. Add tests that prove each future route renders exactly one workflow, has no tab controller, starts with independent local state, exposes a provider-hub return link, and never requests an identifier or external runtime.

- [ ] **Step 2: Run the new tests and confirm the red state**

Run:

```sh
node --test tests/rsi.test.mjs tests/workspace-contract.test.mjs
```

Expected: failures for missing shared package and route workspaces.

- [ ] **Step 3: Move clinical content byte-for-byte**

Move the seven pinned clinical files without editing their contents. Update only import resolution through `src/index.ts`. Preserve hash assertions against their new paths so a route split cannot silently alter clinical recommendations.

- [ ] **Step 4: Build a consistent standalone tool shell**

Use this exact metadata contract:

```ts
export interface RsiStandaloneTool {
  id: 'rsi-medications' | 'airway-scenarios' | 'post-intubation' | 'rsi-timeline' | 'airway-transport';
  route: '/RSI/' | '/AIRWAY-SCENARIOS/' | '/POST-INTUBATION/' | '/RSI-TIMELINE/' | '/AIRWAY-TRANSPORT/';
  title: string;
  purpose: string;
  requiresWeight: boolean;
}
```

`StandaloneToolShell` supplies the CloseDose MD header, title, one-sentence purpose, current-weight context where needed, local reset action, evidence boundary, protocol-verification note, and hub return link. It must not introduce cross-route state or automatic age inference beyond the existing calculator behavior.

- [ ] **Step 5: Build each canonical document**

`/RSI/` renders only `DosingCalculator`; `/AIRWAY-SCENARIOS/` renders only `ScenarioGuide`; `/POST-INTUBATION/` renders only `SedationReference`; `/RSI-TIMELINE/` renders only `ProgressionTracker`; `/AIRWAY-TRANSPORT/` renders only `TransportKit`. Add 301 redirects from each no-slash form and 404 responses for every lowercase form.

- [ ] **Step 6: Verify and commit**

Run:

```sh
npm run typecheck
node --test tests/rsi.test.mjs tests/workspace-contract.test.mjs tests/privacy-scanner.test.mjs
npm run build
npm run test:contract
npm run test:smoke
```

Commit message: `feat(md): split RSI into standalone tools`

---

### Task 3: Create the polished provider suite hub

**Files:**
- Modify: `md/apps/portal/src/toolCatalog.ts`
- Modify: `md/apps/portal/src/App.tsx`
- Modify: `md/apps/portal/src/index.css`
- Modify: `md/apps/portal/src/assets/` only if an existing optimized asset needs a new size
- Modify: `md/tests/portal.test.mjs`
- Modify: `md/tests/smoke/platform.spec.mjs`
- Modify: `md/static/404.html`
- Modify: `md/static/404.css`

**Interfaces:**
- Consumes: all public RSI routes, PIG, PMD, clinical-release manifest state, and six reserved roadmap routes.
- Produces: a typed fifteen-entry catalog, audience/status filtering, categorized tool discovery, direct available-tool links, and accurate unavailable states.

- [ ] **Step 1: Write failing catalog and interaction tests**

Require fifteen catalog entries: PIG, five standalone RSI tools, PMD, Device Rescue, Pediatric Comfort and Sedation, and six planned modules. Every entry must expose `audience`, `category`, `evidenceVersion`, `clinicalReviewDate`, `status`, `canonicalRoute`, `publiclyAccessible`, and a plain-language `task`. Tests must require these labels:

```ts
const actionLabels = {
  Available: 'Open tool',
  'Clinical review': 'Awaiting approval',
  Planned: 'Planned module'
} as const;
```

Available entries are links. Clinical-review entries are links only when `publiclyAccessible` is true. Planned entries are never links.

- [ ] **Step 2: Run portal tests and confirm the red state**

Run:

```sh
node --test tests/portal.test.mjs
```

Expected: failures because the catalog and hub do not expose the new schema or interactions.

- [ ] **Step 3: Implement the bedside catalog experience**

Keep the existing asymmetric hero and optimized clinical preparation image. Place the search and filters immediately before the catalog. Use a labeled search field plus `All clinicians`, `Community EM`, and `PEM` audience filters and `Available`, `Clinical review`, and `Planned` status filters. Group visible results by `Airway and RSI`, `Procedures and comfort`, `Transfer and workflow`, and `Specialty emergencies`. Provide a clear empty state and a one-action reset.

- [ ] **Step 4: Apply one responsive design system**

Use semantic CSS variables for light and dark modes, one teal accent, 12-16 px content surfaces, 8 px fields, minimum 44 px targets, high-contrast focus rings, no automatic animation, and no horizontal overflow at 320 px. Keep the hero action and first available tool visible within the initial phone viewport. Re-read every visible string and remove decorative version labels, fake status indicators, duplicate actions, en dashes, and em dashes.

- [ ] **Step 5: Add visual and behavioral acceptance coverage**

Playwright must verify light and dark modes at 320x800, 768x1024, and 1440x900; no horizontal overflow; filters and reset; direct navigation to every public tool; disabled review/planned states; keyboard focus order; and zero browser-console, page, request, or popup violations.

- [ ] **Step 6: Verify and commit**

Run:

```sh
npm run typecheck:portal
node --test tests/portal.test.mjs
npm run build
npm run test:contract
npm run test:smoke
```

Commit message: `feat(md): create provider suite hub`

---

### Task 4: Harden, review, merge, deploy, and verify production

**Files:**
- Modify: `md/README.md`
- Modify: `md/DEPLOYMENT.md`
- Modify: `docs/architecture/closedose-md-provider-platform.md`
- Modify: `.github/workflows/closedose-md.yml` only if route coverage requires it
- Modify: test or source files only to resolve review or release findings

**Interfaces:**
- Consumes: the complete provider-suite branch and production release manifest.
- Produces: one reviewed GitHub pull request, one merged main commit, one successful Cloudflare Pages deployment, and production verification evidence.

- [ ] **Step 1: Run the complete clean release sequence**

Run from `md/` on Node 22:

```sh
npm ci
npm run typecheck
npm run test:unit
npm run test:rules
npm run build:review
npm run build
npm run test:contract
npx playwright install chromium
npm run test:smoke
```

Also run `git diff --check` and source scans for en/em dashes, external URLs, identifiers, storage, analytics, AI plumbing, environment keys, and unapproved external transport.

- [ ] **Step 2: Obtain independent whole-branch review**

Generate a review package from the merge base through `HEAD`. Resolve every Critical and Important finding in one fix wave, re-review, and rerun every affected test. Record remaining Minor findings in the progress ledger.

- [ ] **Step 3: Complete browser UI and timing acceptance**

In a real browser, verify the hub and every public tool at phone and desktop widths in light and dark modes. Confirm each available tool is reachable from the hub in one interaction, RSI tools expose only their assigned workflow, Device urgent action remains reachable in one interaction in the review build, and no review/planned module appears available.

- [ ] **Step 4: Publish through GitHub**

Confirm a clean intended diff, push `codex/md-provider-tool-roadmap`, open a ready pull request against `main`, wait for required checks, merge only after the exact head passes, and verify the Cloudflare Pages production deployment for the merged commit.

- [ ] **Step 5: Verify both production hostnames**

Run redirect, case, header, cache, asset, and browser-smoke checks against `https://closedose-md.pages.dev` and `https://md.closedose.com`. Production acceptance requires HTTP 200 for every canonical public route, 301 for each no-slash variant, 404 for lowercase variants, the exact CSP/privacy boundaries, clean normal-flow runtime audit, and visible merged-commit behavior.

- [ ] **Step 6: Apply the clinical release boundary**

If the release manifest still lacks the required named approvals, deploy the hub and five RSI tools with Device and Sedation absent from the production artifact and labeled `Awaiting approval`. If valid approval evidence is supplied, record it in the manifest, rerun the full release sequence and independent review, then include those routes in the same production verification matrix.

---

## Self-review record

- The current PMD production state is preserved and explicitly exempted from local-only storage rules.
- The RSI split preserves clinical bytes while changing navigation, shell, packaging, and routes.
- All requested live work has an executable production path, but Device and Sedation cannot bypass the named clinical release gate.
- Every new public route has unit, distribution, privacy, redirect, case, phone, desktop, light, dark, and runtime-audit coverage.
- No new generic clinical calculator category or unreviewed roadmap formula is introduced.
