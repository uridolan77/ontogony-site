#!/usr/bin/env node
/**
 * Walk every JSON flashcard deck under src/content/flashcards/, validate basic
 * structure, and ensure concept references resolve to files in
 * src/content/concepts/.
 *
 * Exits 1 if any error is found, 0 otherwise.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FLASHCARDS_DIR = join(ROOT, 'src', 'content', 'flashcards');
const CONCEPTS_DIR = join(ROOT, 'src', 'content', 'concepts');

function listJson(dir) {
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
    if (st.isDirectory()) out.push(...listJson(full));
    else if (st.isFile() && /\.json$/i.test(name)) out.push(full);
  }
  return out;
}

function listConceptSlugs() {
  const out = new Set();
  const stack = [CONCEPTS_DIR];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of entries) {
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) stack.push(full);
      else if (st.isFile() && /\.(md|mdx)$/i.test(name)) {
        out.add(basename(name, extname(name)));
      }
    }
  }
  return out;
}

function isObject(v) {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

function readJson(file) {
  const raw = readFileSync(file, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`invalid JSON: ${msg}`);
  }
}

const files = listJson(FLASHCARDS_DIR);
const conceptSlugs = listConceptSlugs();

const errors = [];

function err(fileLabel, message) {
  errors.push({ file: fileLabel, message });
}

for (const file of files) {
  const fileLabel = relative(ROOT, file);
  let deck;
  try {
    deck = readJson(file);
  } catch (e) {
    err(fileLabel, e instanceof Error ? e.message : String(e));
    continue;
  }

  if (!isObject(deck)) {
    err(fileLabel, 'root must be an object');
    continue;
  }

  if (typeof deck.title !== 'string' || deck.title.trim() === '') {
    err(fileLabel, 'missing/invalid `title` (must be a non-empty string)');
  }

  if (!Array.isArray(deck.cards) || deck.cards.length === 0) {
    err(fileLabel, 'missing/invalid `cards` (must be a non-empty array)');
  } else {
    deck.cards.forEach((card, ci) => {
      const cn = ci + 1;
      if (!isObject(card)) {
        err(fileLabel, `cards[${ci}] (Card ${cn}) must be an object`);
        return;
      }
      if (typeof card.front !== 'string' || card.front.trim() === '') {
        err(fileLabel, `cards[${ci}].front (Card ${cn}) must be a non-empty string`);
      }
      if (typeof card.back !== 'string' || card.back.trim() === '') {
        err(fileLabel, `cards[${ci}].back (Card ${cn}) must be a non-empty string`);
      }
    });
  }

  if (Array.isArray(deck.concepts)) {
    deck.concepts.forEach((slug, i) => {
      if (typeof slug !== 'string' || slug.trim() === '') {
        err(fileLabel, `concepts[${i}] must be a non-empty string`);
        return;
      }
      if (!conceptSlugs.has(slug)) {
        err(fileLabel, `concepts[${i}] -> concepts/${slug} [missing]`);
      }
    });
  }
}

console.log(`audit-flashcards · scanned ${files.length} file(s)`);

if (errors.length === 0) {
  console.log('audit-flashcards · OK · all decks pass');
  process.exit(0);
}

console.error(`\naudit-flashcards · ${errors.length} error(s) found:\n`);
for (const e of errors) {
  console.error(`  ${e.file}\n    ${e.message}`);
}
process.exit(1);

