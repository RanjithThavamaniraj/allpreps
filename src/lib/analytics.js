import { trackFounderMetric, FOUNDER_METRICS } from './founderAnalytics';

const LOCAL_KEY = 'allpreps_analytics';
const API_PATH = '/api/analytics';

const DEFAULT_ANALYTICS = {
  interview_started: 0,
  weekly_limit_hit: 0,
  upgrade_clicked: 0,
  pro_interest_submitted: 0,
};

const LEGACY_TO_FOUNDER = {
  interview_started: FOUNDER_METRICS.MOCK_INTERVIEWS_STARTED,
  upgrade_clicked: FOUNDER_METRICS.UPGRADE_TO_PRO_CLICKS,
  pro_interest_submitted: FOUNDER_METRICS.WAITLIST_SIGNUPS,
};

/**
 * Read analytics from localStorage mirror.
 * @returns {typeof DEFAULT_ANALYTICS}
 */
function getLocalAnalytics() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? { ...DEFAULT_ANALYTICS, ...JSON.parse(raw) } : { ...DEFAULT_ANALYTICS };
  } catch {
    return { ...DEFAULT_ANALYTICS };
  }
}

/**
 * Persist analytics to localStorage mirror.
 * @param {typeof DEFAULT_ANALYTICS} data
 */
function saveLocalAnalytics(data) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

/**
 * Fetch analytics from JSON file API (dev server) or local mirror.
 * @returns {Promise<typeof DEFAULT_ANALYTICS>}
 */
export async function fetchAnalytics() {
  try {
    const res = await fetch(API_PATH);
    if (res.ok) {
      const data = await res.json();
      saveLocalAnalytics(data);
      return data;
    }
  } catch {
    /* fall through */
  }
  return getLocalAnalytics();
}

/**
 * Track an analytics event.
 * @param {'interview_started'|'weekly_limit_hit'|'upgrade_clicked'|'pro_interest_submitted'} event
 */
export async function trackEvent(event) {
  const local = getLocalAnalytics();
  local[event] = (local[event] || 0) + 1;
  saveLocalAnalytics(local);

  if (LEGACY_TO_FOUNDER[event]) {
    trackFounderMetric(LEGACY_TO_FOUNDER[event]);
  }

  try {
    const res = await fetch(API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event }),
    });
    if (res.ok) {
      const data = await res.json();
      saveLocalAnalytics(data);
      window.dispatchEvent(new Event('allpreps-analytics-updated'));
      return data;
    }
  } catch {
    /* local-only in static builds */
  }

  window.dispatchEvent(new Event('allpreps-analytics-updated'));
  return local;
}

/**
 * Calculate upgrade intent rate.
 * @param {typeof DEFAULT_ANALYTICS} data
 * @returns {number}
 */
export function getUpgradeIntentRate(data) {
  if (!data.weekly_limit_hit) return 0;
  return Math.round((data.upgrade_clicked / data.weekly_limit_hit) * 100);
}

/**
 * Calculate pro interest conversion from upgrade clicks.
 * @param {typeof DEFAULT_ANALYTICS} data
 * @returns {number}
 */
export function getProInterestConversionRate(data) {
  if (!data.upgrade_clicked) return 0;
  return Math.round(((data.pro_interest_submitted || 0) / data.upgrade_clicked) * 100);
}
