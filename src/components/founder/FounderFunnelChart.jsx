/**
 * Horizontal funnel bars for conversion rates.
 * @param {{ funnel: Array<{ id: string, label: string, from: number, to: number, rate: number }> }} props
 */
export default function FounderFunnelChart({ funnel }) {
  return (
    <div className="founder-funnel">
      {funnel.map((step) => (
        <div key={step.id} className="founder-funnel-row">
          <div className="founder-funnel-head">
            <span className="founder-funnel-label">{step.label}</span>
            <span className="founder-funnel-rate">{step.rate}%</span>
          </div>
          <div className="founder-funnel-track" aria-hidden="true">
            <div
              className="founder-funnel-fill"
              style={{ width: `${Math.max(step.rate, step.to > 0 ? 4 : 0)}%` }}
            />
          </div>
          <div className="founder-funnel-meta">
            <span>{step.to.toLocaleString()} / {step.from.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
