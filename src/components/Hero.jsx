import { FiZap, FiArrowRight, FiCode, FiServer, FiCloud, FiDatabase, FiTerminal, FiGitBranch } from 'react-icons/fi';
import { FaAws } from 'react-icons/fa';

const FEATURES = [
  { icon: <FiDatabase size={20} />, label: 'Oracle DBA', path: '/oracle-dba' },
  { icon: <FiTerminal size={20} />, label: 'Linux Admin', path: '/linux-admin' },
  { icon: <FiCode size={20} />, label: 'SQL', path: '/sql-admin' },
  { icon: <FaAws size={20} />, label: 'AWS Cloud', path: '/aws-cloud' },
  { icon: <FiServer size={20} />, label: 'Shell Scripting', path: '/shell-scripting' },
  { icon: <FiGitBranch size={20} />, label: 'DevOps', path: '/devops' },
  { icon: <FiCloud size={20} />, label: 'Azure', path: '/azure-cloud' },
  { icon: <FiCloud size={20} />, label: 'Google Cloud', path: '/google-cloud' },
];

export default function Hero() {
  return (
    <section className="hero-v2">
      {/* Animated background orbs */}
      <div className="hero-v2-orb hero-v2-orb-1" />
      <div className="hero-v2-orb hero-v2-orb-2" />
      <div className="hero-v2-orb hero-v2-orb-3" />

      <div className="container hero-v2-content">
        {/* Badge */}
        <div className="hero-v2-badge fade-up">
          <FiZap size={12} />
          <span>Enterprise-Grade Interview Preparation</span>
        </div>

        {/* Headline */}
        <h1 className="hero-v2-title fade-up delay-1">
          Prepare Smarter.<br />
          <span className="hero-v2-gradient-text">Crack Interviews.</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-v2-sub fade-up delay-2">
          Master Oracle DBA, Linux, SQL, Cloud, DevOps and production scenarios
          with 300+ curated questions by industry experts.
        </p>

        {/* CTA buttons */}
        <div className="hero-v2-actions fade-up delay-3">
          <a href="/mock-interviews" className="btn btn-primary btn-lg">
            Start Mock Interview <FiArrowRight size={16} />
          </a>
          <a href="/interview-questions" className="btn btn-secondary btn-lg">
            Browse Questions
          </a>
        </div>

        {/* Technology orbit */}
        <div className="hero-v2-techs fade-up delay-4">
          <span className="hero-v2-techs-label">Explore Technologies</span>
          <div className="hero-v2-tech-grid">
            {FEATURES.map((f) => (
              <a key={f.label} href={f.path} className="hero-v2-tech-pill">
                {f.icon}
                <span>{f.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
