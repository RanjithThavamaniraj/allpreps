import { AppIcon, Zap, BookOpen, Briefcase, Layers, FileText } from './icons';
import {
  PRODUCTION_SCENARIOS_URL,
  getTotalScenarioCount,
  getTechnologyCountWithScenarios,
} from '../utils/productionScenarios';

const features = [
  {
    icon: Zap,
    eyebrow: 'REAL WORLD',
    title: 'Production Scenarios',
    desc: 'Practice with real-world infrastructure scenarios. Debug a crashed Oracle instance, recover a corrupted database, respond to an AWS outage. Built for engineers who need more than theory.',
    stats: `${getTotalScenarioCount()} Scenarios across ${getTechnologyCountWithScenarios()} technologies`,
    cta: { label: 'Try a Scenario →', href: PRODUCTION_SCENARIOS_URL },
    featured: true,
  },
  {
    icon: BookOpen,
    title: 'Structured Learning',
    desc: 'Organized learning paths from fundamentals to advanced concepts across all technology tracks.',
  },
  {
    icon: Briefcase,
    title: 'Real Interview Scenarios',
    desc: 'Questions sourced from actual technical interviews at enterprise companies and consulting firms.',
  },
  {
    icon: Layers,
    title: 'Technology Coverage',
    desc: '14 technology tracks covering Oracle DBA, PostgreSQL, MySQL, Linux, AWS, DevOps, Azure, GCP, Shell Scripting, Databricks, Snowflake, Kubernetes, and Terraform.',
  },
  {
    icon: FileText,
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
          {features.map(({ icon, eyebrow, title, desc, stats, cta, featured }) => (
            <div className={`why-card ${featured ? 'why-card-featured' : ''}`} key={title}>
              <div className="why-card-icon">
                <AppIcon icon={icon} size="xl" />
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
