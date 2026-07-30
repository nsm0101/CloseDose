# PEM Reassessment Clock implementation specification

## Proposed route and runtime

`/CLOCK/`. Static client-only React application. Timeline and timers exist only
in memory for the active tab and are discarded on reload or close.

## Identifier-free inputs

Institution-approved pathway, non-identifying age band, treatment type, event
type, relative or wall-clock time, completion state, and reviewed reassessment
category. No free text or patient identifiers.

## Deterministic output boundary

Load a validated local configuration, calculate elapsed and remaining time, and
format an identifier-free event timeline. Never infer findings, mark an
assessment complete automatically, or apply a timing rule from another
institution or pathway.

## Interaction and accessibility

Expose the next expected check, elapsed time, pause/reset controls, and manual
reassessment recording in the first phone view. Use text plus shape for state,
live-region announcements that do not repeat each second, keyboard access,
reduced motion, and light/dark parity.

## Tests

Exact-zero, just-before, and just-after timer boundaries; pause/resume/reset;
clock correction; repeated and skipped events; invalid configuration; timeline
copy; reload clearing; privacy scan; route/cache contracts; and simulations.

## Release gates

Signed institutional configuration and source versions, named clinical,
pharmacy, nursing, informatics, records, and regulatory reviews, plus no
identifiers, persistence, analytics, AI, external runtime, or universal
observation/disposition claims.
