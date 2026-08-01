# Peds Device Rescue Implementation Specification

## Status and scope

This specification covers the integrated `@closedose-md/device` review application. The root workspace, provider catalog, canonical redirect, cache rules, and review-build orchestration include the application. The production build omits its document and assets until the checked clinical release manifest records every required approval and changes its status to `Available`.

The application is a deterministic review surface. It does not diagnose, persist data, perform analytics, use AI, or make external runtime calls.

## State model

`DeviceRescueContext` uses explicit enumerations:

| Field | Allowed values |
| --- | --- |
| `upperAirwayPatency` | `patent`, `obstructed`, `unknown` |
| `breathing` | `not-assessed`, `present`, `absent` |
| `suctionPassage` | `not-assessed`, `passable`, `not-passable` |
| `cuff` | `present`, `absent`, `unknown` |
| `innerCannula` | `present`, `absent`, `unknown` |
| `tracheostomyMaturity` | `established`, `fresh`, `uncertain` |
| `ventilatorDependence` | `dependent`, `not-dependent`, `unknown` |

Optional handoff state contains device details, caregiver-confirmed baseline, observed failure, actions taken, current oxygenation and ventilation route, and equipment accompanying the child.

No state field accepts or represents a child or caregiver identifier.

All state exists only in React memory for the current page lifetime. Refreshing or closing the page clears it.

Breathing and suction passage initialize as `not-assessed`. The interface presents no tube-patency or breathing conclusion until the responder makes the corresponding explicit observation.

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
- Visible paired `Clinical review` and `Not approved for clinical use` status.
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
- Every radio group has a stable shared `name`.
- Skip link targets the main rescue content.
- Emergency strip has an accessible label.
- Current workflow step uses `aria-current="step"`.
- Dynamic guidance and copy status use live regions.
- Dangerous-action warnings use alert semantics.
- Controls have visible keyboard focus.
- Visually hidden radio inputs transfer visible focus to the rendered choice control.
- Each pointer target has a practical minimum height or padded hit area.
- Color is not the only carrier of review, selection, or warning state.
- Phone-first defaults use a single column and horizontally scrolling step navigation, with desktop enhancements applied only at minimum-width breakpoints.
- Automatic light and dark color tokens follow the operating-system color scheme.
- The CloseDose MD accent is `#18a78d`, action and focus colors maintain accessible contrast, and one shared radius token controls non-semantic corners.
- Reduced-motion preference disables smooth scrolling.

Release still requires keyboard-only, screen-reader, contrast, zoom, narrow viewport, and high-stress usability review.

## Route and package

- Workspace package: `@closedose-md/device`.
- Canonical Vite base: `/DEVICE/`.
- Standalone build output: `md/dist/DEVICE`.
- Source entry: `md/apps/device/src/main.tsx`.
- Root return target: `/`.

The no-slash route redirects to the canonical route. While approval is pending,
the provider catalog shows the tool without a link and the production artifact
does not contain the route. The review artifact contains the route with the
visible unapproved-use boundary.

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
| Neutral initial observations | No tube-patency or breathing conclusion before explicit selection. |
| Passable suction catheter | Patent tube, ABCDE continuation, and partial-obstruction warning. |
| Non-passable suction catheter | Attachment removal, inner-cannula removal, suction, cuff deflation, and trained established-tracheostomy tube-change boundary. |
| Absent breathing | Five rescue breaths and CPR if there are no signs of life. |
| Patent upper airway | Face ventilation with stoma occlusion. |
| Obstructed upper airway | Stoma ventilation. |
| Unknown upper-airway patency | Both routes for an advanced airway responder. |
| Fresh or uncertain tracheostomy | No blind reinsertion and immediate expert airway help. |
| Handoff | Required categories, explicit unknown values, and no identifier fields. |
| Validation | Every invalid enumeration throws a descriptive error. |
| Application contract | Package name, `/DEVICE/` base, exact clinical-review state, workflow labels, grouped radio names, focus transfer, dark-mode tokens, phone-first breakpoints, shared radius and accent tokens, clipboard failure handling, visible-copy dash constraint, and privacy scan. |
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
7. Exact production route, headers, redirects, catalog registration, and review-build assembly remain verified.
8. The checked release manifest changes atomically to `Available`, records the clinical-review date and named reviewer approvals, and passes the artifact contracts.

Until those gates close, `Clinical review` and `Not approved for clinical use` must remain visibly paired.
