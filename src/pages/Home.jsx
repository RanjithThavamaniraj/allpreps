import Navbar    from '../components/Navbar';
import Hero      from '../components/Hero';
import Stats     from '../components/Stats';
import Footer    from '../components/Footer';

import { FiSearch, FiBookOpen, FiArrowRight, FiTarget, FiTrendingUp } from 'react-icons/fi';

/* ── HOW IT WORKS ── */
const HIW_STEPS = [
  {
    num: '01',
    icon: <FiSearch size={24} />,
    title: 'Choose Your Track',
    desc:  'Pick from 8 technology tracks — Oracle DBA, Linux, AWS, Azure, GCP, SQL, Shell Scripting, and DevOps.',
  },
  {
    num: '02',
    icon: <FiBookOpen size={24} />,
    title: 'Study Real Scenarios',
    desc:  'Dive into curated, production-grade interview scenarios designed by senior architects and industry veterans.',
  },
  {
    num: '03',
    icon: <FiTarget size={24} />,
    title: 'Mock Interview Mode',
    desc:  'Test yourself with 100 randomized questions in our interactive simulator. New questions every session.',
  },
  {
    num: '04',
    icon: <FiTrendingUp size={24} />,
    title: 'Track & Master',
    desc:  'Follow structured roadmaps from Easy → Medium → Hard. Monitor your progress and level up systematically.',
  },
];

function HowItWorks() {
  return (
    <section className="hiw-v2">
      <div className="container">
        <div className="section-header fade-up">
          <span className="section-eyebrow-v2">How It Works</span>
          <h2 className="section-title-v2">Four steps to interview-ready</h2>
          <p className="section-sub-v2">
            A structured preparation workflow that mirrors real enterprise hiring rounds.
          </p>
        </div>
        <div className="hiw-v2-grid">
          {HIW_STEPS.map((s, i) => (
            <div key={i} className={`hiw-v2-card fade-up delay-${i + 1}`}>
              <div className="hiw-v2-num">{s.num}</div>
              <div className="hiw-v2-icon">{s.icon}</div>
              <h3 className="hiw-v2-title">{s.title}</h3>
              <p className="hiw-v2-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FEATURE HIGHLIGHTS ── */
function FeatureHighlights() {
  const features = [
    {
      icon: <FiTrendingUp size={28} />,
      title: 'Track your progress',
      desc: 'Structured paths from Easy → Medium → Hard for every technology. Track your progress and build mastery systematically.',
      link: '/roadmaps',
      accent: '#34d399',
    },
  ];

  return (
    <section className="features-v2">
      <div className="container">
        <div className="section-header fade-up">
          <span className="section-eyebrow-v2">Platform Features</span>
          <h2 className="section-title-v2">Everything you need to prepare</h2>
          <p className="section-sub-v2">
            A comprehensive toolkit designed for senior engineers and architects.
          </p>
        </div>
        <div className="features-v2-grid">
          {features.map((f, i) => (
            <a key={i} href={f.link} className={`features-v2-card fade-up delay-${i + 1}`} style={{ '--card-accent': f.accent }}>
              <div className="features-v2-icon">{f.icon}</div>
              <h3 className="features-v2-title">{f.title}</h3>
              <p className="features-v2-desc">{f.desc}</p>
              <span className="features-v2-link">
                Explore <FiArrowRight size={14} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── HOME ── */
export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flexGrow: 1 }}>
        <Hero />

        <Stats />

        <FeatureHighlights />

        <HowItWorks />
      </main>

      <Footer />
    </div>
  );
}
