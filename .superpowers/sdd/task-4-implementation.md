# Task 4 Implementation Report: clinician landing hub

## Summary

Built the CloseDose MD provider portal as an isolated React, TypeScript, and
Vite workspace at `/`. The landing page presents the PIG and RSI applications
through ordinary links generated from a typed catalog, states the current
clinical and privacy boundaries, and keeps every runtime asset local.

Implementation commit: `5bc23fba678f7f836b29ecb8eb42a98e49be1567`
(`feat(md): add clinician provider portal`)

Review remediation commit: `8f56c3ad9c1eacf81d3547b4f10a459dc4b92c88`
(`fix(md): optimize portal hero delivery`)

## Design decisions

- Design read: greenfield clinician landing hub for time-pressed providers,
  using a trust-first editorial language and native CSS rather than a product
  UI design system.
- Dials: `DESIGN_VARIANCE 4`, `MOTION_INTENSITY 3`, and `VISUAL_DENSITY 4`.
- The split hero uses one clinical photograph as editorial context. It is not
  presented as an interface or product screenshot. A responsive `picture`
  prevents mobile layouts from requesting the full-resolution image.
- The verified CloseDose teal family is the only accent. `#18a78d` appears as
  the quiet brand thread, while darker and lighter tonal variants provide
  accessible action contrast in light and dark mode.
- Public Sans Variable is bundled through the OFL-1.1 licensed
  `@fontsource-variable/public-sans` package. There are no remote font, image,
  stylesheet, analytics, or API requests.
- Light mode uses warm clinical paper tokens. Dark mode uses one deep,
  desaturated surface family through `prefers-color-scheme` with matching
  hierarchy and contrast. Browser theme colors use matching light and dark
  media-qualified metadata.
- Media and interactive surfaces use a consistent 10 px radius. Structural
  catalog and boundary rows stay square because their borders organize content
  rather than imply elevated cards.
- Motion is limited to hover, active, and focus feedback. Reduced-motion mode
  removes transitions and smooth scrolling.
- Visible copy contains no em dash or en dash characters and makes no
  regulatory, accuracy, affiliation, or outcome claims.

## Asset provenance

- CloseDose mark source:
  `public/images/logo-teal.png`
- Portal copy:
  `md/apps/portal/src/assets/closedose-mark-teal.png`
- Mark SHA-256:
  `a9736e0d0ddfaaa81731e7bcfa36f8c2575bf0a0462f30f5c75f13a86a657d86`
- Generated hero source:
  `/Users/nsm/.codex/generated_images/019f7629-bb8d-7a60-8ba3-3e2f6934b00a/exec-ea1253f6-c34f-48b7-a5c5-a53236e0440d.png`
- Responsive hero assets:
  - `clinical-preparation-room-640.webp`: 640 by 401, quality 78, 18,886
    bytes, SHA-256
    `9e053a4c5aba5d2d76bfbc84bd477f8ef0fb230c92179ef097245f41cb8df282`
  - `clinical-preparation-room-960.webp`: 960 by 601, quality 80, 35,218
    bytes, SHA-256
    `31e46d23e8edc3b08d27abb8fd062a657d45df55fe499f8c3acde022f8129ffb`
  - `clinical-preparation-room.webp`: 1586 by 992, quality 82, 90,794 bytes,
    SHA-256
    `e1c522f434e28bfb605f42f834f536d3b639df9157f497055b38cf6a6742be4e`
- Each variant was encoded from the original PNG with `cwebp`, `-sharp_yuv`,
  maximum method and pass settings, and metadata removal. The `picture`
  element restricts viewports below 768 px to the 640w and 960w sources.

## Files

- `md/apps/portal/src/App.tsx`: semantic navigation, split hero, catalog,
  product boundaries, and provider footer.
- `md/apps/portal/src/toolCatalog.ts`: typed PIG and RSI route catalog.
- `md/apps/portal/src/index.css`: responsive light and dark token system,
  keyboard focus, motion policy, and layout.
- `md/apps/portal/src/main.tsx` and `index.html`: local font and React entry.
- `md/apps/portal/src/assets/*`: portal-owned mark and hero photograph.
- `md/apps/portal/package.json`, `tsconfig.json`, and `vite.config.ts`: isolated
  package, typecheck, and root output configuration.
- `md/tests/portal.test.mjs`: catalog, copy, asset, theme, focus, responsive,
  contrast, local-resource, and forbidden-character checks.
- `md/package.json` and `md/package-lock.json`: root portal commands and pinned
  dependency graph.

## Verification

Initial red run before the application scaffold:

```text
$ node --test tests/portal.test.mjs
tests: 6
pass: 0
fail: 6
```

Fresh final sequence from `md/` before the implementation commit:

```text
$ npm run test:portal
tests: 6
pass: 6
fail: 0

$ npm run typecheck:portal
tsc --noEmit
exit status: 0

$ npm run build:portal
Vite 6.4.3
modules transformed: 35
dist/index.html: 0.86 kB
dist/assets/clinical-preparation-room-640-HaRG9kBS.webp: 18.89 kB
dist/assets/clinical-preparation-room-960-CxeMpPgQ.webp: 35.22 kB
dist/assets/clinical-preparation-room-Cuk-_Ytp.webp: 90.79 kB
dist/assets/index-DenmGnEu.css: 8.33 kB
dist/assets/index-CkLp0srg.js: 198.87 kB
exit status: 0

$ npm run test:contract
tests: 3
pass: 3
fail: 0

$ git diff --check
exit status: 0
```

Review remediation preview checks at `http://127.0.0.1:4177/`:

```text
GET / -> 200 text/html
GET built 640w hero -> 200 image/webp, 18,886 bytes
GET built 960w hero -> 200 image/webp, 35,218 bytes
GET built 1586w hero -> 200 image/webp, 90,794 bytes
```

The browser rendered the generated WebP hero, listed only same-origin page
assets, and reported no console warnings or errors. At the desktop viewport of
1780 by 922, navigation measured 72 px and the primary action ended at 642 px,
inside the initial viewport. The heading rendered as the intended two lines.
The connected browser enforced a 400 px minimum when asked for 320 px, where
the page still had no horizontal overflow. The CSS explicitly supports a 320 px
minimum and the test suite locks the mobile breakpoint; exact 320 px visual QA
remains part of the whole-branch browser pass.

## Self-review

- The catalog routes are exactly `/PIG/` and `/RSI/`, with uppercase casing and
  trailing slashes.
- Hero lede length is 10 words and the desktop headline is two lines. The CTA
  is visible in the initial desktop viewport.
- Navigation is one line and below the 80 px maximum.
- Local asset inspection found no page-owned external requests. Vite includes
  its same-origin module preload helper, and React includes an inert error-help
  URL string; neither creates an application request during normal rendering.
- Button and body contrast pairs meet or exceed WCAG AA. Focus is visibly
  outlined, dark tokens retain hierarchy, and reduced motion is respected.
- The page has no gradients, glass treatment, purple, fake interfaces,
  excessive pills, playful motifs, or decorative icons.
- `public/**`, `md/apps/pig/**`, `md/apps/rsi/**`, and
  `.superpowers/sdd/progress.md` were not changed.
