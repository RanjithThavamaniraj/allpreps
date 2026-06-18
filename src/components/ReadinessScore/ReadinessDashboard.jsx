import { useEffect, useState, useMemo } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { READINESS_TRACKS } from '../../lib/readinessTracks';
import { getUserData } from '../../lib/readinessStorage';
import {
  calculateOverallReadiness,
  getScoreBand,
  getScoreColor,
  getGlobalEmptyStateMessage,
  getEmptyStateMessage,
} from '../../lib/calculateReadiness';
import ReadinessCard from './ReadinessCard';
import ScoreRing from './ScoreRing';

export default function ReadinessDashboard() {
  const [data, setData] = useState(() => getUserData());
  const filterTrack = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('track') || null;
  }, []);

  useEffect(() => {
    setData(getUserData());
    const refresh = () => setData(getUserData());
    window.addEventListener('allpreps-readiness-updated', refresh);
    return () => window.removeEventListener('allpreps-readiness-updated', refresh);
  }, []);

  const trackIds = READINESS_TRACKS.map(t => t.id);
  const { average, trackedCount } = calculateOverallReadiness(data, trackIds);
  const avgColor = getScoreColor(average);
  const avgBand = getScoreBand(average);
  const globalEmpty = getGlobalEmptyStateMessage(data);

  const displayTracks = filterTrack
    ? READINESS_TRACKS.filter(t => t.id === filterTrack)
    : READINESS_TRACKS;

  const lastUpdated = data.lastUpdated
    ? new Date(data.lastUpdated).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
      })
    : null;

  return (
    <div className="readiness-dashboard">
      <header className="readiness-dashboard-header">
        <div>
          <p className="readiness-dashboard-eyebrow"><FiTrendingUp /> Interview Readiness</p>
          <h1>Your Readiness Score</h1>
          {lastUpdated && (
            <p className="readiness-dashboard-updated">Last updated {lastUpdated}</p>
          )}
        </div>
      </header>

      {trackedCount > 0 ? (
        <div className="readiness-overall-card">
          <div className="readiness-overall-ring">
            <ScoreRing score={average} size={160} color={avgColor} />
          </div>
          <div className="readiness-overall-info">
            <h2 style={{ color: avgColor }}>{avgBand}</h2>
            <p>{trackedCount} technolog{trackedCount === 1 ? 'y' : 'ies'} tracked</p>
            <p className="readiness-overall-hint">
              Scores combine roadmap progress (40%) and mock interview results (60%).
            </p>
          </div>
        </div>
      ) : (
        <div className="readiness-empty-banner">
          <p>{globalEmpty}</p>
          <div className="readiness-empty-actions">
            <a href="/roadmaps" className="btn btn-secondary">Start Roadmap</a>
            <a href="/mock-interviews" className="btn btn-primary">Take Mock Interview</a>
          </div>
        </div>
      )}

      {filterTrack && (
        <p className="readiness-filter-note">
          Showing: {READINESS_TRACKS.find(t => t.id === filterTrack)?.name ?? filterTrack}
          {' · '}
          <a href="/readiness">View all technologies</a>
        </p>
      )}

      <div className="readiness-cards-grid">
        {displayTracks.map(track => {
          const hint = getEmptyStateMessage(track.id, data);
          return (
            <div key={track.id}>
              <ReadinessCard technology={track.id} />
              {hint && trackedCount > 0 && (
                <p className="readiness-card-hint">{hint}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
