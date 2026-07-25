# CloseDose MD Provider Tool Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add clinically reviewable Peds Device Rescue and Pediatric Comfort & Sedation applications, reserve the six later roadmap modules, and extend the CloseDose MD portal and release contracts without weakening the platform privacy boundary.

**Architecture:** Keep every provider tool as an isolated Vite workspace with its own uppercase canonical route and tests. Put deterministic rules and calculations in importable `.mjs` modules so Node golden tests can execute the same logic the React interface uses. The two new applications are accessible review builds but remain `Clinical review` until named PEM, relevant-specialty, pharmacy, regulatory, and institutional approvals are recorded.

**Tech Stack:** Node 22, npm workspaces, React 19, TypeScript 5.8, Vite 6, Tailwind 4 where already used, Lucide React where already used, Node test runner, Playwright.

## Global Constraints

- Preserve the existing `/PIG/` and `/RSI/` routes and exact uppercase, trailing-slash route contract.
- Add `/DEVICE/` and `/SEDATION/` as isolated client-only applications.
- Reserve `/TRANSFER/`, `/AGITATION/`, `/NEWBORN/`, `/CHD/`, `/INGESTION/`, and `/CLOCK/` in typed catalog metadata without serving unimplemented clinical applications.
- Status values are exactly `Planned`, `Clinical review`, and `Available`.
- The portal catalog supports audience, category, evidence version, clinical-review date, status, and canonical route.
- Device Rescue and Sedation are exactly `Clinical review`; PIG and RSI remain `Available`; the six later modules are exactly `Planned`.
- No patient identifiers, storage, cookies, analytics, accounts, AI runtime, external runtime calls, environment or API-key plumbing, or cross-tool patient state.
- Inputs and checklist/timer state exist only in memory for the active browser tab.
- No clinical review date or reviewer identity may be invented. Unknown approval fields remain `null` and display as not yet recorded.
- Every patient-specific medication output displays source, source publication/reaffirmation date, calculation basis, units, maximum dose or cumulative cap, and applicable population.
- Medication output is presented as transparent reference options for local-protocol verification, never as an autonomous treatment recommendation.
- Every dose-containing release requires named PEM and pediatric-pharmacy review before it can become `Available`.
- Device Rescue requires named PEM plus pediatric airway/ENT/respiratory specialty review before it can become `Available`.
- Time-critical patient-specific recommendations require regulatory review before production availability.
- Do not use en dashes or em dashes in application-visible text.
- Use the existing CloseDose MD teal accent, Public Sans where already present, one radius system, automatic light/dark theme parity, visible focus, reduced-motion behavior, and phone-first layouts.
- Do not add a new third-party runtime dependency.
- Build output remains static and uses the current strict CSP and privacy scanner.

---

### Task 1: Peds Device Rescue review application

**Files:**
- Create: `md/apps/device/package.json`
- Create: `md/apps/device/index.html`
- Create: `md/apps/device/tsconfig.json`
- Create: `md/apps/device/vite.config.ts`
- Create: `md/apps/device/src/main.tsx`
- Create: `md/apps/device/src/App.tsx`
- Create: `md/apps/device/src/index.css`
- Create: `md/apps/device/src/deviceGuidance.mjs`
- Create: `md/apps/device/src/deviceGuidance.d.ts`
- Create: `md/tests/device.test.mjs`
- Create: `docs/provider-tools/device/clinical.md`
- Create: `docs/provider-tools/device/implementation.md`

**Interfaces:**
- Consumes: National Tracheostomy Safety Project pediatric emergency algorithm, review January 2024.
- Produces: workspace `@closedose-md/device`, route base `/DEVICE/`, `getRescueGuidance(context)`, `buildTransferHandoff(context)`, and a review-gated React application.

- [ ] **Step 1: Write failing executable guidance tests**

Cover the following exact cases in `md/tests/device.test.mjs` before implementation:

- every branch begins with help, high-flow oxygen to both face and tracheostomy/stoma, and airway opening;
- a passable suction catheter reports a patent tube, continues ABCDE assessment, and warns about partial obstruction;
- a non-passable catheter removes attachments and inner cannula, attempts suction, includes cuff deflation when present, and limits tube change language to trained responders with an established tracheostomy;
- absent breathing surfaces five rescue breaths and CPR if no signs of life;
- patent upper airway selects face ventilation with stoma occlusion, obstructed upper airway selects stoma ventilation, and unknown patency exposes both routes for an advanced airway responder;
- fresh or uncertain tracheostomy state warns against blind reinsertion and calls for immediate expert airway help;
- the handoff contains device details, caregiver-confirmed baseline, observed failure, actions, current oxygenation/ventilation route, equipment accompanying the child, and explicit unknown values, with no identifier fields;
- invalid enumerated inputs throw descriptive errors.

- [ ] **Step 2: Run the Device test and confirm the red state**

Run: `node --test tests/device.test.mjs`

Expected: failure because `apps/device/src/deviceGuidance.mjs` does not exist.

- [ ] **Step 3: Implement deterministic guidance and handoff generation**

Use explicit enumerations for upper-airway patency, breathing, suction passage, cuff, inner cannula, tracheostomy maturity, and ventilator dependence. Keep source metadata in the output. Do not make the application infer a diagnosis.

- [ ] **Step 4: Build the bedside interface**

The first viewport contains an urgent `Start tracheostomy rescue` action and a persistent emergency strip with `Call for help` and `Oxygen to face and stoma`. The interaction sequence is `Act now`, `Identify`, `Troubleshoot`, `Equipment`, and `Handoff`. Include caregiver questions, same-size and half-size-smaller spare tube preparation, dangerous-action warnings, copyable identifier-free handoff, evidence/version panel, review status, and a return link to `/`.

- [ ] **Step 5: Add clinical and implementation specifications**

`clinical.md` records intended population, excluded situations, source provenance, algorithm mapping, dangerous-action boundary, required reviewers, regulatory gate, open clinical-review questions, and simulated acceptance cases. `implementation.md` records state model, function contracts, UI sequence, accessibility, route, privacy/network boundaries, test matrix, and release gating. Open questions are explicit review gates, not implementation placeholders.

- [ ] **Step 6: Verify and commit**

Run:

```sh
node --test tests/device.test.mjs
npm run typecheck --workspace @closedose-md/device
npm run build --workspace @closedose-md/device
```

Commit message: `feat(md): add Peds Device Rescue review app`

---

### Task 2: Pediatric Comfort and Sedation review application

**Files:**
- Create: `md/apps/sedation/package.json`
- Create: `md/apps/sedation/index.html`
- Create: `md/apps/sedation/tsconfig.json`
- Create: `md/apps/sedation/vite.config.ts`
- Create: `md/apps/sedation/src/main.tsx`
- Create: `md/apps/sedation/src/App.tsx`
- Create: `md/apps/sedation/src/index.css`
- Create: `md/apps/sedation/src/sedationCalculations.mjs`
- Create: `md/apps/sedation/src/sedationCalculations.d.ts`
- Create: `md/tests/sedation.test.mjs`
- Create: `docs/provider-tools/sedation/clinical.md`
- Create: `docs/provider-tools/sedation/implementation.md`

**Interfaces:**
- Consumes: AAP/AAPD pediatric sedation guideline published 2019 and reaffirmed December 2025; Royal Children's Hospital Melbourne ketamine guideline updated December 2021; Texas Children's Hospital procedural sedation guideline dated February 2023.
- Produces: workspace `@closedose-md/sedation`, route base `/SEDATION/`, `calculateMedicationOption(optionId, weightKg, ageMonths)`, medication metadata, and a review-gated React application.

- [ ] **Step 1: Write failing golden calculation tests**

The executable golden matrix must cover:

- intranasal midazolam reference range `0.2-0.4 mg/kg`, maximum `10 mg`, maximum `5 mg per naris`, population infants and children, onset `10-15 min`, and one-decimal rounding;
- intranasal fentanyl analgesia range `1.5-2 mcg/kg`, maximum `100 mcg`, maximum `50 mcg per naris`, population age at least 12 months, onset `7-20 min`, and one-decimal rounding;
- IV ketamine initial range `1-1.5 mg/kg`, repeat range `0.25-0.5 mg/kg` at 10 minutes, cumulative cap `4.5 mg/kg`, population age at least 3 months, and one-decimal rounding;
- IM ketamine initial `4 mg/kg`, repeat `2 mg/kg` at 10 minutes, cumulative cap `6 mg/kg`, population age at least 3 months, and one-decimal rounding;
- cap transitions for midazolam at 25 kg and fentanyl at 50 kg;
- invalid weight including non-finite, below `0.5 kg`, and above `200 kg`;
- age exclusions for fentanyl and ketamine;
- unknown option identifiers;
- every result includes source title, date, calculation basis, units, cap, population, onset, and monitoring depth.

- [ ] **Step 2: Run the Sedation test and confirm the red state**

Run: `node --test tests/sedation.test.mjs`

Expected: failure because `apps/sedation/src/sedationCalculations.mjs` does not exist.

- [ ] **Step 3: Implement the transparent medication reference engine**

Represent intranasal midazolam, intranasal fentanyl, IV ketamine, and IM ketamine as immutable data plus one calculator. Apply caps after weight multiplication and round display values to one decimal. Return structured exclusions rather than a dose when outside the source population. Do not combine agents or calculate concentrations/volumes.

- [ ] **Step 4: Build the comfort and sedation console**

Support laceration repair, fracture reduction, abscess drainage, foreign-body removal, imaging, vascular access, and other procedure selection. Compare nonpharmacologic comfort/local anesthesia, nitrous oxide, anxiolysis, analgesia, and dissociative sedation without declaring a single best agent. Capture non-identifying age, weight, airway/OSA, respiratory illness, ASA III or greater, CHD, previous sedation complication, and interacting-sedative flags. Surface risk prompts, SOAPME preparation, source-adjacent dose outputs, redose countdowns only when the source specifies an interval, monitoring expectations, recovery criteria, and copyable identifier-free documentation.

- [ ] **Step 5: Add clinical and implementation specifications**

`clinical.md` records intended population, exclusions, medication provenance, formula and cap table, interaction warnings, monitoring/recovery basis, required PEM/pharmacy/anesthesia reviewers, regulatory gate, and open clinical-review questions. `implementation.md` records state model, timer behavior, calculation contract, UI sequence, accessibility, privacy/network boundaries, tests, and route/release gating.

- [ ] **Step 6: Verify and commit**

Run:

```sh
node --test tests/sedation.test.mjs
npm run typecheck --workspace @closedose-md/sedation
npm run build --workspace @closedose-md/sedation
```

Commit message: `feat(md): add pediatric comfort and sedation review app`

---

### Task 3: Catalog, governance specifications, and platform integration

**Files:**
- Modify: `md/package.json`
- Modify: `md/package-lock.json`
- Modify: `md/scripts/build.mjs`
- Modify: `md/apps/portal/src/toolCatalog.ts`
- Modify: `md/apps/portal/src/App.tsx`
- Modify: `md/apps/portal/src/index.css`
- Modify: `md/static/_redirects`
- Modify: `md/static/_headers`
- Modify: `md/static/404.html`
- Modify: `md/tests/workspace-contract.test.mjs`
- Modify: `md/tests/portal.test.mjs`
- Modify: `md/tests/distribution-contract.test.mjs`
- Modify: `md/tests/privacy-scanner.test.mjs`
- Modify: `md/tests/smoke/platform.spec.mjs`
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
- Consumes: the Device and Sedation workspaces and specifications from Tasks 1 and 2.
- Produces: a typed ten-tool catalog, assembled static routes `/`, `/PIG/`, `/RSI/`, `/DEVICE/`, and `/SEDATION/`, reserved roadmap routes, and documented clinical governance for all eight roadmap tools.

- [ ] **Step 1: Write failing catalog, workspace, distribution, privacy, and smoke tests**

Update tests first to require five npm workspaces, four tool build scripts, the ten catalog entries, exact statuses, all catalog metadata, uppercase canonical route values, new redirects, new cache rules, new built route directories, same-origin hashed assets, privacy scans of both new apps, no en/em dashes, portal review-state semantics, and phone-accessible review links.

- [ ] **Step 2: Run the integration tests and confirm the red state**

Run:

```sh
npm run test:unit
npm run build
```

Expected: failures because root workspace/build/catalog/distribution contracts do not yet include the new applications.

- [ ] **Step 3: Integrate workspaces, build, routes, and headers**

Add `apps/device` and `apps/sedation` to workspaces, scripts, build order, redirects, HTML and asset cache rules, static 404 links, README, deployment runbook, and architecture topology. Keep planned routes catalog-only.

- [ ] **Step 4: Extend the portal catalog and presentation**

The ten typed entries are PIG, RSI, Peds Device Rescue, Pediatric Comfort & Sedation Console, Peds Transfer Ready, Agitation SafeSteps, Sick Newborn: First 15 Minutes, CHD Emergency Navigator, High-Risk Ingestion Navigator, and PEM Reassessment Clock. Display status, audience, category, evidence version, review date, and canonical route. `Available` links say `Open reference`; `Clinical review` links say `Open review build`; `Planned` entries are non-links and say `Planned module`. Preserve a compact semantic list instead of a generic card wall.

- [ ] **Step 5: Add the six planned-tool specification pairs**

Each clinical specification records target population, explicit non-goals, source baseline from the approved roadmap, clinical-risk questions, required specialty and pharmacy reviewers, regulatory implications, and simulation acceptance cases. Each implementation specification records proposed route, identifier-free inputs, deterministic output boundary, client-only state, accessibility/phone interaction target, test categories, and release gates. Do not include unreviewed formulas or medication directives.

- [ ] **Step 6: Verify and commit**

Run:

```sh
npm ci
npm run typecheck
npm run test:unit
npm run build
npm run test:contract
npm run test:smoke
```

Commit message: `feat(md): integrate provider tool roadmap`

---

## Whole-branch release gate

- [ ] Generate a review package from the branch merge base and obtain independent whole-branch review.
- [ ] Resolve every Critical and Important finding and re-run affected tests.
- [ ] Run the full clean verification sequence from `md/`.
- [ ] Check the final application source for en/em dashes, external URLs, identifiers, persistence, analytics, AI plumbing, environment keys, and external transport.
- [ ] Verify `/DEVICE/` and `/SEDATION/` at phone and desktop widths in light and dark color schemes.
- [ ] Verify the urgent Device action is reachable in one interaction and the urgent rescue sequence in no more than three interactions.
- [ ] Verify no unreviewed new tool is labeled `Available`.
- [ ] Do not deploy the review builds to production without the named clinical, pharmacy, regulatory, and institutional approvals specified above.
