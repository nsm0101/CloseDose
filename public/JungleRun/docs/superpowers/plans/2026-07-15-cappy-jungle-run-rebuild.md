# Cappy Jungle Run Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the existing browser game as a polished, responsive three-lane endless jungle runner with directional course turns and an illustrated 2D/3D comic-book visual identity centered on the supplied Cappy mascot.

**Architecture:** Keep the current vanilla HTML/CSS/Three.js stack and replace only the presentation and game engine files used by `Cappy3D.html`. The runner remains camera-relative at the origin while pooled world segments move toward it; turn gates introduce directional decisions and a camera/world transition, allowing endless play without unbounded world coordinates.

**Tech Stack:** Semantic HTML, modern CSS, vanilla JavaScript, Three.js r128, Web Audio API, localStorage.

## Global Constraints

- Three lanes with responsive keyboard, swipe, and on-screen controls.
- Automatic forward motion, jumping, sliding, coins, obstacles, score, and escalating difficulty.
- Directional course-turn gates that require the indicated left or right input.
- Use the supplied Cappy illustration as the playable character.
- Use a comic-book-inspired 2D/3D visual system with toon shading, ink outlines, halftone, strong silhouette, and controlled motion.
- Preserve the existing native iOS close-handler bridge.
- Add no new runtime framework or build step.

---

### Task 1: Branded game shell and asset

**Files:**
- Create: `assets/cappy-full-body.png`
- Create: `assets/cappy-rear-run.png`
- Create: `vendor/three.r128.min.js`
- Modify: `Cappy3D.html`
- Modify: `cappy-3d.css`

**Interfaces:**
- Consumes: supplied transparent PNG mascot.
- Produces: DOM IDs consumed by `cappy-3d.js`: `game-container`, `start-screen`, `game-over-screen`, HUD metrics, turn prompt, pause control, and four mobile controls.

- [x] **Step 1: Copy the mascot asset** into `assets/cappy-full-body.png` without recompressing it.
- [x] **Step 2: Replace the menu and HUD markup** with the branded title card, compact game HUD, turn prompt, pause state, final score panel, and accessible controls.
- [x] **Step 3: Replace the visual system** with responsive comic-panel surfaces, offset ink borders, warm jungle colors, halftone/grain overlays, speed lines, impact typography, visible focus states, reduced-motion handling, and safe-area layout.
- [x] **Step 4: Verify DOM coverage** by checking that every `getElementById` used by the engine exists once in the HTML.

### Task 2: Endless runner engine and comic jungle

**Files:**
- Modify: `cappy-3d.js`

**Interfaces:**
- Consumes: Three.js global `THREE` and Task 1 DOM IDs.
- Produces: `window.CappyRunner.debugState()` and `window.CappyRunner.actions` for deterministic browser verification.

- [x] **Step 1: Build the scene renderer** with a capped pixel ratio, responsive perspective camera, fog, toon lights, shadow budget, and renderer cleanup on resize.
- [x] **Step 2: Build the illustrated player rig** from a generated rear three-quarter mascot view as a textured transparent plane with a shadow, ink backplate, run bob, lane lean, jump squash/stretch, and slide compression.
- [x] **Step 3: Build pooled track segments** with a three-lane path, alternating line-work, layered jungle silhouettes, ruins, foliage, and a bounded active-segment count.
- [x] **Step 4: Build fair obstacle patterns** using logs for jumps, hanging vines for slides, stone blockers for lane changes, and coin lines that always communicate a safe route.
- [x] **Step 5: Implement gameplay state** with frame-rate-independent lane easing, gravity, jump/slide cooldowns, swept proximity collision, scoring, coin collection, progressive speed, pause, crash, restart, and local high score.
- [x] **Step 6: Implement course-turn gates** by scheduling left/right decisions after the onboarding distance, displaying a world-space arrow, accepting the matching direction in a generous timing window, and applying a continuous 90-degree path pivot with a banking chase-camera follow transition and no text interstitial.
- [x] **Step 7: Implement input and feedback** for keyboard, swipe, pointer buttons, Web Audio cues, haptics where supported, impact freeze, particles, turn streak feedback, and native close handling.

### Task 3: Verification and tuning

**Files:**
- Test: `Cappy3D.html`
- Test: `cappy-3d.css`
- Test: `cappy-3d.js`

**Interfaces:**
- Consumes: `window.CappyRunner.debugState()` and action hooks.
- Produces: a browser-tested playable build at desktop and mobile viewport sizes.

- [x] **Step 1: Run static checks** with `node --check cappy-3d.js` and validate referenced local assets and DOM IDs.
- [x] **Step 2: Serve locally** with `python3 -m http.server 4173` from the project root.
- [x] **Step 3: Verify start and gameplay** in the in-app browser: load without console errors, start a run, switch all three lanes, jump, slide, collect score, pause, and resume.
- [x] **Step 4: Verify the turn mechanic** through the debug action hook and confirm both a successful turn and a missed-turn crash.
- [x] **Step 5: Verify responsive presentation** at 1440x900 and 390x844, capturing screenshots and checking HUD/control legibility and mascot framing.
- [x] **Step 6: Re-read the requirements** and confirm every global constraint is represented in the final build.
