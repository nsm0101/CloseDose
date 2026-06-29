# PMD (PretendingMD)

This directory holds the **source** for the PretendingMD app. It is a
Vite + React 19 + TypeScript single-page app (Firebase realtime, Tailwind)

The **built, deployed** site lives in [`../public/PMD/`](../public/PMD) and is
served at <https://closedose.com/PMD/> (the site is published from the repo's
`public/` directory, which holds the `closedose.com` CNAME).

> `../public/PMD/` is generated output — do not edit it by hand. Change the
> source here and rebuild.

## Build & deploy

```bash
cd pmd
npm install
npm run build          # outputs to pmd/dist/
# copy the build into the deployed folder:
rm -rf ../public/PMD && mkdir -p ../public/PMD
cp -r dist/. ../public/PMD/
# Keep the deploy slim: strip the multi-MB master art that Vite copies from
# public/images. Only the optimized, web-sized assets are actually referenced.
cd ../public/PMD/images && rm -f \
  BearNoScope_shadow.png Bear_Scope_sticker.png Bearhead.png \
  Bearhead_2048icon.png "Bearhead_sticker icon.png" Bearhead_sticker.png \
  PREtendingMD_icon.png PREtendingMD_iosMASTER.png Wordmark.png
```

Key configuration:

- `vite.config.ts` sets `base: '/PMD/'` so all assets resolve under the
  `/PMD/` sub-path rather than the domain root.
- Brand assets are centralized in `src/lib/brand.ts` (the `BRAND` map), which
  builds paths from `import.meta.env.BASE_URL`. `index.html` and
  `manifest.webmanifest` use absolute `/PMD/...` paths. All resolve under
  `/PMD/`.

## Run locally

```bash
npm install
npm run dev
```

## Notes

- **Branding:** the hand-drawn "stuffed bear doctor" is the mascot and
  identifying visual, used throughout the UI (splash, landing, login, header,
  loading, join, settings) plus the favicon / PWA icon set. High-res master
  art (3–5 MB each) lives in `public/images/`; optimized, web-sized
  derivatives are generated from those masters and committed alongside them:
  - `bear-mascot.png` — full doctor bear w/ stethoscope (transparent)
  - `bear-head.png` — clean bear-head mark (transparent)
  - `wordmark.png` — rainbow "PREtendingMD" wordmark (transparent)
  - `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`,
    `icon-maskable-512.png` — favicon / PWA install icons (from the app tile)

  To regenerate the derivatives after editing a master, re-run the resize/
  optimize step (Pillow: tight-crop to the alpha bbox, LANCZOS downscale,
  256-color quantize for the transparent art). The masters are stripped from
  the deployed folder (see the build step above) so only these slim assets ship.
- **Firebase:** `firebase-applet-config.json` holds the web config. The web
  `apiKey` is public by design; access is governed by `firestore.rules`.
