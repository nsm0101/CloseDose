# Task 5 Implementation Report: production assembly and CI

## Summary

Assembled the CloseDose MD portal and both clinical tools into one deterministic
Cloudflare Pages artifact. The production build starts by removing `md/dist/`,
then builds the portal at `/`, PIG at `/PIG/`, and RSI at `/RSI/` in that order.
It copies the Cloudflare routing and security controls plus a standalone 404 only
after all three application builds complete, then fails the build unless the
whole artifact passes its distribution contract.

Implementation commit:
`8c661ea9ba706ea09288a41b8b3cbac7de123f0b`
(`feat(md): assemble provider production artifact`)

Review remediation commit:
`f46307da34181b4a5e8fd67ca7207595c81ccbf0`
(`fix(md): narrow CSP and audit popup pages`)

## Files

- `md/scripts/build.mjs`: explicit clean, ordered application builds, static
  control-file copy, and final distribution validation.
- `md/static/_redirects`: permanent `/PIG` and `/RSI` trailing-slash redirects.
- `md/static/_headers`: CSP, browser safety controls, HTML revalidation, and
  immutable caching for content-hashed assets.
- `md/static/404.html` and `md/static/404.css`: local-only static not-found page
  with ordinary links to the provider index and both canonical tools.
- `md/DEPLOYMENT.md`: Cloudflare project boundary, build/output settings,
  security rationale, routes, approval gate, and rollback boundary.
- `md/tests/distribution-contract.test.mjs`: complete output-tree, canonical
  asset-root, redirect, CSP/security, caching, and static-404 contracts.
- `md/tests/serve-dist.mjs`: dependency-free local server that exercises the
  assembled redirect, header, caching, route, and 404 behavior.
- `md/playwright.config.mjs` and `md/tests/smoke/platform.spec.mjs`: Chromium
  smoke configuration and route/interaction/runtime audits.
- `md/package.json` and `md/package-lock.json`: aggregate CI commands and the
  single new test dependency, `@playwright/test@1.61.1`.
- `md/.gitignore`: ignores Playwright reports and test results.
- `.github/workflows/closedose-md.yml`: provider-platform-only CI.

No application source under `md/apps/pig/**` or `md/apps/rsi/**` was edited. No
parent deployment file under `public/**` was edited.

## Assembly and artifact contract

`npm run build` performs this exact sequence:

1. Recursively remove the resolved `md/dist/` path and recreate it empty.
2. Run `build:portal`, which emits the root portal and root assets.
3. Run `build:pig`, which clears and emits only `dist/PIG/`.
4. Run `build:rsi`, which clears and emits only `dist/RSI/`.
5. Copy `md/static/**` into the assembled root.
6. Run `npm run test:contract` and propagate any failure.

The final contract requires exactly these top-level entries:

```text
404.css
404.html
PIG/
RSI/
_headers
_redirects
assets/
index.html
```

It requires all three entry documents, extracts every HTML `src`, `href`, and
`srcset` URL, confirms every emitted application asset is content hashed, and
confirms each URL resolves inside the artifact under its canonical root. The
fresh final build emitted:

```text
portal: /assets/index-CkLp0srg.js and /assets/index-DenmGnEu.css
PIG:    /PIG/assets/index-DxXxtTqL.js and /PIG/assets/index-F-kfgR_d.css
RSI:    /RSI/assets/index-BmwLbh8t.js and /RSI/assets/index-DIxTnHfF.css
```

The portal also emitted three local Public Sans WOFF2 files, the verified local
mark, and the three responsive local clinical-image variants under `/assets/`.

## CSP and response controls

The deployed policy is:

```text
default-src 'self'; script-src 'self'; style-src 'self'; style-src-elem 'self'; style-src-attr 'unsafe-inline'; font-src 'self'; img-src 'self'; connect-src 'self'; frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; manifest-src 'self'; worker-src 'self'
```

Scripts do not allow inline execution or evaluation. Default, script, font,
image, and connection sources are same-origin only. No Google Fonts, Google
hosts, Gemini endpoints, arbitrary origins, data URLs, or blob URLs are allowed.
Frames, embedding, objects, base overrides, and form submission are disabled.

The only inline allowance is `style-src-attr 'unsafe-inline'`. The byte-pinned
RSI `ProgressionTracker` renders its timer progress bar with a React
`style={{ width: ... }}` attribute at runtime. `style-src 'self'` and
`style-src-elem 'self'` continue to block inline style elements. Browser probes
confirmed the real tracker width advances while an injected inline `<style>`
rule does not apply. No inline script exists, and no other directive contains
`'unsafe-inline'`.

Global response controls also include `nosniff`, `DENY` framing,
`strict-origin-when-cross-origin`, same-origin opener/resource policies, and a
Permissions Policy disabling camera, microphone, geolocation, motion sensors,
payment, serial, and USB capabilities. Canonical HTML and `404.html` use
`max-age=0, must-revalidate`; content-hashed assets use a one-year immutable
cache. This follows Cloudflare Pages' documented `_headers`, `_redirects`, and
custom 404 mechanisms:

- https://developers.cloudflare.com/pages/configuration/headers/
- https://developers.cloudflare.com/pages/configuration/redirects/
- https://developers.cloudflare.com/pages/configuration/serving-pages/

## Browser locators and clinical checks

The smoke suite uses source-backed visible roles and labels. No test ID or
clinical application change was added.

- Portal: role-based links containing `Pediatric Airway Reference Calculator`
  and `Pediatric Emergency RSI Reference and Calculator`; both ordinary anchors
  are clicked and land on their canonical uppercase trailing-slash routes.
- Mobile portal: Chromium viewport is exactly 320 by 800 CSS pixels. Both body
  and document scroll-width deltas must equal zero.
- PIG: visible age button `12y-14y`; existing patient profile and ETT card IDs;
  visible timer titles `Start Timer` and `Pause`.
- PIG clinical check: the selected profile shows `12 to 14 Years` and `48 kg`;
  its cuffed ETT target is `6.0-7.0` with `5.5` backup and `7.5` larger sizing.
- RSI: visible weight placeholder `Enter kg`; existing rocuronium card ID;
  role-based Scenario, Post-Sedation, Progression Tracker, and Transport buttons;
  visible workflow headings and timer buttons.
- RSI clinical check: entering `20` kg renders rocuronium `20.0 mg`.
- RSI workflow check: Hyperkalemia produces the visible critical alert,
  post-intubation sedation renders, the airway clock reaches a non-zero value
  and pauses, and the transport reference plus vasopressor category render.

The auditor records requests and failures on `BrowserContext`, attaches console
and uncaught-page-error listeners to every existing and newly created page, and
fails any unexpected popup. Every HTTP(S) request outside
`http://127.0.0.1:4173` must remain absent. A focused negative probe opens a
`localhost` popup and proves its navigation, assets, console error, and page
error all reach the context audit before `assertClean` rejects the popup.

## Exact local CI sequence

The final sequence was run from `md/` on Node `v25.9.0` and npm `11.12.1`. The
workflow uses the same commands on Node 22, which is the declared minimum.

```text
$ npm ci
added 93 packages; audited 97 packages; 0 vulnerabilities; exit 0

$ npm run typecheck
portal tsc --noEmit: exit 0
PIG tsc --noEmit: exit 0
RSI tsc --noEmit: exit 0
aggregate exit 0

$ npm run test:unit
tests 20; pass 20; fail 0; duration 296.430754 ms; exit 0

$ npm run build
portal: Vite 6.4.3, 35 modules, root HTML/assets emitted
PIG: Vite 6.4.3, 1673 modules, /PIG/ HTML/assets emitted
RSI: Vite 6.4.3, 1679 modules, /RSI/ HTML/assets emitted
embedded distribution contract: tests 5; pass 5; fail 0
exit 0

$ npm run test:contract
tests 5; pass 5; fail 0; duration 227.280882 ms; exit 0

$ npx playwright install --with-deps chromium
Chromium 149.0.7827.55 and headless shell installed on the first run;
final cached run exit 0

$ npm run test:smoke
tests 6; pass 6; fail 0; duration 11.4 s; exit 0

$ npx playwright test -g "CSP blocks|browser-context audit"
targeted negative probes 2; pass 2; fail 0; exit 0
```

The smoke tests served `md/dist/` through `node tests/serve-dist.mjs`. A separate
served response inspection confirmed:

```text
/                         200, CSP, nosniff, HTML revalidation
/PIG                      301 Location: /PIG/
/PIG/                     200, CSP, nosniff, HTML revalidation
/RSI                      301 Location: /RSI/
/RSI/                     200, CSP, nosniff, HTML revalidation
/missing                  404, CSP, nosniff, static not-found body
/assets/index-CkLp0srg.js 200, one-year immutable cache
```

## CI workflow

The workflow triggers only when `md/**` or its own workflow file changes. All
shell commands default to `md/`. It checks out the repository, selects Node 22
with the `md/package-lock.json` cache key, and runs the exact sequence above.
Chromium is installed with its Linux dependencies immediately before the smoke
suite. The job has a 15-minute timeout and cancels obsolete runs for the same
workflow and ref.

## Self-review

- `git diff --check` passed before the implementation commit.
- Fresh unit tests revalidated every byte-pinned PIG and RSI clinical source
  hash and the representative calculations before the browser run.
- The build script owns one resolved `md/dist/` target and does not use a glob,
  environment-resolved deletion target, or parent path.
- The distribution test proves later workspace builds did not erase earlier
  outputs and that all emitted entry URLs remain on the intended route.
- The 404 uses local CSS and contains no inline style or script.
- The production CSP ran in Chromium while the PIG timer and RSI progress/timer
  workflows were visible and interactive.
- Normal-flow context audit totals were zero console errors, zero page errors,
  zero failed requests, zero external requests, and zero unexpected pages.
- Negative probes prove inline style elements remain blocked and popup requests,
  console errors, page errors, and unexpected-page creation cannot escape the
  auditor.
- `public/**`, byte-pinned clinical source, and
  `.superpowers/sdd/progress.md` remain unchanged.
- Generated `dist/`, Playwright reports, and test results remain ignored and are
  not included in the implementation commit.
