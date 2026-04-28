# Tina Indexing Investigation

## Problem
`tinacms build --local --skip-cloud-checks` intermittently stalls at `Indexing local files` on Windows in this repository.

## Scope
This issue is intentionally separate from production site build stability.

## Current Decision
- Default site build is decoupled from Tina (`npm run build` runs `astro build`).
- CMS build remains available via `npm run build:cms`.

## Repro
1. Run `npm run tina:build:local`.
2. Observe whether output stalls at `Indexing local files` for an extended period.

## Investigation Checklist
- Capture timing for `npm run tina:build:local` across multiple runs.
- Check whether stall correlates with cold vs warm npm cache.
- Verify if antivirus/indexing software is scanning `src/content` or `.tina` paths.
- Run with Node LTS variant to compare behavior.
- Compare behavior with a reduced content subset.
- Check for Tina CLI version regressions and changelog notes.
- Try running Tina build in WSL to isolate Windows-specific file I/O behavior.

## Exit Criteria
- Reliable Tina build completion under expected local dev conditions, or
- Documented workaround with known constraints and command guidance.
