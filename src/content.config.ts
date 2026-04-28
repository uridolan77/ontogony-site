import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const concepts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/concepts' }),
  schema: z.object({
    title: z.string(),
    short: z.string(),
    order: z.number().optional(),
    related: z.array(z.string()).default([]),
  }),
});

const essays = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date().optional(),
  }),
});

const pathStep = z.object({
  kind: z.enum(['concept', 'essay', 'note']),
  slug: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
});

const paths = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/paths' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    steps: z.array(pathStep),
  }),
});

const diagrams = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/diagrams' }),
  schema: z.object({
    title: z.string(),
    caption: z.string().optional(),
    image: z.string().optional(),
  }),
});

const fragments = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/fragments' }),
  schema: z.object({
    title: z.string().optional(),
  }),
});

export const collections = { concepts, essays, paths, diagrams, fragments };
