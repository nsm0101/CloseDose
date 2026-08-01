# Pediatric Airway Scenario Guide V2 Implementation Specification

Status: **Clinical review / not approved for clinical use**

## Proposed route and runtime

The canonical route remains `/AIRWAY-SCENARIOS/`. Vite receives an explicit compile-time build mode.

- `production` renders the byte-pinned `ScenarioGuide` inside `.airway-scenario-legacy` and applies only the scoped contrast correction.
- `review` renders `IntegratedScenarioGuide` with a visible clinical-review boundary.

Both builds remain static, client-only, identifier-free, and nonpersistent. No runtime feature flag or query parameter can expose the candidate in production.

## Identifier-free inputs

- Exact numeric age.
- Explicit age unit: days, months, or years.
- Independently verified weight in kilograms.
- One imported clinical scenario.
- Optional boolean patient factors.

The application does not request or store a name, date of birth, medical-record number, address, contact information, clinician identity, institution, encounter identifier, free text, or timestamp.

## Deterministic output boundary

`scenarioFlow.mjs` is a pure module with no browser APIs. It exports:

- `normalizeAgeToDays(value, unit)`.
- `deriveAgeFlags(value, unit)`.
- `describeAge(value, unit)`.
- immutable `SOURCE_REFERENCES`, `PATIENT_FACTORS`, and `SCENARIO_CONTEXT` records.
- `getPatientWarnings(selection)`.

Exact age is normalized with fixed constants only for deterministic boundary display. The model accepts age zero days, uses 0 through 28 days as neonatal, treats age below 3 normalized months as young infant, and rejects ages above 18 years. It does not calculate corrected gestational age.

Patient-factor warnings are additive. They do not diagnose, select a best agent, hide an option, change a dose, or change the imported scenario classification. Every warning carries a stable source identifier.

Medication names, classifications, dose bases, advantages, disadvantages, and contraindications come from byte-pinned `rsiData.ts`. The review component may calculate and display the same imported milligram result by multiplying the unchanged milligram-per-kilogram value by verified weight. It must not alter a formula, cap, or rounding rule.

## Interaction and accessibility

The review workflow follows one vertical reading order:

1. Clinical-review gate.
2. Exact patient context.
3. Scenario selection.
4. Patient-factor selection.
5. Selected bedside reference.
6. Protect-first priorities.
7. Patient-specific cautions.
8. Imported medication considerations and rationale.
9. Pearls and pitfalls.
10. Exceptional cases and imported limitations.
11. Evidence metadata.

Radio buttons and checkboxes remain native controls. Fieldsets and legends identify groups. Selection uses control state, border, text, and color. Controls are at least 44 px high. Invalid age produces inline text and blocks the patient-specific output. The result summary is reachable in document order and warning updates use `aria-live`.

CSS uses app-scoped semantic tokens for surface, text, muted text, line, accent, critical, caution, context, and preferred states. Light and dark tokens must reach WCAG AA for normal text. At widths below 640 px, every multi-column region becomes one column except the compact patient summary, which becomes one column below 390 px.

## Tests

- Exact-age golden tests: zero days, 28/29-day transition, below/at 3 months, below/at one year, 18-year maximum, invalid unit, negative input, non-number, and out-of-population age.
- Warning tests: deterministic ordering, automatic young-infant prompt, selected-factor addition/removal, scenario-derived warning, unknown factor rejection, and required source ID.
- Source tests: every imported scenario has protect, pearl, pitfall, and source coverage; every patient factor has a source; no source URL appears in runtime code.
- Pinned-source tests: original clinical component and data hashes remain unchanged.
- Privacy scan: no identifiers, storage, analytics, network transport, external URL, or environment/API-key plumbing.
- Production browser tests: light and dark contrast, one workflow, interaction continuity, reset, no overflow, and clean runtime audit.
- Review browser tests: visible unapproved status, exact age/scenario/factor integration, deterministic result update, invalid-age handling, reset, keyboard order, 320 px layout, and no runtime violations.
- Distribution tests: production and review artifacts share the canonical route, but only review mode contains candidate status and patient-first copy.

## Release gates

1. Every clinical question in `clinical.md` has a documented disposition.
2. Every required named reviewer approves the exact commit, displayed wording, source version, age boundary, classification, formula, and exceptional-case prompt.
3. Contrast and accessibility review passes in both color schemes at 320 px, 768 px, and desktop widths.
4. Community-ED and PEM simulation cases pass the three-interaction and 20-second urgent-information target.
5. Privacy and security review confirms client-only, identifier-free, nonpersistent behavior.
6. Regulatory review authorizes the patient-specific intended use and release controls.
7. The production switch is an explicit reviewed code change. No runtime flag can expose the review view.
8. Full typecheck, unit, privacy, rules, review build, production build, distribution contract, and browser smoke suites pass.
9. Production is deployed only from merged `main`, followed by exact-case route, redirect, interaction, contrast, CSP, privacy, and Pages-status verification.
