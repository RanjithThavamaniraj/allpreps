export default function QuestionProgressSummary({ completed, total, label = 'Track Progress' }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="q-progress-summary" aria-label={label}>
      <div className="q-progress-stats">
        <div className="q-progress-stat">
          <span className="q-progress-value">{completed}</span>
          <span className="q-progress-label">Questions Completed</span>
        </div>
        <div className="q-progress-divider" aria-hidden="true" />
        <div className="q-progress-stat">
          <span className="q-progress-value">{total}</span>
          <span className="q-progress-label">Total Questions</span>
        </div>
        <div className="q-progress-divider" aria-hidden="true" />
        <div className="q-progress-stat">
          <span className="q-progress-value">{pct}%</span>
          <span className="q-progress-label">Completion</span>
        </div>
      </div>
      <div className="q-progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="q-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
