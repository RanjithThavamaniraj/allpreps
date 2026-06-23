/** Canonical founder metrics — mirror these as Supabase columns / event types later. */
export const FOUNDER_METRICS = {
  VISITORS: 'visitors',
  REGISTRATIONS: 'registrations',
  QUESTIONS_VIEWED: 'questions_viewed',
  QUESTIONS_COMPLETED: 'questions_completed',
  PRACTICE_TESTS_STARTED: 'practice_tests_started',
  PRACTICE_TESTS_COMPLETED: 'practice_tests_completed',
  MOCK_INTERVIEWS_STARTED: 'mock_interviews_started',
  MOCK_INTERVIEWS_COMPLETED: 'mock_interviews_completed',
  UPGRADE_TO_PRO_CLICKS: 'upgrade_to_pro_clicks',
  WAITLIST_SIGNUPS: 'waitlist_signups',
};

export const METRIC_LABELS = {
  [FOUNDER_METRICS.VISITORS]: 'Visitors',
  [FOUNDER_METRICS.REGISTRATIONS]: 'Registrations',
  [FOUNDER_METRICS.QUESTIONS_VIEWED]: 'Questions Viewed',
  [FOUNDER_METRICS.QUESTIONS_COMPLETED]: 'Questions Completed',
  [FOUNDER_METRICS.PRACTICE_TESTS_STARTED]: 'Practice Tests Started',
  [FOUNDER_METRICS.PRACTICE_TESTS_COMPLETED]: 'Practice Tests Completed',
  [FOUNDER_METRICS.MOCK_INTERVIEWS_STARTED]: 'Mock Interviews Started',
  [FOUNDER_METRICS.MOCK_INTERVIEWS_COMPLETED]: 'Mock Interviews Completed',
  [FOUNDER_METRICS.UPGRADE_TO_PRO_CLICKS]: 'Upgrade to Pro Clicks',
  [FOUNDER_METRICS.WAITLIST_SIGNUPS]: 'Waitlist Signups',
};

/** Display order for dashboard cards and charts. */
export const METRIC_ORDER = Object.values(FOUNDER_METRICS);

export const STORAGE_KEY = 'allpreps_founder_analytics';
export const ANALYTICS_VERSION = 1;
