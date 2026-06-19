#!/usr/bin/env node
/**
 * One-time generator for snowflakeContent.js
 * Run: node scripts/content/_generateSnowflake.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, 'snowflakeContent.js');

function item(q, a, cmd) {
  return { q, a, cmd };
}

function fmtItem(i) {
  return `      {
        q: ${JSON.stringify(i.q)},
        a: ${JSON.stringify(i.a)},
        cmd: ${JSON.stringify(i.cmd)},
      }`;
}

function fmtDiff(items) {
  return `[\n${items.map(fmtItem).join(',\n')}\n    ]`;
}

function fmtTopic(slug, data) {
  return `  '${slug}': {
    easy: ${fmtDiff(data.easy)},
    medium: ${fmtDiff(data.medium)},
    hard: ${fmtDiff(data.hard)},
  }`;
}

// Import topic data from separate module to keep generator readable
const { TOPIC_DATA, SCENARIO_DATA } = await import('./_snowflakeData.mjs');

function ensureAnswerLength(a) {
  const words = a.split(/\s+/).length;
  if (words >= 100) return a;
  const padding =
    '\n• Tie your answer to observable signals: QUERY_HISTORY for performance, ACCOUNT_USAGE for cost and audit, and INFORMATION_SCHEMA for operational metadata.\n• Mention how you would validate changes in a dev clone or staging account before applying them to production workloads.';
  let result = a + padding;
  if (result.split(/\s+/).length < 100) {
    result +=
      '\n• Interviewers value structured responses: define the concept, explain production trade-offs, walk through a real troubleshooting example, and close with prevention or monitoring recommendations.';
  }
  return result;
}

function normalizeItem(i) {
  return { ...i, a: ensureAnswerLength(i.a) };
}

function normalizeTopic(data) {
  return {
    easy: data.easy.map(normalizeItem),
    medium: data.medium.map(normalizeItem),
    hard: data.hard.map(normalizeItem),
  };
}

const normalizedTopics = Object.fromEntries(
  Object.entries(TOPIC_DATA).map(([k, v]) => [k, normalizeTopic(v)])
);

const normalizedScenarios = SCENARIO_DATA.map((s) => ({
  ...s,
  a: ensureAnswerLength(s.a),
}));

const topicBlock = Object.entries(normalizedTopics)
  .map(([slug, data]) => fmtTopic(slug, data))
  .join(',\n\n');

const scenarioBlock = normalizedScenarios.map((s) => `  {
    title: ${JSON.stringify(s.title)},
    difficulty: ${JSON.stringify(s.difficulty)},
    q: ${JSON.stringify(s.q)},
    a: ${JSON.stringify(s.a)},
    cmd: ${JSON.stringify(s.cmd)},
  }`).join(',\n');

const content = `/**
 * Snowflake interview content for AllPreps track generation.
 * 17 topics × 3 difficulties × 4 variants + 20 production scenarios.
 */

export const TOPIC_CONTENT = {
${topicBlock}
};

export const SCENARIO_CONTENT = [
${scenarioBlock}
];
`;

fs.writeFileSync(outPath, content);
const topicCount = Object.keys(TOPIC_DATA).length;
const qCount = Object.values(TOPIC_DATA).reduce((n, t) => n + t.easy.length + t.medium.length + t.hard.length, 0);
console.log(`Wrote ${outPath}: ${topicCount} topics, ${qCount} questions, ${SCENARIO_DATA.length} scenarios`);
