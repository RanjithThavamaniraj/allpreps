import { useEffect, useRef } from 'react';

const STATS = [
  { value: '5,000+',  label: 'Practice Questions', suffix: '' },
  { value: '300+',    label: 'Scenario Q&A',       suffix: '' },
  { value: '8',       label: 'Technology Tracks',   suffix: '' },
  { value: '50K+',    label: 'Learners Worldwide',  suffix: '' },
];

export default function Stats() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('stats-v2-visible');
          }
        });
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="stats-v2" ref={ref}>
      <div className="container">
        <div className="stats-v2-grid">
          {STATS.map((s, i) => (
            <div key={s.label} className="stats-v2-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="stats-v2-value">{s.value}</div>
              <div className="stats-v2-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
