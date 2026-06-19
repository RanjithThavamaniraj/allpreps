import { trackEvent } from './analytics';

const API_PATH = '/api/pro-interest';
const LOCAL_KEY = 'allpreps_pro_interest';

/**
 * @typedef {Object} ProInterestLead
 * @property {string} name
 * @property {string} email
 * @property {string} track
 * @property {string} payment_interest
 * @property {string} timestamp
 */

/**
 * Read local mirror of pro interest submissions.
 * @returns {ProInterestLead[]}
 */
export function getLocalProInterest() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProInterest(entries) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

/**
 * Submit early access lead to server API.
 * @param {{ name: string, email: string, track: string, payment_interest: string }} payload
 * @returns {Promise<ProInterestLead>}
 */
export async function submitProInterest(payload) {
  const res = await fetch(API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit. Please try again.');
  }

  const entry = await res.json();
  const local = getLocalProInterest();
  saveLocalProInterest([...local, entry]);
  await trackEvent('pro_interest_submitted');
  window.dispatchEvent(new Event('allpreps-pro-interest-updated'));
  return entry;
}

/**
 * Fetch all pro interest leads (admin).
 * @returns {Promise<ProInterestLead[]>}
 */
export async function fetchProInterest() {
  try {
    const res = await fetch(API_PATH);
    if (res.ok) {
      const data = await res.json();
      saveLocalProInterest(data);
      return data;
    }
  } catch {
    /* fall through */
  }
  return getLocalProInterest();
}
