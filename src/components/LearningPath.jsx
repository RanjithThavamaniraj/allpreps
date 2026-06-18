import { FiBookOpen, FiLayers, FiAward } from 'react-icons/fi';

const tiers = [
  {
    step: '01',
    label: 'Beginner',
    title: 'Foundation',
    desc: 'Build core knowledge of essential technologies, basic commands, and fundamental concepts.',
    topics: 'Basic Commands • Core Concepts • Getting Started Guides',
    icon: FiBookOpen,
  },
  {
    step: '02',
    label: 'Intermediate',
    title: 'Application',
    desc: 'Apply knowledge to real-world scenarios, complex queries, and system architecture.',
    topics: 'Real-world Scenarios • Architecture • Complex Queries',
    icon: FiLayers,
  },
  {
    step: '03',
    label: 'Advanced',
    title: 'Mastery',
    desc: 'Production troubleshooting, performance tuning, and expert-level interview preparation.',
    topics: 'Production Issues • Performance Tuning • Expert Interviews',
    icon: FiAward,
  },
];

export default function LearningPath() {
  return (
    <section className="lp-section" id="learning-path">
      <div className="container">
        <p className="lp-eyebrow">LEARNING PATH</p>
        <h2 className="lp-title">Structured Preparation Roadmap</h2>

        <div className="lp-roadmap">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <div className="lp-tier" data-tier={index + 1} key={tier.step}>
                <Icon className="lp-tier-icon" />
                <span className="lp-tier-step">{tier.step}</span>
                <span className="lp-tier-label">{tier.label}</span>
                <h3 className="lp-tier-title">{tier.title}</h3>
                <p className="lp-tier-desc">{tier.desc}</p>
                <p className="lp-tier-topics">{tier.topics}</p>
              </div>
            );
          })}
        </div>

        <a className="lp-cta" href="/roadmaps">
          View Full Roadmap →
        </a>
      </div>
    </section>
  );
}
