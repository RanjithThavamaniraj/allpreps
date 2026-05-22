import { FiBookOpen, FiBriefcase, FiLayers, FiSearch } from 'react-icons/fi';

const features = [
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
          {features.map(({ icon: Icon, title, desc }) => (
            <div className="why-card" key={title}>
              <div className="why-card-icon">
                <Icon />
              </div>
              <h3 className="why-card-title">{title}</h3>
              <p className="why-card-desc">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
