# Apply the Ontogony field-guide design system

You are working in the Astro project `uridolan77/ontogony-site`, currently on branch `claude/plan-ontogony-v1-zPSHt`. A design handoff package is in `docs/handoff/`. Your job is to port the prototype into the Astro repo without losing fidelity.

## Source of truth

- **Design intent** — `docs/handoff/handoff.html`. Open it in a browser and read end to end before writing code. Follow its component map and PR sequence.
- **Visual reference** — the five prototype pages in `docs/handoff/prototype/`. Lift markup from these directly when porting.
- **Shared stylesheet** — `docs/handoff/ontogony.css`. The component CSS is already written; do not redesign it. Port it into Tailwind v4 `@layer components` blocks in `src/styles/global.css`, preserving class names and behaviour.

## Non-negotiables

1. **Two accents, two jobs.** `--color-accent` is gold (`oklch(70% 0.10 80)`) — structural, used for register tags, stratum markers, route spines. `--color-active` is electric blue (`oklch(56% 0.18 245)`) — kinetic, used **only** for active state (link hover, current path step, "you are here"). Do not collapse them into a single accent. The previous rust accent (`#6b3a1f`) is retired.
2. **Three font families.** Source Serif 4 (serif), Inter Tight (sans), **JetBrains Mono (mono)**. Adding mono is mandatory — register tags, instrument readouts, navigation labels, ledger field labels, footnote markers, and the stratum locator all depend on it.
3. **Schema before layout.** Land the extended frontmatter schema (handoff §4) before the templates. The templates assume `register`, `whereNext`, `notThis`, etc. Backfill the seven existing concept MDX files in the same PR.
4. **Class-name discipline.** The repo's existing `.ledger-list` and the prototype's `.ledger` are different components. Per handoff §3, rename the repo's list-of-concepts component to `.atlas-list` and reserve `.ledger` for the fixed-field grid inside a single concept page.
5. **Three Tweaks** (`data-posture`, `data-temp`, `data-density` on `<body>`) ship as a small client-only React island, mirroring the prototype's behaviour. Defaults: `descend` / `ivory` / `canonical`. Lowest priority — ship the visual layer without it and add later if needed.

## PR sequence (follow exactly)

1. **Theme migration.** Replace the `@theme` block in `src/styles/global.css` with the drop-in from handoff §2.3. No other changes. Verify visual diff is the new palette + Source Serif 4.
2. **Schema extension.** Update `src/content.config.ts` per handoff §4 (concepts, essays, paths). Backfill the seven existing concept MDX files with `register` + any obvious `notThis` / `whereNext`. The `register` field is required on concepts — choose by reading the concept body and matching it to R1 (field) / R2 (biological) / R3 (cognitive) / R4 (institutional).
3. **Layout chrome.** Build `src/layouts/BaseLayout.astro` containing the instrument bar, the three-column `.frame` grid, the `.nav` left rail, the `.stratum-locator` left-rail ladder, the `.margin-notes` right rail, and the `.colophon` footer. Reuse this on every page.
4. **Concept atlas + concept detail.** `src/pages/concepts/index.astro` (uses `.band` + `.atlas-list`) and `src/pages/concepts/[slug].astro` (uses `.ledger` + `.where-next`). Lift markup from `docs/handoff/prototype/concepts.html` and `docs/handoff/prototype/concepts/cessation-signature.html`.
5. **Homepage.** `src/pages/index.astro`. Reuses `.band` from PR 4. Mirror `docs/handoff/prototype/index.html`.
6. **Essay detail + reading path + path ribbon.** `src/pages/essays/[slug].astro` (uses `.body`, `.pullquote`, `.section-glyph`), `src/pages/paths/[slug].astro` (uses `.route` + `.route-stop` + `.route-end`), and a small client script for the sticky `.path-ribbon`. Mirror `docs/handoff/prototype/essays/worm.html` and `docs/handoff/prototype/paths/cost-of-persistence.html`.
7. **Tweaks island.** Optional. React component mounted on the layout; persists user choice via cookie or `localStorage`; applies the three `data-*` attributes on `<body>` server-side or pre-hydrate to avoid flash.

## Acceptance checks

- The five live Astro pages render with the same visual rhythm as the five prototype pages — bands, ledger rows, the route spine, and the path ribbon all present and gilded correctly.
- A fresh concept MDX file with full frontmatter renders the entire ledger (Register / Definition / Burn rate / Cessation signature / Genealogy / Related / What it is not / Where to go next) with no further authoring.
- Active link state and the current reading-path step are blue. Register tags and stratum markers are gold. No third accent appears anywhere.
- The page renders correctly with mono missing (graceful fallback to ui-monospace) and the JetBrains Mono webfont loaded (the intended state).
- Mobile viewport collapses to single column with the left and right rails hidden, per the prototype's media queries.

## Out of scope (per handoff §7)

Theory page, diagrams page, search, footnote plugin. Stub the routes if needed; do not design them.

When you finish each PR, post a screenshot of the relevant page next to the prototype version of the same page for visual diff.
