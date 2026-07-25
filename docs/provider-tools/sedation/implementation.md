# Pediatric Comfort and Sedation implementation specification

## Release state

Workspace: `@closedose-md/sedation`

Canonical route base: `/SEDATION/`

Status: **Clinical review / not approved for clinical use**

This isolated application is not added to the root workspace list, build script, provider catalog, or shared header in this task. Those integrations require a separate release-gated task.

Release also requires approval from a Named institutional sedation policy and formulary owner.

## State model

All state exists only in React memory for the current page and local tab:

- `entered`: whether the review gate view has been passed;
- `activeSection`: Context, Compare, Prepare, Recovery, or Document;
- `context`: procedure, age in months, weight in kg, and six tri-state risk fields;
- `comparedOptions`: medication options included in the comparison record;
- `soapmeChecks`: user-confirmed preparation items;
- `recoveryChecks`: user-confirmed recovery observations;
- `timerExpiries`: local timestamps for manually started source-interval timers;
- `timerAnnouncement`: route-specific, sequence-distinct timer status for assistive technology;
- `copyStatus`: accessible clipboard success or fallback message.

Risk fields begin as an empty, unassessed value. Procedure, age, and weight also begin empty. The initial UI does not assert that a risk is absent, that a patient is eligible, or that any option applies.

## Calculation contract

`calculateMedicationOption(optionId, weightKg, ageMonths)` is a deterministic local function.

1. Resolve one immutable option by exact identifier.
2. Reject an unknown option identifier.
3. Reject a non-finite weight, a weight below 0.5 kg, or a weight above 200 kg.
4. Reject a non-finite or negative age.
5. Return a structured exclusion with no `doses` field when age is outside the source population.
6. Multiply the named mg/kg or mcg/kg value by weight.
7. Apply the total cap after multiplication where the source specifies an absolute cap.
8. Round each displayed amount to one decimal.
9. Return source title, source date, calculation basis, units, cap, population, onset, and monitoring depth with every included or excluded result.

The engine contains no concentration, volume, administration-device, infusion, combined-agent, ranking, scoring, or recommendation logic.

## Timer behavior

Only IV and IM ketamine expose a timer because only those represented options specify a 10-minute repeat interval.

- A timer starts only after explicit user action.
- The timer stores an expiry timestamp in component memory.
- Display updates once per second while any timer is active.
- Each timer is independent and can be reset.
- Changing age or weight clears every active timer so an interval cannot remain attached to recalculated context.
- Expired timers display `00:00` and do not authorize a repeat.
- The interval is cleared when no timer remains active and on component unmount.
- Start, reset, context-clear, and expiry announcements identify IV or IM ketamine and include a monotonically increasing event number so successive live-region updates remain distinct.
- Tests inject a deterministic clock to advance an IV ketamine timer to `00:00`, verify its route-specific expiry announcement, and prove interval cleanup without waiting 10 minutes.
- Timers are local tab aids only. They are not persisted, synchronized, logged, or sent over a network.
- Refreshing, closing, duplicating, or navigating away from the tab discards the timer.

## UI sequence

1. **Review gate:** states Clinical review and Not approved for clinical use, identifies excluded capabilities, requires a Named institutional sedation policy and formulary owner approval, and does not expose a start-dose action.
2. **Context:** captures non-identifying procedure, age, weight, and tri-state risk observations.
3. **Compare:** shows nonpharmacologic comfort/local anesthesia, nitrous oxide, intranasal midazolam, intranasal fentanyl, IV ketamine, and IM ketamine as parallel options. No best agent is selected.
4. **Prepare:** records SOAPME checks and displays depth-aware monitoring expectations.
5. **Recovery:** records source-based recovery observations without declaring readiness or discharge.
6. **Document:** generates copyable identifier-free review documentation with explicit unknown or unassessed values.

Medication calculations remain adjacent to their source title, organization, date, formula, cap, population, onset, and monitoring expectation.

## Risk behavior

A present flag appends a transparent review prompt. It never removes a medication card, changes a dose, ranks an option, or declares a contraindication beyond the explicit age exclusion.

- Airway or OSA concern prompts individualized airway assessment, monitoring, and rescue review.
- Respiratory illness cites the ketamine relative-contraindication boundary.
- ASA III or greater prompts individualized physician and anesthesia review.
- Congenital heart disease prompts specialist review of hemodynamic risk, location, monitoring, and rescue resources.
- Previous sedation complication prompts review of the prior event and an individualized plan.
- Interacting sedative prompts pediatric pharmacy review and reiterates that outputs must not be combined.

## Accessibility

- A skip link targets the main review content.
- The application uses semantic headings, navigation, fieldsets, legends, labels, definition lists, status regions, a timer role, and selectable `pre` output.
- All interaction is keyboard available.
- Focus uses a visible three-pixel outline.
- Controls meet a minimum touch target near 44 pixels.
- Light and dark palettes respond automatically to `prefers-color-scheme`.
- Smooth scrolling is disabled when `prefers-reduced-motion: reduce` is active.
- The phone-first layout uses base styles for narrow viewports and only `min-width` enhancement queries.
- Information is not conveyed by color alone.
- Timer changes and clipboard status are announced with live regions.

## Privacy and network boundaries

- No identifiers are requested.
- No persistence.
- No analytics.
- No AI.
- No external runtime calls.
- No environment or key plumbing.
- No cookies, browser storage, database, authentication, telemetry, or backend API.
- Clipboard write is the only browser side effect and requires explicit user action.
- The documentation preview warns against adding a name, birth date, record number, address, contact information, or another identifier.

## Tests

`md/tests/sedation.test.mjs` covers:

- the full golden dose matrix;
- cap transitions at 25 kg for intranasal midazolam and 50 kg for intranasal fentanyl;
- one-decimal rounding;
- invalid weight boundaries;
- fentanyl and ketamine age exclusions;
- unknown identifiers;
- immutable option metadata;
- source and monitoring metadata on every result;
- route and build configuration;
- review status and visible workflow content;
- phone-first light and dark style contract;
- timer setup and cleanup;
- injectable-clock timer zero crossing, route-specific expiry announcement, and interval shutdown;
- clipboard fallback;
- privacy scanning;
- required clinical and implementation specification content.

Required Task 2 verification:

```sh
node --test tests/sedation.test.mjs
npm run typecheck --prefix apps/sedation
npm run build --prefix apps/sedation
```

## Route and release gating

The Vite base and output target are fixed at `/SEDATION/` and `md/dist/SEDATION`. This task builds the isolated application only. Root workspace, build, provider catalog, shared header, redirect, deployment, and production exposure are outside Task 2.

No route integration or release is authorized until the mandatory clinical reviewers, regulatory owner, and Named institutional sedation policy and formulary owner approve the clinical specification and all release checks pass.
