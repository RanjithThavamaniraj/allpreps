#!/usr/bin/env node
/** Generates scripts/content/postgresqlRegistry.js — 21 topics × 5 questions */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_TOPICS } from './_postgresqlRegistryData.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, 'postgresqlRegistry.js');

function esc(s) {
  return JSON.stringify(s);
}

function fmtArr(arr, indent) {
  return '[\n' + arr.map(i => `${indent}  ${esc(i)}`).join(',\n') + `\n${indent}]`;
}

function fmtQuestion(q) {
  const s = q.sections;
  return `  buildQuestion({
    id: ${esc(q.id)},
    trackId: 'postgresql',
    topic: ${esc(q.topic)},
    file: ${esc(q.file)},
    difficulty: ${esc(q.difficulty)},
    frequency: ${esc(q.frequency)},
    role: ${esc(q.role)},
    question: ${esc(q.question)},
    sections: {
      interview: ${esc(s.interview)},
      explanation: ${esc(s.explanation)},
      production: ${esc(s.production)},
      followUps: ${fmtArr(s.followUps, '      ')},
      mistakes: ${fmtArr(s.mistakes, '      ')},
      seniorInsights: ${esc(s.seniorInsights)},
      commands: ${fmtArr(s.commands, '      ')},
      bestPractices: ${fmtArr(s.bestPractices, '      ')},
    },${q.command ? `\n    command: ${esc(q.command)},` : ''}
  })`;
}

const sections = ALL_TOPICS.map(({ label, file, topic, questions }) => {
  const header = `  // ─── ${file}: ${topic} ─────────────────────────────────────`;
  const body = questions.map(fmtQuestion).join(',\n');
  return `${header}\n${body}`;
});

const content = `/**
 * PostgreSQL interview question registry for AllPreps.
 * 21 topics × 5 questions = 105 production-focused questions.
 */

import { buildQuestion } from './dbAnswerFormat.js';

export const POSTGRESQL_QUESTIONS = [
${sections.join(',\n\n')},
];
`;

fs.writeFileSync(outPath, content, 'utf8');
const count = ALL_TOPICS.reduce((n, t) => n + t.questions.length, 0);
console.log(`Wrote ${outPath} (${count} questions)`);
