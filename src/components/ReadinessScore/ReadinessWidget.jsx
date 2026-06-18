import { useEffect, useState } from 'react';
import { FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { READINESS_TRACKS } from '../../lib/readinessTracks';
import { getUserData, hasAnyActivity } from '../../lib/readinessStorage';
import { calculateReadinessBreakdown, calculateOverallReadiness, getScoreColor, getScoreBand } from '../../lib/calculateReadiness';
import ScoreRing from './ScoreRing';

export default function ReadinessWidget({
  maxTechnologies = 3,
  showCTA = true,
  compact = false,
}) {
  const [data, setData] = useState(() => getUserData());

  useEffect(() => {
    const refresh = () => setData(getUserData());
    window.addEventListener('allpreps-readiness-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('allpreps-readiness-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  if (!hasAnyActivity()) return null;

  const trackIds = READINESS_TRACKS.map(t => t.id);
  const { average, trackedCount } = calculateOverallReadiness(data, trackIds);
  const avgColor = getScoreColor(average);
  const avgBand = getScoreBand(average);

  const ranked = READINESS_TRACKS
    .map(track => ({
      ...track,
      breakdown: calculateReadinessBreakdown(track.id, data),
    }))
    .filter(t => t.breakdown.hasActivity)
    .sort((a, b) => b.breakdown.score - a.breakdown.score)
    .slice(0, maxTechnologies);

  if (compact) {
    return (
      <div className="readiness-widget readiness-widget-compact">
        <div className="readiness-widget-compact-score" style={{ color: avgColor }}>
          <FiTrendingUp /> {average}%
        </div>
        <span className="readiness-widget-compact-band">{avgBand}</span>
        {showCTA && (
          <a href="/readiness" className="readiness-widget-link">View all →</a>
        )}
      </div>
    );
  }

  return (
    <section className="readiness-widget">
      <div className="container">
        <div className="readiness-widget-inner">
          <div className="readiness-widget-summary">
            <ScoreRing score={average} size={120} strokeWidth={10} color={avgColor} />
            <div>
              <p className="readiness-widget-eyebrow">INTERVIEW READINESS</p>
              <h3 className="readiness-widget-title">{avgBand}</h3>
              <p className="readiness-widget-sub">{trackedCount} technolog{trackedCount === 1 ? 'y' : 'ies'} tracked</p>
              {showCTA && (
                <a href="/readiness" className="btn btn-primary btn-sm">
                  View Dashboard <FiArrowRight />
                </a>
              )}
            </div>
          </div>

          <div className="readiness-widget-tracks">
            {ranked.map(track => {
              const Icon = track.icon;
              const color = getScoreColor(track.breakdown.score);
              return (
                <a
                  key={track.id}
                  href={`/readiness?track=${encodeURIComponent(track.id)}`}
                  className="readiness-widget-track"
                >
                  <Icon />
                  <span className="readiness-widget-track-name">{track.name}</span>
                  <span className="readiness-widget-track-score" style={{ color }}>{track.breakdown.score}%</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
