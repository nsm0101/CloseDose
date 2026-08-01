# Pediatric Airway Scenario Guide Flow Implementation Plan

> **For agentic workers:** Execute this plan inline. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public scenario guide readable in both color schemes and create a single patient-first clinical-review flow that combines exact age, verified weight, scenario selection, patient factors, medication cautions, pearls, pitfalls, and exceptional-case prompts.

**Architecture:** Preserve the byte-pinned CC-RSI component and data as the current production clinical baseline. Add a scoped, presentation-only contrast correction to the public application. Build the redesigned workflow as an app-local component rendered only by Vite `review` mode until named PEM, pediatric-airway, pediatric-pharmacy, institutional, and regulatory reviewers approve the new patient-specific presentation.

**Tech Stack:** React 19, TypeScript, Vite 6, Tailwind CSS 4, Node test runner, Playwright, Cloudflare Pages.

## Global Constraints

- Keep `/AIRWAY-SCENARIOS/` uppercase and trailing-slash canonical.
- Do not change the pinned `ScenarioGuide.tsx`, `rsiData.ts`, medication formulas, doses, scenario classifications, or clinical source strings in the production artifact.
- Keep all inputs identifier-free, client-only, and nonpersistent. No analytics, AI, external runtime calls, accounts, or cross-tool patient state.
- The public patch may change contrast and layout styling only.
- The integrated patient-specific flow must state `Clinical review` and `Not approved for clinical use` and must render only in a review build.
- Exact age must be entered explicitly. Weight must never infer age.
- All selected states need text or control state in addition to color.
- Body text and controls must meet WCAG AA contrast in light and dark modes.
- Do not invent reviewer names, approval dates, source versions, or institutional authorization.

---

### Task 1: Lock the release boundary and contrast regression

**Files:**
- Modify: `md/apps/airway-scenarios/src/App.tsx`
- Modify: `md/apps/airway-scenarios/src/index.css`
- Modify: `md/tests/rsi.test.mjs`
- Modify: `md/tests/smoke/platform.spec.mjs`

**Interfaces:**
- Consumes: current production `ScenarioGuide` and `reference.css` tokens.
- Produces: `.airway-scenario-legacy` production wrapper and contrast assertions for active scenario, warning, caution, and medication rows.

- [ ] **Step 1: Add failing source contracts**

Assert that the application contains a compile-time review-mode branch, the production branch still imports `ScenarioGuide`, and the shared byte-pinned source hashes remain unchanged.

- [ ] **Step 2: Add failing browser contrast checks**

At `/AIRWAY-SCENARIOS/` in dark mode, calculate relative luminance from computed foreground and background RGB values. Require at least `4.5` for the active scenario label, first-line drug, alternative drug, avoid drug, and paralytic labels.

- [ ] **Step 3: Add scoped semantic contrast overrides**

Inside `.airway-scenario-legacy`, map red, amber, green, blue, and violet Tailwind text/background combinations to dark-mode colors that preserve meaning and meet the contrast assertions. Do not alter another RSI route.

- [ ] **Step 4: Run the focused baseline tests**

Run: `npm run test:rsi`

Expected: the pinned-source contract passes and all new source assertions pass.

---

### Task 2: Add a deterministic patient-context model

**Files:**
- Create: `md/apps/airway-scenarios/src/scenarioFlow.mjs`
- Create: `md/apps/airway-scenarios/src/scenarioFlow.d.ts`
- Create: `md/tests/airway-scenarios.test.mjs`
- Modify: `md/package.json`

**Interfaces:**
- Produces: `normalizeAgeToDays(value, unit)`, `describeAge(value, unit)`, `deriveAgeFlags(value, unit)`, `PATIENT_FACTORS`, `SCENARIO_CONTEXT`, and `getPatientWarnings(selection)`.
- Consumes: no browser APIs and no patient identifiers.

- [ ] **Step 1: Write age boundary tests**

Cover invalid, negative, and implausible ages; valid age zero days; day/month/year conversion; neonate boundaries at 28 and 29 days; and young-infant boundary immediately below and at 3 months.

- [ ] **Step 2: Write warning-composition tests**

Verify that age-derived young-infant status is automatic, risk flags are deterministic, deselected flags disappear, no warning is silently promoted to a diagnosis, and every warning includes its source identifier.

- [ ] **Step 3: Implement the pure model**

Use immutable exported records. Keep the model qualitative: it may surface source-mapped cautions and review prompts but may not choose a medication, hide an option, or calculate a dose.

- [ ] **Step 4: Run the focused model tests**

Run: `node --test tests/airway-scenarios.test.mjs`

Expected: all formula, boundary, invalid-input, and warning-composition cases pass.

---

### Task 3: Build the integrated review workflow

**Files:**
- Create: `md/apps/airway-scenarios/src/IntegratedScenarioGuide.tsx`
- Modify: `md/apps/airway-scenarios/src/App.tsx`
- Modify: `md/apps/airway-scenarios/src/index.css`
- Modify: `md/scripts/build.mjs`
- Modify: `md/tests/smoke/platform.spec.mjs`

**Interfaces:**
- Consumes: `SCENARIOS`, `INDUCTION_AGENTS`, and `PARALYTICS_COMPARISON` from the byte-pinned reference package plus the pure patient-context model.
- Produces: one linear workflow with patient context, scenario selection, patient factors, priority view, medication considerations, pearls/pitfalls, exceptional cases, and evidence links.

- [ ] **Step 1: Render the review gate**

Show `Clinical review` and `Not approved for clinical use` before the workflow. Explain that the view compares transparent considerations and does not diagnose or select a best agent.

- [ ] **Step 2: Integrate patient and scenario inputs**

Place exact age, age unit, verified weight, scenario buttons, and patient-factor checkboxes in one ordered form. Keep 44 px minimum control targets, persistent labels, keyboard focus, fieldsets, legends, and `aria-live` summaries.

- [ ] **Step 3: Render the provider reference output**

Show the selected scenario rationale first. Follow with `Protect first`, `Patient-specific cautions`, `Medication considerations`, `Pearls and pitfalls`, and `Exceptional cases`. Use the existing imported medication/scenario data for medication names, dose calculations, advantages, disadvantages, and contraindications. Clearly label evidence strength and the need to verify local protocols.

- [ ] **Step 4: Make build mode explicit**

Pass `--mode production` or `--mode review` to the airway-scenarios Vite build. Production renders the pinned guide with the contrast patch. Review mode renders the integrated workflow.

- [ ] **Step 5: Add review-flow browser tests**

Build review mode and verify that changing age and scenario updates one result region, a selected patient factor surfaces a caution, reset restores the initial state, the review boundary is visible, and there is no horizontal overflow at 320 px.

---

### Task 4: Write the clinical and implementation specifications

**Files:**
- Create: `docs/provider-tools/airway-scenarios/clinical.md`
- Create: `docs/provider-tools/airway-scenarios/implementation.md`
- Modify: `md/tests/provider-specs.test.mjs`

**Interfaces:**
- Produces: source inventory, unchanged clinical baseline, open review questions, named reviewer requirements, acceptance cases, and the exact production/review artifact boundary.

- [ ] **Step 1: Record the evidence baseline**

Map the review prompts to the 2026 SCCM pediatric sepsis guideline, Brain Trauma Foundation pediatric severe TBI guideline, FDA succinylcholine prescribing information, 2023 ESAIC/BJA neonatal and infant airway guideline, 2025 AHA/AAP PALS guideline, and cited pediatric airway registry evidence.

- [ ] **Step 2: Record open clinical questions**

Require reviewers to resolve medication ranking, age bands, shock-state wording, congenital-heart physiology, asthma and seizure framing, exact contraindication language, exception prompts, and whether any output crosses the local regulatory threshold for time-critical patient-specific recommendations.

- [ ] **Step 3: Record release requirements**

Require named PEM, pediatric airway/anesthesia, pediatric pharmacy, relevant specialty, institutional, human-factors/accessibility, privacy/security, and regulatory approvals before the integrated view replaces the public pinned view.

---

### Task 5: Verify, review, and release the safe subset

**Files:**
- Modify only files required to resolve verification findings.

**Interfaces:**
- Produces: a reviewed pull request, a merged production contrast patch, a locally assembled clinical-review artifact, and live route evidence.

- [ ] **Step 1: Run the full local release sequence**

Run from `md/`: `npm run typecheck`, `npm run test:unit`, `npm run build:review`, `npm run build`, `npm run test:contract`, and `npm run test:smoke`.

Expected: all commands pass. The review build shows the integrated flow and review boundary. The production build shows the pinned guide with corrected contrast.

- [ ] **Step 2: Perform visual QA**

Capture phone and desktop screenshots in light and dark modes for both production and review builds. Confirm readable text, one linear flow, no overlap or overflow, visible selected state, and a useful priority order.

- [ ] **Step 3: Merge and deploy only the approved subset**

Merge the contrast correction and review artifact. Deploy the production artifact so `/AIRWAY-SCENARIOS/` receives the contrast fix while retaining the pinned clinical flow.

- [ ] **Step 4: Verify production**

Confirm `/AIRWAY-SCENARIOS` redirects to `/AIRWAY-SCENARIOS/`, the canonical route returns 200, lowercase stays 404, live dark-mode contrast tests pass, and runtime auditing reports no identifiers, persistence, analytics, AI, popups, or unexpected network calls.

## Self-review record

- The user-requested single flow is fully implementable without changing the public route contract.
- Clinical-content changes are not silently released. The public subset fixes readability; the integrated version remains review-only until named approvals exist.
- The old component and shared clinical data remain byte-pinned in production.
- Exact age does not infer weight, and weight does not infer age.
- Tests cover the visually reported defect plus every new age boundary and review-build release boundary.
