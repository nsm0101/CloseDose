# PREtendingMD Design System

A design system for **PREtendingMD** — an emergency department clinical workflow patient management dashboard to assist in Attending physicians allowing for Fellow autonomy while taking the role of department leader (with background supervision).

---

## Product context

**PREtendingMD** lives at **closedose.com/PMD**.

## Design influences

- **closedose.com** — the existing product. Teal color story. Dark-mode aware.

---

## Index

| File / folder | What it is |
| --- | --- |
| `README.md` | This file. Brand context + content + visual + iconography fundamentals. |
| `colors_and_type.css` | All color and typography tokens (light + dark), as CSS custom properties. |
| `fonts/` | Webfont files used by the system. |
| `assets/` | Logos, marks, and brand imagery. |
| `preview/` | Small HTML cards that populate the Design System review tab. |
| `ui_kits/web/` | UI kit recreating the marketing site + dose-lookup flow. |
| `ui_kits/app/` | UI kit recreating the mobile dose-lookup app screens. |
| `SKILL.md` | Cross-compatible Skill manifest for using this system in Claude Code. |

---

## Content fundamentals

CloseDose is **calm, clinical, and calculated**. It reads like a thoughtful pediatrician explaining something to you.

**Voice characteristics**

- **Clinical language.** Medical-facing application.
- **Sentence case everywhere.** Headlines, buttons, nav. Title Case feels stiff; SHOUTING feels alarming. The only ALL CAPS we use is on a single warning label or on a section eyebrow tag (`SAFETY`).
- **Numbers as numerals** when they are doses, weights, ages, or times. "5 mL", "ages 2–11", "every 4 hours". Not "five milliliters."
- **Units always spelled or abbreviated consistently** — `mL`, `mg`, `kg`, `lb`, `°F`. Never mixing styles.
- **Reassuring, never panicked.** Errors say "Let's double-check that weight" — not "Invalid input."

**Emoji**: not in product. Allowed in marketing illustration captions sparingly (a single 🌙 for night-mode messaging, a 🍼 in a "for babies" eyebrow). Never inside dose data, never inside buttons, never as bullets.

**Casing summary**

- **Sentence case**: headlines, buttons, nav, modal titles
- **lowercase**: nothing (we don't do faux-humble all-lowercase)
- **ALL CAPS**: single-word eyebrow tags (`SAFETY`, `NEW`), tracked +0.08em
- **Title Case**: only proper nouns and drug brand names (Tylenol, Motrin, CloseDose itself)

---

## Visual foundations

The visual system is built around three ideas: **a deep, calm teal that reads as both medical and bedtime**, **soft mint and cream grounds** that let cards float, and **stacked, layered cards** as the central compositional motif.

### Color

The palette is led by **Teal 500 (`#18A78D`) — the official brand teal, sampled from parent CloseDose branding color**. It's the action color, the link color, the brand mark color. Around it sits a cool-leaning neutral ramp (slates with a faint teal undertone) and a warm cream surface (`#FBF8F2`) for the marketing site, with mint (`#E8F5F1`) and seafoam (`#D6EFE8`) as soft surface tints.

- **Primary action**: Teal 500 (`#18A78D`)
- **Brand accent**: Teal 600 (`#128873`) for hover, Teal 700 (`#0E6D5C`) for press
- **Soft accent**: Mint 200 (`#C7E9DD`) for chips, badges, low-emphasis surfaces
- **Warning**: Amber 600 (`#D97A0E`) — used sparingly, for "check your dose" reminders, never for errors
- **Error**: Coral 600 (`#D84A4A`) — desaturated, never pure red. Pediatric ≠ alarming.
- **Success**: Sage 600 (`#2E9E6E`) — confirmations
- **Surfaces (light)**: cream (`#FBF8F2`) page → white (`#FFFFFF`) card → off-white (`#F4EFE5`) inset
- **Surfaces (dark)**: deep teal-black (`#0B1717`) page → slate-teal (`#13201F`) card → slate (`#1A2A29`) inset. Dark mode is **warm-dark, not pure black** — it has to be readable at 3am without scorching the eyes.

Full tokens in `colors_and_type.css`.

### Type

- **Display & headlines**: **Nunito Sans** (variable sans, weight 700–800). Rounded terminals echo the friendly app icon. Warm and parental without tipping childish. Used for hero copy, section headers, dose numerals.
- **UI & body**: **Inter** (variable sans). Neutral and trustworthy, sharp legibility for product chrome and form fields.
- **Numbers in dose results**: **Nunito Sans 700** at large sizes (the dose feels considered and warm); **Inter tabular-nums** in dense tables.
- **Mono / units**: **DM Mono** for unit labels (`mL`, `mg`, `kg`), timestamps, and any data chips.

Type scale uses a 1.250 (major third) ratio at body and below, jumping to 1.5 for display. Line-height is generous: 1.6 for body, 1.15 for display.

All three are loaded from Google Fonts in `colors_and_type.css`. **If CloseDose ships with different brand fonts in production, please share them** and I'll swap them in.

### Spacing

A 4-pt grid. Tokens: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96. Cards prefer 24–32 internal padding; sections prefer 64–96 vertical rhythm.

### Backgrounds

- **No full-bleed photography** in app surfaces. Photography belongs to marketing only and is warm, naturally lit, family/parent imagery — soft skin tones, no clinical hospital stock.
- **No noisy textures**. The only background "texture" is a very faint vertical gradient (teal 50 → cream) on hero sections, optional.
- **No hand-drawn illustrations.** This is a health product; we stay grounded.
- **Soft radial wash** behind the hero phone stack: a \~600px blurred mint disc, 40% opacity, set behind cards.

### Animation

Subtle, never bouncy. The product is for tired parents — energy is offensive.

- **Standard duration**: 200ms (`--motion-fast`), 320ms (`--motion-base`), 480ms (`--motion-slow`)
- **Easing**: `cubic-bezier(0.2, 0, 0, 1)` — a calm, asymmetric ease-out. Tokenized as `--ease-out-soft`.
- **Card entrance**: 12px translate-y + fade, 320ms, staggered 60ms when cards appear in a list.
- **Hover**: surface darkens 4% OR shadow grows from level-1 to level-2. Never both.
- **Press**: 0.98 scale, 120ms, snap back on release.
- **No bounces, no springs, no parallax.** A dose calculator is not a game.

### Hover & press

- **Buttons**: hover darkens fill by \~6% (Teal 600 → Teal 700). Press scales to 0.98. Focus ring is 2px Teal 500 with 4px white halo.
- **Cards**: hover lifts shadow (level-1 → level-2) and translates -2px. Press settles back to level-1. Cursor is `pointer`.
- **Links**: hover changes color (Teal 600 → Teal 700) AND underlines (ink decoration `underline-offset: 3px`).

### Borders & shadows

Cards are the primary container. Two shadow systems coexist:

- **Soft shadow (default)**: `0 1px 2px rgba(11,30,29,0.04), 0 8px 24px -8px rgba(11,30,29,0.10)` — warm, low-contrast, ambient.
- **Crisp shadow (dark mode + emphasized cards)**: `0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px -12px rgba(0,0,0,0.5)` — defined edges, pop without glare.

Borders are **1px hairlines** (`rgba(11,30,29,0.08)` light / `rgba(255,255,255,0.06)` dark), used in addition to shadow on cards for dark-mode definition. No 2px+ borders anywhere except focus rings.

### Corner radii

- **4** — chips, micro tags
- **8** — inputs, small buttons, secondary cards
- **12** — primary buttons
- **16** — cards (the default)
- **24** — hero/feature cards, modals
- **999px** — pills

### Cards (the central motif)

Cards are the heart of CloseDose. From the inspiration:

- Cards stack and overlap with a slight rotation (-2°/+2°) on marketing hero compositions, like a small fan of phones or features
- Inside the product, cards are flat (no overlap), but they layer: a parent card may contain child cards with the inset surface color
- All cards: 16px radius default, hairline border + soft shadow, 24px padding minimum
- Marketing hero cards: 24px radius, generous padding (32–40px)

### Transparency & blur

- **Blur is rare.** A 16px backdrop-blur on the sticky header when content scrolls beneath it. Nothing else.
- **Transparency** is used in tints (Mint 200 at 60% over cream) and in shadow fills, never in primary surfaces.

### Imagery vibe

- **Warm and naturally lit.** Hands-with-medicine, parent-and-child, kitchen-counter scenes. Never hospital corridors.
- **Skin tones look real.** No over-saturation, no green tint, no clinical cool grade.
- **Slight warmth grade overall.** +5 warmth, -5 saturation in spirit.
- **No b&w, no grain.**

### Layout rules

- **Marketing**: 1200px container max, 24px gutters on mobile, centered. Hero is asymmetric: text left, stacked phones right, slight overlap.
- **App**: full-bleed cards, 16px page gutters, sticky bottom CTA on dose-result screens.
- **Sticky elements**: app top nav (with backdrop-blur), bottom CTA bar on result screens. Marketing has a transparent-to-solid sticky header.
- **No fixed sidebars** in app. Tabs live at bottom (it's mobile-first).

---

## Iconography

CloseDose uses **Lucide** as the primary icon set — clean, friendly, 1.75px stroke, rounded line-caps. Lucide reads as both medical-credible and warm; it's the right register for a parent product.

- **Stroke**: 1.75px (Lucide default); never mix weights
- **Size grid**: 16, 20, 24, 32, 48 — pick one per context, do not interpolate
- **Color**: inherits `currentColor`. In default product chrome, icons use Slate 600. When inside a Teal pill or button, they use the contrast color.
- **Pediatric icons**: `baby`, `heart-pulse`, `pill`, `clock`, `moon`, `droplet`, `weight`, `thermometer`, `syringe` — these are the workhorses
- **No emoji in product UI.** A single `🌙` glyph may appear in marketing copy for night-mode messaging.
- **No unicode dingbats.** No ▸, ➜, ✓ — we use Lucide's `chevron-right`, `arrow-right`, `check`.

> ⚠️ Substitution flag: Lucide is used as the icon system here because the codebase wasn't available. **If CloseDose ships with a different icon set in production, please share** and I'll swap.

### Logos & marks

- **Wordmark**: "closedose" set in Fraunces SemiBold, 96 weight. The "o"s are dot-anchored — see logo SVG.
- **Mark**: a stylized teal droplet enclosing a soft "cd" monogram. Used as favicon and app icon.
- See `assets/` for SVGs.

---

## Accessibility

- All text/background combinations in `colors_and_type.css` clear WCAG AA at body sizes; AAA where possible at large display.
- Dark mode is fully tokenized — every surface and ink color has a `--dark-` counterpart.
- Focus rings are visible (2px Teal 500 + 4px halo) on every interactive element.
- Tap targets minimum 44×44px in app contexts.
- Numeric inputs use `inputmode="decimal"` and tabular figures.

---

## PREtendingMD — sub-brand

**PREtendingMD** is a sibling product in the CloseDose family: a **pediatric ED tracking board** for fellows learning to run the room. It keeps CloseDose's calm structural bones but has its own personality, defined in **`pretendingmd.css`** (all tokens `--pmd-*` namespaced, scoped to `.pmd`; folded into the system via an `@import` in `colors_and_type.css`).

**The idea:** the vivid **clinical spectrum leads the app**; CloseDose teal stays a quiet **family thread** (the `--pmd-family` token — links, "synced" status, the *part of the CloseDose family* footer). Two registers coexist:

- **Clinical** — board, patient cards, workflow. Clean, professional, dense.
- **Playful** — launch / login / empty states / settings / footer. Teddy + crayon.

**The clinical spectrum** is one tuned family (single lightness/chroma, varied hue) — the grown-up sibling of the crayon rainbow in the wordmark. States, each with `-on` / `-ink` / `-soft` / `-line` / `-grad` variants:

`--pmd-tobeseen` (rose) · `--pmd-workup` (sky) · `--pmd-fellow` (blue) · `--pmd-staffed` (indigo) · `--pmd-attending` (violet) · `--pmd-dispo` (fuchsia) · `--pmd-ready` (emerald). Plus `--pmd-flag` (amber barrier-open) and the `--crayon-*` rainbow for playful shells.

**Surfaces** switch on `.pmd[data-pmd-theme="dark"|"light"]`:

- **Dark** — warm navy board (`--pmd-bg #070e1c`), never pure black; the spectrum glows, active states use signature `-grad` gradients.
- **Light** — soft pediatric pastel: pale-blue ground + warm cream for playful shells + white cards. Gentle, not clinical-white.

**Type:** `--pmd-font-brand` (Baloo 2, playful display) · `--pmd-font-clinical` (Nunito Sans, board headers + patient names + numerals) · `--pmd-font-ui` (Inter, chrome) · `--pmd-font-mono` (DM Mono, timers/units) · `--pmd-font-chalk` (Gochi Hand, sparing — launch tagline, empty states). Gradients are a **signature on active/selected states only**, flat elsewhere.

**Assets:** `assets/pretendingmd/` — `sticker-head.png` (dashboard mark), `wordmark-tight.png` (crayon wordmark), `teddy-full-tight.png` (welcome hero), `teddy-mark-mono.png` (line icon).

**See it:** `PREtendingMD Board.html` (recreated board, dark + light, with playful welcome shell) and the **PREtendingMD** group in the Design System tab (`preview/pmd-*.html`).

## Open questions / asks

1. **Codebase / Figma**: please share so we can lock real tokens.
2. **Real fonts**: confirm Fraunces + Inter or send the production stack.
3. **Real logo files**: SVGs of the wordmark + app mark in production form.
4. **Photography**: any approved campaign imagery to seed the marketing kit.
5. **Dose data structure**: how doses are modeled (mg/kg, range vs single, age/weight gates) — needed to make the result component truly accurate.
