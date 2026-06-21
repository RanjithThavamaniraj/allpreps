#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { POSTGRESQL_QUESTIONS } from './content/postgresqlRegistry.js';
import { MYSQL_QUESTIONS } from './content/mysqlRegistry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'src/data');

const TRACKS = {
  postgresql: { label: 'PostgreSQL', questions: POSTGRESQL_QUESTIONS },
  mysql: { label: 'MySQL', questions: MYSQL_QUESTIONS },
};

function serializeQuestion(q) {
  const fields = [
    `id: ${JSON.stringify(q.id)}`,
    `technology: ${JSON.stringify(q.technology)}`,
    `category: ${JSON.stringify(q.category)}`,
    `difficulty: ${JSON.stringify(q.difficulty)}`,
    `frequency: ${JSON.stringify(q.frequency)}`,
    `role: ${JSON.stringify(q.role)}`,
    `question: ${JSON.stringify(q.question)}`,
    `answer: ${JSON.stringify(q.answer)}`,
    `command: ${JSON.stringify(q.command)}`,
    `tags: ${JSON.stringify(q.tags)}`,
  ];
  return `  {\n    ${fields.join(',\n    ')},\n  }`;
}

function groupByFile(questions) {
  const byFile = {};
  for (const q of questions) {
    const file = q.file || 'questions.js';
    if (!byFile[file]) byFile[file] = [];
    byFile[file].push(q);
  }
  return byFile;
}

for (const [trackKey, track] of Object.entries(TRACKS)) {
  const byFile = groupByFile(track.questions);
  const trackDir = path.join(dataDir, trackKey);
  fs.mkdirSync(trackDir, { recursive: true });

  let total = 0;
  for (const [file, questions] of Object.entries(byFile)) {
    total += questions.length;
    const filePath = path.join(trackDir, file);
    const content = `// ${track.label} — ${file.replace('.js', '')}
// Structured interview content — run: node scripts/generate-db-tracks.mjs
// ${questions.length} questions

export const questions = [
${questions.map(serializeQuestion).join(',\n')}
];
`;
    fs.writeFileSync(filePath, content);
    console.log(`Wrote ${questions.length} → ${filePath}`);
  }
  console.log(`${trackKey}: ${total} questions total\n`);
}

console.log('Done.');
