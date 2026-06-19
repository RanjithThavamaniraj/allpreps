import { FiTarget, FiTrendingUp, FiLock } from 'react-icons/fi';
import {
  READINESS_TARGET,
  getScoreTrend,
  getRecommendedActions,
  canViewScoreHistory,
} from '../lib/readinessInsights';
import { getScoreColor } from '../lib/calculateReadiness';

export default function ReadinessMotivation({ currentScore }) {
  const trend = getScoreTrend(5);
  const actions = getRecommendedActions();
  const showHistory = canViewScoreHistory();
  const scoreColor = getScoreColor(currentScore);
  const targetColor = getScoreColor(READINESS_TARGET);

  return (
    <div className="readiness-motivation">
      <div className="readiness-motivation-scores">
        <div className="readiness-motivation-current">
          <span className="readiness-motivation-label">Current Readiness</span>
          <span className="readiness-motivation-value" style={{ color: scoreColor }}>
            {currentScore}%
          </span>
        </div>
        <div className="readiness-motivation-arrow">→</div>
        <div className="readiness-motivation-target">
          <span className="readiness-motivation-label"><FiTarget /> Target</span>
          <span className="readiness-motivation-value" style={{ color: targetColor }}>
            {READINESS_TARGET}%
          </span>
        </div>
      </div>

      {trend.length > 0 && (
        <div className="readiness-trend-section">
          <h4><FiTrendingUp /> Score Trend</h4>
          {showHistory ? (
            <div className="readiness-trend-bar">
              {trend.map((score, i) => (
                <div key={i} className="readiness-trend-point">
                  <span className="readiness-trend-score" style={{ color: getScoreColor(score) }}>
                    {score}%
                  </span>
                  {i < trend.length - 1 && <span className="readiness-trend-connector" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="readiness-trend-locked">
              <FiLock />
              <span>Upgrade to Pro for readiness score history</span>
              <a href="/pricing" className="btn btn-secondary btn-sm">View Pro</a>
            </div>
          )}
        </div>
      )}

      <div className="readiness-actions-section">
        <h4>Recommended Actions</h4>
        <ul className="readiness-actions-list">
          {actions.map((action, i) => (
            <li key={i}>{action}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
