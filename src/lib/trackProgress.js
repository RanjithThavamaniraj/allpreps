import { ALL_QUESTIONS } from '../data/questionLoader';
import {
  getAllCheckedQuestionIds,
  getCheckedQuestionsForTrack,
  getUserData,
  toggleRoadmapQuestion,
} from './readinessStorage';

/**
 * Get total question count for a technology track.
 * @param {string} trackId
 * @returns {number}
 */
export function getTrackQuestionTotal(trackId) {
  return ALL_QUESTIONS.filter(q => q.category === trackId).length;
}

/**
 * Get all globally checked question IDs (for cross-page sync).
 * @returns {string[]}
 */
export function getGlobalCompletedIds() {
  return getAllCheckedQuestionIds(getUserData());
}

/**
 * Get checked IDs for a single track.
 * @param {string} trackId
 * @returns {string[]}
 */
export function getTrackCompletedIds(trackId) {
  return getCheckedQuestionsForTrack(trackId);
}

/**
 * Toggle question completion and return updated global checked IDs.
 * @param {string} trackId
 * @param {string} questionId
 * @returns {string[]}
 */
export function toggleTrackQuestion(trackId, questionId) {
  const total = getTrackQuestionTotal(trackId);
  toggleRoadmapQuestion(trackId, questionId, total);
  return getGlobalCompletedIds();
}

/**
 * Subscribe to readiness storage updates.
 * @param {() => void} callback
 * @returns {() => void} Unsubscribe function
 */
export function subscribeToProgress(callback) {
  const handler = () => callback();
  window.addEventListener('allpreps-readiness-updated', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('allpreps-readiness-updated', handler);
    window.removeEventListener('storage', handler);
  };
}
