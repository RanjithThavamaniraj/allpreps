import { FiActivity, FiArrowRight } from 'react-icons/fi';
import {
  getScenarioCountForTrack,
  getProductionScenariosUrl,
  PRODUCTION_SCENARIO_TRACKS,
  hasProductionScenarios,
} from '../utils/productionScenarios';

export default function ProductionScenariosCallout({ trackId }) {
  if (!hasProductionScenarios(trackId)) return null;

  const track = PRODUCTION_SCENARIO_TRACKS[trackId];
  const count = getScenarioCountForTrack(trackId);
  const href = getProductionScenariosUrl(track.chip);

  return (
    <section className="ps-callout-section">
      <div className="container">
        <div className="ps-callout">
          <div className="ps-callout-content">
            <h3 className="ps-callout-title">
              <FiActivity /> Production Scenarios — {track.label}
            </h3>
            <p className="ps-callout-desc">
              Test your skills with real {track.label} production incidents and infrastructure challenges.
            </p>
          </div>
          <div className="ps-callout-actions">
            <span className="ps-callout-count">{count} Scenarios available</span>
            <a href={href} className="btn btn-primary">
              Try Production Scenarios <FiArrowRight />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
