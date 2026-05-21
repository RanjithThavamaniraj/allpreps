import { useState, useMemo, useEffect } from 'react';
import { FiArrowLeft, FiGitBranch, FiSearch, FiChevronDown, FiChevronUp, FiCpu, FiTrendingUp, FiCheck } from 'react-icons/fi';
import { QUESTIONS_DATA } from '../data/questionsData';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Helper to generate context-relevant tags based on the question title
function getTags(title) {
  const t = title.toLowerCase();
  const tags = ['devops'];
  if (t.includes('docker') || t.includes('container') || t.includes('image')) {
    tags.push('docker');
  }
  if (t.includes('kubernetes') || t.includes('k8s') || t.includes('pod') || t.includes('statefulset') || t.includes('helm') || t.includes('ebs')) {
    tags.push('kubernetes');
  }
  if (t.includes('pipeline') || t.includes('ci/cd') || t.includes('gitops') || t.includes('argocd') || t.includes('action') || t.includes('jenkins')) {
    tags.push('ci-cd');
  }
  if (t.includes('terraform') || t.includes('iac') || t.includes('ansible')) {
    tags.push('infrastructure-as-code');
  }
  if (t.includes('monitor') || t.includes('alert') || t.includes('prometheus') || t.includes('grafana')) {
    tags.push('monitoring');
  }
  if (tags.length === 1) {
    tags.push('engineering-operations');
  }
  return tags;
}

export default function DevOps() {
  const [searchQuery, setSearchQuery] = useState('');
  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('allpreps_completed_questions');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Error reading localStorage:", e);
      return [];
    }
  });

  useEffect(() => {
    const syncCompleted = () => {
      try {
        const stored = localStorage.getItem('allpreps_completed_questions');
        if (stored) {
          setCompletedIds(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Error syncing completed questions:", e);
      }
    };
    syncCompleted();
    window.addEventListener('focus', syncCompleted);
    window.addEventListener('storage', syncCompleted);
    const interval = setInterval(syncCompleted, 1000);
    return () => {
      window.removeEventListener('focus', syncCompleted);
      window.removeEventListener('storage', syncCompleted);
      clearInterval(interval);
    };
  }, []);

  const toggleCompleted = (rawId, e) => {
    e.stopPropagation();
    let updated;
    if (completedIds.includes(rawId)) {
      updated = completedIds.filter(x => x !== rawId);
    } else {
      updated = [...completedIds, rawId];
    }
    setCompletedIds(updated);
    try {
      localStorage.setItem('allpreps_completed_questions', JSON.stringify(updated));
    } catch (err) {
      console.error("Error saving completed questions:", err);
    }
  };
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState({}); // Active tab ('details' vs 'solution') for each question

  const devopsQuestions = useMemo(() => {
    return QUESTIONS_DATA.filter(q => q.category === 'devops').map(q => ({
      id: `dev-${q.id}`,
      rawId: q.id,
      title: q.title,
      difficulty: q.difficulty,
      description: q.title + ' - Scenario-based question covering Docker, Kubernetes, CI/CD, GitOps, Infrastructure as Code, and monitoring.',
      details: q.answer,
      solution: q.command,
      tags: getTags(q.title)
    }));
  }, []);

  const filteredQuestions = useMemo(() => {
    return devopsQuestions.filter((q) => {
      const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      const matchesSearch =
        !searchQuery ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDifficulty && matchesSearch;
    });
  }, [devopsQuestions, searchQuery, difficultyFilter]);

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
              <div className="tech-card-icon-wrap" style={{ width: '48px', height: '48px', fontSize: '24px', backgroundColor: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent)' }}>
                <FiGitBranch />
              </div>
              <h1 style={{ fontSize: '36px', fontWeight: '800' }}>DevOps Track</h1>
            </div>
            <p className="hero-sub" style={{ margin: '0', maxWidth: '800px' }}>
              Master DevOps and Platform Engineering. Prepare for senior DevOps, Platform Engineer, and SRE interviews with scenario-based questions covering Docker multi-stage builds, Kubernetes persistent storage, Helm chart templating, Terraform state management, GitHub Actions pipelines, and Prometheus alerts.
            </p>
          </div>
        </section>

        {/* Stats Cards */}
        <section style={{ padding: '40px 0', backgroundColor: 'var(--bg-surface)' }}>
          <div className="container">
            <div className="grid-3">
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiGitBranch /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>{devopsQuestions.length} Scenario Units</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Platform Infrastructure QA</div>
                </div>
              </div>
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiCpu /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>Orchestration</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Kubernetes & Docker container environments</div>
                </div>
              </div>
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiTrendingUp /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>Automated Pipelines</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>GitOps & Git pipelines</div>
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
                  placeholder="Filter DevOps questions..."
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
                  <h3>No DevOps questions found matching the criteria</h3>
                  <p>Try resetting the search bar or changing the difficulty filter.</p>
                </div>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const isExpanded = expandedId === q.id;
                  const currentTab = activeTab[q.id] || 'details';
                  const completed = completedIds.includes(q.rawId);

                  return (
                    <div
                      key={q.id}
                      className={`q-card ${isExpanded ? 'tech-grid-card-active' : ''}`}
                      style={{
                        borderColor: completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                        boxShadow: completed ? '0 0 12px rgba(16, 185, 129, 0.03)' : 'none'
                      }}
                    >
                      <div className="q-summary-row" onClick={() => toggleExpand(q.id)}>
                        <div className="q-title-side" style={{ display: 'flex', alignItems: 'center' }}>
                          <div
                            onClick={(e) => toggleCompleted(q.rawId, e)}
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              border: completed ? '2px solid #10b981' : '2px solid var(--border)',
                              backgroundColor: completed ? '#10b981' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              marginRight: '12px',
                              flexShrink: 0
                            }}
                          >
                            {completed && <FiCheck size={11} style={{ color: '#0f172a', fontWeight: 'bold' }} />}
                          </div>
                          <span className="q-number" style={{ marginRight: '8px' }}>#{String(idx + 1).padStart(2, '0')}</span>
                          <h3 className="q-title" style={{ 
                            textDecoration: completed ? 'line-through' : 'none', 
                            color: completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                            margin: 0
                          }}>{q.title}</h3>
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
