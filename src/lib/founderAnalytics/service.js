import { FOUNDER_METRICS, METRIC_ORDER } from './events.js';
import { incrementMetric, readSnapshot, todayKey } from './localStorageStore.js';

const SESSION_VISITOR_KEY = 'allpreps_visitor_recorded';

/**
 * Track one visitor per browser session (counts toward today's visitors).
 * Call once on app boot.
 */
export function recordVisitor() {
  try {
    if (sessionStorage.getItem(SESSION_VISITOR_KEY)) return;
    sessionStorage.setItem(SESSION_VISITOR_KEY, '1');
    trackFounderMetric(FOUNDER_METRICS.VISITORS);
  } catch {
    trackFounderMetric(FOUNDER_METRICS.VISITORS);
  }
}

/**
 * @param {import('./events.js').FOUNDER_METRICS[keyof import('./events.js').FOUNDER_METRICS]} metric
 * @param {{ metadata?: Record<string, unknown> }} [options]
 */
export function trackFounderMetric(metric, options = {}) {
  const snapshot = incrementMetric(metric, { metadata: options.metadata });
  window.dispatchEvent(new Event('allpreps-founder-analytics-updated'));
  return snapshot;
}

/** @returns {import('./localStorageStore.js').FounderSnapshot} */
export function getFounderSnapshot() {
  return readSnapshot();
}

/**
 * Build dashboard-ready aggregates.
 * Designed to match a future Supabase RPC / materialized view shape.
 */
export function getFounderDashboardData({ trendDays = 14 } = {}) {
  const snapshot = readSnapshot();
  const dates = buildDateRange(trendDays);

  const dailySeries = dates.map((date) => {
    const day = snapshot.daily[date] || {};
    const row = { date };
    for (const metric of METRIC_ORDER) {
      row[metric] = day[metric] || 0;
    }
    return row;
  });

  const totals = { ...snapshot.totals };
  for (const metric of METRIC_ORDER) {
    totals[metric] = totals[metric] || 0;
  }

  const last7 = dailySeries.slice(-7);
  const weekTotals = METRIC_ORDER.reduce((acc, metric) => {
    acc[metric] = last7.reduce((sum, day) => sum + (day[metric] || 0), 0);
    return acc;
  }, {});

  return {
    totals,
    weekTotals,
    dailySeries,
    updatedAt: snapshot.updatedAt,
    recentEvents: snapshot.recentEvents.slice(0, 20),
    funnel: buildFunnel(totals),
  };
}

function buildDateRange(days) {
  const dates = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - i);
    dates.push(todayKey(d));
  }
  return dates;
}

function buildFunnel(totals) {
  const pct = (num, den) => (den > 0 ? Math.round((num / den) * 100) : 0);

  return [
    {
      id: 'registration',
      label: 'Visitor → Registration',
      from: totals.visitors,
      to: totals.registrations,
      rate: pct(totals.registrations, totals.visitors),
    },
    {
      id: 'question-engage',
      label: 'Visitors → Questions Viewed',
      from: totals.visitors,
      to: totals.questions_viewed,
      rate: pct(totals.questions_viewed, totals.visitors),
    },
    {
      id: 'practice-complete',
      label: 'Practice Started → Completed',
      from: totals.practice_tests_started,
      to: totals.practice_tests_completed,
      rate: pct(totals.practice_tests_completed, totals.practice_tests_started),
    },
    {
      id: 'mock-complete',
      label: 'Mock Started → Completed',
      from: totals.mock_interviews_started,
      to: totals.mock_interviews_completed,
      rate: pct(totals.mock_interviews_completed, totals.mock_interviews_started),
    },
    {
      id: 'upgrade',
      label: 'Upgrade Clicks → Waitlist',
      from: totals.upgrade_to_pro_clicks,
      to: totals.waitlist_signups,
      rate: pct(totals.waitlist_signups, totals.upgrade_to_pro_clicks),
    },
  ];
}

/**
 * Future Supabase adapter stub — swap implementation without changing callers.
 * @param {import('./localStorageStore.js').FounderSnapshot} snapshot
 */
export async function syncToRemote(_snapshot) {
  // Placeholder for: await supabase.from('founder_events').insert(...)
  return { ok: false, reason: 'remote_not_configured' };
}
