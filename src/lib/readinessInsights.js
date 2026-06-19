import { getUserData } from './readinessStorage';
import { calculateOverallReadiness, calculateReadinessBreakdown } from './calculateReadiness';
import { READINESS_TRACKS } from './readinessTracks';
import { isProUser } from './subscriptionStorage';

export const READINESS_TARGET = 85;

/**
 * Score trend from completed mock interviews (overall scores, chronological).
 * @param {number} limit
 * @returns {number[]}
 */
export function getScoreTrend(limit = 5) {
  const data = getUserData();
  return [...data.mockInterviews]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-limit)
    .map(i => i.totalScore);
}

/**
 * Recommended actions based on readiness data.
 * @returns {string[]}
 */
export function getRecommendedActions() {
  const data = getUserData();
  const trackIds = READINESS_TRACKS.map(t => t.id);
  const { average, trackedCount } = calculateOverallReadiness(data, trackIds);
  const actions = [];

  if (average < READINESS_TARGET) {
    const needed = Math.ceil((READINESS_TARGET - average) / 15);
    actions.push(`Complete ${Math.max(1, needed)} Mock Interview${needed > 1 ? 's' : ''}`);
  }

  const lastInterview = [...data.mockInterviews].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )[0];

  if (lastInterview?.weakAreas?.length) {
    actions.push(`Review ${lastInterview.weakAreas[0]}`);
    if (lastInterview.weakAreas[1]) {
      actions.push(`Practice ${lastInterview.weakAreas[1]}`);
    }
  } else if (trackedCount > 0) {
    const weakest = trackIds
      .map(id => ({ id, ...calculateReadinessBreakdown(id, data) }))
      .filter(t => t.hasActivity)
      .sort((a, b) => a.score - b.score)[0];

    if (weakest) {
      const track = READINESS_TRACKS.find(t => t.id === weakest.id);
      actions.push(`Focus on ${track?.name ?? weakest.id} scenarios`);
    }
  }

  if (actions.length === 0) {
    actions.push('Take a mock interview to establish your baseline');
    actions.push('Check off roadmap questions as you learn');
  }

  return actions.slice(0, 4);
}

/**
 * Interview history for Pro users.
 * @returns {Array}
 */
export function getInterviewHistory() {
  const data = getUserData();
  return [...data.mockInterviews].sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Whether score history trend should be fully visible.
 * @returns {boolean}
 */
export function canViewScoreHistory() {
  return isProUser();
}
