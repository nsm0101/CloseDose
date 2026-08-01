# Peds Transfer Ready implementation specification

## Proposed route and runtime

`/TRANSFER/`, uppercase with a trailing slash. Static client-only React
application with in-memory state for the active tab only.

## Identifier-free inputs

Age band, broad clinical support needs, airway or ventilation state, vascular
access category, infusion category, isolation need, transport capability,
family-readiness state, and records or image readiness. Do not request names,
dates of birth, record numbers, facilities, clinicians, phone numbers, or free
text that could contain identifiers.

## Deterministic output boundary

Map selected process facts to ordered checklist groups and an identifier-free
SBAR-style handoff. Every rule is traceable to a reviewed source or an explicit
institutional configuration. Never generate a diagnosis, destination, mode, or
time-critical treatment directive.

## Interaction and accessibility

The first phone viewport exposes Stabilize now and Call now. All targets are at
least 44 px, keyboard reachable, screen-reader labeled, and usable at 320 px.
Completion states use text and shape in addition to color.

## Tests

Golden ordering tests, unknown and incomplete states, configuration validation,
handoff omission tests, privacy scans, route and cache contracts, 320 px browser
cases, keyboard order, and four simulated transfer cases from the clinical spec.

## Release gates

No storage, analytics, AI runtime, external request, or cross-tool state. Require
all named clinical, pharmacy, institutional, legal, and regulatory approvals
before a production document or Available status exists.
