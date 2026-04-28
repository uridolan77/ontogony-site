#!/usr/bin/env node
/**
 * Walk every MDX/MD file under src/content/, parse its frontmatter, and
 * confirm that every slug-bearing reference resolves against the right
 * collection. Used as a pre-flight check before opening Tina to authors
 * (Tina rejects orphan references at edit time; we'd rather know now).
 *
 * Slug-bearing fields audited:
 *  - concept.related:           string[] -> concept
 *  - concept.featuredDiagram:   string -> diagram
 *  - concept.relatedDiagrams:   string[] -> diagram
 *  - concept.whereNext[].slug:  string,  kind-typed
 *  - essay.cites:               string[] -> concept
 *  - essay.featuredDiagram:     string -> diagram
 *  - essay.relatedDiagrams:     string[] -> diagram
 *  - essay.whereNext[].slug:    string,  kind-typed
 *  - path.featuredDiagram:      string -> diagram
 *  - path.relatedDiagrams:      string[] -> diagram
 *  - path.steps[].slug:         string,  kind-typed (concept | essay)
 *
 * Exits 1 if any orphan is found, 0 otherwise.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTENT = join(ROOT, 'src', 'content');

const COLLECTIONS = ['concepts', 'essays', 'paths', 'diagrams', 'fragments'];

function listMdx(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...listMdx(full));
    } else if (st.isFile() && /\.(md|mdx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

function parseFrontmatter(filePath) {
  const text = readFileSync(filePath, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  return yaml.load(m[1]) ?? {};
}

function loadCollection(name) {
  const dir = join(CONTENT, name);
  const files = listMdx(dir);
  return files.map((file) => ({
    id: basename(file, extname(file)),
    file,
    data: parseFrontmatter(file),
  }));
}

const collections = Object.fromEntries(
  COLLECTIONS.map((name) => [name, loadCollection(name)]),
);

const idsByCollection = Object.fromEntries(
  Object.entries(collections).map(([name, list]) => [
    name,
    new Set(list.map((e) => e.id)),
  ]),
);

const KIND_TO_COLLECTION = {
  concept: 'concepts',
  essay: 'essays',
  path: 'paths',
  diagram: 'diagrams',
};

const orphans = [];

function check(slug, target, location) {
  if (!slug) return;
  const ids = idsByCollection[target];
  if (!ids) {
    orphans.push({ ...location, slug, target, reason: 'unknown-target' });
    return;
  }
  if (!ids.has(slug)) {
    orphans.push({ ...location, slug, target, reason: 'missing' });
  }
}

function checkWhereNext(arr, fileLabel) {
  if (!Array.isArray(arr)) return;
  arr.forEach((step, i) => {
    if (!step || typeof step !== 'object') return;
    const target = KIND_TO_COLLECTION[step.kind];
    if (!target) {
      orphans.push({
        file: fileLabel,
        field: `whereNext[${i}].kind`,
        slug: step.slug ?? '',
        target: step.kind,
        reason: 'unknown-kind',
      });
      return;
    }
    check(step.slug, target, {
      file: fileLabel,
      field: `whereNext[${i}].slug`,
    });
  });
}

// concepts: related[] -> concepts; whereNext[].slug kind-typed
for (const entry of collections.concepts) {
  const fileLabel = relative(ROOT, entry.file);
  if (Array.isArray(entry.data.related)) {
    entry.data.related.forEach((slug, i) =>
      check(slug, 'concepts', {
        file: fileLabel,
        field: `related[${i}]`,
      }),
    );
  }
  check(entry.data.featuredDiagram, 'diagrams', {
    file: fileLabel,
    field: 'featuredDiagram',
  });
  if (Array.isArray(entry.data.relatedDiagrams)) {
    entry.data.relatedDiagrams.forEach((slug, i) =>
      check(slug, 'diagrams', {
        file: fileLabel,
        field: `relatedDiagrams[${i}]`,
      }),
    );
  }
  checkWhereNext(entry.data.whereNext, fileLabel);
}

// essays: cites[] -> concepts; whereNext[].slug kind-typed
for (const entry of collections.essays) {
  const fileLabel = relative(ROOT, entry.file);
  if (Array.isArray(entry.data.cites)) {
    entry.data.cites.forEach((slug, i) =>
      check(slug, 'concepts', {
        file: fileLabel,
        field: `cites[${i}]`,
      }),
    );
  }
  check(entry.data.featuredDiagram, 'diagrams', {
    file: fileLabel,
    field: 'featuredDiagram',
  });
  if (Array.isArray(entry.data.relatedDiagrams)) {
    entry.data.relatedDiagrams.forEach((slug, i) =>
      check(slug, 'diagrams', {
        file: fileLabel,
        field: `relatedDiagrams[${i}]`,
      }),
    );
  }
  checkWhereNext(entry.data.whereNext, fileLabel);
}

// paths: steps[].slug kind-typed (concept | essay); note kind has no slug
for (const entry of collections.paths) {
  const fileLabel = relative(ROOT, entry.file);
  check(entry.data.featuredDiagram, 'diagrams', {
    file: fileLabel,
    field: 'featuredDiagram',
  });
  if (Array.isArray(entry.data.relatedDiagrams)) {
    entry.data.relatedDiagrams.forEach((slug, i) =>
      check(slug, 'diagrams', {
        file: fileLabel,
        field: `relatedDiagrams[${i}]`,
      }),
    );
  }
  if (!Array.isArray(entry.data.steps)) continue;
  entry.data.steps.forEach((step, i) => {
    if (!step || typeof step !== 'object') return;
    if (step.kind === 'note') return;
    const target = KIND_TO_COLLECTION[step.kind];
    if (!target) {
      orphans.push({
        file: fileLabel,
        field: `steps[${i}].kind`,
        slug: step.slug ?? '',
        target: step.kind,
        reason: 'unknown-kind',
      });
      return;
    }
    if (!step.slug) {
      orphans.push({
        file: fileLabel,
        field: `steps[${i}].slug`,
        slug: '',
        target,
        reason: 'missing-slug',
      });
      return;
    }
    check(step.slug, target, {
      file: fileLabel,
      field: `steps[${i}].slug`,
    });
  });
}

// Report
const totalsBy = (key) =>
  Object.entries(collections)
    .map(([name, list]) => `${list.length} ${name}`)
    .join(', ');
console.log(`audit-slugs · scanned ${totalsBy()} `);

if (orphans.length === 0) {
  console.log('audit-slugs · OK · all references resolve');
  process.exit(0);
}

console.error(`\naudit-slugs · ${orphans.length} orphan(s) found:\n`);
for (const o of orphans) {
  console.error(
    `  ${o.file}\n    ${o.field} -> ${o.target}/${o.slug || '(empty)'}  [${o.reason}]`,
  );
}
process.exit(1);
