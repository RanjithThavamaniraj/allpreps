/**
 * Interview Readiness Score calculation.
 * Combines roadmap progress (40%) and mock interview history (60%).
 */

const ROADMAP_WEIGHT = 0.4;
const INTERVIEW_WEIGHT = 0.6;

/**
 * @typedef {import('./readinessStorage').UserData} UserData
 */

/**
 * Calculate roadmap completion percentage for a technology (0–100).
 * @param {string} technology
 * @param {UserData} userData
 * @returns {number}
 */
export function calculateRoadmapScore(technology, userData) {
  const progress = userData.roadmapProgress[technology];
  if (!progress || progress.totalQuestions === 0) return 0;
  const checked = progress.checkedQuestions?.length ?? 0;
  return Math.round((checked / progress.totalQuestions) * 100);
}

/**
 * Calculate average mock interview score for a technology (0–100).
 * @param {string} technology
 * @param {UserData} userData
 * @returns {number}
 */
export function calculateInterviewScore(technology, userData) {
  const interviews = userData.mockInterviews.filter(i => i.technology === technology);
  if (interviews.length === 0) return 0;
  const total = interviews.reduce((sum, i) => sum + (i.totalScore ?? 0), 0);
  return Math.round(total / interviews.length);
}

/**
 * Calculate combined readiness score for a technology (0–100).
 * @param {string} technology
 * @param {UserData} userData
 * @returns {number}
 */
export function calculateReadinessScore(technology, userData) {
  const roadmapScore = calculateRoadmapScore(technology, userData);
  const interviewScore = calculateInterviewScore(technology, userData);
  const combined = roadmapScore * ROADMAP_WEIGHT + interviewScore * INTERVIEW_WEIGHT;
  return Math.round(combined);
}

/**
 * Full breakdown for dashboard cards.
 * @param {string} technology
 * @param {UserData} userData
 * @returns {{
 *   score: number,
 *   band: string,
 *   roadmapScore: number,
 *   interviewScore: number,
 *   attemptCount: number,
 *   strongAreas: string[],
 *   weakAreas: string[],
 *   hasRoadmap: boolean,
 *   hasInterviews: boolean,
 *   hasActivity: boolean,
 * }}
 */
export function calculateReadinessBreakdown(technology, userData) {
  const roadmapScore = calculateRoadmapScore(technology, userData);
  const interviewScore = calculateInterviewScore(technology, userData);
  const score = calculateReadinessScore(technology, userData);
  const interviews = userData.mockInterviews.filter(i => i.technology === technology);
  const lastInterview = interviews.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const progress = userData.roadmapProgress[technology];
  const hasRoadmap = (progress?.checkedQuestions?.length ?? 0) > 0;
  const hasInterviews = interviews.length > 0;

  return {
    score,
    band: getScoreBand(score),
    roadmapScore,
    interviewScore,
    attemptCount: interviews.length,
    strongAreas: lastInterview?.strongAreas?.slice(0, 2) ?? [],
    weakAreas: lastInterview?.weakAreas?.slice(0, 2) ?? [],
    hasRoadmap,
    hasInterviews,
    hasActivity: hasRoadmap || hasInterviews,
  };
}

/**
 * Get human-readable score band label.
 * @param {number} score
 * @returns {string}
 */
export function getScoreBand(score) {
  if (score < 25) return 'Not Started';
  if (score < 50) return 'Building Foundations';
  if (score < 70) return 'Developing';
  if (score < 85) return 'Interview Ready';
  return 'Strong Candidate';
}

/**
 * Get Tailwind-compatible color class for a score.
 * @param {number} score
 * @returns {string}
 */
export function getScoreColorClass(score) {
  if (score < 25) return 'text-gray-400';
  if (score < 50) return 'text-red-400';
  if (score < 70) return 'text-yellow-400';
  if (score < 85) return 'text-blue-400';
  return 'text-green-400';
}

/**
 * Get CSS variable color for inline styles (AllPreps theme).
 * @param {number} score
 * @returns {string}
 */
export function getScoreColor(score) {
  if (score < 25) return 'var(--text-muted)';
  if (score < 50) return 'var(--danger)';
  if (score < 70) return 'var(--warning)';
  if (score < 85) return 'var(--primary)';
  return 'var(--success)';
}

/**
 * Map score to readiness CSS class for components.
 * @param {number} score
 * @returns {string}
 */
export function getScoreCssClass(score) {
  if (score < 25) return 'readiness-color-muted';
  if (score < 50) return 'readiness-color-red';
  if (score < 70) return 'readiness-color-yellow';
  if (score < 85) return 'readiness-color-blue';
  return 'readiness-color-green';
}

/**
 * Calculate overall average readiness across technologies with activity.
 * @param {UserData} userData
 * @param {string[]} technologies
 * @returns {{ average: number, trackedCount: number }}
 */
export function calculateOverallReadiness(userData, technologies) {
  const active = technologies.filter(tech => {
    const progress = userData.roadmapProgress[tech];
    const hasRoadmap = (progress?.checkedQuestions?.length ?? 0) > 0;
    const hasInterviews = userData.mockInterviews.some(i => i.technology === tech);
    return hasRoadmap || hasInterviews;
  });

  if (active.length === 0) return { average: 0, trackedCount: 0 };

  const total = active.reduce((sum, tech) => sum + calculateReadinessScore(tech, userData), 0);
  return {
    average: Math.round(total / active.length),
    trackedCount: active.length,
  };
}

/**
 * Get contextual empty-state message for a technology.
 * @param {string} technology
 * @param {UserData} userData
 * @returns {string|null}
 */
export function getEmptyStateMessage(technology, userData) {
  const breakdown = calculateReadinessBreakdown(technology, userData);
  if (!breakdown.hasRoadmap && !breakdown.hasInterviews) {
    return 'Start a mock interview or check off roadmap questions to build your readiness score.';
  }
  if (breakdown.hasRoadmap && !breakdown.hasInterviews) {
    return 'Complete a mock interview to improve your score. Roadmap alone accounts for 40% of your readiness.';
  }
  if (!breakdown.hasRoadmap && breakdown.hasInterviews) {
    return 'Check off roadmap questions as you learn them to improve your score further.';
  }
  return null;
}

/**
 * Get global empty-state message when no activity at all.
 * @param {UserData} userData
 * @returns {string}
 */
export function getGlobalEmptyStateMessage(userData) {
  const hasAny = Object.keys(userData.roadmapProgress).some(
    k => (userData.roadmapProgress[k]?.checkedQuestions?.length ?? 0) > 0
  ) || userData.mockInterviews.length > 0;

  if (!hasAny) {
    return 'Start a mock interview or check off roadmap questions to build your readiness score.';
  }
  return '';
}
