# PREtendingMD (PMD) — UX improvements & analytics

This note covers two things:

1. **What changed in this pass** — the concrete UX, data, and analytics work.
2. **A prioritized roadmap** for making PMD feel like it *just works* for the
   less tech‑savvy attendings, while staying powerful for the residents and
   fellows who live in it all shift.

The guiding principle throughout: **an attending should be able to glance at a
phone for three seconds, or sit at the desktop "hub," and instantly trust what
they see.** No manuals, no settings spelunking, no "did it save?"

---

## 1. What changed in this pass

### Analytics — see your traffic and usage

Both properties now report to the **same Google Analytics 4 property
(`G-WYY1QFRPYP`)** that already powered closedose.com, so everything lives in
one dashboard.

| Where | What you can now see |
| --- | --- |
| **closedose.com** | The `calculate_dose` event fires every time the calculator returns a real result. Params: `age_group`, `weight_unit`, `result_type` (`infant` / `pediatric` / `adolescent` / `emergency`). This answers *"how often is the calculator actually used,"* not just page views. |
| **closedose.com/PMD** | Page traffic is captured automatically (the gtag snippet is in the PMD `index.html`). On top of that, the app sends product events: `screen_view` (per tab), `onboard_complete` (with role), `create_session`, `join_session`, `add_patient`. |

**How to read it in GA4:** *Reports → Engagement → Events* shows counts for
`calculate_dose`, `add_patient`, etc. Use *Explore → Free form* and break the
event down by its parameters (e.g. `calculate_dose` by `age_group`) to see which
age bands dominate. To see PMD traffic alone, filter *Reports → Pages and
screens* by page path containing `/PMD`.

Notes:
- All analytics calls are **best‑effort and fail‑safe** — if gtag is blocked or
  offline, the calls are silent no‑ops and never interfere with dosing or the
  board. No PHI is ever sent: only counts, roles, age bands, and UI state.
- **To split PMD into its own GA4 property later:** create a new GA4 data
  stream, then change the ID in two places — `pmd/index.html` (the gtag snippet)
  and `GA_MEASUREMENT_ID` in `pmd/src/lib/analytics.ts` — and rebuild.

### "It just works" — trust and recognition

- **Real‑time sync is now visible and honest.** The old green "Live Sync" dot
  was decorative. There is now a `SyncStatus` badge — in the header on every
  tab and on the board — driven by the actual Firestore connection state:
  - 🟢 **Live · Synced** — everyone on the session sees changes instantly.
  - 🟡 **Reconnecting…** — syncing; your edits are safe.
  - 🔴 **Offline · Saved on device** — no connection; changes save locally and
    sync when you're back. Plain words, no jargon.
- **Patient first name + last initial.** Patients are now entered and shown as
  e.g. **"Sarah M."** instead of a cryptic "SM". This matches how clinicians
  actually refer to kids and makes the board instantly readable at a glance. The
  legacy `initials` field is kept in sync automatically, so search and handoff
  keep working and older records still render. Only a **first name + single last
  initial** are ever stored (never a full surname), and the privacy notice was
  updated to say so.
- **Layout adapts to the device automatically.** First time you open PMD it
  defaults to the multi‑column **information hub** on a desktop and the
  single‑column **quick reference** on a phone — no toggle hunting. You can
  still override it in Settings, and your choice is remembered.
- **Copy cleanup.** Fixed a stray non‑English word in the disposition panel and
  tightened a few labels.

---

## 2. Roadmap — making it effortless for every attending

Ordered roughly by impact‑to‑effort. Items marked ✅ are done in this pass.

### A. Trust & "did it save?" (highest impact)
- ✅ Honest, always‑visible sync status.
- **Per‑field "saved" micro‑feedback.** A brief checkmark pulse when a field
  commits removes the last shred of "did that take?" doubt.
- **Presence avatars.** Show who else is on the session right now (e.g. "You +
  Dr. Chen viewing"). Reuses the team list; turns the abstract "real‑time" into
  something you can see.
- **"Last updated 4s ago by JC" on each card.** `updatedAt` is already stored;
  surfacing it makes collaboration legible.

### B. Reduce taps & reading load on mobile
- **One‑tap patient add with name focus.** After "Add Patient," auto‑focus the
  first‑name field and open the keyboard so the attending just starts typing.
- **Bigger primary targets in quick‑reference mode.** Room, name, status, and
  the 3 care‑phase buttons are the only things most attendings touch on a phone;
  make those the largest tap targets and let everything else collapse.
- **Swipe actions** on a card (swipe right = "Seen by attending," left =
  disposition) for power users, with the buttons still there for everyone else.

### C. Make the board scannable in 3 seconds
- **Status‑grouped "rounding" view** (New → Worked‑up → Ready to dispo →
  Dispositioned) as a one‑tap preset, distinct from the per‑provider filter.
- **Color is information, not decoration.** Tighten to one dominant accent per
  state so a glance reads the room. Today several states share warm hues.
- **"Needs you" pile.** A pinned strip at top: patients flagged
  `readyForAttending` and not yet staffed — the attending's actual to‑do list.

### D. Onboarding that disappears
- **Remember me by default** (already storing name/role) and offer a "Resume
  last session" button on launch so a returning attending is one tap from the
  board.
- **Demo/seed button on an empty board**, not buried in Settings, so a first‑time
  user immediately sees what a populated board looks like.
- **Installable PWA prompt** ("Add PREtendingMD to your home screen") — the
  manifest and icons already exist; a gentle prompt makes it feel like an app.

### E. Desktop "information hub" polish
- **Keyboard shortcuts** for the desk user (j/k to move between cards, number
  keys for status) — invisible to phone users, a superpower at the workstation.
- **Print/handoff styling** already exists; add a "copy sign‑out" button that
  formats the active list as text for the EHR.

### F. Safety & data hygiene
- **Auto‑expire old shifts** (e.g. clear a session 24h after end) so limited
  identifiers don't linger. Pairs with a visible "this board clears at end of
  shift" reassurance.
- **Confirm‑on‑delete with undo** (undo toast already exists for edits; extend it
  to deletes).

### G. Instrument the roadmap with the analytics you now have
Use the events above to decide what to build next:
- Low `add_patient`‑to‑`screen_view` ratio on mobile → the add flow is too heavy
  (do B).
- Lots of `join_session` but few `create_session` → sharing works; lean into
  presence (A).
- `calculate_dose` `result_type=emergency` spikes → consider clearer infant
  safety messaging on closedose.com.

---

*Implementation pointers:* analytics live in `pmd/src/lib/analytics.ts` and the
gtag snippets in `pmd/index.html` / `public/index.html`; the sync badge is
`pmd/src/components/SyncStatus.tsx`, fed by `syncState` in `pmd/src/App.tsx`. The
deployed PMD bundle in `public/PMD/` is generated — edit the source in `pmd/` and
rebuild per `pmd/README.md`.
