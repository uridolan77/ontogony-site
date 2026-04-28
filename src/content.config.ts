import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const Register = z.enum(['R1', 'R2', 'R3', 'R4']);

const whereNextStep = z.object({
  kind: z.enum(['concept', 'essay', 'path', 'diagram']),
  slug: z.string(),
  title: z.string().optional(),
  why: z.string().optional(),
});

const concepts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/concepts' }),
  schema: z.object({
    title: z.string(),
    short: z.string(),
    order: z.number().optional(),
    related: z.array(z.string()).default([]),

    // structural fields exposed to the ledger
    register: Register,
    chapter: z.string().optional(),
    burnRate: z.string().optional(),
    cessation: z.string().optional(),
    genealogy: z.array(z.string()).default([]),
    notThis: z.array(z.string()).default([]),
    whereNext: z.array(whereNextStep).default([]),
  }),
});

const essayFootnote = z.object({
  id: z.string(),
  body: z.string(),
});

const essays = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date().optional(),
    register: Register.optional(),
    readingTime: z.number().optional(),
    number: z.number().optional(),
    chapter: z.string().optional(),
    cites: z.array(z.string()).default([]),
    footnotes: z.array(essayFootnote).default([]),
    whereNext: z.array(whereNextStep).default([]),
  }),
});

const pathStop = z.object({
  kind: z.enum(['concept', 'essay', 'note']),
  slug: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  register: Register.optional(),
  minutes: z.number().optional(),
});

const paths = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/paths' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    number: z.number().optional(),
    strataCovered: z.array(Register).default([]),
    totalMinutes: z.number().optional(),
    steps: z.array(pathStop),
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
