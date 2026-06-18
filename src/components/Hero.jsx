import { FiArrowRight } from 'react-icons/fi';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <h1 className="hero-headline">
          Technical Interview Preparation{' '}
          <span className="hero-headline-accent">Platform For Engineers</span>
        </h1>
        <p className="hero-sub">
          Master Oracle DBA, Linux, SQL, AWS, DevOps and cloud technologies with
          structured learning paths, interview questions and practical
          preparation resources.
        </p>
        <div className="hero-actions">
          <a href="/mock-interviews" className="btn btn-primary btn-lg">
            Start Preparing <FiArrowRight size={16} />
          </a>
          <a href="/technologies" className="btn btn-secondary btn-lg">
            Explore Technologies
          </a>
        </div>
        <div className="hero-metrics">
          <div className="hero-metric">
            <span className="hero-metric-value">5000+</span>
            <span className="hero-metric-label">Questions</span>
          </div>
          <div className="hero-metric-divider" />
          <div className="hero-metric">
            <span className="hero-metric-value">50+</span>
            <span className="hero-metric-label">Interview Topics</span>
          </div>
          <div className="hero-metric-divider" />
          <div className="hero-metric">
            <span className="hero-metric-value">8</span>
            <span className="hero-metric-label">Technologies</span>
          </div>
        </div>

        <div className="hero-feature-pills">
          <a href="/mock-interviews" className="hero-feature-pill">
            <span className="hero-feature-pill-icon">🎯</span>
            <span>Mock Interview Mode</span>
          </a>
          <a href="/interview-questions#practice" className="hero-feature-pill">
            <span className="hero-feature-pill-icon">⚡</span>
            <span>Production Scenarios</span>
          </a>
          <a href="/roadmaps" className="hero-feature-pill">
            <span className="hero-feature-pill-icon">📚</span>
            <span>Interactive Roadmaps</span>
          </a>
          <a href="/#learning-path" className="hero-feature-pill">
            <span className="hero-feature-pill-icon">🗺</span>
            <span>Learning Pathways</span>
          </a>
        </div>
      </div>
    </section>
  );
}
