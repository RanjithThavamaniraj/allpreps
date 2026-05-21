import { FiSearch, FiZap } from 'react-icons/fi';
import { FaDatabase, FaLinux, FaAws } from 'react-icons/fa';

const CHIPS = ['Oracle RAC', 'RMAN', 'Linux', 'AWS', 'SQL', 'Kubernetes'];

const MOCK_TRACKS = [
  { name: 'Oracle DBA', icon: <FaDatabase />, count: 1450, pct: 72 },
  { name: 'Linux Admin', icon: <FaLinux />,   count: 980,  pct: 55 },
  { name: 'AWS Cloud',  icon: <FaAws />,      count: 720,  pct: 31 },
];

export default function Hero({ searchVal, onSearchChange, activeChip, onChipClick }) {
  return (
    <section className="hero">
      <div className="container hero-grid">

        {/* ── LEFT ── */}
        <div className="hero-left">
          <div className="hero-label fade-up">
            <FiZap size={11} /> Enterprise Interview Prep Platform
          </div>

          <h1 className="hero-h1 fade-up delay-1">
            Prepare Smarter.<br />
            <span className="blue">Crack Interviews.</span>
          </h1>

          <p className="hero-sub fade-up delay-2">
            Master Oracle DBA, Linux, SQL, Cloud and production
            scenarios. Curated by industry experts for senior
            database administrators and systems architects.
          </p>

          <form
            className="hero-search fade-up delay-2"
            onSubmit={(e) => {
              e.preventDefault();
              const q = (searchVal || '').toLowerCase();
              let route = '/mock-interviews';
              if (q.includes('oracle') || q.includes('dba') || q.includes('rac') || q.includes('rman')) {
                route = '/oracle-dba';
              } else if (q.includes('linux') || q.includes('unix')) {
                route = '/linux-admin';
              } else if (q.includes('sql') || q.includes('database')) {
                route = '/sql-admin';
              } else if (q.includes('aws') || q.includes('cloud')) {
                route = '/aws-cloud';
              } else if (q.includes('shell') || q.includes('script') || q.includes('bash')) {
                route = '/shell-scripting';
              } else if (q.includes('devops') || q.includes('docker') || q.includes('kubernetes')) {
                route = '/devops';
              }
              window.history.pushState({}, '', route);
              window.dispatchEvent(new Event('popstate'));
            }}
          >
            <FiSearch className="hero-search-icon" />
            <input
              type="text"
              className="input-field"
              placeholder="Search topics, commands, concepts..."
              value={searchVal || ''}
              onChange={e => onSearchChange(e.target.value)}
            />
          </form>

          <div className="hero-actions fade-up delay-3">
            <a href="/mock-interviews" className="btn btn-primary btn-lg">
              Start Preparing <FiSearch size={14} />
            </a>
            <a href="/technologies" className="btn btn-secondary btn-lg">
              Browse Topics
            </a>
          </div>

          <div className="hero-chips fade-up delay-4">
            <span className="chip-label">Trending:</span>
            {CHIPS.map(chip => {
              const id = chip.toLowerCase();
              return (
                <button
                  key={chip}
                  className={`chip ${activeChip === id ? 'chip-active' : ''}`}
                  onClick={() => onChipClick(activeChip === id ? '' : id)}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT — DASHBOARD MOCKUP ── */}
        <div className="hero-visual fade-up delay-2">
          <div className="hero-mockup">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="mockup-dot dot-r" />
                <span className="mockup-dot dot-y" />
                <span className="mockup-dot dot-g" />
              </div>
              <span className="mockup-title">AllPreps — My Dashboard</span>
              <span />
            </div>

            <div className="mockup-body">
              {MOCK_TRACKS.map((t, i) => (
                <div key={i} className="mockup-track">
                  <div className="mockup-track-left">
                    <div className="mockup-track-icon">{t.icon}</div>
                    <div>
                      <div className="mockup-track-name">{t.name}</div>
                      <div className="mockup-track-count">{t.count.toLocaleString()} questions</div>
                    </div>
                  </div>
                  <div className="mockup-prog-wrap">
                    <div className="mockup-prog-bar">
                      <div className="mockup-prog-fill" style={{ width: `${t.pct}%` }} />
                    </div>
                    <span className="mockup-prog-pct">{t.pct}%</span>
                  </div>
                </div>
              ))}

              <div className="mockup-footer">
                <span className="mockup-footer-label">Questions solved this week</span>
                <span className="mockup-footer-val">+47 ↑</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
