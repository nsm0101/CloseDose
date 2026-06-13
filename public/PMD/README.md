# PMD (PretendingMD)

This folder hosts the **PretendingMD** webapp, served at `https://closedose.com/PMD/`.

The site is published from the repository's `public/` directory (which holds the
`closedose.com` CNAME), so everything that should appear under `closedose.com/PMD`
belongs in `public/PMD/`.

## Status

Placeholder scaffold. The actual PretendingMD application files are added from a
local session (the source lives on the author's machine and is not reachable from
the cloud build environment).

## Sub-path hosting note

Because the app is served from the `/PMD/` sub-path rather than the domain root,
asset and link references must resolve correctly under `/PMD/`:

- Prefer **relative** paths, **or** add `<base href="/PMD/">` to each HTML page's `<head>`.
- Audit absolute references that start with `/` (in `src`, `href`, `fetch`, `import`,
  and CSS `url()`) — they resolve against `closedose.com/` and will 404.
- For build-based apps (Vite/React/Next/etc.), set the public/base path to `/PMD/`
  and commit the **built output**, not the raw source.
