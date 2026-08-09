# CloseDose MD provider tool governance

Each provider tool is an independent safety-critical subsystem with a clinical
specification, implementation specification, executable tests, and its own
release decision. A roadmap entry is not evidence of approval.

<!-- generated:governance-table start -->
| Tool | Route | Status |
| --- | --- | --- |
| Peds Device Rescue | `/DEVICE/` | Clinical review |
| Pediatric Comfort and Sedation Console | `/SEDATION/` | Clinical review |
| Peds Transfer Ready | `/TRANSFER/` | Planned |
| PEM Reassessment Clock | `/CLOCK/` | Planned |
| Agitation SafeSteps | `/AGITATION/` | Planned |
| Sick Newborn: First 15 Minutes | `/NEWBORN/` | Planned |
| CHD Emergency Navigator | `/CHD/` | Planned |
| High-Risk Ingestion Navigator | `/INGESTION/` | Planned |
<!-- generated:governance-table end -->

This table is generated from [`md/tools.registry.json`](../../md/tools.registry.json);
run `npm run sync:tools` from `md/` after changing a tool's release state. Tools
already released to production are listed in [`md/README.md`](../../md/README.md).

Clinical-review applications remain absent from production until the checked-in
release manifest records every required named approval. Planned applications
have no executable route and must complete evidence selection, clinical review,
regulatory review where applicable, implementation, golden tests, and simulated
phone cases before their status can change.
