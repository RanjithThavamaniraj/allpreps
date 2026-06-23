import { FiArrowRight } from 'react-icons/fi';
import { AppIcon, Target, Zap, BookOpen, Map } from './icons';

const TECH_STACK = [
  'Oracle DBA', 'PostgreSQL', 'MySQL', 'Linux', 'AWS', 'Azure',
  'Google Cloud', 'DevOps', 'Kubernetes', 'Terraform', 'Snowflake', 'Databricks',
];

const FEATURE_PILLS = [
  {
    href: '/mock-interviews',
    icon: Target,
    label: 'Practice Real Interviews',
    pro: true,
    title: 'Timed mock interviews with structured feedback — Pro',
  },
  {
    href: '/interview-questions?filter=production-scenarios#practice',
    icon: Zap,
    label: 'Solve Production Scenarios',
  },
  {
    href: '/#learning-path',
    icon: BookOpen,
    label: 'Structured Learning Paths',
  },
  {
    href: '/roadmaps',
    icon: Map,
    label: 'Technology-Specific Roadmaps',
  },
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <p className="hero-kicker">Technical interview preparation for infrastructure engineers</p>
          <h1 className="hero-headline">
            Master Technical Interviews for{' '}
            <span className="hero-headline-accent">Modern Infrastructure Roles</span>
          </h1>
          <p className="hero-sub">
            Practice real interview questions from a searchable question bank, solve production
            scenarios, follow structured learning paths, and prepare confidently for cloud,
            database, Linux, and DevOps roles.
          </p>

          <div className="hero-actions">
            <a href="/mock-interviews" className="btn btn-primary btn-lg hero-cta-primary">
              Practice Mock Interviews
              <span
                className="hero-pro-badge hero-pro-badge-inline"
                data-tooltip="Full mock interview sessions with detailed feedback — Pro"
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
            {FEATURE_PILLS.map((pill) => (
              <a
                key={pill.label}
                href={pill.href}
                className="hero-feature-pill"
                title={pill.title}
              >
                <span className="hero-feature-pill-icon">
                  <AppIcon icon={pill.icon} size="sm" />
                </span>
                <span>{pill.label}</span>
                {pill.pro && (
                  <span
                    className="hero-pro-badge"
                    data-tooltip="Full mock interview sessions with detailed feedback — Pro"
                    aria-label="Pro feature: full mock interview sessions with detailed feedback"
                  >
                    PRO
                  </span>
                )}
              </a>
            ))}
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
