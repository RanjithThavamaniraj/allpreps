import { useEffect, useState } from 'react';
import { FiCheck, FiFlag, FiArrowRight } from 'react-icons/fi';
import { getTrackById } from '../../lib/readinessTracks';
import { calculateReadinessBreakdown, getScoreColor, getScoreCssClass } from '../../lib/calculateReadiness';
import { getUserData } from '../../lib/readinessStorage';

function ProgressBar({ value, color, delay = 0 }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 50 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div className="readiness-bar-track">
      <div
        className="readiness-bar-fill"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function ReadinessCard({ technology }) {
  const track = getTrackById(technology);
  const userData = getUserData();
  const breakdown = calculateReadinessBreakdown(technology, userData);
  const scoreColor = getScoreColor(breakdown.score);
  const scoreClass = getScoreCssClass(breakdown.score);
  const Icon = track?.icon;

  if (!breakdown.hasActivity) {
    return (
      <div className="readiness-card readiness-card-empty">
        {Icon && <Icon className="readiness-card-icon" />}
        <h3>{track?.name ?? technology}</h3>
        <p className="readiness-card-empty-text">No activity yet</p>
        <a href="/roadmaps" className="btn btn-secondary btn-sm">
          Start Roadmap <FiArrowRight />
        </a>
      </div>
    );
  }

  const mockUrl = `/mock-interviews?tech=${encodeURIComponent(technology)}`;

  return (
    <div className="readiness-card">
      <div className="readiness-card-header">
        <div className="readiness-card-title-row">
          {Icon && <Icon className="readiness-card-icon" />}
          <h3>{track?.name ?? technology}</h3>
        </div>
        <div className={`readiness-card-score ${scoreClass}`} style={{ color: scoreColor }}>
          {breakdown.score}
        </div>
      </div>

      <p className="readiness-card-band" style={{ color: scoreColor }}>{breakdown.band}</p>

      <div className="readiness-bar-group">
        <div className="readiness-bar-label">
          <span>Overall</span>
          <span>{breakdown.score}%</span>
        </div>
        <ProgressBar value={breakdown.score} color={scoreColor} />
      </div>

      <div className="readiness-bar-group">
        <div className="readiness-bar-label">
          <span>Roadmap</span>
          <span>{breakdown.roadmapScore}%</span>
        </div>
        <ProgressBar value={breakdown.roadmapScore} color="var(--primary)" delay={100} />
      </div>

      <div className="readiness-bar-group">
        <div className="readiness-bar-label">
          <span>Interviews</span>
          <span>{breakdown.interviewScore}% · {breakdown.attemptCount} attempt{breakdown.attemptCount !== 1 ? 's' : ''}</span>
        </div>
        <ProgressBar value={breakdown.interviewScore} color="var(--success)" delay={200} />
      </div>

      {breakdown.strongAreas.length > 0 && (
        <ul className="readiness-mini-list readiness-mini-strong">
          {breakdown.strongAreas.map((s, i) => (
            <li key={i}><FiCheck /> {s}</li>
          ))}
        </ul>
      )}

      {breakdown.weakAreas.length > 0 && (
        <ul className="readiness-mini-list readiness-mini-weak">
          {breakdown.weakAreas.map((g, i) => (
            <li key={i}><FiFlag /> {g}</li>
          ))}
        </ul>
      )}

      <div className="readiness-card-actions">
        <a href="/roadmaps" className="btn btn-secondary btn-sm">Continue Studying</a>
        <a href={mockUrl} className="btn btn-primary btn-sm">Take Mock Interview</a>
      </div>
    </div>
  );
}
