/**
 * Mock subscription override for development and demand validation.
 * Set to 'free' | 'pro' to force a plan, or null to use localStorage.
 * Can also set VITE_MOCK_PLAN=free|pro in .env
 */
const envOverride = import.meta.env.VITE_MOCK_PLAN;

export const MOCK_PLAN_OVERRIDE =
  envOverride === 'free' || envOverride === 'pro' ? envOverride : null;

export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
};

export const PRO_PRICE_INR = 299;

export const FREE_WEEKLY_INTERVIEW_LIMIT = 1;
export const FREE_LIMIT_WINDOW_DAYS = 7;

export const PRO_FEATURES = [
  'Unlimited AI Mock Interviews',
  'Detailed AI Evaluation',
  'Readiness Score History',
  'Interview History',
  'Progress Tracking',
  'Performance Analytics',
  'Weak Area Detection',
  'Personalized Improvement Plans',
  'Priority Access To New Features',
];

export const FREE_FEATURES = [
  'Roadmaps',
  'Question Banks',
  'Production Scenarios',
  'Readiness Score',
  '1 AI Mock Interview every 7 days',
];
