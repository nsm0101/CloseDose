# Task 6 Implementation Report: release hardening

## Summary

Resolved all three Important findings and all four practical Minor findings in
`final-review.md` without editing `public/**`, the byte-pinned PIG application,
the byte-pinned RSI clinical/workflow source, or
`.superpowers/sdd/progress.md`. No deployment, push, pull request, DNS, or
Cloudflare mutation was performed.

Implementation commits:

- `4413344978f1cf0e65e783d17d3fbbd0d7e4ff39`
  (`fix(md): harden provider release gate`)
- `2229abd80f72170af5042ea70353da336371d43b`
  (`test(md): enforce exact runtime request allowlist`)

Current branch range after implementation:
`19b4a454fa66a5a1acd42f85c8773c9bc74a51cf..2229abd80f72170af5042ea70353da336371d43b`

## Review findings and resolutions

### Important

1. **Workflow trust boundary:** `.github/workflows/closedose-md.yml` now has
   `permissions: contents: read`; checkout has `persist-credentials: false`;
   checkout and setup-node use full immutable SHAs with release comments. A
   focused test prevents mutable v4 tags or missing controls from returning.
2. **Deployed-target smoke mode:** one target resolver supplies both Playwright
   config and the smoke spec. `CLOSEDOSE_MD_BASE_URL` accepts only a root
   HTTP(S) URL, derives the expected origin, and omits `webServer` when set.
   `DEPLOYMENT.md` contains exact preview and production commands and gates.
3. **Privacy regression boundary:** one shared scanner is used by portal, PIG,
   and RSI tests. It covers fetch, XHR, WebSocket, EventSource, sendBeacon,
   Axios, local/session storage, IndexedDB, cookie APIs, analytics SDK/marker
   APIs, external URLs/assets, environment/API-key plumbing, and identifier
   fields/plumbing. A focused test proves the portal's explanatory privacy copy
   is not a false positive. The BrowserContext audit now allows only GET
   canonical documents and exact emitted artifact paths with matching resource
   types. It rejects external origins, same-origin query strings, bodies,
   non-GET traffic, and unexpected paths/types.

### Minor

1. The smoke suite explicitly requires `/pig`, `/pig/`, `/rsi`, and `/rsi/` to
   return the provider 404. The local server now resolves every path component
   case-sensitively rather than hard-coding these variants, including on macOS.
2. `md/README.md` now describes the assembled release, full clean CI sequence,
   boundaries, casing, and deployment-runbook link.
3. Task 1 through 5 tracked implementation reports now cite reachable
   post-rebase commits. Ignored local review reports label old ranges as
   pre-rebase and list current equivalents; they remain uncommitted by policy.
4. `/404.css` has explicit revalidation in `_headers`; both the distribution
   contract and served Chromium checks enforce it.

## Official action-pin evidence

Fresh official-repository reads on 2026-07-18:

```text
$ git ls-remote --tags https://github.com/actions/checkout.git 'refs/tags/v4*'
34e114876b0b11c390a56381ad16ebd13914f8d5 refs/tags/v4
34e114876b0b11c390a56381ad16ebd13914f8d5 refs/tags/v4.3.1

$ git ls-remote --tags https://github.com/actions/setup-node.git 'refs/tags/v4*'
49933ea5288caeca8642d1e84afbd3f7d6820020 refs/tags/v4
49933ea5288caeca8642d1e84afbd3f7d6820020 refs/tags/v4.4.0
```

The workflow pins exactly those SHAs and records `v4.3.1` and `v4.4.0` in
comments for review tooling.

## Post-rebase provenance repair

The current equivalents were taken from
`git log --format='%H %s' --reverse origin/main..HEAD`, not fabricated ranges:

| Report | Role | Current reachable commit |
| --- | --- | --- |
| Task 1 | implementation | `1267822208beed6f2fd9a5b2e52e5580f797554e` |
| Task 2 | implementation | `7303d0beaaf800148c5e1b5fdcd295d31da53d2e` |
| Task 2 | review fix | `4433594b2219c4137120adbfb45d21bd6831e6e9` |
| Task 3 | implementation | `c5b42845ebe923d6abed9b345623135fbddd45a9` |
| Task 3 | review fix | `fe5db4eee3aa6f193abc744c558a2f669e6eb9f6` |
| Task 4 | implementation | `5bc23fba678f7f836b29ecb8eb42a98e49be1567` |
| Task 4 | review fix | `8f56c3ad9c1eacf81d3547b4f10a459dc4b92c88` |
| Task 5 | implementation | `8c661ea9ba706ea09288a41b8b3cbac7de123f0b` |
| Task 5 | review fix | `f46307da34181b4a5e8fd67ca7207595c81ccbf0` |

The supplied final-review package remains the canonical reviewed pre-hardening
range `19b4a454..ddc4c844`; this task adds the focused hardening commit above.

## Verification

Focused checks before the final clean run:

```text
npm run test:unit: 26 passed, 0 failed
npm run build: all three Vite builds and embedded contract passed
npm run test:contract: 5 passed, 0 failed
npm run test:smoke: 7 passed, 0 failed
CLOSEDOSE_MD_BASE_URL=http://127.0.0.1:4173 npm run test:smoke
  with separately started serve-dist.mjs: 7 passed, 0 failed
git diff --check: exit 0
```

The external-target run confirmed Playwright did not start its own web server.
It used the separately managed local artifact because deployment was explicitly
out of scope; the documented Pages and production commands remain go-live
gates, not claimed live results.

Final Node 22 gate used Node `v22.23.1` and a clean `npm ci`, then ran the CI
sequence in order:

```text
npm ci: 93 packages installed, 0 vulnerabilities
npm run typecheck: portal, PIG, RSI passed
npm run test:unit: 26 passed, 0 failed
npm run build: portal, PIG, RSI and embedded contract passed
npm run test:contract: 5 passed, 0 failed
Playwright Chromium install: passed
npm run test:smoke: 7 passed, 0 failed
```

Launcher caveat: the first Node 22 wrapper inherited the outer npm-exec
`npm_config_call` and `npm_config_package` values, so the nested `npx
playwright install` stopped with npm `EUSAGE` before invoking Playwright. No
application check failed. Unsetting only those wrapper variables for the
install command fixed the harness; the corrected full Node 22 sequence exited
0, and a fresh corrected Node 22 smoke run independently reported 7 of 7
passing.

Final scope checks found no diff in `public/**`,
`md/apps/pig/src/App.tsx`, `md/apps/rsi/src/**`, or
`.superpowers/sdd/progress.md`.

## Final re-review remediation

The follow-up replaced the hash-shaped asset matcher with an exact allowlist
derived deterministically from the current assembled `md/dist`: canonical
documents plus actual emitted non-control files mapped to Playwright resource
types. Physical entry aliases and Cloudflare control files are excluded, and
an unknown emitted extension fails suite startup. Polled negative probes now
cover unexpected same-origin GET paths, a known exact script fetched with the
wrong `fetch` resource type, and an external request fulfilled through
Playwright routing without a failed navigation. Query, method, body, popup,
console-error, and page-error probes remain.

Final evidence:

```text
focused auditor repeat: 25/25 passed; post-format repeat: 15/15 passed
full local smoke: 10/10 passed
external-target smoke with separately managed server: 10/10 passed
Node 22.23.1 clean gate: 3 typechecks, 26/26 unit, 3 builds,
  5/5 contract, Chromium install, and 10/10 smoke passed
git diff --check: exit 0
```
