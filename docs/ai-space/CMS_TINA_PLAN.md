# TinaCMS / Editorial Workflow Plan

## Goal

Use TinaCMS as a Git-backed editing layer over the existing MDX files.

Tina should make it easier to edit:

- concepts
- essays
- reading paths
- diagrams
- fragments

The source of truth remains:

```txt
src/content/
```

## Key Principles

- Tina is an editing UI, not a replacement architecture.
- Astro Content Collections remain the build-time content model.
- MDX remains in Git.
- Tina schema mirrors Astro schema.
- Draft/published workflow should be supported.
- `updatedAt` should be stamped on save.
- Slug/reference health should be audited.

## Collections

Tina collection names:

```txt
concept
essay
path
diagram
fragment
```

Paths:

```txt
src/content/concepts
src/content/essays
src/content/paths
src/content/diagrams
src/content/fragments
```

## Editorial Metadata

Add to all content types:

```yaml
status: published
createdAt: YYYY-MM-DD
updatedAt:
```

Drafts:

- visible in local dev
- hidden in production
- production pages should not link to draft-only routes

## Slug Audit

Audit:

- `concept.related`
- `concept.whereNext`
- `essay.cites`
- `essay.whereNext`
- `path.steps`

## MDX Templates

Initial essay components:

```txt
PullQuote
SectionGlyph
FootnoteMarker
```

Possible later:

```txt
Lede
TheoryNote
DiagramFigure
ChapterHandoff
```

## Local Workflow

```bash
npm run tina:dev
```

Visit:

```txt
http://localhost:4321/admin/
```

## Production Workflow

1. Set Tina env vars in Vercel
2. Build with `tinacms build && astro build`
3. Visit `https://ontogony.net/admin/`
4. Tina commits edits to GitHub
5. Vercel rebuilds

## Acceptance Criteria

- `/admin` loads locally
- `/admin` loads on Vercel
- concept edits write valid MDX
- essay body round-trips
- slug audit passes
- build passes
- draft content is hidden in production
