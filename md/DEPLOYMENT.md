# CloseDose MD static deployment

Deploy this workspace as its own Cloudflare Pages project with `md/` as the
root, `npm run build` as the build command, and `dist/` as the output directory.
The build removes `dist/` explicitly, builds the portal first, then PIG and RSI,
and finally copies and validates the Cloudflare control files and static 404.
It never reads from or writes to the parent-facing `public/` deployment.

## Security policy

`static/_headers` applies one same-origin Content Security Policy to the whole
artifact. Scripts, fonts, images, connections, manifests, and workers are local
only. Inline scripts, external hosts, frames, objects, base overrides, and form
submissions are blocked.

The single exception is `style-src 'unsafe-inline'`. The imported RSI
`ProgressionTracker` uses React's `style={{ width: `${progress}%` }}` to render
the live timer progress width. React emits that value as an element style at
runtime, so removing this exception would break the preserved tracker under
CSP. No application contains inline script, and this exception must not be
expanded to `script-src` or any other directive.

Canonical HTML is revalidated on every request. Vite's content-hashed assets
under `/assets/`, `/PIG/assets/`, and `/RSI/assets/` are immutable for one year.

## Routes and rollback

- `/` serves the provider portal.
- `/PIG` redirects permanently to `/PIG/`.
- `/RSI` redirects permanently to `/RSI/`.
- Unknown paths return the static `404.html`; they never fall back to a clinical
  application.

Keep the existing CloseDose Pages project unchanged. Before attaching
`md.closedose.com`, verify the dedicated preview, obtain clinical approval, and
retain the prior successful Pages deployment as the rollback target.
