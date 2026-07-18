# Task 3 Implementation Report: RSI import and scaffold sanitization

## Summary

Imported the Pediatric Emergency RSI application from the pinned private
`CC-RSI` source, preserving the clinical calculations and workflow source
byte-for-byte. The RSI workspace is now a static React, TypeScript, Tailwind,
and Vite application at `/RSI/`, with its unused AI Studio, API-key, server,
environment, analytics, persistence, and remote-font surfaces removed.

## Provenance

- Source: `nsm0101/CC-RSI`
- Pinned commit: `a309bdaa7b7736051753a852b274b295ae00c67d`
- Implementation commit:
  `3a53d0441052609a38725b3fff5a9811c4f4a99f`
- Review-fix commit:
  `e2bade73f0db07216848e4b846679c89b346150c`

The GitHub App was used to enumerate all 19 files at the pinned commit before
import:

```text
.env.example
.gitignore
README.md
assets/.aistudio/.gitignore
index.html
metadata.json
package.json
src/App.tsx
src/components/DosingCalculator.tsx
src/components/ProgressionTracker.tsx
src/components/ScenarioGuide.tsx
src/components/SedationReference.tsx
src/components/TransportKit.tsx
src/data/rsiData.ts
src/index.css
src/main.tsx
src/types.ts
tsconfig.json
vite.config.ts
```

The application source imports only React, React DOM, Lucide, and Tailwind.
It does not consume `@google/genai`, Express, dotenv, Motion, tsx, Node or
Express types, environment variables, or API keys.

### Byte-pinned clinical files

| File | Upstream Git blob | SHA-256 |
| --- | --- | --- |
| `src/App.tsx` | `0adf953b2add70c3744cc2176745c3a9e12ba3f5` | `6bfa6ec485027059cc619d0174953500e6ce280391caf94bb7ba75a2796ac459` |
| `src/components/DosingCalculator.tsx` | `4bd79039e61c7a63106797751b9d763ee4e81d7b` | `7105fa533ee0587288b29385873617f8d0d1b022ea5bc4ce1e5a5e38819af086` |
| `src/components/ProgressionTracker.tsx` | `1b3da1fa98e38178607453d40dbe43d20842c7fd` | `5ef2fc7400bc314ac6d04ab4bac6d7edd823dd20625f1152e7eaac5168d919b5` |
| `src/components/ScenarioGuide.tsx` | `7243d4b8d26e89ec0883953be2d076f47f38ab31` | `dfc81a76fa6945397c1431d466463c845abf86157b6bfb9e0aa940a9e00a3a3d` |
| `src/components/SedationReference.tsx` | `89b9dfc3f69b4d2554db8143e40a59c93a808a2c` | `03e5c0f3be48003cfe7754aa606feaca0691137f5c1e0278456346a74c2fe08f` |
| `src/components/TransportKit.tsx` | `66e1afea232d9cbed7f84600bf92b242214983ae` | `01f3edf049b11a08b32cec22163cf0a8cdc91ad49e4eb07500d8d6bb179783cc` |
| `src/data/rsiData.ts` | `026016ed5b1b00dfb8918a959701c0e83cb62858` | `9b33eb1d3ecc0cf45e05f0d7f4acec0f5120ec0ed1f409df270c4a48d6b34d11` |
| `src/types.ts` | `56e2cb624da2cebe902d90cd70c8a791182e7c9c` | `c5ec2dac0382f5ab8266b88e36d4b8e96c7935331b045902735142312843e27d` |

`index.html` also remains byte-identical to upstream blob
`b92ead689e2fdfbbe5399935e75fe5285543f864`. The hash regression test covers
every clinical file above.

## Deliberate sanitization

- Omitted `.env.example`, AI Studio `README.md`,
  `assets/.aistudio/.gitignore`, and `metadata.json`.
- Replaced the upstream package manifest. Removed direct
  `@google/genai`, `express`, `dotenv`, `motion`, `tsx`,
  `@types/node`, `@types/express`, `autoprefixer`, and `esbuild`.
- Replaced the AI Studio Vite HMR/environment configuration with a static
  `/RSI/` base and `../../dist/RSI` output.
- Removed the Google Fonts request from `src/index.css` and retained the
  same Tailwind font roles with local system stacks.
- The enumerated source contains no server file. The misleading
  `server.js` cleanup reference was removed with the upstream scripts.
- `@types/node` remains only as a transitive Vite dependency and as shared
  PIG tooling; RSI does not declare or import it.

## Files

- Imported `md/apps/rsi/index.html`, `src/App.tsx`, all five component
  files, `src/data/rsiData.ts`, `src/main.tsx`, and `src/types.ts`.
- Added sanitized `md/apps/rsi/package.json`, `vite.config.ts`,
  `tsconfig.json`, and `src/index.css`.
- Added RSI root scripts and the deterministic workspace lockfile entry.
- Added `md/tests/rsi.test.mjs` and byte-preservation attributes.

## Verification

Fresh checks from `md/`:

- `npm install`: 92 packages audited, 0 vulnerabilities.
- `npm ci`: 88 packages installed, 92 audited, 0 vulnerabilities.
- `npm run typecheck:rsi`: exit 0.
- `npm run test:rsi`: 6 tests passed, 0 failed.
- The calculation test executes the imported
  `(1.0 * weight).toFixed(1)` expression and confirms 20 kg rocuronium is
  `20.0 mg`; the pinned data also states `1.0 mg/kg`.
- `npm run build:rsi`: Vite 6.4.3, 1679 modules, output under
  `dist/RSI/`; exit 0.
- `npm run test:contract`: 3 tests passed, 0 failed.
- `npm ls --workspace @closedose-md/rsi --depth=0`: exit 0 with only the
  expected browser and build packages.
- `npm ls @google/genai express dotenv tsx @types/express motion
  --workspace @closedose-md/rsi --all`: empty tree.
- Lockfile inspection: no forbidden RSI direct edge and no Google GenAI,
  Express, dotenv, tsx, Express types, or Motion package entry.
- Forbidden AI/server/env and network/analytics/persistence scans across
  `index.html` and the existing `src/**` coverage: no matches.
- Remote-asset regression negative check: injecting
  `https://example.com/remote.css` into a temporary `index.html` copy
  produced the expected targeted test failure (5 pass, 1 fail); the untouched
  workspace then passed 6 of 6 tests.
- Built HTML references only
  `/RSI/assets/index-BmwLbh8t.js` and
  `/RSI/assets/index-DIxTnHfF.css`.
- Local static HTTP checks: `/RSI/`, the JS asset, and the CSS asset each
  returned 200.
- `git diff --cached --check`: exit 0 before the implementation commit.
- Implementation diff contains no `public/**` or
  `.superpowers/sdd/progress.md` change.

## Self-review

- All clinical and visible workflow TSX plus the clinical data table remain
  byte-identical to the pinned source.
- The CSS edit is non-clinical and removes an external request without
  changing the application workflow.
- The package, source, tests, and output contain no backend, AI runtime,
  API-key plumbing, analytics, persistence, patient-identifier capture, or
  new outbound request.
- The regression suite prevents the removed package declarations, files,
  metadata, strings, environment exposure, network calls, remote HTML assets,
  and persistence surfaces from returning across both the entry document and
  application source.
- Existing parent-facing `public/` content and SDD progress tracking were
  not modified.
