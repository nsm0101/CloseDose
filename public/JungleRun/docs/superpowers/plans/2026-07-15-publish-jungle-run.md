# Publish JungleRun to CloseDose Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the completed Cappy Jungle Run game from `/Users/nsm/Desktop/Cappy3D` at `https://closedose.com/JungleRun/` through the `nsm0101/CloseDose` production repository.

**Architecture:** Package the game's static HTML, CSS, JavaScript, Three.js runtime, and only the referenced character images under `public/JungleRun/`, because the CloseDose Cloudflare Pages project serves the repository's `public` directory. Work from a clean branch/worktree so the existing unrelated changes in `/Users/nsm/Documents/GitHub/CloseDoseGit` remain untouched, merge the reviewed branch into `main`, then wait for the Cloudflare Pages deployment and verify the production route.

**Tech Stack:** Static HTML/CSS/JavaScript, Three.js r128, Git, GitHub, GitHub Pages, Cloudflare Pages.

## Global Constraints

- The deployed route must be exactly `/JungleRun/` with a capital `J` and `R`.
- Preserve all current CloseDose repository files and unrelated local worktree changes.
- Deploy only the files required by the game; exclude temporary image-generation sources, native wrappers, `.DS_Store`, and planning files.
- Production must load the game canvas, referenced images, stylesheet, JavaScript, and Three.js runtime without browser console errors.
- Merge to `main` only after local static and browser verification succeeds.

---

### Task 1: Package the static game under the production public directory

**Files:**
- Create: `public/JungleRun/index.html`
- Create: `public/JungleRun/cappy-3d.css`
- Create: `public/JungleRun/cappy-3d.js`
- Create: `public/JungleRun/vendor/three.r128.min.js`
- Create: `public/JungleRun/assets/cappy-full-body.png`
- Create: `public/JungleRun/assets/cappy-center-boost.png`
- Create: `public/JungleRun/assets/cappy-center-crash.png`
- Create: `public/JungleRun/assets/cappy-center-jump.png`
- Create: `public/JungleRun/assets/cappy-center-run-a.png`
- Create: `public/JungleRun/assets/cappy-center-run-b.png`
- Create: `public/JungleRun/assets/cappy-center-slide.png`
- Create: `public/JungleRun/assets/cappy-run-left.png`
- Create: `public/JungleRun/assets/cappy-run-right.png`

**Interfaces:**
- Consumes: the verified source game in `/Users/nsm/Desktop/Cappy3D`.
- Produces: a self-contained static directory served at `/JungleRun/`.

- [x] **Step 1: Create a clean deployment worktree**

Run:

```bash
git fetch origin main
git worktree add /tmp/closedose-junglerun -b agent/add-jungle-run origin/main
```

Expected: a clean branch based on the current `origin/main`; the original checkout remains dirty only with its pre-existing files.

- [x] **Step 2: Copy the required runtime files**

Copy `Cappy3D.html` as `public/JungleRun/index.html`, copy `cappy-3d.css`, `cappy-3d.js`, `vendor/three.r128.min.js`, and the nine image paths referenced by HTML/JavaScript. Do not copy `tmp/`, `hatch-runs/`, native files, duplicate `Cappy3D.js`, or `.DS_Store`.

- [x] **Step 3: Run static packaging checks**

Run:

```bash
node --check public/JungleRun/cappy-3d.js
```

Expected: exit `0`. Parse the HTML/JavaScript references and confirm every local asset exists below `public/JungleRun`.

- [x] **Step 4: Test the production-relative route locally**

Serve the worktree's `public` directory and open `http://127.0.0.1:<port>/JungleRun/`. Confirm the start screen and WebGL canvas render, Supercharge activates, and the browser console contains no errors.

### Task 2: Publish and verify production

**Files:**
- Commit: only `public/JungleRun/**`

**Interfaces:**
- Consumes: the locally verified static package from Task 1.
- Produces: a merged `main` commit and a verified Cloudflare Pages production deployment.

- [x] **Step 1: Review and commit the exact scope**

Run `git status --short` and `git diff --stat -- public/JungleRun`. Stage only `public/JungleRun`, then commit with message `Add Jungle Run game`.

- [x] **Step 2: Push and merge the publishing branch**

Push `agent/add-jungle-run`, open a ready pull request against `main`, and merge it after checks. This ready-and-merge flow is authorized by the user's request to publish live now.

- [x] **Step 3: Wait for deployment checks**

Monitor the merged `main` commit until the `Cloudflare Pages` and GitHub Pages checks complete successfully. Report any deployment failure rather than claiming the route is live.

- [x] **Step 4: Verify the live game**

Request `https://closedose.com/JungleRun/` and all referenced static assets, confirm HTTP `200`, load the route in a browser, confirm the WebGL canvas and start screen render, exercise a run and Supercharge activation, and confirm zero browser console errors.
