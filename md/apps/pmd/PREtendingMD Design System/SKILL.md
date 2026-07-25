---
name: closedose-design
description: Use this skill to generate well-branded interfaces and assets for CloseDose, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick map
- `colors_and_type.css` — drop-in CSS variables (light + dark)
- `assets/` — logos (mark + wordmark, light + dark)
- `ui_kits/app/` — mobile dose-lookup recreation (HomeScreen, DoseScreen, TabBar, MedCard, KidPill, Icon)
- `ui_kits/web/` — marketing site recreation (Header, Hero, StackedCards, FeatureGrid, CTA, Footer)
- `preview/` — small token-card examples to crib from

## Voice cheat sheet
- Sentence case everywhere; no Title Case
- Plain English: "Find the right dose" not "Determine the appropriate dosage"
- Numerals for doses, weights, ages, times
- Errors are warm: "That weight looks off — can you check?"
- Always include the safety line on dose results: *"Always confirm dosing before administering medication."*
- No emoji in product UI

## Visual cheat sheet
- Brand teal `#18A78D` (Teal 500, sampled from app icon); hover Teal 600; press Teal 700
- Cream `#FBF8F2` page; white cards; mint `#E8F5F1` tints
- Dark mode is warm-dark: `#0B1717` page, never pure black
- Type: Nunito Sans 700/800 (display + dose numerals), Inter (UI/body), DM Mono (unit labels)
- Cards: 16px radius, hairline border, soft shadow, 24px padding
- Motion: 320ms `cubic-bezier(0.2,0,0,1)`, no bounces
- Icons: Lucide, 1.75px stroke

## PREtendingMD sub-brand (pediatric ED board)
- Tokens in `pretendingmd.css` (`--pmd-*`, scoped to `.pmd`, switch theme with `data-pmd-theme="dark|light"`)
- Vivid **clinical spectrum leads**; teal is a quiet family thread (`--pmd-family`)
- Spectrum: tobeseen·rose → workup·sky → fellow·blue → staffed·indigo → attending·violet → dispo·fuchsia → ready·emerald (each has `-on/-ink/-soft/-line/-grad`); `--pmd-flag` amber for barriers
- Dark = warm navy `#070e1c` board; Light = soft pediatric pastel (pale-blue + cream + white cards)
- Two registers: clinical core = clean/dense; playful shells (launch/login/footer) = teddy + `--crayon-*` rainbow + Gochi Hand chalk
- Fonts: Baloo 2 (brand), Nunito Sans (clinical), Inter (UI), DM Mono (units). Gradients on active states only
- Examples: `PREtendingMD Board.html`, `preview/pmd-*.html`
