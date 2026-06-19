#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateAllTracks, TRACKS } from './trackDefinitions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'src/data');

function serializeQuestion(q) {
  return `  {
    id: ${JSON.stringify(q.id)},
    technology: ${JSON.stringify(q.technology)},
    category: ${JSON.stringify(q.category)},
    difficulty: ${JSON.stringify(q.difficulty)},
    question: ${JSON.stringify(q.question)},
    answer: ${JSON.stringify(q.answer)},
    command: ${JSON.stringify(q.command)},
    tags: ${JSON.stringify(q.tags)},
  }`;
}

const allGenerated = generateAllTracks();

for (const [trackKey, questions] of Object.entries(allGenerated)) {
  const trackDir = path.join(dataDir, trackKey);
  fs.mkdirSync(trackDir, { recursive: true });

  const filePath = path.join(trackDir, 'questions.js');
  const content = `// Auto-generated from scripts/content/*Content.js — ${TRACKS[trackKey].label}
// Run: node scripts/generate-tracks.mjs
// ${questions.length} questions (${questions.filter(q => !q.tags.includes('production-scenario')).length} bank + ${questions.filter(q => q.tags.includes('production-scenario')).length} production scenarios)

export const questions = [
${questions.map(serializeQuestion).join(',\n')}
];
`;
  fs.writeFileSync(filePath, content);
  console.log(`Wrote ${questions.length} questions → ${filePath}`);
}

console.log('Done.');
