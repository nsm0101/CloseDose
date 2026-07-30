# Agitation SafeSteps implementation specification

## Proposed route and runtime

`/AGITATION/`. Static client-only React application with no persistence and no
cross-tool state.

## Identifier-free inputs

Age band, communication mode, neurodiversity accommodations, observed behavior,
possible medical contributors, oral-route feasibility, medication classes
already given, and restraint state. Do not accept names or narrative free text.

## Deterministic output boundary

Render reviewed environmental, communication, assessment, safety, and
reassessment prompts based on explicit selections. Risk screening and medication
content remain disabled until their independently reviewed rule sets are added.

## Interaction and accessibility

Environment and immediate medical safety appear first. Support low stimulation,
plain language, screen readers, keyboard-only use, reduced motion, high contrast,
and 320 px layouts. Timers are local, labeled, pausable, and resettable.

## Tests

Cause-priority golden tests, interaction-warning pairs, invalid and unknown
states, timer boundaries, restraint monitoring visibility, privacy scan,
route/case contracts, keyboard order, and all clinical simulation cases.

## Release gates

Named specialty, pharmacy, nursing, legal, regulatory, and institutional review;
transparent source/version display; no AI, analytics, external runtime, storage,
identifiers, or autonomous treatment recommendation.
