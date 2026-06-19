import { FiClock, FiLock } from 'react-icons/fi';
import { getInterviewHistory, canViewScoreHistory } from '../lib/readinessInsights';
import { getTrackLabel, getDifficultyLabel } from '../utils/mockInterviewUtils';

export default function InterviewHistoryPanel() {
  if (!canViewScoreHistory()) {
    return (
      <div className="interview-history-locked">
        <FiLock size={24} />
        <h3>Interview History</h3>
        <p>Upgrade to Pro to access your full interview history and analytics.</p>
        <a href="/pricing" className="btn btn-primary btn-sm">Upgrade to Pro</a>
      </div>
    );
  }

  const history = getInterviewHistory();

  if (history.length === 0) {
    return (
      <div className="interview-history-empty">
        <h3>Interview History</h3>
        <p>Complete mock interviews to build your history.</p>
      </div>
    );
  }

  return (
    <div className="interview-history-panel">
      <h3><FiClock /> Interview History</h3>
      <div className="interview-history-list">
        {history.map(item => (
          <div key={item.id} className="interview-history-item">
            <div className="interview-history-meta">
              <span className="interview-history-tech">{getTrackLabel(item.technology)}</span>
              <span className="interview-history-level">{getDifficultyLabel(item.level)}</span>
            </div>
            <div className="interview-history-stats">
              <span className="interview-history-score">{item.totalScore}%</span>
              <span className="interview-history-date">
                {new Date(item.date).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
