/**
 * TinaCMS schema for the Ontogony field guide.
 *
 * Mirrors src/content.config.ts (Astro Content Collections) — the
 * Markdown/MDX files under src/content/ remain the single source of truth.
 * Tina is a Git-backed editing layer; it reads and writes those files in
 * place, no database.
 *
 * Local workflow
 * ──────────────
 *   npm run tina:dev              # Tina admin + Astro dev server
 *   open http://localhost:4321/admin/
 *
 * Production workflow (Vercel)
 * ────────────────────────────
 *   Set env vars on the Vercel project:
 *     TINA_CLIENT_ID     # Tina Cloud project id (public-safe)
 *     TINA_TOKEN         # Tina Cloud read token (server-side)
 *     TINA_BRANCH        # optional; defaults to main / VERCEL_GIT_COMMIT_REF
 *   Set the Vercel build command to:
 *     npm run build:cms  # tinacms build && astro build
 *
 * Notes
 * ─────
 *  - updatedAt is stamped on save by a beforeSubmit hook (`stampUpdatedAt`).
 *  - Slug references in concept.related, essay.cites, whereNext[].slug,
 *    and path.steps[].slug stay as plain strings; `npm run audit:slugs`
 *    is the pre-flight check that gates orphan references. (Tina v3 does
 *    not support reference + list — the combination breaks GraphQL
 *    codegen, so reference-list fields cannot be used today.)
 */
import { defineConfig } from 'tinacms';

const REGISTER_OPTIONS = [
  { value: 'R1', label: 'R1 · Field' },
  { value: 'R2', label: 'R2 · Biological' },
  { value: 'R3', label: 'R3 · Cognitive' },
  { value: 'R4', label: 'R4 · Institutional' },
];

const STATUS_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

const KIND_OPTIONS = [
  { value: 'concept', label: 'Concept' },
  { value: 'essay', label: 'Essay' },
  { value: 'path', label: 'Path' },
  { value: 'diagram', label: 'Diagram' },
];

const PATH_STOP_KIND_OPTIONS = [
  { value: 'concept', label: 'Concept' },
  { value: 'essay', label: 'Essay' },
  { value: 'note', label: 'Note (inline)' },
];

// Tina collection-level hook that stamps updatedAt on every save.
// Tina does not do this automatically; without this hook updatedAt would
// stay whatever the author last typed (or empty).
const stampUpdatedAt = {
  beforeSubmit: async ({ values }: { values: Record<string, unknown> }) => ({
    ...values,
    updatedAt: new Date().toISOString(),
  }),
};

const metaFields = [
  {
    type: 'string' as const,
    name: 'status',
    label: 'Status',
    options: STATUS_OPTIONS,
    required: true,
  },
  {
    type: 'datetime' as const,
    name: 'createdAt',
    label: 'Created at',
  },
  {
    type: 'datetime' as const,
    name: 'updatedAt',
    label: 'Updated at',
    description: 'Set automatically on save.',
    ui: {
      // Read-only signal to the author that this is managed.
      component: 'date' as const,
    },
  },
];

// MDX components available inside an essay body. Each maps to an Astro
// component under src/components/mdx/ that the essay template renders via
// `<Content components={...} />`. Names must match the JSX names used in
// the MDX source.
const essayBodyTemplates = [
  {
    name: 'PullQuote',
    label: 'Pull quote',
    fields: [
      {
        type: 'rich-text' as const,
        name: 'children',
        label: 'Quote body',
      },
    ],
  },
  {
    name: 'SectionGlyph',
    label: 'Section glyph',
    fields: [
      {
        type: 'string' as const,
        name: 'glyph',
        label: 'Glyph (default §)',
      },
    ],
  },
  {
    name: 'FootnoteMarker',
    label: 'Footnote marker',
    inline: true as const,
    fields: [
      {
        type: 'string' as const,
        name: 'id',
        label: 'Footnote id (e.g. fn1)',
        required: true,
      },
      {
        type: 'string' as const,
        name: 'n',
        label: 'Number / superscript (e.g. ¹)',
        required: true,
      },
    ],
  },
];

const whereNextField = {
  type: 'object' as const,
  name: 'whereNext',
  label: 'Where to go next',
  list: true as const,
  fields: [
    {
      type: 'string' as const,
      name: 'kind',
      label: 'Kind',
      options: KIND_OPTIONS,
      required: true,
    },
    // Kept as string (not a polymorphic reference) per the v1 plan;
    // the audit script (`npm run audit:slugs`) validates these.
    { type: 'string' as const, name: 'slug', label: 'Slug', required: true },
    { type: 'string' as const, name: 'title', label: 'Title (optional override)' },
    { type: 'string' as const, name: 'why', label: 'Why (gloss)' },
  ],
};

export default defineConfig({
  branch:
    process.env.TINA_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    process.env.HEAD ||
    'main',
  clientId: process.env.TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      // -------------------------------------------------- concept
      {
        name: 'concept',
        label: 'Concepts',
        path: 'src/content/concepts',
        format: 'mdx',
        ui: {
          ...stampUpdatedAt,
          filename: {
            slugify: (values: { title?: string }) =>
              (values.title ?? 'untitled')
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, ''),
          },
        },
        defaultItem: () => ({
          status: 'published',
          createdAt: new Date().toISOString(),
          register: 'R2',
          related: [],
          relatedDiagrams: [],
          genealogy: [],
          notThis: [],
          whereNext: [],
        }),
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true, isTitle: true },
          {
            type: 'string',
            name: 'short',
            label: 'Short definition',
            required: true,
            ui: { component: 'textarea' },
          },
          { type: 'number', name: 'order', label: 'Order' },
          { type: 'number', name: 'chapterNumber', label: 'Chapter number' },
          { type: 'string', name: 'bookTitle', label: 'Book chapter title' },
          {
            type: 'string',
            name: 'register',
            label: 'Register',
            options: REGISTER_OPTIONS,
            required: true,
          },
          {
            type: 'string',
            name: 'burnRate',
            label: 'Burn rate (prose, optional)',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'cessation',
            label: 'Cessation signature (prose, optional)',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'genealogy',
            label: 'Genealogy (citations)',
            list: true,
          },
          {
            type: 'string',
            name: 'notThis',
            label: 'What it is not (one bullet per item)',
            list: true,
            ui: { component: 'textarea' },
          },
          {
            // Plain string list. Tina v3 does not support reference + list:
            // the combination breaks GraphQL codegen. The
            // `npm run audit:slugs` script validates these against the
            // concept collection.
            type: 'string',
            name: 'related',
            label: 'Related concepts (slugs)',
            list: true,
          },
          {
            type: 'string',
            name: 'featuredDiagram',
            label: 'Featured diagram (slug)',
          },
          {
            type: 'string',
            name: 'relatedDiagrams',
            label: 'Related diagrams (slugs)',
            list: true,
          },
          whereNextField,
          ...metaFields,
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
          },
        ],
      },

      // -------------------------------------------------- essay
      {
        name: 'essay',
        label: 'Essays',
        path: 'src/content/essays',
        format: 'mdx',
        ui: {
          ...stampUpdatedAt,
          filename: {
            slugify: (values: { title?: string }) =>
              (values.title ?? 'untitled')
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, ''),
          },
        },
        defaultItem: () => ({
          status: 'published',
          createdAt: new Date().toISOString(),
          cites: [],
          relatedDiagrams: [],
          footnotes: [],
          whereNext: [],
        }),
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true, isTitle: true },
          {
            type: 'string',
            name: 'summary',
            label: 'Summary / standfirst',
            required: true,
            ui: { component: 'textarea' },
          },
          { type: 'datetime', name: 'date', label: 'Date' },
          { type: 'string', name: 'register', label: 'Primary register', options: REGISTER_OPTIONS },
          { type: 'number', name: 'readingTime', label: 'Reading time (minutes)' },
          { type: 'number', name: 'number', label: 'Essay number' },
          { type: 'number', name: 'chapterNumber', label: 'Chapter number' },
          { type: 'string', name: 'bookTitle', label: 'Book chapter title' },
          {
            // Plain string list. See note on concept.related re Tina v3
            // reference-list limitation.
            type: 'string',
            name: 'cites',
            label: 'Cites (concept slugs)',
            list: true,
          },
          {
            type: 'string',
            name: 'featuredDiagram',
            label: 'Featured diagram (slug)',
          },
          {
            type: 'string',
            name: 'relatedDiagrams',
            label: 'Related diagrams (slugs)',
            list: true,
          },
          {
            type: 'object',
            name: 'footnotes',
            label: 'Footnotes',
            list: true,
            fields: [
              { type: 'string', name: 'id', label: 'Anchor id (e.g. fn1)', required: true },
              {
                type: 'string',
                name: 'body',
                label: 'Footnote body',
                required: true,
                ui: { component: 'textarea' },
              },
            ],
          },
          whereNextField,
          ...metaFields,
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
            templates: essayBodyTemplates,
          },
        ],
      },

      // -------------------------------------------------- path
      {
        name: 'path',
        label: 'Reading paths',
        path: 'src/content/paths',
        format: 'mdx',
        ui: {
          ...stampUpdatedAt,
          filename: {
            slugify: (values: { title?: string }) =>
              (values.title ?? 'untitled')
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, ''),
          },
        },
        defaultItem: () => ({
          status: 'published',
          createdAt: new Date().toISOString(),
          strataCovered: [],
          relatedDiagrams: [],
          steps: [],
        }),
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true, isTitle: true },
          {
            type: 'string',
            name: 'description',
            label: 'Description',
            required: true,
            ui: { component: 'textarea' },
          },
          { type: 'number', name: 'number', label: 'Path number' },
          {
            type: 'string',
            name: 'strataCovered',
            label: 'Strata covered',
            list: true,
            options: REGISTER_OPTIONS,
          },
          { type: 'number', name: 'totalMinutes', label: 'Total minutes' },
          {
            type: 'string',
            name: 'featuredDiagram',
            label: 'Featured diagram (slug)',
          },
          {
            type: 'string',
            name: 'relatedDiagrams',
            label: 'Related diagrams (slugs)',
            list: true,
          },
          {
            type: 'number',
            name: 'chapters',
            label: 'Chapters covered (numbers)',
            list: true,
          },
          {
            type: 'object',
            name: 'steps',
            label: 'Steps',
            list: true,
            fields: [
              {
                type: 'string',
                name: 'kind',
                label: 'Kind',
                options: PATH_STOP_KIND_OPTIONS,
                required: true,
              },
              { type: 'string', name: 'slug', label: 'Slug (concept | essay)' },
              { type: 'string', name: 'title', label: 'Title (override or note title)' },
              {
                type: 'string',
                name: 'body',
                label: 'Inline body / gloss',
                ui: { component: 'textarea' },
              },
              { type: 'string', name: 'register', label: 'Register', options: REGISTER_OPTIONS },
              { type: 'number', name: 'minutes', label: 'Minutes' },
            ],
          },
          ...metaFields,
        ],
      },

      // -------------------------------------------------- diagram
      {
        name: 'diagram',
        label: 'Diagrams',
        path: 'src/content/diagrams',
        format: 'mdx',
        ui: {
          ...stampUpdatedAt,
        },
        defaultItem: () => ({
          status: 'published',
          createdAt: new Date().toISOString(),
        }),
        fields: [
          { type: 'string', name: 'title', label: 'Title', required: true, isTitle: true },
          { type: 'string', name: 'caption', label: 'Caption' },
          { type: 'image', name: 'image', label: 'Image' },
          { type: 'number', name: 'chapterNumber', label: 'Chapter number' },
          { type: 'string', name: 'bookTitle', label: 'Book chapter title' },
          ...metaFields,
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body (notes, captions)',
            isBody: true,
          },
        ],
      },

      // -------------------------------------------------- fragment
      {
        name: 'fragment',
        label: 'Fragments',
        path: 'src/content/fragments',
        format: 'mdx',
        ui: {
          ...stampUpdatedAt,
        },
        defaultItem: () => ({
          status: 'published',
          createdAt: new Date().toISOString(),
        }),
        fields: [
          { type: 'string', name: 'title', label: 'Title' },
          { type: 'number', name: 'chapterNumber', label: 'Chapter number' },
          { type: 'string', name: 'bookTitle', label: 'Book chapter title' },
          ...metaFields,
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
          },
        ],
      },
    ],
  },
});
