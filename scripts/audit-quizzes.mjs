#!/usr/bin/env node
/**
 * Walk every JSON quiz under src/content/quizzes/, validate basic structure,
 * and ensure concept references resolve to files in src/content/concepts/.
 *
 * Exits 1 if any error is found, 0 otherwise.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const QUIZZES_DIR = join(ROOT, 'src', 'content', 'quizzes');
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

const files = listJson(QUIZZES_DIR);
const conceptSlugs = listConceptSlugs();

const errors = [];

function err(fileLabel, message) {
  errors.push({ file: fileLabel, message });
}

for (const file of files) {
  const fileLabel = relative(ROOT, file);
  let quiz;
  try {
    quiz = readJson(file);
  } catch (e) {
    err(fileLabel, e instanceof Error ? e.message : String(e));
    continue;
  }

  if (!isObject(quiz)) {
    err(fileLabel, 'root must be an object');
    continue;
  }

  if (typeof quiz.title !== 'string' || quiz.title.trim() === '') {
    err(fileLabel, 'missing/invalid `title` (must be a non-empty string)');
  }

  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    err(fileLabel, 'missing/invalid `questions` (must be a non-empty array)');
  } else {
    quiz.questions.forEach((q, qi) => {
      const qn = qi + 1;
      if (!isObject(q)) {
        err(fileLabel, `questions[${qi}] (Q${qn}) must be an object`);
        return;
      }
      if (typeof q.question !== 'string' || q.question.trim() === '') {
        err(fileLabel, `questions[${qi}] (Q${qn}) missing/invalid \`question\``);
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        err(
          fileLabel,
          `questions[${qi}].options (Q${qn}) must be an array with at least 2 options`,
        );
        return;
      }

      let correctCount = 0;
      q.options.forEach((opt, oi) => {
        if (!isObject(opt)) {
          err(fileLabel, `questions[${qi}].options[${oi}] (Q${qn}) must be an object`);
          return;
        }
        if (typeof opt.text !== 'string' || opt.text.trim() === '') {
          err(fileLabel, `questions[${qi}].options[${oi}].text (Q${qn}) must be a non-empty string`);
        }
        if (typeof opt.isCorrect !== 'boolean') {
          err(
            fileLabel,
            `questions[${qi}].options[${oi}].isCorrect (Q${qn}) must be boolean`,
          );
        } else if (opt.isCorrect) {
          correctCount += 1;
        }
      });

      if (correctCount !== 1) {
        err(
          fileLabel,
          `questions[${qi}] (Q${qn}) must have exactly 1 correct option (found ${correctCount})`,
        );
      }
    });
  }

  if (Array.isArray(quiz.concepts)) {
    quiz.concepts.forEach((slug, i) => {
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

console.log(`audit-quizzes · scanned ${files.length} file(s)`);

if (errors.length === 0) {
  console.log('audit-quizzes · OK · all quizzes pass');
  process.exit(0);
}

console.error(`\naudit-quizzes · ${errors.length} error(s) found:\n`);
for (const e of errors) {
  console.error(`  ${e.file}\n    ${e.message}`);
}
process.exit(1);

