import {
  ANALYTICS_VERSION,
  FOUNDER_METRICS,
  METRIC_ORDER,
  STORAGE_KEY,
} from './events.js';

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function createEmptyDaily() {
  return Object.fromEntries(METRIC_ORDER.map((key) => [key, 0]));
}

function createEmptyTotals() {
  return createEmptyDaily();
}

function createEmptySnapshot() {
  return {
    version: ANALYTICS_VERSION,
    updatedAt: new Date().toISOString(),
    totals: createEmptyTotals(),
    daily: {},
    recentEvents: [],
  };
}

/**
 * @typedef {import('./events.js').FOUNDER_METRICS[keyof import('./events.js').FOUNDER_METRICS]} FounderMetric
 * @typedef {{ metric: FounderMetric, timestamp: string, metadata?: Record<string, unknown> }} FounderEvent
 * @typedef {{ version: number, updatedAt: string, totals: Record<FounderMetric, number>, daily: Record<string, Record<FounderMetric, number>>, recentEvents: FounderEvent[] }} FounderSnapshot
 */

/** @returns {FounderSnapshot} */
export function readSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptySnapshot();

    const parsed = JSON.parse(raw);
    const snapshot = createEmptySnapshot();
    snapshot.updatedAt = parsed.updatedAt || snapshot.updatedAt;
    snapshot.totals = { ...snapshot.totals, ...(parsed.totals || {}) };
    snapshot.daily = parsed.daily || {};
    snapshot.recentEvents = Array.isArray(parsed.recentEvents) ? parsed.recentEvents : [];
    return snapshot;
  } catch {
    return createEmptySnapshot();
  }
}

/** @param {FounderSnapshot} snapshot */
export function writeSnapshot(snapshot) {
  try {
    snapshot.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* quota / private mode */
  }
}

/**
 * Increment a metric in totals + daily bucket.
 * @param {FounderMetric} metric
 * @param {{ amount?: number, date?: string, metadata?: Record<string, unknown> }} [options]
 */
export function incrementMetric(metric, options = {}) {
  const amount = options.amount ?? 1;
  const date = options.date ?? todayKey();
  const snapshot = readSnapshot();

  snapshot.totals[metric] = (snapshot.totals[metric] || 0) + amount;

  if (!snapshot.daily[date]) {
    snapshot.daily[date] = createEmptyDaily();
  }
  snapshot.daily[date][metric] = (snapshot.daily[date][metric] || 0) + amount;

  if (options.metadata) {
    snapshot.recentEvents = [
      { metric, timestamp: new Date().toISOString(), metadata: options.metadata },
      ...snapshot.recentEvents,
    ].slice(0, 100);
  }

  writeSnapshot(snapshot);
  return snapshot;
}

/** @param {FounderMetric} metric */
export function isValidMetric(metric) {
  return Object.values(FOUNDER_METRICS).includes(metric);
}

export { todayKey, createEmptyDaily };
