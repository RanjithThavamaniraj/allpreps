import { FiPlay, FiBarChart2 } from 'react-icons/fi';

const LEVELS = [
  { id: 'easy', label: 'Beginner', count: 10, desc: 'Fundamentals & core concepts' },
  { id: 'medium', label: 'Intermediate', count: 10, desc: 'Production implementation' },
  { id: 'hard', label: 'Advanced', count: 10, desc: 'Architecture & incident scenarios' },
];

export default function PracticeTestSection({ trackName, trackId, onStartPractice }) {
  return (
    <section className="practice-test-section">
      <div className="container">
        <div className="practice-test-header">
          <span className="section-eyebrow">Practice Tests</span>
          <h2>{trackName} Practice Tests</h2>
          <p>
            Timed-style question sets filtered by difficulty. Mark questions complete as you study
            to build your readiness score.
          </p>
        </div>
        <div className="practice-test-grid">
          {LEVELS.map(level => (
            <button
              key={level.id}
              type="button"
              className="practice-test-card"
              onClick={() => onStartPractice?.(level.id)}
            >
              <FiBarChart2 className="practice-test-icon" />
              <h3>{level.label}</h3>
              <p>{level.desc}</p>
              <span className="practice-test-meta">{level.count} questions</span>
              <span className="practice-test-start">
                <FiPlay /> Start Practice
              </span>
            </button>
          ))}
        </div>
        <p className="practice-test-footnote">
          For AI-evaluated interviews, try{' '}
          <a href={`/mock-interviews?tech=${encodeURIComponent(trackId)}`}>
            {trackName} Mock Interviews →
          </a>
        </p>
      </div>
    </section>
  );
}
