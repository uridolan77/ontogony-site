# First Prompt — Align Current MDX Content with the Book

Paste this into Claude Code / your dev AI.

```text
We have shipped ontogony.net. Now perform a content-alignment pass so the site more closely reflects the book project.

Goal:
Update existing site content and metadata so the canonical public title becomes:

Ontogony: A Field Guide to the Transductive Universe

The site should present itself as a public field guide and companion atlas to the book’s argument, not merely as a standalone theory site.

Important:
This is a content/MDX/copy pass, not a redesign.

Use the uploaded book chapters as the source horizon. The book spine is:

1. Chapter 1 — The Hard Problem of Grounding: Rival Ontologies, Compositional Immanence, and the Transductive Exit
2. Chapter 2 — The Demon’s Unpaid Bill: Landauer, Finite Observers, and the Limits of Flat Physicalism
3. Chapter 3 — The Price of Being: Ontogony and the Thermodynamic Reality of Levels
4. Chapter 4 — The Immanentist Underground: A Genealogy of Exaptation
5. Chapter 5 — The Genesis Engine: The Architecture of Novelty
6. Chapter 6 — The Stabilisation Engine: Hylogenesis and the Persistence of Reality
7. Chapter 7 — The Stratification Engine: The Architecture of Normogenesis and Escape from Saturation
8. Chapter 8 — The Bioelectric Governor
9. Chapter 9 — The Embodied Present
10. Chapter 10 — The Affective Witness
11. Chapter 11 — The Offline Mind
12. Chapter 12 — The Symbolic Exit
13. Chapter 13 — The Sixth Transduction

Tasks:

1. Update global title/framing copy
- Use “Ontogony: A Field Guide to the Transductive Universe” as the canonical project title.
- Keep “A field guide to the becoming of things” only as a secondary lyrical line where useful.
- Update homepage, metadata, description text, and any visible title/subtitle language accordingly.

2. Update homepage copy
Reframe the homepage as:
- the public field guide to the book
- a companion atlas to the Transductive Universe
- an entry into the manuscript’s major problems, engines, strata, and concepts

The homepage should mention that the site organizes the book through:
- concepts
- essays
- reading paths
- diagrams
- fragments

3. Update /theory and /about copy
Make these pages explain:
- what the book project is
- what the site is
- how to read the site
- how the site relates to the thirteen-chapter argument
- where a new reader should begin

4. Add or update a book-spine section
Create a visible section, preferably on /theory or /about for now, listing the thirteen chapters with one-line descriptions.

Do not create a new /book route unless it is simpler and clearly justified. Prefer updating existing pages first.

5. Update existing concepts
For each existing concept MDX file, add or refine references to the book where appropriate:
- source chapter or chapter range
- relation to the book’s argument
- clearer where-next links
- language that connects the concept to the book spine

Do not rewrite every concept heavily. Make a focused alignment pass.

6. Update essays/paths language
Make the current essay and reading path feel like part of the book companion architecture.
Rename or reframe labels if needed so they point into the manuscript’s argument.

7. Keep architecture intact
Do not redesign.
Do not change layout.
Do not add CMS in this pass.
Do not add search.
Do not add new interactive features.
Do not add a large number of new content pages yet.

8. Verification
After changes:
- run npm run build
- check homepage
- check /theory
- check /about
- check /concepts
- check at least one concept page
- report files changed and summarize the content shifts

Deliverable:
A small PR titled:

Content alignment: book-facing title and chapter spine

Stop after this content-alignment pass.
```
