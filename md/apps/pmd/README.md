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

PREtendingMD uses verified Google identities, an administrator-managed
workspace allowlist, per-shift membership, Firestore real-time sync, and
browser storage for user settings. Patient and operational fields are
persisted in Firestore; they are not local-only. The provider portal
distinguishes this behavior from the local-only PIG and RSI calculators. The
migrated app does not load Google Analytics or any AI runtime.

`firebase-applet-config.json` contains the public Firebase web configuration.
Access is governed by `firestore.rules`. Anonymous identities are rejected.
New verified users create an unapproved profile and remain signed out until an
administrator marks that profile approved. Session codes create explicit shift
membership rather than exposing all shifts to every authenticated identity.
New codes are generated with Web Crypto, expire after 12 hours, and support
administrator revocation.
Run `npm run test:rules` from `md/` to exercise these guarantees against the
Firestore emulator. Deploy the rules to the named database before publishing a
new PMD client. The explicit, export-gated legacy migration is documented in
the shared `DEPLOYMENT.md`; the browser never rewrites legacy shifts
automatically.

## Brand assets

Runtime art is centralized in `src/lib/brand.ts` and resolves beneath Vite's
`/PMD/` base. Only optimized web images live in `public/images/`.
High-resolution masters live in `artwork/images/` and are not copied into the
deployment.

To regenerate optimized derivatives with Pillow installed:

```bash
python3 md/apps/pmd/scripts/optimize-brand-assets.py
```
