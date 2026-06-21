# PMD (PretendingMD / PEM FlowMaster) — source

This directory holds the **source** for the PretendingMD app. It is a
Vite + React 19 + TypeScript single-page app (Firebase realtime, Tailwind),
originally exported from Google AI Studio
(<https://ai.studio/apps/2f1b1ed6-35b2-4162-bac6-1fbc2d599b35>).

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
```

Key configuration:

- `vite.config.ts` sets `base: '/PMD/'` so all assets resolve under the
  `/PMD/` sub-path rather than the domain root.
- Logo references use `import.meta.env.BASE_URL` (in `.tsx`) or the absolute
  `/PMD/...` path (in `index.html`) so they resolve under `/PMD/`.

## Run locally

```bash
npm install
npm run dev
```

## Notes

- **Images:** the app only references `public/images/PREtendingMD_icon.png`.
  The deployed `../public/PMD/images/` was slimmed to just that file; the other
  branding PNGs are kept here in `public/images/` but are large (3–5 MB each)
  and should be optimized before being wired into the UI.
- **Firebase:** `firebase-applet-config.json` holds the web config. The web
  `apiKey` is public by design; access is governed by `firestore.rules`.
- `server.ts` is the AI Studio local dev server and is **not** used for static
  hosting on GitHub Pages.
- No Gemini API key is required to build; the source does not call the Gemini API.
