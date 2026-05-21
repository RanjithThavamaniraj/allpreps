const STATS = [
  { value: '5,000+',  label: 'Practice Questions' },
  { value: '1,000+',  label: 'Scenario Q&A'       },
  { value: '30+',     label: 'Technologies'        },
  { value: '50K+',    label: 'Learners'            },
];

export default function Stats() {
  return (
    <section className="stats-strip">
      <div className="container">
        <div className="stats-strip-inner">
          {STATS.map(s => (
            <div key={s.label} className="stats-item">
              <span className="stats-num">{s.value}</span>
              <span className="stats-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
