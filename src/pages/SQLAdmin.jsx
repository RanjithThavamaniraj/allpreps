import { useState, useMemo } from 'react';
import { FiArrowLeft, FiDatabase, FiSearch, FiChevronDown, FiChevronUp, FiCpu, FiTrendingUp } from 'react-icons/fi';
import { QUESTIONS_DATA } from '../data/questionsData';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Helper to generate context-relevant tags based on the question title
function getTags(title) {
  const t = title.toLowerCase();
  const tags = ['sql'];
  if (t.includes('index') || t.includes('clustered') || t.includes('b-tree')) {
    tags.push('indexing');
  }
  if (t.includes('tune') || t.includes('slow') || t.includes('explain') || t.includes('optimize') || t.includes('plan')) {
    tags.push('query-tuning');
  }
  if (t.includes('join') || t.includes('union') || t.includes('merge')) {
    tags.push('joins');
  }
  if (t.includes('window') || t.includes('analytic') || t.includes('rank') || t.includes('lead') || t.includes('lag')) {
    tags.push('window-functions');
  }
  if (t.includes('cte') || t.includes('recursive') || t.includes('with')) {
    tags.push('cte');
  }
  if (t.includes('duplicate') || t.includes('group by') || t.includes('having')) {
    tags.push('aggregations');
  }
  if (tags.length === 1) {
    tags.push('relational-db');
  }
  return tags;
}

export default function SQLAdmin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState({}); // Active tab ('details' vs 'solution') for each question

  const sqlQuestions = useMemo(() => {
    return QUESTIONS_DATA.filter(q => q.category === 'sql').map(q => ({
      id: `sql-${q.id}`,
      title: q.title,
      difficulty: q.difficulty,
      description: q.title + ' - Scenario-based question covering SQL performance tuning, indexing, aggregation, and window functions.',
      details: q.answer,
      solution: q.command,
      tags: getTags(q.title)
    }));
  }, []);

  const filteredQuestions = useMemo(() => {
    return sqlQuestions.filter((q) => {
      const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      const matchesSearch =
        !searchQuery ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDifficulty && matchesSearch;
    });
  }, [sqlQuestions, searchQuery, difficultyFilter]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    if (!activeTab[id]) {
      setActiveTab((prev) => ({ ...prev, [id]: 'details' }));
    }
  };

  const setTab = (qId, tabName) => {
    setActiveTab((prev) => ({ ...prev, [qId]: tabName }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flexGrow: 1, paddingBottom: '80px' }}>
        {/* Header Banner */}
        <section className="hero-bg" style={{ padding: '60px 0 40px', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ textAlign: 'left' }}>
            <a href="/" className="btn btn-secondary btn-sm" style={{ marginBottom: '24px' }}>
              <FiArrowLeft /> Back to Home
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div className="tech-card-icon-wrap" style={{ width: '48px', height: '48px', fontSize: '24px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>
                <FiDatabase />
              </div>
              <h1 style={{ fontSize: '36px', fontWeight: '800' }}>SQL Track</h1>
            </div>
            <p className="hero-sub" style={{ margin: '0', maxWidth: '800px' }}>
              Deep dive into Structured Query Language. Prepare for data-heavy developer, data engineer, and database analyst interviews with scenario-based questions covering execution plans, indexing strategies, analytical functions, CTEs, and query optimization.
            </p>
          </div>
        </section>

        {/* Stats Cards */}
        <section style={{ padding: '40px 0', backgroundColor: 'var(--bg-surface)' }}>
          <div className="container">
            <div className="grid-3">
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiDatabase /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>{sqlQuestions.length} Scenario Units</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Relational Queries</div>
                </div>
              </div>
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiCpu /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>Query Execution</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Explain Plans & Joins</div>
                </div>
              </div>
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiTrendingUp /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>Optimization</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Window functions & CTEs</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Controls */}
        <section style={{ padding: '40px 0 20px' }}>
          <div className="container">
            <div className="questions-header-block" style={{ marginBottom: '24px' }}>
              <div className="hero-search-wrap" style={{ flex: '1', maxWidth: '480px' }}>
                <FiSearch className="search-icon-pos" />
                <input
                  type="text"
                  placeholder="Filter SQL questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field search-input-field"
                />
              </div>

              <div className="questions-filter-tabs">
                {['all', 'easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficultyFilter(level)}
                    className={`btn btn-sm ${
                      difficultyFilter === level ? 'btn-primary' : 'btn-secondary'
                    }`}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions list */}
            <div className="question-list-stack">
              {filteredQuestions.length === 0 ? (
                <div className="empty-questions">
                  <h3>No SQL questions found matching the criteria</h3>
                  <p>Try resetting the search bar or changing the difficulty filter.</p>
                </div>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const isExpanded = expandedId === q.id;
                  const currentTab = activeTab[q.id] || 'details';

                  return (
                    <div
                      key={q.id}
                      className={`q-card ${isExpanded ? 'tech-grid-card-active' : ''}`}
                    >
                      <div className="q-summary-row" onClick={() => toggleExpand(q.id)}>
                        <div className="q-title-side">
                          <span className="q-number">#{String(idx + 1).padStart(2, '0')}</span>
                          <h3 className="q-title">{q.title}</h3>
                        </div>

                        <div className="q-meta-side">
                          <span className={`badge badge-${q.difficulty}`}>{q.difficulty}</span>
                          {isExpanded ? <FiChevronUp className="chevron" /> : <FiChevronDown className="chevron" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="q-expanded-body">
                          <p className="q-desc-text">{q.description}</p>

                          <div className="q-details-tabs">
                            <button
                              onClick={() => setTab(q.id, 'details')}
                              className={`q-details-tab-btn ${
                                currentTab === 'details' ? 'q-details-tab-active' : ''
                              }`}
                            >
                              Scenario Details
                            </button>
                            <button
                              onClick={() => setTab(q.id, 'solution')}
                              className={`q-details-tab-btn ${
                                currentTab === 'solution' ? 'q-details-tab-active' : ''
                              }`}
                            >
                              Reference Command / Plan
                            </button>
                          </div>

                          {currentTab === 'details' && (
                            <div className="q-tab-panel">
                              <p className="q-desc-text" style={{ whiteSpace: 'pre-wrap' }}>
                                {q.details}
                              </p>
                            </div>
                          )}

                          {currentTab === 'solution' && (
                            <div className="q-tab-panel">
                              <pre className="code-pre-box">
                                <code>{q.solution}</code>
                              </pre>
                            </div>
                          )}

                          {/* Tags */}
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                            {q.tags.map(tag => (
                              <span key={tag} className="q-tech-tag" style={{ color: 'var(--text-secondary)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
