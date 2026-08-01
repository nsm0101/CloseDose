# High-Risk Ingestion Navigator implementation specification

## Proposed route and runtime

`/INGESTION/`. Static client-only React application with no persistence.

## Identifier-free inputs

Object category or unknown, count or unknown, elapsed-time band, symptom
categories, possible anatomic location, imaging completed, swallowing ability,
and consultation state. Do not request brand, narrative, names, or record data.

## Deterministic output boundary

Render reviewed imaging preparation, Poison Control escalation, conditional
mitigation eligibility, specialty consultation, and removal or transfer
preparation. No image interpretation, diagnosis, or autonomous disposition.

## Interaction and accessibility

Poison Control and emergency escalation remain persistent. Object selection and
urgent actions are usable within three interactions and 20 seconds at 320 px.
Support visible focus, screen readers, light/dark parity, and reduced motion.

## Tests

Object/count/time boundaries, mitigation inclusion and exclusion, imaging-view
sets, unknown states, consultation routing, invalid input, source adjacency,
privacy scan, route contracts, and all clinical simulations.

## Release gates

Named toxicology and specialty reviews, pediatric pharmacy, institutional and
regulatory approval, source/version display, and no identifiers, storage,
analytics, AI, or external runtime except an ordinary user-initiated Poison
Control link approved by policy.
