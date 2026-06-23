/**
 * SUPABASE MIGRATION GUIDE
 * When migrating to Supabase:
 * 1. Replace getUserData() with Supabase select query
 * 2. Replace saveUserData() with Supabase upsert
 * 3. Add userId parameter to all functions
 * 4. Wrap all functions in async/await
 * 5. Update all callers to await these functions
 * 6. Run one-time migration: read localStorage → write to Supabase
 * All business logic in calculateReadiness.js stays unchanged.
 */

import { ALL_QUESTIONS } from '../data/questionLoader';
import { calculateReadinessScore } from './calculateReadiness';
import { trackFounderMetric, FOUNDER_METRICS } from './founderAnalytics';

const STORAGE_KEY = 'allpreps_user_data';
const LEGACY_COMPLETED_KEY = 'allpreps_completed_questions';

/** @type {import('./readinessStorage').UserData} */
const defaultUserData = {
  version: 1,
  lastUpdated: null,
  roadmapProgress: {},
  mockInterviews: [],
  readinessScores: {},
  lastCompletedInterview: null,
};

/**
 * @typedef {Object} RoadmapProgressEntry
 * @property {string[]} checkedQuestions
 * @property {number} totalQuestions
 */

/**
 * @typedef {Object} MockInterviewQuestion
 * @property {string} questionId
 * @property {string} category
 * @property {number} score
 * @property {number} followUpScore
 */

/**
 * @typedef {Object} MockInterviewSession
 * @property {string} id
 * @property {string} technology
 * @property {string} level
 * @property {string} date
 * @property {number} totalScore
 * @property {number} questionCount
 * @property {string[]} strongAreas
 * @property {string[]} weakAreas
 * @property {MockInterviewQuestion[]} questions
 */

/**
 * @typedef {Object} ReadinessScoreEntry
 * @property {number} score
 * @property {string} lastCalculated
 */

/**
 * @typedef {Object} UserData
 * @property {number} version
 * @property {string|null} lastUpdated
 * @property {Record<string, RoadmapProgressEntry>} roadmapProgress
 * @property {MockInterviewSession[]} mockInterviews
 * @property {Record<string, ReadinessScoreEntry>} readinessScores
 * @property {{ technology: string, date: string, score: number }|null} lastCompletedInterview
 */

/**
 * Safely parse JSON from localStorage.
 * @param {string} raw
 * @returns {unknown}
 */
function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Merge legacy flat completed-questions array into per-track roadmap progress.
 * @param {UserData} data
 * @returns {UserData}
 */
function migrateLegacyCompletedQuestions(data) {
  try {
    const legacyRaw = localStorage.getItem(LEGACY_COMPLETED_KEY);
    if (!legacyRaw) return data;

    const legacyIds = safeParse(legacyRaw);
    if (!Array.isArray(legacyIds) || legacyIds.length === 0) return data;

    const updated = { ...data, roadmapProgress: { ...data.roadmapProgress } };
    let changed = false;

    for (const trackId of getAllTrackIds()) {
      const trackQuestionIds = ALL_QUESTIONS
        .filter(q => q.category === trackId)
        .map(q => q.id);
      const total = trackQuestionIds.length;
      if (total === 0) continue;

      const existing = updated.roadmapProgress[trackId]?.checkedQuestions ?? [];
      const fromLegacy = legacyIds.filter(id => trackQuestionIds.includes(id));
      const merged = [...new Set([...existing, ...fromLegacy])];

      if (merged.length > existing.length || !updated.roadmapProgress[trackId]) {
        updated.roadmapProgress[trackId] = {
          checkedQuestions: merged,
          totalQuestions: total,
        };
        changed = true;
      }
    }

    // Migrate legacy generic SQL progress to PostgreSQL
    const sqlLegacy = updated.roadmapProgress['sql'];
    if (sqlLegacy?.checkedQuestions?.length) {
      const pgTotal = ALL_QUESTIONS.filter(q => q.category === 'postgresql').length;
      const pgExisting = updated.roadmapProgress.postgresql?.checkedQuestions ?? [];
      updated.roadmapProgress.postgresql = {
        checkedQuestions: [...new Set([...pgExisting, ...sqlLegacy.checkedQuestions])],
        totalQuestions: pgTotal,
      };
      delete updated.roadmapProgress.sql;
      changed = true;
    }

    return changed ? updated : data;
  } catch {
    return data;
  }
}

/**
 * All technology track IDs used in roadmaps and readiness.
 * @returns {string[]}
 */
export function getAllTrackIds() {
  return [
    'oracle dba',
    'postgresql',
    'mysql',
    'linux',
    'aws',
    'azure',
    'google',
    'shell scripting',
    'devops',
    'databricks',
    'snowflake',
    'kubernetes',
    'terraform',
  ];
}

/**
 * Recalculate and persist readiness scores for all tracks with activity.
 * @param {UserData} data
 * @returns {UserData}
 */
function recalculateScores(data) {
  const readinessScores = {};
  const tracks = getAllTrackIds();

  for (const technology of tracks) {
    if (hasActivityForTechnology(data, technology)) {
      const score = calculateReadinessScore(technology, data);
      readinessScores[technology] = {
        score,
        lastCalculated: new Date().toISOString(),
      };
    }
  }

  return { ...data, readinessScores };
}

/**
 * Check if a technology has roadmap or interview activity.
 * @param {UserData} data
 * @param {string} technology
 * @returns {boolean}
 */
export function hasActivityForTechnology(data, technology) {
  const roadmap = data.roadmapProgress[technology];
  const hasRoadmap = roadmap && roadmap.checkedQuestions.length > 0;
  const hasInterviews = data.mockInterviews.some(i => i.technology === technology);
  return hasRoadmap || hasInterviews;
}

/**
 * Check if user has any readiness-related activity.
 * @returns {boolean}
 */
export function hasAnyActivity() {
  const data = getUserData();
  const hasRoadmap = Object.values(data.roadmapProgress).some(
    r => r.checkedQuestions.length > 0
  );
  const hasInterviews = data.mockInterviews.length > 0;
  return hasRoadmap || hasInterviews;
}

/**
 * Get full user data from localStorage, with defaults and legacy migration.
 * @returns {UserData}
 */
export function getUserData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let data = raw
      ? { ...defaultUserData, ...safeParse(raw) }
      : { ...defaultUserData };

    data.roadmapProgress = data.roadmapProgress || {};
    data.mockInterviews = data.mockInterviews || [];
    data.readinessScores = data.readinessScores || {};

    data = migrateLegacyCompletedQuestions(data);
    return data;
  } catch {
    return { ...defaultUserData };
  }
}

/**
 * Persist user data to localStorage and sync legacy completed-questions key.
 * @param {UserData} data
 * @returns {boolean}
 */
export function saveUserData(data) {
  try {
    const withTimestamp = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    const recalculated = recalculateScores(withTimestamp);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recalculated));

    const allChecked = getAllCheckedQuestionIds(recalculated);
    localStorage.setItem(LEGACY_COMPLETED_KEY, JSON.stringify(allChecked));

    window.dispatchEvent(new Event('allpreps-readiness-updated'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Flatten all checked question IDs across tracks (legacy compat).
 * @param {UserData} data
 * @returns {string[]}
 */
export function getAllCheckedQuestionIds(data) {
  const ids = new Set();
  for (const entry of Object.values(data.roadmapProgress)) {
    for (const id of entry.checkedQuestions || []) {
      ids.add(id);
    }
  }
  return [...ids];
}

/**
 * Get checked question IDs for a specific technology track.
 * @param {string} technology
 * @returns {string[]}
 */
export function getCheckedQuestionsForTrack(technology) {
  const data = getUserData();
  return data.roadmapProgress[technology]?.checkedQuestions ?? [];
}

/**
 * Save roadmap progress for a technology track.
 * @param {string} technology
 * @param {string[]} checkedQuestions
 * @param {number} total
 * @returns {boolean}
 */
export function saveRoadmapProgress(technology, checkedQuestions, total) {
  try {
    const data = getUserData();
    data.roadmapProgress[technology] = {
      checkedQuestions: [...checkedQuestions],
      totalQuestions: total,
    };
    return saveUserData(data);
  } catch {
    return false;
  }
}

/**
 * Toggle a single question's completed state for a track.
 * @param {string} technology
 * @param {string} questionId
 * @param {number} totalQuestions
 * @returns {string[]} Updated checked IDs for the track
 */
export function toggleRoadmapQuestion(technology, questionId, totalQuestions) {
  const data = getUserData();
  const current = data.roadmapProgress[technology]?.checkedQuestions ?? [];
  const isCompleting = !current.includes(questionId);
  const updated = isCompleting
    ? [...current, questionId]
    : current.filter(id => id !== questionId);

  saveRoadmapProgress(technology, updated, totalQuestions);

  if (isCompleting) {
    trackFounderMetric(FOUNDER_METRICS.QUESTIONS_COMPLETED, {
      metadata: { technology, questionId },
    });
  }

  return updated;
}

/**
 * Save a completed mock interview session and update readiness.
 * @param {MockInterviewSession} interviewSession
 * @returns {boolean}
 */
export function saveCompletedInterview(interviewSession) {
  try {
    const data = getUserData();
    data.mockInterviews = [...data.mockInterviews, interviewSession];
    data.lastCompletedInterview = {
      technology: interviewSession.technology,
      date: interviewSession.date,
      score: interviewSession.totalScore,
    };
    return saveUserData(data);
  } catch {
    return false;
  }
}

/**
 * Get cached readiness score for a technology (recalculated on read).
 * @param {string} technology
 * @returns {number}
 */
export function getReadinessScore(technology) {
  const data = getUserData();
  return calculateReadinessScore(technology, data);
}

/**
 * Get all readiness scores keyed by technology.
 * @returns {Record<string, ReadinessScoreEntry>}
 */
export function getAllReadinessScores() {
  const data = getUserData();
  const scores = {};
  for (const tech of getAllTrackIds()) {
    if (hasActivityForTechnology(data, tech)) {
      scores[tech] = {
        score: calculateReadinessScore(tech, data),
        lastCalculated: new Date().toISOString(),
      };
    }
  }
  return scores;
}

/**
 * Get the most recent mock interview for a technology.
 * @param {string} technology
 * @returns {MockInterviewSession|null}
 */
export function getLastInterviewForTechnology(technology) {
  const data = getUserData();
  const interviews = data.mockInterviews
    .filter(i => i.technology === technology)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return interviews[0] ?? null;
}

/**
 * Count mock interview attempts for a technology.
 * @param {string} technology
 * @returns {number}
 */
export function getInterviewAttemptCount(technology) {
  const data = getUserData();
  return data.mockInterviews.filter(i => i.technology === technology).length;
}

/**
 * Clear all user readiness data (testing/reset).
 * @returns {boolean}
 */
export function clearUserData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_COMPLETED_KEY);
    window.dispatchEvent(new Event('allpreps-readiness-updated'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Placeholder for future Supabase migration.
 * @throws {Error}
 */
export function migrateToSupabase() {
  throw new Error('Not implemented');
}

// DEVELOPMENT ONLY — remove before production
/**
 * Seed realistic test data for UI development.
 * @returns {boolean}
 */
export function seedTestData() {
  try {
    const now = new Date().toISOString();
    const data = {
      ...defaultUserData,
      lastUpdated: now,
      roadmapProgress: {
        'oracle dba': {
          checkedQuestions: ['legacy-1', 'legacy-2', 'legacy-3', 'legacy-7', 'legacy-15'],
          totalQuestions: 75,
        },
        linux: {
          checkedQuestions: ['legacy-4', 'legacy-8', 'legacy-61'],
          totalQuestions: 75,
        },
      },
      mockInterviews: [
        {
          id: 'test-session-1',
          technology: 'oracle dba',
          level: 'mid',
          date: new Date(Date.now() - 86400000 * 3).toISOString(),
          totalScore: 72,
          questionCount: 5,
          strongAreas: ['Memory architecture fundamentals', 'RMAN backup procedures'],
          weakAreas: ['Data Guard failover steps', 'ASM rebalance tuning'],
          questions: [
            { questionId: 'legacy-1', category: 'Memory Architecture', score: 8, followUpScore: 7 },
            { questionId: 'legacy-3', category: 'Networking', score: 7, followUpScore: 6 },
          ],
        },
        {
          id: 'test-session-2',
          technology: 'linux',
          level: 'junior',
          date: new Date(Date.now() - 86400000).toISOString(),
          totalScore: 58,
          questionCount: 5,
          strongAreas: ['Process management', 'File permissions'],
          weakAreas: ['Kernel tuning parameters', 'LVM expansion'],
          questions: [
            { questionId: 'legacy-4', category: 'Linux Administration', score: 6, followUpScore: 5 },
          ],
        },
      ],
      readinessScores: {},
      lastCompletedInterview: {
        technology: 'linux',
        date: new Date(Date.now() - 86400000).toISOString(),
        score: 58,
      },
    };
    return saveUserData(data);
  } catch {
    return false;
  }
}
