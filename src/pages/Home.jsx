import { useState } from 'react';
import Navbar    from '../components/Navbar';
import Hero      from '../components/Hero';
import Stats     from '../components/Stats';
import Footer    from '../components/Footer';

import { FiSearch, FiBookOpen, FiCheckCircle, FiMail } from 'react-icons/fi';

/* ── HOW IT WORKS (inline) ── */
const HIW_STEPS = [
  {
    num: '01',
    icon: <FiSearch size={22} />,
    title: 'Search a Topic',
    desc:  'Find the technology or domain you are preparing for — Oracle DBA, Linux, AWS, SQL, DevOps and more.',
  },
  {
    num: '02',
    icon: <FiBookOpen size={22} />,
    title: 'Study Scenarios',
    desc:  'Read curated, real-world interview scenarios written by industry veterans and senior architects.',
  },
  {
    num: '03',
    icon: <FiCheckCircle size={22} />,
    title: 'Practice Commands',
    desc:  'Work through validated SQL scripts, shell commands, and config blueprints for every scenario.',
  },
];

function HowItWorks() {
  return (
    <section className="hiw">
      <div className="container">
        <div className="section-header fade-up">
          <span className="section-eyebrow">How It Works</span>
          <h2 className="section-title">Three steps to interview-ready</h2>
          <p className="section-sub">
            A structured preparation workflow that mirrors real enterprise hiring rounds.
          </p>
        </div>
        <div className="hiw-grid">
          {HIW_STEPS.map((s, i) => (
            <div key={i} className={`hiw-card fade-up delay-${i + 1}`}>
              <span className="hiw-num">{s.num}</span>
              <div className="hiw-icon-box">{s.icon}</div>
              <h3 className="hiw-title">{s.title}</h3>
              <p className="hiw-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA BANNER (inline) ── */
function CTABanner() {
  const [email, setEmail]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSuccess(true); }, 1000);
  };

  return (
    <section className="cta-banner">
      <div className="container">
        <div className="cta-inner fade-up">
          <span className="section-eyebrow">Stay Sharp</span>
          <h2 className="cta-title">
            Ready to crack your next DBA interview?
          </h2>
          <p className="cta-sub">
            Get a curated weekly digest of scenario-based questions, system design cards, and
            expert tips — delivered straight to your inbox.
          </p>

          {success ? (
            <div className="cta-success">
              <FiCheckCircle /> You're subscribed! Check your inbox soon.
            </div>
          ) : (
            <form className="cta-form" onSubmit={handleSubmit}>
              <input
                type="email"
                className="input-field"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Subscribing…' : <><FiMail size={15} /> Subscribe</>}
              </button>
            </form>
          )}

          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            No spam, unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── HOME ── */
export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleChipClick = (id) => {
    const routeMap = {
      'oracle rac': '/oracle-dba',
      'rman': '/oracle-dba',
      'linux': '/linux-admin',
      'aws': '/aws-cloud',
      'sql': '/sql-admin',
      'kubernetes': '/devops',
    };
    const route = routeMap[id.toLowerCase()] || '/mock-interviews';
    window.history.pushState({}, '', route);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flexGrow: 1 }}>
        <Hero
          searchVal={searchQuery}
          onSearchChange={setSearchQuery}
          activeChip=""
          onChipClick={handleChipClick}
        />

        <Stats />

        <HowItWorks />

        <CTABanner />
      </main>

      <Footer />
    </div>
  );
}
