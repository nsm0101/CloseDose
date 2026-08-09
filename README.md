[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/D1D71M8JMY)

# CloseDose

CloseDose is a pediatric medication dosing calculator for parents and caregivers,
built with plain HTML, CSS and JavaScript. The project uses a responsive layout
and adapts to your device's preferred color scheme.

This repository holds two independent deployments:

| Deployment | Source | Audience |
| --- | --- | --- |
| `https://closedose.com/` | [`public/`](./public) | Parents and caregivers |
| `https://md.closedose.com/` | [`md/`](./md) | Clinicians |

The provider hub builds separately and does not read from or write to the
parent-facing site. See [md/README.md](./md/README.md) for its workspace layout,
release gating, and verification sequence.

## Adding a tool

Both sides are driven by a registry so a tool is declared in exactly one place.

**Parent-facing toolkit** — [`public/tools.registry.json`](./public/tools.registry.json)
generates the site menu that appears on every page and the tool card grid on the
home page:

1. Add the tool's page under `public/`.
2. Add a `nav` entry (menu link) and, if it should be promoted on the home page,
   a `cards` entry. If the new page carries the site menu, add it to `navPages`
   and paste the `<!-- generated:site-nav start -->` / `end` markers inside its
   `<nav class="menu-links">`.
3. Run `node scripts/sync-parent-tools.mjs`.
4. Run `node --test tests/parent-tools.test.mjs`.

**Provider hub** — [`md/tools.registry.json`](./md/tools.registry.json) generates
the workspace list, build and test scripts, the portal catalog, redirects, and
the route and governance tables. Adding a tool is one registry entry plus
`npm run new:tool -- <id>`. Clinical tools enter gated and stay out of production
builds until [`md/clinical-release-manifest.json`](./md/clinical-release-manifest.json)
records every required named approval. The full sequence is documented in
[md/README.md](./md/README.md#adding-a-tool).

Both registries are enforced in CI: `sync:tools:check` and
`sync-parent-tools.mjs --check` fail the build if a generated file drifts from
its registry, so a tool cannot be half-added.

## Repository consolidation

The tools that previously lived in separate repositories are consolidated here.
Import provenance is byte-pinned in [md/sources.json](./md/sources.json).

| Former repository | Now | Status |
| --- | --- | --- |
| `nsm0101/PIG-CAR` | [`md/apps/pig`](./md/apps/pig) | Consolidated, pinned at `ef67724` |
| `nsm0101/PIGCAR` | comparison-only source for PIG | Superseded, pinned at `c02d529` |
| `nsm0101/CC-RSI` | `md/apps/rsi`, `airway-scenarios`, `post-intubation`, `rsi-timeline`, `airway-transport` | Consolidated, pinned at `a309bda` |
| `nsm0101/CD` | [`public/`](./public) | Superseded by this repository's parent site |
| `nsm0101/FlowMaster` | [`md/apps/pmd`](./md/apps/pmd) | Production app consolidated; the pathway-navigator engine remains in development upstream and is deliberately not merged |

## Logo Files and License

This repository contains several CloseDose logo files in SVG and PNG formats. The logos are the intellectual property of Nickolas Mancini, MD, MBA and are provided solely for use with the CloseDose project. Redistribution or modification of the logo assets is prohibited without express permission. Please see LOGO_LICENSE.md for the full license.
