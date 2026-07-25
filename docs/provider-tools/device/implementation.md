# Peds Device Rescue Implementation Specification

## Status and scope

This specification covers the isolated `@closedose-md/device` review application. It does not add the application to the provider catalog, root workspace, build orchestration, headers, redirects, or deployment.

The application is a deterministic review surface. It does not diagnose, persist data, perform analytics, use AI, or make external runtime calls.

## State model

`DeviceRescueContext` uses explicit enumerations:

| Field | Allowed values |
| --- | --- |
| `upperAirwayPatency` | `patent`, `obstructed`, `unknown` |
| `breathing` | `present`, `absent` |
| `suctionPassage` | `passable`, `not-passable` |
| `cuff` | `present`, `absent`, `unknown` |
| `innerCannula` | `present`, `absent`, `unknown` |
| `tracheostomyMaturity` | `established`, `fresh`, `uncertain` |
| `ventilatorDependence` | `dependent`, `not-dependent`, `unknown` |

Optional handoff state contains device details, caregiver-confirmed baseline, observed failure, actions taken, current oxygenation and ventilation route, and equipment accompanying the child.

No state field accepts or represents a child or caregiver identifier.

All state exists only in React memory for the current page lifetime. Refreshing or closing the page clears it.

## Function contracts

### `getRescueGuidance(context)`

Consumes a complete `DeviceRescueContext`.

Validation:

- Reject a missing or non-object context.
- Reject every unsupported enumerated value with `Invalid <field>` and the allowed values.

Returns:

- Source organization, title, review date, and review status.
- The three common immediate actions in fixed order.
- Tube status.
- Deterministic troubleshooting actions.
- Breathing support actions.
- Ventilation route guidance.
- Dangerous-action warnings.

The function does not infer a diagnosis.

### `buildTransferHandoff(context)`

Consumes a complete `DeviceRescueContext`, including optional handoff values.

Returns plain text containing:

- Device details.
- Caregiver-confirmed baseline.
- Observed failure.
- Actions taken.
- Current oxygenation and ventilation route.
- Equipment accompanying the child.

Blank or missing values become the literal value `unknown`. Lists are separated with semicolons. The contract contains no identifier field.

## User-interface sequence

The first viewport contains:

- Persistent emergency strip with `Call for help` and `Oxygen to face and stoma`.
- Urgent `Start tracheostomy rescue` action.
- Visible `Review required` and `Not approved for clinical use` status.
- Return link to `/`.

After starting, the sequence is:

1. `Act now`: common immediate actions and absent-breathing rescue escalation.
2. `Identify`: caregiver questions, device details, ventilator dependence, tracheostomy maturity, and caregiver-confirmed baseline.
3. `Troubleshoot`: suction passage, inner cannula, cuff, upper-airway patency, deterministic output, ventilation routes, and dangerous-action warnings.
4. `Equipment`: same-size and half-size-smaller spare tubes, rescue equipment checklist, and trained-responder boundary.
5. `Handoff`: observed failure, actions taken, current route, selected equipment, explicit unknowns, preview, and copy action.

An evidence and version panel remains available after the workflow and contains source provenance, application version, and review status.

## Accessibility

- Semantic header, main, nav, sections, fieldsets, legends, lists, definition list, and footer.
- Skip link targets the main rescue content.
- Emergency strip has an accessible label.
- Current workflow step uses `aria-current="step"`.
- Dynamic guidance and copy status use live regions.
- Dangerous-action warnings use alert semantics.
- Controls have visible keyboard focus.
- Each pointer target has a practical minimum height or padded hit area.
- Color is not the only carrier of review, selection, or warning state.
- Layout reflows to a single column and the step navigation scrolls horizontally on narrow screens.
- Reduced-motion preference disables smooth scrolling.

Release still requires keyboard-only, screen-reader, contrast, zoom, narrow viewport, and high-stress usability review.

## Route and package

- Workspace package: `@closedose-md/device`.
- Canonical Vite base: `/DEVICE/`.
- Standalone build output: `md/dist/DEVICE`.
- Source entry: `md/apps/device/src/main.tsx`.
- Root return target: `/`.

Root workspace registration and platform integration are intentionally outside Task 1.

## Privacy, network, and runtime boundaries

- No child or caregiver identifier fields.
- No local storage, session storage, IndexedDB, cookies, service worker, or other browser persistence.
- No analytics, telemetry, error-reporting service, or tracking pixel.
- No AI model, AI dependency, prompt, or inference.
- No fetch, XMLHttpRequest, WebSocket, EventSource, beacon, or external runtime call.
- No externally hosted font, image, script, style, or other asset.
- Clipboard access occurs only after the user selects `Copy identifier-free handoff` and copies the locally generated plain text.

The shared source privacy scanner enforces browser transport, persistence, analytics, external URL, environment and key plumbing, and identifier-field boundaries.

## Test matrix

| Test | Evidence |
| --- | --- |
| Common first actions | Every representative branch begins with the same three actions in order. |
| Passable suction catheter | Patent tube, ABCDE continuation, and partial-obstruction warning. |
| Non-passable suction catheter | Attachment removal, inner-cannula removal, suction, cuff deflation, and trained established-tracheostomy tube-change boundary. |
| Absent breathing | Five rescue breaths and CPR if there are no signs of life. |
| Patent upper airway | Face ventilation with stoma occlusion. |
| Obstructed upper airway | Stoma ventilation. |
| Unknown upper-airway patency | Both routes for an advanced airway responder. |
| Fresh or uncertain tracheostomy | No blind reinsertion and immediate expert airway help. |
| Handoff | Required categories, explicit unknown values, and no identifier fields. |
| Validation | Every invalid enumeration throws a descriptive error. |
| Application contract | Package name, `/DEVICE/` base, review-gate text, workflow labels, visible-copy dash constraint, and privacy scan. |
| Type safety | `npm run typecheck --prefix apps/device`. |
| Static package | `npm run build --prefix apps/device`. |

## Release gating

The application must not be treated as clinically released until:

1. Every required reviewer in the clinical specification records approval.
2. Every open clinical-review question has a documented disposition.
3. All simulated acceptance cases pass with recorded evidence.
4. Accessibility review passes.
5. Privacy and security review confirms the source and built output boundaries.
6. Regulatory and quality-system review authorizes release.
7. Exact production route, headers, redirects, catalog registration, and deployment are separately implemented and verified.
8. The application review status is updated through controlled change after approval.

Until those gates close, `Review required` and `Not approved for clinical use` must remain visible.
