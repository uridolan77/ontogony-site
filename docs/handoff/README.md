# Ontogony field-guide design handoff

This folder contains the design package for porting the prototype into the Astro repo.

## Files

- **`PROMPT.md`** — paste this into Claude Code / Cursor / your dev to start the implementation.
- **`handoff.html`** — open in a browser. The full design spec: tokens, component map, schema extensions, type rules, Tweaks, open questions, and the recommended PR sequence.
- **`ontogony.css`** — the shared stylesheet used by all five prototype pages. Port into `src/styles/global.css` (Tailwind v4 `@layer components`) preserving class names.
- **`prototype/`** — the five completed page templates. Lift markup directly when porting:
  - `prototype/index.html` — homepage (vertical stratified map)
  - `prototype/concepts.html` — concepts atlas (index)
  - `prototype/concepts/cessation-signature.html` — concept detail
  - `prototype/essays/worm.html` — essay detail
  - `prototype/paths/cost-of-persistence.html` — reading path
  - `prototype/tweaks-panel.jsx` — Tweaks panel component (for the optional island)
  - `prototype/path-ribbon.js` — sticky path-ribbon helper

## Quick start for the dev

1. Open `handoff.html` in a browser. Read it end to end.
2. Open `PROMPT.md` and follow the PR sequence.
3. When in doubt, lift markup from the matching `prototype/*.html` file.

## Design invariants (do not violate)

- Two accents, two jobs: **gold** is structural (register tags, stratum markers, route spines); **electric blue** is kinetic (active state only — link hover, current path step, "you are here").
- Three font families: **Source Serif 4** (serif), **Inter Tight** (sans), **JetBrains Mono** (mono — load-bearing, not optional).
- Mono carries register tags, instrument readouts, navigation labels, ledger field labels, footnote markers, and the stratum locator. Without it the field-guide texture collapses.
- Schema before layout: extend the frontmatter schema (handoff §4) before building the templates that depend on it.
