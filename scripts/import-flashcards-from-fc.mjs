#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const IN_FILE = join(ROOT, 'src', 'content', 'flashcards', 'fc.html');
const OUT_FILE = join(
  ROOT,
  'src',
  'content',
  'flashcards',
  'affective-witness-symbolic-stratum-flashcards.json',
);

function extractDataAppData(html) {
  const m = html.match(/data-app-data="([\s\S]*?)"\s+data-client-experiment-payload=/);
  if (!m) throw new Error('Could not find data-app-data attribute.');
  return m[1];
}

function readJsonFromExport(html) {
  const raw = extractDataAppData(html);
  const unescaped = raw
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
  try {
    return JSON.parse(unescaped);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Invalid JSON in data-app-data: ${msg}`);
  }
}

const html = readFileSync(IN_FILE, 'utf8');
const payload = readJsonFromExport(html);

const deck = {
  title: 'Affective Witness and Symbolic Stratum Flashcards',
  description:
    'Flashcards covering the Affective Witness, Symbolic Stratum, Quartet Architecture, Stabilisation Engine, Quantum Darwinism, burn rates, institutional failure modes, and Symbolic Self.',
  source: 'NotebookLM flashcard export',
  chapterNumbers: [6, 10, 12],
  concepts: [
    'affective-witness',
    'symbolic-exit',
    'stabilisation-engine',
    'witness-canon-architecture',
    'closure-crisis-lemma',
    'landauer-floor',
  ],
  difficulty: 'advanced',
  status: 'published',
  createdAt: '2026-04-29',
  topics: payload.topics,
  cards: (payload.flashcards ?? []).map((c) => ({
    front: String(c?.f ?? '').trim(),
    back: String(c?.b ?? '').trim(),
  })),
};

writeFileSync(OUT_FILE, `${JSON.stringify(deck, null, 2)}\n`, 'utf8');
console.log(`import-flashcards-from-fc · wrote ${deck.cards.length} card(s)`);

