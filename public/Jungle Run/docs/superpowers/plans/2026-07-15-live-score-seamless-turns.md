# Live Score and Seamless Turns Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the existing runner feel and animation system while making the live score accurate, making turns uninterrupted, preventing end-of-straight clipping, and lengthening straightaways as speed rises.

**Architecture:** Keep the pooled straight-segment runner and resolve a queued turn by rebuilding the forward segment pool at the safe approach point without entering a separate turn-animation state. Store turn spacing per progression stage so straightaway distance grows from 176m to 308m and roughly offsets the higher late-game speed.

**Tech Stack:** Semantic HTML, vanilla JavaScript, Three.js r128, CSS.

## Global Constraints

- Preserve the current run, lane-change, jump, slide, boost, crash, stage, and sprite animations.
- Remove only the spatial turn-transition animation and its speed reduction.
- Keep the active segment pool bounded at nine segments.
- Keep keyboard, pointer, swipe, accessibility, and native iOS behavior intact.

---

### Task 1: Live score and boost explanation

**Files:**
- Modify: `Cappy3D.html`
- Modify: `cappy-3d.js`

**Interfaces:**
- Consumes: `state.distance`, `state.boostBonus`, `state.pickupScore`, and `state.combo`.
- Produces: `calculateScore()` and a HUD whose visible value matches the final-score calculation throughout the run.

- [x] **Step 1: Make score calculation reusable**

```js
function calculateScore() {
  return Math.floor(state.distance + state.boostBonus + state.pickupScore + Math.max(0, state.combo - 1) * 25);
}
```

- [x] **Step 2: Render the calculated score live**

```js
state.score = calculateScore();
dom.hudScore.textContent = String(state.score).padStart(5, '0');
```

- [x] **Step 3: Clarify the HUD and help copy**

```html
<span class="hud-kicker">score</span>
<span class="hud-unit">pts</span>
<p>Ink Boost is Cappy's charge-powered sprint. Collect pulse seeds to refill it, then hold to run 42% faster and earn double distance and pickup points.</p>
```

### Task 2: Continuous turn resolution and progressive straightaways

**Files:**
- Modify: `cappy-3d.js`

**Interfaces:**
- Consumes: stage `turnGap` values and a queued turn gate.
- Produces: `state.lastTurnSerial`, stage-aware turn placement, and immediate safe segment-pool rebuilding without a transition state.

- [x] **Step 1: Add stage turn spacing**

```js
turnGap: 8 // stage 1; later stages use 10, 12, and 14
```

- [x] **Step 2: Schedule turns from the previous turn rather than a fixed modulus**

```js
const shouldTurn = !safe && !needsRecovery && serial >= 7 && serial - state.lastTurnSerial >= stage.turnGap;
if (shouldTurn) state.lastTurnSerial = serial;
```

- [x] **Step 3: Resolve the queued turn at the safe approach point**

```js
state.heading = (state.heading + turn.direction + 4) % 4;
rebuildAfterTurn();
applyBiome(state.heading);
```

- [x] **Step 4: Remove turn-only movement and camera interruption**

```js
moveSegments(state.speed * dt);
```

Keep the normal running pose, current boost state, player controls, and chase camera active before and after the segment-pool rebuild.

### Task 3: Regression verification

**Files:**
- Test: `Cappy3D.html`
- Test: `cappy-3d.js`

**Interfaces:**
- Consumes: localhost `window.CappyRunner` actions and debug state.
- Produces: evidence for live score progression, stage spacing, seamless turns, bounded recycling, and clean rendering.

- [x] **Step 1: Run syntax and DOM-reference checks**

```bash
node --check cappy-3d.js
```

Expected: exit code `0`; every `dom.*` element remains present in `Cappy3D.html`.

- [x] **Step 2: Run a local browser smoke test**

```bash
python3 -m http.server 4173
```

Start a run, force distance beyond 2400, trigger a left and right turn, and verify that the HUD score continues increasing, `turnAnimation` is absent, the runner remains in `RUNNING`, and no blocking object reaches the player.

- [x] **Step 3: Verify progression spacing and recycler bounds**

At stages 0 through 3, confirm turn gaps are `8`, `10`, `12`, and `14` segments (`176m`, `220m`, `264m`, and `308m`) while `activeSegments` remains `9` after repeated recycling.
