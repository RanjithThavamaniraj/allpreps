import { MOCK_PLAN_OVERRIDE, PLANS } from './subscriptionConfig';

const STORAGE_KEY = 'allpreps_subscription';

const defaultSubscription = {
  plan: PLANS.FREE,
  upgradedAt: null,
  source: 'default',
};

/**
 * Get current subscription state.
 * @returns {{ plan: string, upgradedAt: string|null, source: string }}
 */
export function getSubscription() {
  if (MOCK_PLAN_OVERRIDE) {
    return { ...defaultSubscription, plan: MOCK_PLAN_OVERRIDE, source: 'mock_override' };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultSubscription };
    return { ...defaultSubscription, ...JSON.parse(raw) };
  } catch {
    return { ...defaultSubscription };
  }
}

/**
 * @returns {boolean}
 */
export function isProUser() {
  return getSubscription().plan === PLANS.PRO;
}

/**
 * Activate mock Pro subscription (no payment).
 * @returns {boolean}
 */
export function activateMockPro() {
  try {
    const data = {
      plan: PLANS.PRO,
      upgradedAt: new Date().toISOString(),
      source: 'mock_activation',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('allpreps-subscription-updated'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Reset to free plan (dev/testing).
 * @returns {boolean}
 */
export function resetToFree() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...defaultSubscription }));
    window.dispatchEvent(new Event('allpreps-subscription-updated'));
    return true;
  } catch {
    return false;
  }
}

/**
 * Set plan explicitly (admin dev toggle).
 * @param {'free'|'pro'} plan
 */
export function setMockPlan(plan) {
  if (plan === PLANS.PRO) return activateMockPro();
  return resetToFree();
}
