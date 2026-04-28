# GitHub Issue Templates for Ontogony

## Concept Page Issue

```md
## Goal

Create or revise concept page:

`[concept-name]`

## Agent Labels

- agent:managing-editor
- agent:philosophy-professor
- agent:literary-editor
- agent:reader-advocate
- agent:dev-architect

## Source Material

- Chapter:
- Existing notes:
- Related concepts:

## Deliverable

MDX concept entry with:

- title
- short definition
- register
- chapter source
- genealogy
- notThis
- related
- whereNext
- body

## Acceptance Criteria

- concept is clear to a new reader
- concept is philosophically precise
- related links resolve
- build passes
```

## Chapter Companion Issue

```md
## Goal

Create chapter companion page:

`Chapter N — [Title]`

## Agent Labels

- agent:managing-editor
- agent:literary-editor
- agent:philosophy-professor
- agent:reader-advocate
- agent:dev-architect

## Source Material

- manuscript chapter:
- key anchor scene:
- central operator:

## Deliverable

Site-facing essay with:

- the problem
- opening ordeal
- central operator
- key concepts
- what the chapter establishes
- what it hands forward
- where next

## Acceptance Criteria

- shorter and clearer than manuscript chapter
- faithful to book argument
- navigable for public reader
- linked to concepts
```

## Diagram Issue

```md
## Goal

Create diagram:

`[diagram-name]`

## Agent Labels

- agent:diagram-cartographer
- agent:design-director
- agent:dev-architect

## Structure to Visualize

## Deliverable

- diagram concept
- caption
- linked concepts
- image/SVG/MDX entry

## Acceptance Criteria

- clarifies theory
- visually fits site
- works on mobile
```

## Dev Issue

```md
## Goal

## Branch

## Files Likely Affected

## Acceptance Criteria

- npm run audit:slugs passes
- npm run build passes
- routes checked
- Vercel deploy works if relevant
```

## PR Review Issue

```md
## PR

## Review Agents

- Dev Architect
- Reader Advocate
- Literary Editor
- Philosophy Professor
- Design Director

## Questions

- Does it build?
- Does it improve the site?
- Does it preserve identity?
- Does it introduce risk?
- Should it merge?
```
