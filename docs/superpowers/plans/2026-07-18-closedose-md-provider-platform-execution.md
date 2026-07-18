# CloseDose MD Provider Platform Execution Plan

> This is the binding implementation brief for the subagent-driven build. It supersedes conflicting portal styling examples in `2026-07-18-closedose-md-provider-platform.md` while retaining that document's routing, provenance, testing, and deployment detail.

**Goal:** Ship a provider-focused CloseDose hub at `md.closedose.com`, with the PIG tool at `/PIG/` and the RSI tool at `/RSI/`, as independently testable applications that can later converge on a shared clinical core.

**Architecture:** Add an isolated `md/` npm workspace to the CloseDose repository. Build the portal, PIG, and RSI applications into one static `md/dist/` artifact. Deploy that artifact as a dedicated Cloudflare Pages project and attach `md.closedose.com` only after the Pages preview passes clinical interaction checks.

**Non-negotiable clinical constraints:** Version 1 is client-only. It must not collect, persist, transmit, or log patient identifiers. It must not include an AI/Gemini runtime, an Express server, API-key plumbing, analytics, or unneeded network calls. Existing calculation behavior must be preserved unless a failing test proves a repair is necessary. Every screen must clearly identify the software as decision support and direct providers to verify institutional protocols.

**Design direction:** Use the CloseDose teal identity, but make the MD property restrained, precise, and clinically focused. Keep a single teal accent, editorial typography, deliberate spacing, minimal motion, high contrast, and an explicit light/dark token system. Use the existing CloseDose brand asset rather than a hand-drawn replacement. Self-host fonts and all imagery. Do not use external font imports, playful illustration, decorative gradients, fake dashboards, purple AI styling, or oversized pill-shaped UI. Visible copy must not contain em dashes or en dashes.

---

## Task 1: Create the MD workspace and source provenance

**Files:** Create `md/package.json`, `md/.gitignore`, `md/sources.json`, `md/README.md`, and initial contract tests under `md/tests/`.

**Requirements:**

- Define npm workspaces for `apps/portal`, `apps/pig`, and `apps/rsi`.
- Pin the imported source repositories and commits in `md/sources.json`:
  - `nsm0101/PIG-CAR` at `ef67724eccc4e0cfb8b291871147fdd22b9fa811`
  - `nsm0101/PIGCAR` comparison at `c02d529d63d69798d081178b5537913392304541`
  - `nsm0101/CC-RSI` at `a309bdaa7b7736051753a852b274b295ae00c67d`
- Document `/`, `/PIG/`, and `/RSI/` as the canonical routes.
- Add tests that fail until all three workspace packages and route bases exist.
- Keep all MD work isolated from the existing parent-facing `public/` site.

**Verification:** Run the workspace contract tests and validate `sources.json` with `jq empty`.

---

## Task 2: Import and repair PIG-CAR

**Files:** Create `md/apps/pig/` from the pinned `PIG-CAR` source and add any package, entrypoint, configuration, and test files needed for a deterministic Vite build.

**Requirements:**

- Preserve the existing PIG-CAR clinical logic and visible workflow.
- Repair the missing `src/main.tsx` entrypoint and missing runtime/build dependencies.
- Configure Vite with base `/PIG/`.
- Do not add a server, AI SDK, API key, analytics, or persistence.
- Capture the `PIGCAR` alternate as provenance only. Do not silently mix the alternate ETT/equipment presentation into the canonical tool.
- Add focused tests for package integrity, the `/PIG/` base, and at least one representative calculation path available from the current source.

**Verification:** Install from the `md/` root, run PIG typecheck/tests, and build to a standalone artifact that loads under `/PIG/`.

---

## Task 3: Import RSI and remove unused AI Studio/server dependencies

**Files:** Create `md/apps/rsi/` from the pinned `CC-RSI` source, then simplify its package and configuration to the static browser application it actually is.

**Requirements:**

- Preserve the existing RSI calculation behavior and visible workflow.
- Configure Vite with base `/RSI/`.
- Remove unused AI Studio and server dependencies, including `@google/genai`, `express`, `dotenv`, `tsx`, and server-only type packages when source evidence confirms they are unused.
- Remove AI Studio metadata, environment-variable exposure, and any API-key configuration not required by the application.
- Do not add new outbound requests, backend code, analytics, storage, or patient-data capture.
- Add tests that prevent the removed packages and API-key plumbing from returning.
- Add a representative RSI calculation assertion, including a 20 kg rocuronium result if the imported clinical constants support it.

**Verification:** Run RSI typecheck/tests, inspect the dependency tree for removed packages, search the final source for Gemini/API-key/server references, and build under `/RSI/`.

---

## Task 4: Design and build the clinician landing hub

**Files:** Create `md/apps/portal/` and its local brand, font, and image assets.

**Experience:** The page is the front door for a clinician arriving between cases. It should communicate trust, speed, and scope in one viewport, then provide clear access to the tools and concise information about how the platform is intended to be used.

**Required content and structure:**

- One-line navigation no taller than 80 px with the existing CloseDose mark, `CloseDose MD`, a compact `Provider tools` context label, and a clear tools link.
- A split editorial hero with a short two-line maximum headline, supporting copy of no more than 20 words, a primary `View provider tools` action, and a real locally hosted clinical image. The image must be decorative/contextual, not a fake product interface.
- A high-clarity tools section generated from a typed catalog. Each available tool must have a title, concise scope statement, status, and ordinary anchor link to `/PIG/` or `/RSI/`.
- An information section that explains version 1 boundaries: local browser calculation, no patient identifiers, no AI runtime, and verification against institutional protocols.
- A calm footer with provider-use context and the current product boundary.
- Avoid invented regulatory approvals, accuracy claims, outcome claims, testimonials, hospital affiliations, and fabricated metrics.

**Visual system:**

- Carry forward the verified CloseDose teal and logo assets, with neutral ink, warm clinical paper, and a deep desaturated dark mode.
- Use one self-hosted professional sans family plus a restrained mono or label treatment if it improves hierarchy. No remote font requests.
- Use a consistent modest corner radius, bordered surfaces, asymmetric editorial spacing, and one teal accent.
- Do not use gradients, glassmorphism, excessive rounded cards, hand-drawn icons, or playful pediatric motifs.
- Support `prefers-color-scheme: dark` with token parity and WCAG AA contrast.
- Motion intensity is low: CSS hover/focus feedback only, with `prefers-reduced-motion` respected.

**Verification:** Test typed catalog routes, keyboard navigation, visible focus, light and dark rendering, 320 px through wide desktop layouts, absence of remote asset requests, and a portal production build.

---

## Task 5: Assemble production routing, safety headers, and CI

**Files:** Add the production assembly script, Cloudflare `_redirects` and `_headers`, a useful static `404.html`, Playwright smoke tests, and a focused GitHub Actions workflow.

**Requirements:**

- Assemble `portal` at `/`, PIG at `/PIG/`, and RSI at `/RSI/` without rewriting application asset URLs.
- Redirect `/PIG` to `/PIG/` and `/RSI` to `/RSI/`.
- Use a strict static-site CSP that permits only locally hosted scripts, styles, fonts, and images. Do not allow Google Fonts, Gemini endpoints, arbitrary connections, framing, or inline scripts.
- Add browser smoke tests for portal navigation, PIG age selection/calculation, RSI 20 kg rocuronium output, timers/tabs where present, trailing-slash routes, mobile width, and console errors.
- CI must install with `npm ci`, typecheck, test, build, and execute the browser smoke suite from `md/` only.

**Verification:** Run the exact CI sequence locally, inspect the assembled directory, and serve the static artifact for browser verification.

---

## Task 6: Whole-branch review and deployment

**Requirements:**

- Run an independent whole-branch review against this execution plan and the architecture decision record.
- Resolve all Critical and Important findings, then repeat the relevant tests.
- Verify desktop/mobile and light/dark portal states visually, plus representative PIG and RSI interactions.
- Push the feature branch, open a pull request, and require CI to pass before merge.
- Create or update the dedicated Cloudflare Pages project with root `md` and output `dist`.
- Verify the generated `*.pages.dev` deployment before attaching `md.closedose.com`.
- Attach and verify `md.closedose.com`, `/PIG/`, and `/RSI/` only after the preview is approved.

**Definition of done:** The hostname and all three canonical routes return successful responses, local assets load without external dependencies, representative clinical interactions pass, the browser console is clean, and DNS/TLS are healthy.
