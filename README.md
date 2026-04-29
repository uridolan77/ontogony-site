# Ontogony Site

Ontogony is a field-guide style knowledge site about the _Transductive Universe_: concepts, working essays, curated reading paths, and learning-layer runs (quizzes and flashcards).

It is designed to be:
- MD-first content with strongly validated frontmatter/schema
- reader-friendly (field-guide chrome, stable navigation, accessible controls)
- author-friendly (TinaCMS for editing)

## Stack

- [Astro](https://astro.build/) (static site generation)
- React (quiz and flashcard players)
- MDX (for concepts/essays/paths/diagrams content)
- [Tailwind CSS](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- [TinaCMS](https://tina.io/) (content editing)

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. (Optional) If you run TinaCloud/admin builds locally, create a `.env` file. See `.env.example`.

## Development

Run the dev server:

```bash
npm run dev
```

## Production build

```bash
npm run build
```

## Content audits

Run the pre-flight audits (fail fast on orphan references / invalid content):

```bash
npm run audit:slugs
npm run audit:quizzes
npm run audit:flashcards
```

For the full check pipeline:

```bash
npm run check
```

## TinaCMS note

This repo uses TinaCMS for editing. For _TinaCloud/admin_ builds, you need the environment variables in `.env.example`:

- `TINA_CLIENT_ID`
- `TINA_TOKEN`
- `TINA_BRANCH=main`

Local reading/dev can work without Tina auth, but Tina build/edit flows need these values.

Common Tina commands:

```bash
npm run tina:dev
npm run tina:build
```

## Content collections overview

Astro content collections live under `src/content/` and are registered in `src/content.config.ts`.

Collections in this repo:
- `concepts`
- `essays`
- `paths`
- `diagrams`
- `fragments`
- `quizzes` (JSON)
- `flashcards` (JSON)

## Learning-layer note (quizzes + flashcards)

Quizzes and flashcards are authored as JSON under:
- `src/content/quizzes`
- `src/content/flashcards`

They are rendered with React players mounted from:
- `src/pages/quizzes/[slug].astro`
- `src/pages/flashcards/[slug].astro`

Their interaction state is session-only (no account, no persistence).

## Deployment

- Use `npm run build` to generate the static site output for deployment.
- If you are running the TinaCMS build step as part of deployment, use:
  - `npm run build:cms`

Astro `site` URL is set in `astro.config.mjs` for SEO output (sitemap, etc.).

