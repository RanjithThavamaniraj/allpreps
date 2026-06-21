import { FiArrowRight } from 'react-icons/fi';

const TECH_STACK = [
  'Oracle DBA', 'PostgreSQL', 'MySQL', 'Linux', 'AWS', 'Azure',
  'Google Cloud', 'DevOps', 'Kubernetes', 'Terraform', 'Snowflake', 'Databricks',
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <p className="hero-kicker">AI-assisted interview preparation</p>
          <h1 className="hero-headline">
            Ace Your IT Infrastructure Interviews with{' '}
            <span className="hero-headline-accent">AI-Powered Preparation</span>
          </h1>
          <p className="hero-sub">
            Practice with AI-guided mock interviews, production troubleshooting scenarios, and
            structured learning paths — built for engineers preparing for real infrastructure roles.
          </p>

          <div className="hero-actions">
            <a href="/mock-interviews" className="btn btn-primary btn-lg hero-cta-primary">
              Practice Mock Interviews
              <span
                className="hero-pro-badge hero-pro-badge-inline"
                data-tooltip="AI-powered mock interviews available in Pro"
                aria-label="Pro feature"
              >
                PRO
              </span>
              <FiArrowRight size={16} />
            </a>
            <a href="/technologies" className="btn btn-secondary btn-lg">
              Explore Technologies
            </a>
          </div>

          <div className="hero-metrics">
            <div className="hero-metric">
              <span className="hero-metric-value">6200+</span>
              <span className="hero-metric-label">Questions</span>
            </div>
            <div className="hero-metric-divider" />
            <div className="hero-metric">
              <span className="hero-metric-value">80+</span>
              <span className="hero-metric-label">Interview Topics</span>
            </div>
            <div className="hero-metric-divider" />
            <div className="hero-metric">
              <span className="hero-metric-value">14</span>
              <span className="hero-metric-label">Technologies</span>
            </div>
          </div>

          <div className="hero-feature-pills">
            <a
              href="/mock-interviews"
              className="hero-feature-pill"
              title="AI-powered mock interviews available in Pro"
            >
              <span className="hero-feature-pill-icon">🎯</span>
              <span>Practice Real Interviews</span>
              <span
                className="hero-pro-badge"
                data-tooltip="AI-powered mock interviews available in Pro"
                aria-label="Pro feature: AI-powered mock interviews available in Pro"
              >
                PRO
              </span>
            </a>
            <a href="/interview-questions?filter=production-scenarios#practice" className="hero-feature-pill">
              <span className="hero-feature-pill-icon">⚡</span>
              <span>Solve Real Production Scenarios</span>
            </a>
            <a href="/roadmaps" className="hero-feature-pill">
              <span className="hero-feature-pill-icon">📚</span>
              <span>Interactive Learning Roadmaps</span>
            </a>
            <a href="/#learning-path" className="hero-feature-pill">
              <span className="hero-feature-pill-icon">🗺</span>
              <span>Structured Learning Paths</span>
            </a>
          </div>

          <div className="hero-tech-stack" aria-label="Supported technologies">
            {TECH_STACK.map(tech => (
              <span key={tech} className="hero-tech-chip">{tech}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
