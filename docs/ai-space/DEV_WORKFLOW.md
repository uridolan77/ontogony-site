# Dev Workflow

## Repository

```txt
uridolan77/ontogony-site
```

## Production

```txt
https://ontogony.net
```

## Current Stack

- Astro
- MDX
- Astro Content Collections
- Tailwind
- React islands
- TinaCMS
- Vercel
- GitHub

## Source of Truth

Content source of truth:

```txt
src/content/
```

Schema source:

```txt
src/content.config.ts
```

Tina config:

```txt
tina/config.ts
```

## Standard Branch Workflow

1. Create/continue branch
2. Inspect repo state
3. Make focused changes
4. Run checks
5. Commit
6. Push
7. Review PR
8. Merge
9. Verify Vercel deploy

## Standard Inspection Commands

```bash
git status --short --branch
git log --oneline -10
git branch --show-current
git diff
```

## Standard Checks

```bash
npm install
npm run audit:slugs
npm run build
npm run preview
```

For Tina:

```bash
npm run tina:build:local
npm run tina:dev
```

## Core Routes to Check

```txt
/
 /theory
 /concepts
 /concepts/transduction
 /essays
 /essays/worm
 /paths
 /paths/cost-of-persistence
 /diagrams
 /about
 /admin
```

## Build Scripts Target

Preferred package scripts once Tina is active:

```json
{
  "dev": "astro dev",
  "start": "astro dev",
  "build": "tinacms build && astro build",
  "build:astro": "astro build",
  "build:cms": "tinacms build && astro build",
  "preview": "astro preview",
  "astro": "astro",
  "audit:slugs": "node scripts/audit-slugs.mjs",
  "check": "npm run audit:slugs && npm run build",
  "tina:dev": "tinacms dev -c \"npm run dev\"",
  "tina:build": "tinacms build",
  "tina:build:local": "tinacms build --local --skip-cloud-checks"
}
```

## Vercel Env Vars for Tina

```txt
TINA_CLIENT_ID
TINA_TOKEN
TINA_BRANCH=main
```

## Production Config

`astro.config.mjs` should use:

```ts
site: 'https://ontogony.net'
```

## PR Review Checklist

- build passes
- slug audit passes
- no visible route 404s
- production URL is correct
- draft links do not create production 404s
- Tina admin builds if CMS changes
- MDX renders correctly
- mobile layout still usable
