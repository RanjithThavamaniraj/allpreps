/** Shared question metadata labels for UI display */
export const DIFFICULTY_LABELS = {
  easy: 'Beginner',
  medium: 'Intermediate',
  hard: 'Advanced',
};

export const FREQUENCY_LABELS = {
  common: 'Common',
  'very-common': 'Very Common',
  rare: 'Rare',
};

export const SEARCH_PLACEHOLDER = 'Search topics, concepts or interview questions...';

const CATEGORY_LABELS = {
  'oracle dba': 'Oracle DBA',
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  linux: 'Linux Admin',
  aws: 'AWS Cloud',
  azure: 'Azure Cloud',
  google: 'Google Cloud',
  'shell scripting': 'Shell Scripting',
  devops: 'DevOps',
  databricks: 'Databricks',
  snowflake: 'Snowflake',
  kubernetes: 'Kubernetes',
  terraform: 'Terraform',
};

export function getQuestionTitle(q) {
  return q?.question || q?.title || 'Untitled question';
}

export function formatCategoryLabel(category) {
  if (!category) return 'General';
  const key = category.toLowerCase().trim();
  return CATEGORY_LABELS[key] || category.replace(/\b\w/g, c => c.toUpperCase());
}

export function isFundamentalQuestion(q) {
  const tags = (q?.tags || []).map(t => String(t).toLowerCase());
  return q?.difficulty === 'easy' || tags.some(t => t.includes('fundamental'));
}

/** @returns {{ emoji: string, label: string, className: string }[]} */
export function getFrequencyBadges(q) {
  const badges = [];
  const freq = (q?.frequency || '').toLowerCase().trim();

  if (freq === 'very common') {
    badges.push({ emoji: '🔥', label: 'Frequently Asked', className: 'freq-hot' });
  } else if (freq === 'common') {
    badges.push({ emoji: '⭐', label: 'Common', className: 'freq-star' });
  }

  if (isFundamentalQuestion(q)) {
    badges.push({ emoji: '📚', label: 'Fundamental', className: 'freq-fundamental' });
  }

  return badges;
}

export function extractInterviewPreview(answer, maxLen = 160) {
  if (!answer) return '';
  const match = answer.match(/## Interview Answer\n([\s\S]*?)(?:\n## |$)/);
  const text = (match ? match[1] : answer).replace(/\n+/g, ' ').trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).trim()}…`;
}

export function mapQuestionForCard(q, idPrefix, trackId) {
  return {
    id: `${idPrefix}-${q.id}`,
    rawId: q.id,
    question: q.question,
    title: q.question,
    category: q.category || trackId,
    difficulty: q.difficulty,
    frequency: q.frequency,
    role: q.role,
    answer: q.answer,
    details: q.answer,
    command: q.command,
    solution: q.command,
    tags: q.tags || [trackId],
  };
}

export function getQuestionMeta(q) {
  return {
    frequency: q.frequency || null,
    role: q.role || null,
    difficultyLabel: DIFFICULTY_LABELS[q.difficulty] || q.difficulty,
  };
}
