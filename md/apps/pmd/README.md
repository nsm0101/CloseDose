# PREtendingMD

This workspace contains the Vite, React 19, TypeScript, Firebase, and Tailwind
source for PREtendingMD PEM FlowMaster.

The provider-platform build publishes the app at
<https://md.closedose.com/PMD/>. The former
<https://closedose.com/PMD/> entry redirects here while preserving query
parameters and fragments.

## Build and deploy

Run the shared provider build:

```bash
cd md
npm ci
npm run build
```

This assembles the portal, PIG, RSI, and PREtendingMD into the ignored
`md/dist/` artifact. Cloudflare Pages publishes that artifact. This app's
`vite.config.ts` keeps the exact `/PMD/` route and writes to `md/dist/PMD/`.

For local development:

```bash
cd md
npm run dev --workspace @closedose-md/pmd
```

## Runtime boundary

PREtendingMD intentionally uses Firebase Authentication, Firestore real-time
sync, and browser storage for user settings. The provider portal distinguishes
this behavior from the local-only PIG and RSI calculators. The migrated app
does not load Google Analytics or any AI runtime.

`firebase-applet-config.json` contains the public Firebase web configuration.
Access is governed by `firestore.rules`.

## Brand assets

Runtime art is centralized in `src/lib/brand.ts` and resolves beneath Vite's
`/PMD/` base. Only optimized web images live in `public/images/`.
High-resolution masters live in `artwork/images/` and are not copied into the
deployment.

To regenerate optimized derivatives with Pillow installed:

```bash
python3 md/apps/pmd/scripts/optimize-brand-assets.py
```
