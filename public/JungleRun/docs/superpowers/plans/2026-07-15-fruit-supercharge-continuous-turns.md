# Fruit, Supercharge, and Continuous Turns Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Ink Boost pickup with fruit fuel and an inventory-based Supercharge while restoring required directional turns with a continuous Cappy-and-camera follow animation.

**Architecture:** Keep the existing boost bar and hold-to-sprint mechanic, but refill it with a clearly modeled fruit pickup instead of the pulse seed. Add stackable Supercharge pickups with an eight-second invincibility timer, an animated non-blocking screen overlay, and a double-tap gesture that coexists with swipe and hold detection. For turns, retain the current gate prompt and required direction, hide the dead-end blocker after correct input, run a short full-speed world/camera pivot, then rebuild the pooled straightaway at the new heading.

**Tech Stack:** Semantic HTML, CSS, vanilla JavaScript, Three.js r128, Pointer Events, Web Audio API.

## Global Constraints

- Remove every player-facing reference to Ink Boost and the old `BOOST` pickup type.
- Preserve hold-to-sprint with the existing boost bar and `1.42` speed multiplier.
- Fruit adds `55` boost charge, which is substantially more than the old `28`-charge pickup.
- Supercharge inventory holds at most `3` charges and each activation grants `8` seconds of collision invincibility.
- Active Supercharge adds a full-screen animated energy overlay without blocking controls or covering required turn prompts.
- Double tap activates Supercharge; `X` is the keyboard-accessible equivalent.
- Missing a required turn is never bypassed by invincibility.
- A correct turn keeps full forward speed, shows Cappy's directional pose, and continuously follows the course without a cut screen.
- Pit obstacles must read clearly from approach without changing their collision timing.
- Solid crashes must stop Cappy in front of the obstacle; pit crashes use a dedicated fall into the opening.
- Keep the segment pool bounded at `9` segments.

---

### Task 1: Fruit fuel and Supercharge inventory

**Files:**
- Modify: `Cappy3D.html`
- Modify: `cappy-3d.css`
- Modify: `cappy-3d.js`

**Interfaces:**
- Consumes: existing `boostCharge`, pickup collision, HUD, pointer controls, obstacle collision, and boulder strike handling.
- Produces: `FRUIT` and `SUPERCHARGE` pickups, `state.superchargeInventory`, `state.superchargeTimer`, `activateSupercharge()`, and the side inventory display.

- [x] **Step 1: Replace pickup configuration and scheduling**

```js
fruitBoostCharge: 55,
superchargeDuration: 8,
superchargeMaxInventory: 3,
```

Schedule fruit on the prior eight-segment cadence and Supercharge on a separate fourteen-segment cadence, without placing either on a safe-start segment or a turn segment.

- [x] **Step 2: Model both pickups with Three.js primitives**

```js
addPickup(segment, 'FRUIT', lane, 3.1, 1.05);
addPickup(segment, 'SUPERCHARGE', lane, 3.1, 1.08);
```

Fruit uses a coral rounded body, cream highlight, leaf, and stem. Supercharge uses a bright octahedral core, two offset energy rings, and a dark outline.

- [x] **Step 3: Implement collection and activation**

```js
state.boostCharge = Math.min(100, state.boostCharge + CONFIG.fruitBoostCharge);
state.superchargeInventory = Math.min(CONFIG.superchargeMaxInventory, state.superchargeInventory + 1);

function activateSupercharge() {
  if (state.mode !== GAME.RUNNING || state.superchargeInventory <= 0 || state.superchargeTimer > 0) return false;
  state.superchargeInventory -= 1;
  state.superchargeTimer = CONFIG.superchargeDuration;
  return true;
}
```

- [x] **Step 4: Apply invincibility to collision events**

```js
if (state.superchargeTimer > 0) {
  obstacle.hit = true;
  smashObstacle(obstacle);
  return;
}
```

Use the same active-timer check for boulder strikes, while leaving `crash('missed turn')` unchanged.

- [x] **Step 5: Add inventory and active-state HUD**

```html
<aside id="supercharge-inventory" class="supercharge-inventory hidden" aria-live="polite">
  <span class="supercharge-icon">S</span>
  <span><b>SUPERCHARGE</b><small>DOUBLE TAP · <strong id="supercharge-count">0</strong></small></span>
  <i id="supercharge-time" class="hidden">8s</i>
</aside>
```

- [x] **Step 6: Add double-tap gesture arbitration**

Treat two stationary taps within `320ms` and `34px` as Supercharge activation. Cancel the pending tap when the pointer becomes a swipe or hold, and retain `X` as the non-pointer activation path.

- [x] **Step 7: Add the active-mode overlay**

Show a comic `FULL POWER!` entrance, animated energy rays, and a pulsing border for the full eight-second active window. Keep the overlay decorative and below the HUD, inventory, and directional turn prompt.

### Task 2: Required continuous turn event

**Files:**
- Modify: `Cappy3D.html`
- Modify: `cappy-3d.css`
- Modify: `cappy-3d.js`

**Interfaces:**
- Consumes: `state.activeTurn`, `acceptTurn(direction)`, the world-space gate, directional player textures, and the chase camera.
- Produces: visible directional popup, `state.turnAnimation`, cleared dead-end geometry, full-speed world rotation, and pooled-track handoff.

- [x] **Step 1: Restore the visible popup**

```css
.turn-prompt {
  position: fixed;
  top: 18%;
  left: 50%;
  display: flex;
  transform: translateX(-50%) rotate(-1deg);
}
```

Keep the arrow and `LEFT TURN` or `RIGHT TURN` label, with the helper copy `SWIPE / PRESS`.

- [x] **Step 2: Make the dead end removable after correct input**

```js
segment.turn = { direction, root: segment.root, deadEnd, resolved: false, prompted: false };
if (turn.deadEnd) turn.deadEnd.visible = false;
```

- [x] **Step 3: Start the pivot before the gate reaches Cappy**

```js
if (turn.queued && !turn.resolved && z > -12) beginTurn(turn);
state.turnAnimation = { direction: turn.direction, time: 0, duration: 0.56 };
```

- [x] **Step 4: Animate Cappy, course, and camera at full forward speed**

```js
world.rotation.y = animation.direction * eased * Math.PI / 2;
camera.position.x = -animation.direction * Math.sin(progress * Math.PI) * 1.4;
```

Do not scale `moveSegments(state.speed * dt)`. Keep the run cycle advancing and force the matching left/right pose during the pivot.

- [x] **Step 5: Handoff to the next straightaway**

At animation completion, rebuild the nine pooled segments, reset the world and camera to chase coordinates, apply the new heading biome tint, and clear the turn class without showing an overlay or pausing gameplay.

### Task 3: Obvious pit obstacles

**Files:**
- Modify: `cappy-3d.js`

**Interfaces:**
- Consumes: the existing `PIT` obstacle type and unchanged jump collision rule.
- Produces: a larger dark pit silhouette, broken high-contrast rim, and ground chevrons on the approach side.

- [x] **Step 1: Enlarge and reshape the opening**

```js
pit.scale.set(1.08, 1.55, 1);
```

Use the same transform for the coral outer ring so the hazard fills its lane and reads in perspective.

- [x] **Step 2: Add edge breakup and advance warning**

Add cream/stone fragments around the rim and two sun-colored chevrons at positive local Z, which is the player-facing approach side. Keep the obstacle origin and collision logic unchanged.

### Task 4: Collision-specific crash motion

**Files:**
- Modify: `cappy-3d.js`

**Interfaces:**
- Consumes: obstacle collision world position and the existing crash loop.
- Produces: solid-obstacle recoil that stays in front of the mesh and a dedicated 1.5-second pit fall.

- [x] **Step 1: Preserve the collision point**

Pass the obstacle world Z into `crash()` and place Cappy on the camera-facing side before freezing the course.

- [x] **Step 2: Split solid and pit crash motion**

For solid hazards, move Cappy farther toward the camera during recoil instead of through the obstacle. For pits, keep Cappy centered over the opening, sink him below the track, shrink the rig, fade the shadow, and use the longer pit-fall duration.

### Task 5: Regression verification

**Files:**
- Test: `Cappy3D.html`
- Test: `cappy-3d.css`
- Test: `cappy-3d.js`

**Interfaces:**
- Consumes: localhost test actions and HUD data attributes.
- Produces: fresh evidence for the two power-ups, double-tap activation, invincibility, required turns, full-speed animation, and bounded recycling.

- [x] **Step 1: Run static checks**

```bash
node --check cappy-3d.js
```

Expected: exit `0`, no `INK BOOST` or `pickup.type === 'BOOST'`, all referenced DOM IDs and local assets present.

- [x] **Step 2: Verify power-ups in the browser**

Force fruit collection and confirm boost charge rises by `55` up to the `100` cap. Force Supercharge collection, confirm the side inventory count, double-tap to consume one charge, confirm the animated overlay appears, collide with an obstacle and boulder during the eight-second timer, and confirm the mode remains `RUNNING`.

- [x] **Step 3: Verify the required turn event**

Force a buffered right turn, verify the prompt is visible, send the wrong direction and confirm the turn remains active, then send right and confirm `turnAnimation` becomes active, heading changes, the game stays `RUNNING`, speed is not reduced, and the next straightaway completes with `9` active segments.

- [x] **Step 4: Verify browser quality**

Check desktop and phone layouts for inventory and prompt legibility, then confirm the browser log contains zero errors or warnings.
