import { getUserData } from './readinessStorage';
import { isProUser } from './subscriptionStorage';
import { FREE_WEEKLY_INTERVIEW_LIMIT, FREE_LIMIT_WINDOW_DAYS } from './subscriptionConfig';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Get interviews completed within the rolling window.
 * @param {number} windowDays
 * @returns {Array<{ date: string, technology: string, totalScore: number }>}
 */
export function getRecentInterviews(windowDays = FREE_LIMIT_WINDOW_DAYS) {
  const data = getUserData();
  const cutoff = Date.now() - windowDays * MS_PER_DAY;
  return data.mockInterviews.filter(i => new Date(i.date).getTime() > cutoff);
}

/**
 * @returns {number}
 */
export function getWeeklyInterviewCount() {
  return getRecentInterviews().length;
}

/**
 * @returns {boolean}
 */
export function canStartInterview() {
  if (isProUser()) return true;
  return getWeeklyInterviewCount() < FREE_WEEKLY_INTERVIEW_LIMIT;
}

/**
 * @returns {{ allowed: boolean, reason?: string, nextAvailable?: Date|null }}
 */
export function checkInterviewLimit() {
  if (isProUser()) {
    return { allowed: true };
  }

  const recent = getRecentInterviews();
  if (recent.length < FREE_WEEKLY_INTERVIEW_LIMIT) {
    return { allowed: true };
  }

  const oldest = recent
    .map(i => new Date(i.date).getTime())
    .sort((a, b) => a - b)[0];

  const nextAvailable = new Date(oldest + FREE_LIMIT_WINDOW_DAYS * MS_PER_DAY);

  return {
    allowed: false,
    reason: 'weekly_limit',
    nextAvailable,
  };
}

/**
 * Format next available date for display.
 * @param {Date|null} date
 * @returns {string|null}
 */
export function formatNextAvailable(date) {
  if (!date) return null;
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * @returns {number|null} Remaining free interviews this week
 */
export function getRemainingInterviews() {
  if (isProUser()) return null;
  return Math.max(0, FREE_WEEKLY_INTERVIEW_LIMIT - getWeeklyInterviewCount());
}
