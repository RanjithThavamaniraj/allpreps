import { FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { getTrackById } from '../../lib/readinessTracks';
import { getUserData, hasActivityForTechnology } from '../../lib/readinessStorage';
import { calculateReadinessBreakdown, getScoreColor, getScoreBand } from '../../lib/calculateReadiness';

export default function ReadinessTechStrip({ trackId }) {
  const data = getUserData();

  if (!hasActivityForTechnology(data, trackId)) return null;

  const track = getTrackById(trackId);
  const breakdown = calculateReadinessBreakdown(trackId, data);
  const color = getScoreColor(breakdown.score);
  const band = getScoreBand(breakdown.score);
  const readinessUrl = `/readiness?track=${encodeURIComponent(trackId)}`;

  return (
    <section className="readiness-tech-strip">
      <div className="container">
        <div className="readiness-tech-strip-inner">
          <div className="readiness-tech-strip-left">
            <FiTrendingUp style={{ color }} />
            <div>
              <h3>Interview Readiness — {track?.name ?? trackId}</h3>
              <p>
                <span style={{ color, fontWeight: 700 }}>{breakdown.score}%</span>
                {' · '}
                {band}
              </p>
            </div>
          </div>
          <a href={readinessUrl} className="btn btn-primary btn-sm">
            View Readiness <FiArrowRight />
          </a>
        </div>
      </div>
    </section>
  );
}
