import { FiBookOpen, FiBriefcase, FiLayers, FiSearch, FiActivity } from 'react-icons/fi';
import {
  PRODUCTION_SCENARIOS_URL,
  getTotalScenarioCount,
  getTechnologyCountWithScenarios,
} from '../utils/productionScenarios';

const features = [
  {
    icon: FiActivity,
    eyebrow: 'REAL WORLD',
    title: 'Production Scenarios',
    desc: 'Practice with real-world infrastructure scenarios. Debug a crashed Oracle instance, recover a corrupted database, respond to an AWS outage. Built for engineers who need more than theory.',
    stats: `${getTotalScenarioCount()} Scenarios across ${getTechnologyCountWithScenarios()} technologies`,
    cta: { label: 'Try a Scenario →', href: PRODUCTION_SCENARIOS_URL },
    featured: true,
  },
  {
    icon: FiBookOpen,
    title: 'Structured Learning',
    desc: 'Organized learning paths from fundamentals to advanced concepts across all technology tracks.',
  },
  {
    icon: FiBriefcase,
    title: 'Real Interview Scenarios',
    desc: 'Questions sourced from actual technical interviews at enterprise companies and consulting firms.',
  },
  {
    icon: FiLayers,
    title: 'Technology Coverage',
    desc: '8 technology tracks covering Oracle DBA, Linux, SQL, AWS, DevOps, Azure, GCP, and Shell Scripting.',
  },
  {
    icon: FiSearch,
    title: 'Searchable Question Bank',
    desc: 'Filter 5000+ questions by technology, difficulty level, and topic for targeted preparation.',
  },
];

export default function WhyAllPreps() {
  return (
    <section className="why-section">
      <div className="container">
        <p className="why-eyebrow">WHY ALLPREPS</p>
        <h2 className="why-title">Built For Technical Professionals</h2>

        <div className="why-grid">
          {features.map(({ icon: Icon, eyebrow, title, desc, stats, cta, featured }) => (
            <div className={`why-card ${featured ? 'why-card-featured' : ''}`} key={title}>
              <div className="why-card-icon">
                <Icon />
              </div>
              {eyebrow && <p className="why-card-eyebrow">{eyebrow}</p>}
              <h3 className="why-card-title">{title}</h3>
              <p className="why-card-desc">{desc}</p>
              {stats && <p className="why-card-stats">{stats}</p>}
              {cta && (
                <a href={cta.href} className="why-card-cta">{cta.label}</a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
