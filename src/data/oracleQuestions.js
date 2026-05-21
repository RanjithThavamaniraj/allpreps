import { QUESTIONS_DATA } from './questionsData';

// Helper to generate context-relevant tags based on the question title
function getTags(title) {
  const t = title.toLowerCase();
  const tags = ['oracle'];
  if (t.includes('sga') || t.includes('pga') || t.includes('memory') || t.includes('pool') || t.includes('parse')) {
    tags.push('memory');
  }
  if (t.includes('rac') || t.includes('cluster') || t.includes('voting')) {
    tags.push('rac');
    tags.push('high-availability');
  }
  if (t.includes('rman') || t.includes('backup') || t.includes('recovery') || t.includes('restore') || t.includes('controlfile')) {
    tags.push('rman');
    tags.push('backup-recovery');
  }
  if (t.includes('guard') || t.includes('standby') || t.includes('switchover')) {
    tags.push('data-guard');
    tags.push('disaster-recovery');
  }
  if (t.includes('asm') || t.includes('disk') || t.includes('storage') || t.includes('rebalance')) {
    tags.push('asm');
    tags.push('storage');
  }
  if (t.includes('tune') || t.includes('slow') || t.includes('explain') || t.includes('parse') || t.includes('mutex') || t.includes('latch')) {
    tags.push('performance-tuning');
  }
  if (tags.length === 1) {
    tags.push('database-admin');
  }
  return tags;
}

export const oracleQuestions = QUESTIONS_DATA
  .filter(q => q.category === 'oracle dba')
  .map(q => ({
    id: `ora-${q.id}`,
    title: q.title,
    category: q.category,
    tags: getTags(q.title),
    difficulty: q.difficulty,
    description: q.title + ' - Scenario questions covering key DBA concepts, memory architectures, performance tuning, and high-availability.',
    details: q.answer,
    solution: q.command
  }));
