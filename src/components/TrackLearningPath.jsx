import { FiChevronDown } from 'react-icons/fi';

export default function TrackLearningPath({ steps, trackName }) {
  if (!steps?.length) return null;

  return (
    <section className="track-learning-path">
      <div className="container">
        <div className="track-lp-header">
          <span className="section-eyebrow">Learning Path</span>
          <h2>{trackName} Learning Path</h2>
        </div>
        <div className="track-lp-steps">
          {steps.map((step, index) => (
            <div key={step} className="track-lp-step">
              <div className="track-lp-step-marker">{index + 1}</div>
              <div className="track-lp-step-body">
                <h3>{step}</h3>
                {index < steps.length - 1 && (
                  <FiChevronDown className="track-lp-arrow" aria-hidden="true" />
                )}
              </div>
            </div>
          ))}
        </div>
        <a href="/roadmaps" className="track-lp-cta">
          Track progress in Roadmaps →
        </a>
      </div>
    </section>
  );
}
