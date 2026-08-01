# CloseDose MD static deployment

Deploy this workspace as a dedicated Cloudflare Pages project. Do not change
the existing Pages project or `public/` output that serves `closedose.com`.

| Setting | Value |
| --- | --- |
| Project name | `closedose-md` |
| Repository | `nsm0101/CloseDose` |
| Production branch | `main` |
| Root directory | `md` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `22` |
| Build watch include path | `md/*` |

The build removes only `md/dist/`, builds the portal first, then PIG, the five
standalone RSI documents, and PREtendingMD, and finally copies and validates the Cloudflare controls and
provider 404. Device and Sedation join a production artifact only when the
checked-in clinical release manifest contains all required named approvals.
`npm run build:review` assembles both applications for local review while
retaining their visible not-approved status.

## Security and caching

`static/_headers` applies a strict local-only Content Security Policy to the
portal, PIG, and RSI. Only `/PMD/*` detaches that policy and applies the exact
Firebase Authentication, token, Firestore, Auth-frame, and Google Auth helper
origins required by PREtendingMD. The Google helper is limited to
`https://apis.google.com`; analytics and arbitrary Google-hosted scripts remain
blocked. The PMD route also changes COOP to
`same-origin-allow-popups` for Google sign-in; the other routes retain
`same-origin`. Inline scripts, external analytics, arbitrary frames, objects,
base overrides, and form submissions are blocked.

The single exception is `style-src-attr 'unsafe-inline'`. The imported RSI
`ProgressionTracker` uses a React `style={{ width: ... }}` attribute for its
live timer progress width. `style-src 'self'` and `style-src-elem 'self'` still
block inline style elements. This exception must not expand to another
directive.

PREtendingMD uses popup-based Google sign-in because Firebase redirect sign-in
cannot reliably complete from a custom Pages origin in browsers that block
cross-origin storage. Before release, the Firebase Authentication project
`gen-lang-client-0217325418` must list both `md.closedose.com` and
`closedose-md.pages.dev` under Authentication > Settings > Authorized domains.
Keep the existing `firebaseapp.com` auth domain in the app configuration.

The Firestore rules in `apps/pmd/firestore.rules` reject anonymous and
unverified identities, require an administrator-approved user profile, and
limit patient and operational records to shift members. `firebase.json`
targets only the existing named PMD database.

### Legacy PMD data cutover

Do not let the browser migrate production records on sign-in. Before changing
rules or Authentication, schedule a maintenance window and complete this
versioned migration:

1. Stop creating or editing shifts in the legacy client.
2. Complete a managed export of the entire named database. Record the finished
   export URI and operation ID. The Firebase project must have billing enabled
   for managed exports.
3. Authenticate Application Default Credentials, then run the migration in
   dry-run mode. It validates required fields, duplicate session IDs, invite
   conflicts, and the exact record count without writing.
4. Apply only after the dry-run count matches the export. The apply command
   writes a new mode-`0600` JSON metadata backup, preserves each legacy
   `createdBy`, assigns the primary administrator as the initial member, creates
   expiring/revocable invites, and commits at most 200 shifts per batch.
5. Re-run dry-run mode. It must report zero legacy shifts before the rules
   deploy.

```sh
gcloud firestore export gs://BUCKET/PREFIX \
  --project=gen-lang-client-0217325418 \
  --database=ai-studio-2f1b1ed6-35b2-4162-bac6-1fbc2d599b35

gcloud auth application-default login

npm run migrate:pmd -- --admin-uid=PRIMARY_ADMIN_UID

npm run migrate:pmd -- \
  --apply \
  --admin-uid=PRIMARY_ADMIN_UID \
  --backup=/absolute/new/pmd-shift-membership-v1.json \
  --export-operation=EXPORT_OPERATION_ID \
  --export-uri=gs://BUCKET/PREFIX \
  --confirm=pmd-shift-membership-v1
```

After the migration and its zero-legacy verification, deploy the rules:

```sh
npx firebase-tools@15.24.0 deploy \
  --project gen-lang-client-0217325418 \
  --only firestore
```

Then authorize both provider hostnames and disable Anonymous under
Authentication > Sign-in method. Existing
anonymous accounts may be removed only after reviewing ownership and retention
requirements; the new rules deny them regardless.

New share codes use Web Crypto, expire after 12 hours, and can be revoked by an
administrator when removing a member. A revoked or expired invite cannot add a
member back to a shift.

Canonical HTML, `404.html`, and the stable `/404.css` URL use
`public, max-age=0, must-revalidate`. Vite content-hashed assets under
`/assets/`, `/PIG/assets/`, `/RSI/assets/`, `/AIRWAY-SCENARIOS/assets/`,
`/POST-INTUBATION/assets/`, `/RSI-TIMELINE/assets/`,
`/AIRWAY-TRANSPORT/assets/`, `/PMD/assets/`, `/DEVICE/assets/`, and
`/SEDATION/assets/` are immutable for one year. PREtendingMD's optimized
`/PMD/images/` assets are also immutable.

## Local release gate

From `md/` on Node 22, run the exact CI sequence before publishing a preview:

```sh
npm ci
npx playwright install --with-deps chromium
npm run typecheck
npm run test:unit
npm run test:rules
npm run build:review
npm run build
npm run test:contract
npm run test:smoke
```

The local smoke run uses `http://127.0.0.1:4173/` and starts
`tests/serve-dist.mjs`. That server resolves every file path case-sensitively,
including on macOS, so it matches the Pages route-casing contract.

## Pages preview gate

Publish the reviewed commit to the dedicated Pages project without attaching
the custom domain. Verify the production Pages hostname first:

```sh
curl -fsSIL https://closedose-md.pages.dev/
curl -fsSIL https://closedose-md.pages.dev/PIG/
curl -fsSIL https://closedose-md.pages.dev/RSI/
curl -fsSIL https://closedose-md.pages.dev/AIRWAY-SCENARIOS/
curl -fsSIL https://closedose-md.pages.dev/POST-INTUBATION/
curl -fsSIL https://closedose-md.pages.dev/RSI-TIMELINE/
curl -fsSIL https://closedose-md.pages.dev/AIRWAY-TRANSPORT/
curl -fsSIL https://closedose-md.pages.dev/PMD/
CLOSEDOSE_MD_BASE_URL=https://closedose-md.pages.dev npm run test:smoke
```

`CLOSEDOSE_MD_BASE_URL` must be an HTTP(S) site-root URL without credentials,
a query, or a fragment. When it is set, Playwright does not start the local
server. The same suite verifies redirects, lowercase 404 behavior, served
headers and cache controls, representative PIG and RSI interactions, the
signed-out PREtendingMD shell, and the strict local-tool runtime audit. Its
negative probes use synthetic audit values only.

Do not attach `md.closedose.com` until all of these gates are recorded on the
pull request:

- the exact commit passed the local Node 22 sequence and provider CI;
- the Pages smoke command passed against `closedose-md.pages.dev`;
- every available no-slash tool route redirects to its uppercase trailing-slash route;
- lowercase variants return the provider 404;
- the browser console, page errors, request failures, unexpected requests, and
  unexpected popup audit are clean during normal flows;
- both provider hostnames are present in Firebase Authentication's authorized
  domains, and Google sign-in opens from each hostname;
- the managed Firestore export completed, the versioned PMD migration dry-run
  matched the reviewed count, apply created its local metadata backup, and the
  post-migration dry-run reported zero legacy shifts;
- the exact rules commit passed the Firestore emulator suite and was deployed
  to the named PMD database before the portal link became available;
- Anonymous sign-in is disabled, the primary administrator can sign in, and an
  unapproved verified account cannot read a shift;
- a named clinical owner approved the preview formulas, reference values,
  warnings, and representative outputs.

### Device and Sedation public release gate

Do not set `publicReleaseApproved` to `true` without recording the required
named roles, approval dates, and reviewed scope in
`clinical-release-manifest.json`. Device requires PEM, pediatric airway
specialty, institutional, and regulatory approvals. Sedation requires PEM,
pediatric pharmacy, pediatric sedation or anesthesia, institutional, and
regulatory approvals. The manifest validator fails the build if a required
role or record field is missing. Until then, production omits both route
documents and the portal labels them `Awaiting approval`.

## Custom domain and production gate

In Cloudflare, open Workers & Pages, select `closedose-md`, add the custom
domain `md.closedose.com`, and allow the Pages flow to create or validate DNS.
Do not create only a manual CNAME without associating the hostname with the
Pages project.

After DNS and TLS become healthy, run:

```sh
dig +short md.closedose.com
curl -fsSIL https://md.closedose.com/
curl -fsSIL https://md.closedose.com/PIG/
curl -fsSIL https://md.closedose.com/RSI/
curl -fsSIL https://md.closedose.com/AIRWAY-SCENARIOS/
curl -fsSIL https://md.closedose.com/POST-INTUBATION/
curl -fsSIL https://md.closedose.com/RSI-TIMELINE/
curl -fsSIL https://md.closedose.com/AIRWAY-TRANSPORT/
curl -fsSIL https://md.closedose.com/PMD/
curl -sSI https://md.closedose.com/PIG | sed -n '1,8p'
curl -sSI https://md.closedose.com/RSI | sed -n '1,8p'
curl -sSI https://md.closedose.com/AIRWAY-SCENARIOS | sed -n '1,8p'
curl -sSI https://md.closedose.com/POST-INTUBATION | sed -n '1,8p'
curl -sSI https://md.closedose.com/RSI-TIMELINE | sed -n '1,8p'
curl -sSI https://md.closedose.com/AIRWAY-TRANSPORT | sed -n '1,8p'
curl -sSI https://md.closedose.com/PMD | sed -n '1,8p'
CLOSEDOSE_MD_BASE_URL=https://md.closedose.com npm run test:smoke
```

Production is accepted only when DNS resolves, TLS is valid, the portal and all
seven public tool routes return a final HTTP 200, redirect/casing/header checks pass,
representative clinical interactions pass, and the normal-flow runtime audit
is clean.

## Rollback

If production verification fails, roll `closedose-md` back to its prior
successful Pages deployment. If no provider deployment is safe, remove only
`md.closedose.com` from the `closedose-md` custom domains. Do not alter the
existing `closedose.com` Pages project or its DNS records.

Do not restore the former anonymous/global-access rules. For a data-cutover
failure, stop the client, retain the local migration backup, and import the
recorded managed export into a recovery database for comparison before making
targeted repairs. A full import overwrites documents captured in the export
but does not remove documents created afterward, so it requires a reviewed
recovery plan rather than an automatic rollback.
