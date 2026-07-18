# Task 1 Implementation Report: CloseDose MD workspace and provenance

## Summary

Established the isolated `md/` npm workspace boundary for the CloseDose MD
provider platform. The work defines portal, PIG, and RSI package identities
and their canonical route bases without importing or fabricating clinical app
source. It leaves the parent-facing `public/` site untouched.

## Files

- `md/package.json`: private npm workspace root and contract-test command.
- `md/.gitignore`: ignores MD build and local dependency artifacts.
- `md/sources.json`: pins the primary PIG, comparison PIG, and RSI source
  repositories to the required commits.
- `md/README.md`: records route, privacy, and workspace boundaries.
- `md/apps/{portal,pig,rsi}/package.json`: initial package identities and
  route-base declarations only.
- `md/tests/workspace-contract.test.mjs`: verifies workspace declarations,
  route bases, README route documentation, and exact source provenance.

## Tests

Initial red contract run before child workspace manifests were added:

```text
npm run test:contract
exit status: 1
pass: 2
fail: 1
failure: ENOENT for md/apps/portal/package.json
```

Final Task 1 verification from `md/`:

```text
$ npm run test:contract
exit status: 0
tests: 3
pass: 3
fail: 0

$ jq empty sources.json
exit status: 0

$ git diff --check
exit status: 0
```

The final contract-test output confirmed all three isolated workspace packages,
their `/`, `/PIG/`, and `/RSI/` route bases, the documented canonical routes,
and the exact provenance records.

## Commit

Implementation commit: `1267822208beed6f2fd9a5b2e52e5580f797554e`
(`feat(md): establish provider workspace contracts`)

## Self-review

- No files in `public/` were changed.
- No clinical calculation source, server, analytics, persistence, AI runtime,
  API-key plumbing, or outbound request was added.
- Child package manifests are deliberately source-free import boundaries; Tasks
  2 through 4 own application source and build configuration.
- The contract test is intentionally meaningful in the Task 1 state: removing
  a required package manifest or changing its route base fails the test.
