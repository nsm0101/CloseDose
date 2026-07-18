# CloseDose MD

CloseDose MD is an isolated static provider platform for `md.closedose.com`.
It does not change the parent-facing `public/` site or its deployment.

## Canonical routes

| Route | Application |
| --- | --- |
| `/` | CloseDose MD provider portal |
| `/PIG/` | Pediatric Airway Reference Calculator |
| `/RSI/` | Pediatric Emergency RSI Reference and Calculator |

`/PIG` and `/RSI` will redirect to their trailing-slash canonical routes in
the production assembly task. Route casing is intentional.

## Workspace boundary

The three npm workspaces are deliberately separate:

- `apps/portal` owns the provider landing page.
- `apps/pig` will contain the pinned `PIG-CAR` snapshot.
- `apps/rsi` will contain the pinned `CC-RSI` snapshot.

Task 1 establishes package descriptors and route contracts only. It does not
copy clinical application source, change calculation logic, or add a server,
analytics, storage, AI runtime, or patient-data handling. Import provenance is
recorded in [sources.json](./sources.json).

## Local verification

From this directory, run:

```sh
npm run test:contract
jq empty sources.json
```

The contract test verifies the root workspace declaration, every child
package's name and route base, the documented canonical routes, and the pinned
source provenance. Future application tasks should keep this test passing.
