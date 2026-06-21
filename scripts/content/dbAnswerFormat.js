/**
 * Structured interview answer format for PostgreSQL / MySQL tracks.
 * Compatible with AllPreps question schema (answer + command fields).
 */

/**
 * @param {object} sections
 * @param {string} sections.interview
 * @param {string} sections.explanation
 * @param {string} sections.production
 * @param {string|string[]} sections.followUps
 * @param {string|string[]} sections.mistakes
 * @param {string} sections.seniorInsights
 * @param {string|string[]} sections.commands
 * @param {string|string[]} sections.bestPractices
 */
export function formatStructuredAnswer(sections) {
  const bullets = (items) => {
    const list = Array.isArray(items) ? items : [items];
    return list.filter(Boolean).map(i => `• ${i}`).join('\n');
  };

  return [
    '## Interview Answer',
    sections.interview,
    '',
    '## Detailed Explanation',
    sections.explanation,
    '',
    '## Production Perspective',
    sections.production,
    '',
    '## Common Follow-up Questions',
    bullets(sections.followUps),
    '',
    '## Common Mistakes',
    bullets(sections.mistakes),
    '',
    '## Senior Engineer Insights',
    sections.seniorInsights,
    '',
    '## Key Commands',
    typeof sections.commands === 'string' ? sections.commands : bullets(sections.commands),
    '',
    '## Best Practices',
    bullets(sections.bestPractices),
  ].join('\n');
}

/** Map schema difficulty to display label */
export const DIFFICULTY_LABELS = {
  easy: 'Beginner',
  medium: 'Intermediate',
  hard: 'Advanced',
};

export const FREQUENCY_OPTIONS = ['Common', 'Very Common', 'Rare'];
export const ROLE_OPTIONS = ['DBA', 'Database Engineer', 'Production Support', 'Cloud Engineer'];

/**
 * Build export-ready question object for AllPreps.
 * @param {object} params
 */
export function buildQuestion({
  id,
  trackId,
  topic,
  file,
  difficulty,
  frequency,
  role,
  question,
  sections,
  command,
  extraTags = [],
}) {
  const cmd = command || (typeof sections.commands === 'string'
    ? sections.commands
    : (Array.isArray(sections.commands) ? sections.commands.join('\n') : ''));

  return {
    id,
    technology: trackId,
    category: trackId,
    file,
    difficulty,
    frequency,
    role,
    question,
    answer: formatStructuredAnswer(sections),
    command: cmd,
    tags: [trackId, topic, difficulty, frequency.toLowerCase().replace(/\s+/g, '-'), ...extraTags],
  };
}
