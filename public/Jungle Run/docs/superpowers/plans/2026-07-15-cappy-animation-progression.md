# Cappy animation, boost, and world progression implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing Cappy runner into a pose-driven, weighty comic-book chase game with hold-to-boost, staged environments, clearer depth, safer obstacle pacing, and optional controls help.

**Architecture:** Keep the existing vanilla HTML/CSS/Three.js stack. Add a small pose library to the existing player rig, drive pose selection from gameplay state, and extend the current segment recycler with stage-aware palettes, hazards, and boost pickups. UI changes remain DOM/CSS overlays so the WebGL scene stays focused on gameplay.

**Tech Stack:** HTML5, CSS3, JavaScript, Three.js r128, PNG character sprites, Web Audio API, Pointer/Touch/Keyboard events.

## Global constraints

- Preserve the three-lane endless runner, jump, slide, pickups, boulder attacks, and spatial 90-degree turn camera.
- Keep the provided Cappy mascot recognizable across every generated pose.
- Use project-local assets and the vendored Three.js runtime; add no package dependency.
- Hide keyboard instructions until requested and show no persistent touchscreen control pad.
- Keep touch play gesture-first: swipe to move/jump/slide and press-and-hold to boost.
- Keep generated runtime objects bounded and dispose recycled non-shared Three.js resources.

---

### Task 1: Generate the rear-view pose library

**Files:**
- Create: `assets/cappy-center-run-a.png`
- Create: `assets/cappy-center-run-b.png`
- Create: `assets/cappy-center-jump.png`
- Create: `assets/cappy-center-slide.png`
- Create: `assets/cappy-center-boost.png`
- Create: `assets/cappy-center-crash.png`
- Create: `assets/cappy-run-left.png`
- Create: `assets/cappy-run-right.png`

**Interfaces:**
- Consumes: `assets/cappy-rear-run.png` as the identity, camera-angle, linework, palette, and scale reference.
- Produces: transparent PNG textures with a consistent square canvas; the six center-state assets use a strict direct-rear head-spine-hip axis, while left/right assets bank away from that neutral anchor.

- [ ] **Step 1: Generate one chroma-key image per pose**

Use the built-in image generator once for each named asset. Each prompt must require the same elevated rear three-quarter chase view, full-body silhouette, warm tan fur, dark-brown ink contour, offset-print texture, flat `#00ff00` background, no cast shadow, and no text.

- [ ] **Step 2: Remove the chroma key**

Run for each source image:

```bash
/Users/nsm/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 /Users/nsm/.codex/skills/.system/imagegen/scripts/remove_chroma_key.py --input tmp/imagegen/SOURCE.png --out assets/OUTPUT.png --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill
```

- [ ] **Step 3: Verify every sprite**

Run:

```bash
/Users/nsm/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 -c "from PIL import Image; from pathlib import Path; files=list(Path('assets').glob('cappy-*.png')); print([(p.name, Image.open(p).mode, Image.open(p).size, Image.open(p).getextrema()[-1]) for p in files])"
```

Expected: every pose reports `RGBA`, a square image, and an alpha range beginning at `0` and ending at `255`.

### Task 2: Replace static mascot motion with gameplay poses

**Files:**
- Modify: `cappy-3d.js`

**Interfaces:**
- Consumes: the seven transparent pose textures from Task 1.
- Produces: `setPlayerPose(name)`, pose texture/material maps, ink-offset layers, boost afterimages, and state-driven pose selection.

- [ ] **Step 1: Preload the texture map**

Create pose keys `runA`, `runB`, `left`, `right`, `jump`, `slide`, `boost`, and `crash`, sharing loaded textures between the main art, outline, and chromatic registration layers.

- [ ] **Step 2: Select poses from movement state**

Use `jump` while airborne, `slide` during a slide, `boost` while boost is active, `left` or `right` while lane interpolation has meaningful lateral velocity, and alternate `runA`/`runB` by stride phase in the center lane.

- [ ] **Step 3: Add depth and speed feedback**

Offset cyan and coral duplicate planes only during boost/rapid lane motion, add bounded afterimage planes behind Cappy, widen camera field of view while boosting, and retain the grounded elliptical shadow.

- [ ] **Step 4: Verify pose selection**

Use `window.CappyRunner.debugState()` after left, right, jump, slide, and boost actions. Expected: `pose` changes to the matching named state without changing the lane or action rules.

### Task 3: Add hold-to-boost and balanced pickup pacing

**Files:**
- Modify: `Cappy3D.html`
- Modify: `cappy-3d.css`
- Modify: `cappy-3d.js`

**Interfaces:**
- Produces: `state.boostCharge` in the range `0..100`, `startBoost()`, `stopBoost()`, `BOOST` pickups, a compact gauge, hold controls for Shift/B and long-press, and a score multiplier.

- [ ] **Step 1: Add the HUD gauge**

Add an accessible `BOOST` meter to the center HUD with `aria-valuemin="0"`, `aria-valuemax="100"`, and live `aria-valuenow` updates.

- [ ] **Step 2: Add boost pickups**

Render a cyan/coral energy seed, award `28` charge on collection, and place it in a safe lane no more often than once every eight recycled segments.

- [ ] **Step 3: Implement boost consumption**

While held and charge is above zero, consume `24` charge per second, multiply forward speed by `1.42`, and multiply distance and collectible score gain by `2`. Stop automatically at zero charge, on pause, crash, game over, or turn animation.

- [ ] **Step 4: Implement gesture arbitration**

Begin boost only after a stationary press threshold of roughly `170ms`; cancel the pending hold when movement exceeds `18px`; resolve swipe actions on release; bind Shift and B keydown/keyup to the same boost lifecycle.

- [ ] **Step 5: Verify input**

Hold Shift and inspect the gauge and speed through `debugState()`, then swipe on a touch viewport. Expected: boost drains while held, stops on release, and swipe actions do not accidentally start boost.

### Task 4: Add distance-driven stages and obstacle variety

**Files:**
- Modify: `cappy-3d.js`
- Modify: `cappy-3d.css`
- Modify: `Cappy3D.html`

**Interfaces:**
- Produces: stage definitions, `applyStage(index)`, stage label UI, stage-aware palettes, density, speed, threat cadence, and obstacle selection.

- [ ] **Step 1: Define four environments**

Add `Emerald Canopy` at `0m`, `River Gorge` at `350m`, `Sunset Ruins` at `750m`, and `Moonlit Pulse` at `1200m`. Each definition owns sky, fog, path, foliage, accent, difficulty, safe-gap, and threat timing values.

- [ ] **Step 2: Apply stage changes during the run**

Detect threshold crossings, recolor the existing shared materials, update atmosphere and CSS accent variables, show a short comic issue-card announcement, and rebuild only upcoming recycled segments.

- [ ] **Step 3: Expand hazards without unfair stacking**

Add rock clusters and temple gates as lane blockers, preserve logs/vines/pits/totems, enforce at least one relaxed segment after multi-obstacle patterns early in a run, and shorten the gap only in later stages.

- [ ] **Step 4: Verify progression**

Expose `setDistance(value)` in the localhost-only debug actions and set distance beyond each threshold. Expected: stage name, scene palette, difficulty value, and new obstacle mix update without resetting player state.

### Task 5: Replace the card-spin crash with a weighty impact sequence

**Files:**
- Modify: `cappy-3d.js`
- Modify: `cappy-3d.css`

**Interfaces:**
- Consumes: `assets/cappy-crash.png`.
- Produces: impact freeze, squash, planted stumble, short skid, camera punch/settle, ink burst, and game-over handoff.

- [ ] **Step 1: Stage the collision**

For the first `90ms`, freeze forward motion and punch the camera; then switch to the crash pose, compress the rig, rotate no more than about `0.3` radians, and slide it forward with decreasing velocity.

- [ ] **Step 2: Add comic effects**

Spawn an ink/coral burst and ground streak, add a brief RGB registration split, and animate the shadow widening under the character.

- [ ] **Step 3: Finish cleanly**

Hand off to game over after about `1.15s`, reset all temporary transforms and classes in `startRun()`, and stop boost immediately on impact.

- [ ] **Step 4: Verify crash state**

Run `window.CappyRunner.actions.forceCrash()`. Expected: the `crash` pose appears, the rig does not complete a flat spin, and the game-over view appears after the impact sequence.

### Task 6: Hide control overlays and add optional help

**Files:**
- Modify: `Cappy3D.html`
- Modify: `cappy-3d.css`
- Modify: `cappy-3d.js`

**Interfaces:**
- Produces: `openControls()` and `closeControls()`, a HUD help button, a start-screen help button, and an accessible dismissible controls sheet.

- [ ] **Step 1: Remove persistent controls**

Delete the mobile arrow pad and the always-visible start-screen keyboard panel while preserving swipe and keyboard event handlers.

- [ ] **Step 2: Add the help sheet**

Show desktop keys and touch gestures in a single popup only after the user presses `?` or `HOW TO RUN`; include Shift/B and touch hold for boost, Escape/P for pause, and focus restoration on close.

- [ ] **Step 3: Verify responsive behavior**

Inspect at `1440x900` and `390x844`. Expected: no control pad, no hidden overflow, and the help sheet opens, traps focus adequately for its simple content, and closes with its button or Escape.

### Task 7: Final verification and review

**Files:**
- Test: `Cappy3D.html`
- Test: `cappy-3d.css`
- Test: `cappy-3d.js`

**Interfaces:**
- Verifies every interface produced above.

- [ ] **Step 1: Run static checks**

Run:

```bash
node --check cappy-3d.js
python3 -m http.server 4173
```

Expected: JavaScript syntax check exits `0`; the preview serves `Cappy3D.html` and every pose asset with HTTP `200`.

- [ ] **Step 2: Run browser smoke tests**

Exercise start, all three lanes, jump, slide, hold boost, pause/resume, help open/close, forced stage transitions, forced turn, forced crash, and restart at desktop and phone sizes. Expected: no console errors and each state is visible and interactive.

- [ ] **Step 3: Run the recycler stress check**

Recycle at least `240` segments through the localhost debug bridge. Expected: `renderer.info.memory.geometries` and `textures` remain bounded after warm-up.

- [ ] **Step 4: Request a code review**

Ask a reviewer to compare the implementation against this plan, fix any critical or important findings, then rerun Steps 1-3 before reporting completion.
