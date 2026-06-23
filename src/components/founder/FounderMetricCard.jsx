import { METRIC_LABELS } from '../../lib/founderAnalytics';

export default function FounderMetricCard({ metric, value, weekValue, accent }) {
  return (
    <article className={`founder-metric-card${accent ? ' founder-metric-card-accent' : ''}`}>
      <span className="founder-metric-label">{METRIC_LABELS[metric]}</span>
      <span className="founder-metric-value">{formatNumber(value)}</span>
      <span className="founder-metric-week">+{formatNumber(weekValue)} this week</span>
    </article>
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0);
}
