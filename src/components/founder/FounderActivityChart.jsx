import { METRIC_LABELS } from '../../lib/founderAnalytics';

const CHART_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
  '#4f46e5',
  '#0d9488',
  '#ca8a04',
  '#9333ea',
];

/**
 * Multi-series bar chart for daily founder metrics.
 * @param {{ dailySeries: Array<Record<string, number|string>>, metrics: string[], maxBars?: number }} props
 */
export default function FounderActivityChart({ dailySeries, metrics, maxBars = 7 }) {
  const rows = dailySeries.slice(-maxBars);
  const maxValue = Math.max(
    1,
    ...rows.flatMap((row) => metrics.map((metric) => row[metric] || 0)),
  );

  return (
    <div className="founder-chart">
      <div className="founder-chart-legend">
        {metrics.map((metric, index) => (
          <span key={metric} className="founder-chart-legend-item">
            <span
              className="founder-chart-swatch"
              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            {METRIC_LABELS[metric]}
          </span>
        ))}
      </div>

      <div className="founder-chart-bars" role="img" aria-label="Daily activity chart">
        {rows.map((row) => (
          <div key={row.date} className="founder-chart-column">
            <div className="founder-chart-stack">
              {metrics.map((metric, index) => {
                const value = row[metric] || 0;
                const height = `${Math.max((value / maxValue) * 100, value > 0 ? 6 : 0)}%`;
                return (
                  <div
                    key={metric}
                    className="founder-chart-bar"
                    style={{
                      height,
                      backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                    }}
                    title={`${METRIC_LABELS[metric]}: ${value}`}
                  />
                );
              })}
            </div>
            <span className="founder-chart-label">{formatShortDate(row.date)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatShortDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
