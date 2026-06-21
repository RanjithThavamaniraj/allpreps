import { ALL_QUESTIONS } from '../data/questionLoader';

export const TECHNOLOGY_TRACKS = [
  { id: 'oracle dba', label: 'Oracle DBA', roadmapId: 'oracle dba' },
  { id: 'postgresql', label: 'PostgreSQL', roadmapId: 'postgresql' },
  { id: 'mysql', label: 'MySQL', roadmapId: 'mysql' },
  { id: 'linux', label: 'Linux Admin', roadmapId: 'linux' },
  { id: 'aws', label: 'AWS', roadmapId: 'aws' },
  { id: 'devops', label: 'DevOps', roadmapId: 'devops' },
  { id: 'azure', label: 'Azure', roadmapId: 'azure' },
  { id: 'google', label: 'Google Cloud', roadmapId: 'google' },
  { id: 'shell scripting', label: 'Shell Scripting', roadmapId: 'shell scripting' },
  { id: 'databricks', label: 'Databricks', roadmapId: 'databricks' },
  { id: 'snowflake', label: 'Snowflake', roadmapId: 'snowflake' },
  { id: 'kubernetes', label: 'Kubernetes', roadmapId: 'kubernetes' },
  { id: 'terraform', label: 'Terraform', roadmapId: 'terraform' },
];

export const DIFFICULTY_LEVELS = [
  { id: 'junior', label: 'Junior', bankDifficulty: 'easy' },
  { id: 'mid', label: 'Mid-Level', bankDifficulty: 'medium' },
  { id: 'senior', label: 'Senior', bankDifficulty: 'hard' },
];

export const QUESTION_COUNTS = [5, 10, 15];

export const INTERVIEW_STYLES = [
  { id: 'deep-dive', label: 'Technical Deep Dive' },
  { id: 'scenario', label: 'Scenario Based' },
  { id: 'mixed', label: 'Mixed' },
];

const STORAGE_KEY = 'allpreps_mock_interview_draft';

const CATEGORY_KEYWORDS = [
  { keywords: ['sga', 'pga', 'memory', 'pool', 'buffer'], label: 'Memory Architecture' },
  { keywords: ['rac', 'cluster', 'ha ', 'high availability', 'failover'], label: 'High Availability' },
  { keywords: ['rman', 'backup', 'recovery', 'restore'], label: 'Backup & Recovery' },
  { keywords: ['dataguard', 'standby', 'guard'], label: 'Data Guard' },
  { keywords: ['performance', 'tune', 'slow', 'explain', 'index'], label: 'Performance Tuning' },
  { keywords: ['network', 'vpc', 'subnet', 'firewall', 'dns'], label: 'Networking' },
  { keywords: ['security', 'iam', 'encryption', 'ssh', 'permission'], label: 'Security' },
  { keywords: ['storage', 's3', 'disk', 'volume', 'blob'], label: 'Storage' },
  { keywords: ['kubernetes', 'docker', 'container', 'ci/cd', 'pipeline'], label: 'DevOps & Containers' },
  { keywords: ['databricks', 'spark', 'delta lake', 'delta table', 'unity catalog', 'lakehouse'], label: 'Databricks & Spark' },
  { keywords: ['snowflake', 'warehouse', 'snowpipe', 'micro partition', 'virtual warehouse'], label: 'Snowflake Data Cloud' },
  { keywords: ['pod', 'deployment', 'replicaset', 'ingress', 'helm', 'k8s'], label: 'Kubernetes' },
  { keywords: ['terraform', 'iac', 'state file', 'remote state', 'module', 'provider'], label: 'Terraform & IaC' },
  { keywords: ['shell', 'bash', 'script', 'cron', 'awk'], label: 'Shell Scripting' },
  { keywords: ['sql', 'query', 'join', 'union', 'transaction'], label: 'SQL Fundamentals' },
  { keywords: ['postgresql', 'postgres', 'mvcc', 'vacuum', 'wal', 'pg_stat'], label: 'PostgreSQL' },
  { keywords: ['mysql', 'innodb', 'myisam', 'binlog', 'gtid', 'buffer pool'], label: 'MySQL' },
  { keywords: ['linux', 'kernel', 'process', 'systemd'], label: 'Linux Administration' },
];

export function getTrackLabel(trackId) {
  return TECHNOLOGY_TRACKS.find(t => t.id === trackId)?.label ?? trackId;
}

export function getDifficultyLabel(difficultyId) {
  return DIFFICULTY_LEVELS.find(d => d.id === difficultyId)?.label ?? difficultyId;
}

export function getQuestionCategoryLabel(question) {
  const text = `${question.question || ''} ${(question.tags || []).join(' ')}`.toLowerCase();
  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.keywords.some(kw => text.includes(kw))) {
      return entry.label;
    }
  }
  const tech = getTrackLabel(question.category || question.technology || '');
  return tech || 'General';
}

export function selectInterviewQuestions({ technology, difficulty, count }) {
  const level = DIFFICULTY_LEVELS.find(d => d.id === difficulty);
  const bankDifficulty = level?.bankDifficulty ?? 'medium';

  let pool = ALL_QUESTIONS.filter(q => {
    const cat = (q.category || '').toLowerCase();
    const tech = (q.technology || '').toLowerCase();
    const track = technology.toLowerCase();
    const matchTech = cat === track || tech === track || cat.includes(track);
    const matchDiff = q.difficulty === bankDifficulty;
    return matchTech && matchDiff;
  });

  if (pool.length < count) {
    pool = ALL_QUESTIONS.filter(q => {
      const cat = (q.category || '').toLowerCase();
      const tech = (q.technology || '').toLowerCase();
      const track = technology.toLowerCase();
      return cat === track || tech === track || cat.includes(track);
    });
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(q => ({
    questionId: String(q.id),
    questionText: q.question,
    category: getQuestionCategoryLabel(q),
    referenceAnswer: q.answer || '',
  }));
}

export function getScoreColor(score) {
  if (score <= 4) return 'var(--danger)';
  if (score <= 7) return 'var(--warning)';
  return 'var(--success)';
}

export function getOverallScoreColor(percent) {
  if (percent < 50) return 'var(--danger)';
  if (percent < 70) return 'var(--warning)';
  if (percent < 85) return 'var(--primary)';
  return 'var(--success)';
}

export function getVerdictLabel(percent) {
  if (percent < 50) return 'Not Ready — Keep Practising';
  if (percent < 70) return 'Developing — Focus on Gaps';
  if (percent < 85) return 'Interview Ready';
  return 'Strong Candidate';
}

export function computeQuestionScore(evaluation, followUpEvaluation) {
  const main = evaluation?.score ?? 0;
  const followUp = followUpEvaluation?.score ?? 0;
  return Math.round(((main + followUp) / 2) * 10) / 10;
}

export function computeOverallScore(questionResults) {
  if (!questionResults.length) return 0;
  const total = questionResults.reduce((sum, q) => sum + (q.questionScore ?? 0), 0);
  return Math.round((total / questionResults.length) * 10);
}

export function formatElapsedTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

export function aggregateTopItems(questionResults, field, limit = 3) {
  const counts = {};
  for (const result of questionResults) {
    const items = result.evaluation?.[field] ?? [];
    for (const item of items) {
      const key = item.trim().toLowerCase();
      if (!key) continue;
      counts[key] = counts[key] || { text: item.trim(), count: 0 };
      counts[key].count += 1;
    }
  }
  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(item => item.text);
}

export function getRecommendedStudyAreas(gaps, technology, limit = 3) {
  const track = technology.toLowerCase();
  const areas = [];

  for (const gap of gaps) {
    const gapLower = gap.toLowerCase();
    const match = ALL_QUESTIONS.find(q => {
      const cat = (q.category || '').toLowerCase();
      const tech = (q.technology || '').toLowerCase();
      const inTrack = cat === track || tech === track || cat.includes(track);
      const text = `${q.question} ${q.answer || ''}`.toLowerCase();
      return inTrack && gapLower.split(' ').some(word => word.length > 3 && text.includes(word));
    });

    if (match) {
      areas.push({
        topic: getQuestionCategoryLabel(match),
        question: match.question,
        link: `/interview-questions?q=${encodeURIComponent(match.question.slice(0, 40))}`,
        roadmapLink: '/roadmaps',
      });
    } else {
      areas.push({
        topic: gap,
        question: gap,
        link: `/interview-questions?q=${encodeURIComponent(gap)}`,
        roadmapLink: '/roadmaps',
      });
    }
    if (areas.length >= limit) break;
  }

  while (areas.length < limit) {
    const fallback = ALL_QUESTIONS.find(q => {
      const cat = (q.category || '').toLowerCase();
      return cat === track || cat.includes(track);
    });
    if (!fallback) break;
    areas.push({
      topic: getQuestionCategoryLabel(fallback),
      question: fallback.question,
      link: `/interview-questions?q=${encodeURIComponent(fallback.question.slice(0, 40))}`,
      roadmapLink: '/roadmaps',
    });
  }

  return areas.slice(0, limit);
}

function getStylePrompt(style) {
  switch (style) {
    case 'deep-dive':
      return 'Focus on technical depth. Probe implementation details, internals, and edge cases.';
    case 'scenario':
      return 'Focus on real-world scenarios. Present production situations and troubleshooting paths.';
    default:
      return 'Mix technical depth with practical scenario-based probing.';
  }
}

function buildEvaluationSystemPrompt(settings) {
  const tech = getTrackLabel(settings.technology);
  const level = getDifficultyLabel(settings.difficulty);
  const styleNote = getStylePrompt(settings.interviewStyle);

  return `You are a senior technical interviewer conducting a real job interview for a ${tech} ${level} position.

Evaluate the candidate's answer strictly and professionally.
Be direct. Do not be encouraging or motivational.
Act like a real interviewer, not a tutor.

${styleNote}

Respond ONLY with valid JSON — no markdown fences, no extra text — in this exact format:
{
  "score": <number 1-10>,
  "evaluation": "<2-3 sentence honest evaluation>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "follow_up_question": "<one specific follow-up question>"
}`;
}

function buildFollowUpSystemPrompt(settings) {
  const tech = getTrackLabel(settings.technology);
  const level = getDifficultyLabel(settings.difficulty);

  return `You are a senior technical interviewer conducting a real job interview for a ${tech} ${level} position.

Evaluate the candidate's follow-up answer strictly and professionally.
Be direct. Do not be encouraging or motivational.

Respond ONLY with valid JSON — no markdown fences, no extra text — in this exact format:
{
  "score": <number 1-10>,
  "evaluation": "<1-2 sentence evaluation of follow-up answer>",
  "verdict": "Strong" | "Acceptable" | "Weak"
}`;
}

function parseJsonResponse(text) {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('Invalid JSON response from AI');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function callAnthropicAPI({ systemPrompt, userMessage, timeoutMs = 30000 }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key not configured. Set VITE_ANTHROPIC_API_KEY in your .env file.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`API error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) throw new Error('Empty response from AI');
    return parseJsonResponse(text);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function evaluateAnswer({ settings, question, userAnswer }) {
  const systemPrompt = buildEvaluationSystemPrompt(settings);
  const userMessage = `Interview Question:
"${question.questionText}"

Category: ${question.category}

Reference answer (for your evaluation only — do not reveal to candidate):
${question.referenceAnswer || 'N/A'}

Candidate's Answer:
${userAnswer}

Evaluate the candidate's answer and provide a follow-up question.`;

  return callAnthropicAPI({ systemPrompt, userMessage });
}

export async function evaluateFollowUp({ settings, question, userAnswer, followUpQuestion, followUpAnswer }) {
  const systemPrompt = buildFollowUpSystemPrompt(settings);
  const userMessage = `Original Question: "${question.questionText}"

Original Answer: ${userAnswer}

Follow-up Question: "${followUpQuestion}"

Candidate's Follow-up Answer:
${followUpAnswer}

Evaluate the follow-up answer only.`;

  return callAnthropicAPI({ systemPrompt, userMessage });
}

export function saveDraftToStorage(draft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* ignore quota errors */
  }
}

export function loadDraftFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraftFromStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function generateShareCardImage({ score, verdict, technology, date }) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 600, 400);
  gradient.addColorStop(0, '#0B1220');
  gradient.addColorStop(1, '#111827');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 400);

  ctx.strokeStyle = 'rgba(37, 99, 235, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 560, 360);

  ctx.fillStyle = '#2563EB';
  ctx.font = 'bold 28px Inter, system-ui, sans-serif';
  ctx.fillText('AllPreps', 40, 60);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '14px Inter, system-ui, sans-serif';
  ctx.fillText('Mock Interview Result', 40, 85);

  const scoreColor = score >= 85 ? '#10B981' : score >= 70 ? '#2563EB' : score >= 50 ? '#F59E0B' : '#EF4444';
  ctx.fillStyle = scoreColor;
  ctx.font = 'bold 72px Inter, system-ui, sans-serif';
  ctx.fillText(`${score}%`, 40, 180);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 22px Inter, system-ui, sans-serif';
  ctx.fillText(verdict, 40, 220);

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '16px Inter, system-ui, sans-serif';
  ctx.fillText(getTrackLabel(technology), 40, 280);
  ctx.fillText(date, 40, 310);

  ctx.fillStyle = '#64748B';
  ctx.font = '13px Inter, system-ui, sans-serif';
  ctx.fillText('allpreps.com', 40, 360);

  return canvas.toDataURL('image/png');
}
