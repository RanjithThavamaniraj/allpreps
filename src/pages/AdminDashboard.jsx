import { useEffect, useMemo, useState } from 'react';
import { AppIcon, BarChart3, RefreshCw } from '../components/icons';
import { LogoIcon } from '../components/Logo';
import FounderMetricCard from '../components/founder/FounderMetricCard';
import FounderActivityChart from '../components/founder/FounderActivityChart';
import FounderFunnelChart from '../components/founder/FounderFunnelChart';
import {
  FOUNDER_METRICS,
  METRIC_ORDER,
  getFounderDashboardData,
} from '../lib/founderAnalytics';

const HIGHLIGHT_METRICS = new Set([
  FOUNDER_METRICS.VISITORS,
  FOUNDER_METRICS.REGISTRATIONS,
  FOUNDER_METRICS.MOCK_INTERVIEWS_COMPLETED,
  FOUNDER_METRICS.WAITLIST_SIGNUPS,
]);

const TREND_METRICS = [
  FOUNDER_METRICS.VISITORS,
  FOUNDER_METRICS.QUESTIONS_VIEWED,
  FOUNDER_METRICS.MOCK_INTERVIEWS_STARTED,
  FOUNDER_METRICS.UPGRADE_TO_PRO_CLICKS,
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  const refresh = () => setData(getFounderDashboardData({ trendDays: 14 }));

  useEffect(() => {
    refresh();
    window.addEventListener('allpreps-founder-analytics-updated', refresh);
    return () => window.removeEventListener('allpreps-founder-analytics-updated', refresh);
  }, []);

  const updatedLabel = useMemo(() => {
    if (!data?.updatedAt) return '';
    return new Date(data.updatedAt).toLocaleString();
  }, [data?.updatedAt]);

  if (!data) {
    return (
      <div className="founder-shell">
        <main className="founder-main founder-loading">Loading founder analytics…</main>
      </div>
    );
  }

  return (
    <div className="founder-shell">
      <header className="founder-topbar">
        <div className="founder-topbar-brand">
          <LogoIcon size={24} />
          <div>
            <strong>AllPreps</strong>
            <span>Founder Analytics</span>
          </div>
        </div>
        <div className="founder-topbar-actions">
          <span className="founder-updated">Updated {updatedLabel}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={refresh}>
            <AppIcon icon={RefreshCw} size="sm" /> Refresh
          </button>
        </div>
      </header>

      <main className="founder-main">
        <section className="founder-hero">
          <div>
            <p className="founder-eyebrow"><AppIcon icon={BarChart3} size="sm" /> Product metrics</p>
            <h1>Founder Dashboard</h1>
            <p className="founder-subtitle">
              Track acquisition, learning engagement, and monetization signals.
              Stored locally for now — architecture is ready for Supabase migration.
            </p>
          </div>
          <div className="founder-hero-stat">
            <span className="founder-hero-stat-label">7-day visitors</span>
            <span className="founder-hero-stat-value">
              {data.weekTotals[FOUNDER_METRICS.VISITORS].toLocaleString()}
            </span>
          </div>
        </section>

        <section className="founder-metrics-grid">
          {METRIC_ORDER.map((metric) => (
            <FounderMetricCard
              key={metric}
              metric={metric}
              value={data.totals[metric]}
              weekValue={data.weekTotals[metric]}
              accent={HIGHLIGHT_METRICS.has(metric)}
            />
          ))}
        </section>

        <section className="founder-panels">
          <article className="founder-panel founder-panel-wide">
            <div className="founder-panel-head">
              <h2>14-day activity</h2>
              <p>Visitors, question views, mock interviews, and upgrade clicks.</p>
            </div>
            <FounderActivityChart
              dailySeries={data.dailySeries}
              metrics={TREND_METRICS}
              maxBars={14}
            />
          </article>

          <article className="founder-panel">
            <div className="founder-panel-head">
              <h2>Conversion funnel</h2>
              <p>All-time rates across key journeys.</p>
            </div>
            <FounderFunnelChart funnel={data.funnel} />
          </article>
        </section>

        <section className="founder-panel">
          <div className="founder-panel-head">
            <h2>Daily breakdown</h2>
            <p>Last 14 days by metric.</p>
          </div>
          <div className="founder-table-wrap">
            <table className="founder-table">
              <thead>
                <tr>
                  <th>Date</th>
                  {METRIC_ORDER.map((metric) => (
                    <th key={metric}>{shortLabel(metric)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...data.dailySeries].reverse().map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    {METRIC_ORDER.map((metric) => (
                      <td key={metric}>{row[metric] || 0}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="founder-footnote">
          Data source: <code>localStorage</code> key <code>allpreps_founder_analytics</code>.
          Replace <code>localStorageStore</code> with a Supabase adapter when ready.
        </p>
      </main>
    </div>
  );
}

function shortLabel(metric) {
  return metric
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
