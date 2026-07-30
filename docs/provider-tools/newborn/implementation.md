# Sick Newborn: First 15 Minutes implementation specification

## Proposed route and runtime

`/NEWBORN/`. Static client-only React application with active-tab memory only.

## Identifier-free inputs

Age in days, gestational-age band or unknown, temperature category, glucose
category or unknown, respiratory support, perfusion category, cyanosis, feeding
or vomiting category, and available neonatal resources. No free text.

## Deterministic output boundary

Show parallel reviewed action groups and consultation triggers. Rules must
preserve unknown values and source-specific applicability. No diagnostic score,
probability, medication calculation, or autonomous treatment plan.

## Interaction and accessibility

Universal stabilization actions occupy the first phone viewport. Branch detail
opens progressively, but uncertainty and consultation never collapse. Support
44 px controls, keyboard use, visible focus, light/dark parity, and reduced
motion.

## Tests

Age boundaries at 0 and 28 days, gestational-age unknowns, parallel-action
ordering, contraindicated normalization copy, invalid input, source metadata,
privacy scan, route contracts, phone timing, and all clinical simulation cases.

## Release gates

Approved evidence matrix, named multidisciplinary and pharmacy review,
regulatory assessment, institutional policy verification, no identifiers or
network/storage/AI behavior, and production simulation evidence.
