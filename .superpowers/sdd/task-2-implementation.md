# Task 2 Implementation Report: PIG-CAR import and repair

## Summary

Imported the canonical Pediatric Airway Reference application from the pinned
private `PIG-CAR` source and repaired its incomplete browser scaffold. The PIG
workspace now has a deterministic static React, TypeScript, Tailwind, and Vite
build at the canonical `/PIG/` base without changing the imported clinical
application source or mixing in the alternate `PIGCAR` equipment presentation.

## Provenance

- Primary source: `nsm0101/PIG-CAR`
- Pinned commit: `ef67724eccc4e0cfb8b291871147fdd22b9fa811`
- Comparison-only source retained in `md/sources.json`:
  `nsm0101/PIGCAR@c02d529d63d69798d081178b5537913392304541`
- Imported `src/App.tsx` Git blob:
  `42efd698593c05bdc826388007fc9229f0e8c9f4`
- Imported `src/App.tsx` SHA-256:
  `279effee8f08517cdf5d46405b29d7512601dddde5ada3f8ac376fb47c07523c`

The Git blob for `md/apps/pig/src/App.tsx` matches the connector-fetched blob
exactly, so the clinical application is byte-for-byte identical to the pinned
primary source. The pinned `.gitignore`, `README.md`, `package.json`, and
`vite.config.ts` were also inspected. The upstream package lacked React and
Lucide dependencies, and its Vite config exposed unused Gemini environment
variables, so those broken scaffold files were not copied into the runtime.

## Changed files

- `.gitattributes`: exempts only the exact pinned App and HTML snapshots from
  whitespace normalization/checks so their upstream Git blobs remain intact.
- `md/package.json`: adds focused PIG build, typecheck, and test commands.
- `md/package-lock.json`: records the installed workspace dependency graph.
- `md/apps/pig/index.html`: exact pinned HTML entry document.
- `md/apps/pig/metadata.json`: exact pinned source metadata; it is not imported
  by application code or emitted into the Vite build.
- `md/apps/pig/tsconfig.json`: pinned TypeScript compiler configuration.
- `md/apps/pig/src/App.tsx`: exact pinned primary clinical application source.
- `md/apps/pig/src/main.tsx`: missing React DOM entrypoint.
- `md/apps/pig/src/index.css`: local Tailwind entry and existing animation
  support using system font stacks and no remote assets.
- `md/apps/pig/package.json`: static runtime/build dependencies and commands.
- `md/apps/pig/vite.config.ts`: React and Tailwind plugins, `/PIG/` base, and
  `md/dist/PIG/` output.
- `md/tests/pig.test.mjs`: package, route/base, source-integrity,
  no-network/persistence, and representative ranged-ETT calculation tests.

## Verification

Initial red test from `md/` before the source and scaffold were added:

```text
$ node --test tests/pig.test.mjs
exit status: 1
tests: 4
pass: 0
fail: 4
failures: missing package module config, vite.config.ts, and src/App.tsx
```

Dependency installation from `md/`:

```text
$ npm install
Node: v25.9.0
npm: 11.12.1
added: 87 packages
audited: 91 packages
vulnerabilities: 0
exit status: 0

$ npm ci
added: 88 packages
audited: 92 packages
vulnerabilities: 0
exit status: 0
```

Fresh Task 2 verification after the clean install:

```text
$ npm run typecheck:pig
tsc --noEmit
exit status: 0

$ npm run test:pig
tests: 4
pass: 4
fail: 0
exit status: 0

$ npm run test:contract
tests: 3
pass: 3
fail: 0
exit status: 0

$ npm run build:pig
Vite: 6.4.3
modules transformed: 1673
dist/PIG/index.html: 0.46 kB
dist/PIG/assets/index-F-kfgR_d.css: 35.38 kB
dist/PIG/assets/index-DxXxtTqL.js: 257.56 kB
exit status: 0
```

Built route and asset inspection:

```text
HTML asset paths:
src="/PIG/assets/index-DxXxtTqL.js"
href="/PIG/assets/index-F-kfgR_d.css"

Local static preview:
/PIG/: HTTP 200
/PIG/assets/index-DxXxtTqL.js: HTTP 200
/PIG/assets/index-F-kfgR_d.css: HTTP 200

Forbidden runtime/package scan: no matches
git diff --check: exit status 0
public/ diff: none
.superpowers/sdd/progress.md diff: none
```

## Commit

Implementation commit: `e9be4c71399272ff6b037920493a3102356bab18`
(`feat(md): add PIG provider tool`)

## Self-review

- `src/App.tsx` is byte-for-byte identical to the primary pinned source, and
  its exact hash is enforced by an automated test.
- The comparison-only `PIGCAR` ETT/equipment rendering was not imported.
- The representative test executes the imported `getEttBackupSizes` function
  directly and confirms `6.0-7.0` produces `5.5` and `7.5`; it does not copy or
  invent clinical constants.
- Runtime dependencies are limited to React, React DOM, and Lucide. Build-only
  dependencies are limited to TypeScript, Vite, React/Tailwind plugins, and
  required type packages.
- The runtime package, Vite config, entrypoint, and clinical source contain no
  server, Gemini/API-key plumbing, analytics, persistence, remote font import,
  or application-level outbound request.
- The exact upstream metadata still contains its legacy AI Studio capability
  label, but it is inert source metadata and is not referenced or emitted by
  the static application build.
- Existing `public/` content and `.superpowers/sdd/progress.md` were not
  modified.
