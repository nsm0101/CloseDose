# CHD Emergency Navigator implementation specification

## Proposed route and runtime

`/CHD/`. Static client-only React application with no persistence or shared
patient context.

## Identifier-free inputs

Age band, lesion family, repair stage or unknown, baseline saturation range,
medication classes, respiratory/perfusion presentation, rhythm concern, and
available cardiology support. No names, dates, institutions, or narrative notes.

## Deterministic output boundary

Map only reviewed lesion-state combinations to transparent physiology,
complication prompts, cautions, supportive option categories, and an
identifier-free handoff. Unknown or unsupported combinations require cardiology
clarification and never borrow another pathway.

## Interaction and accessibility

Baseline physiology and do-not-normalize-blindly warnings remain visible while
branches change. Provide 44 px targets, keyboard and screen-reader support,
light/dark parity, reduced motion, and 320 px operation.
Community-ED and PEM simulations must place the first urgent action within three
interactions and 20 seconds on a 320 px phone viewport.

## Tests

Every lesion-stage mapping, unknown state, baseline saturation boundary,
contraindication, unsupported combination, handoff field, source version,
privacy rule, route contract, phone timing, and clinical simulation case.

## Release gates

Named cardiology, critical-care, pharmacy, transport, institutional, and
regulatory approvals; no AI, identifiers, external runtime, storage, analytics,
or unreviewed time-critical directive.
