import { useState, useMemo, useEffect } from 'react';
import { FaAws } from 'react-icons/fa';
import { FiArrowLeft, FiSearch, FiChevronDown, FiChevronUp, FiCpu, FiCloud, FiTrendingUp, FiCheck } from 'react-icons/fi';
import { QUESTIONS_DATA } from '../data/questionsData';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Helper to generate context-relevant tags based on the question title
function getTags(title) {
  const t = title.toLowerCase();
  const tags = ['aws'];
  if (t.includes('rds') || t.includes('aurora') || t.includes('database')) {
    tags.push('rds-aurora');
  }
  if (t.includes('vpc') || t.includes('peering') || t.includes('transit gateway') || t.includes('subnet') || t.includes('network')) {
    tags.push('vpc-networking');
  }
  if (t.includes('iam') || t.includes('policy') || t.includes('role') || t.includes('access')) {
    tags.push('iam-security');
  }
  if (t.includes('s3') || t.includes('bucket') || t.includes('glacier') || t.includes('storage')) {
    tags.push('s3-storage');
  }
  if (t.includes('migrate') || t.includes('datapump') || t.includes('dms') || t.includes('snowball')) {
    tags.push('migration');
  }
  if (t.includes('ec2') || t.includes('scaling') || t.includes('load balancer') || t.includes('alb')) {
    tags.push('compute-scaling');
  }
  if (tags.length === 1) {
    tags.push('cloud-ops');
  }
  return tags;
}

export default function AWSCloud() {
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

  const awsQuestions = useMemo(() => {
    return QUESTIONS_DATA.filter(q => q.category === 'aws').map(q => ({
      id: `aws-${q.id}`,
      rawId: q.id,
      title: q.title,
      difficulty: q.difficulty,
      description: q.title + ' - Scenario-based question covering AWS architecture, RDS databases, IAM security, VPC networks, and S3 storage.',
      details: q.answer,
      solution: q.command,
      tags: getTags(q.title)
    }));
  }, []);

  const filteredQuestions = useMemo(() => {
    return awsQuestions.filter((q) => {
      const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      const matchesSearch =
        !searchQuery ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDifficulty && matchesSearch;
    });
  }, [awsQuestions, searchQuery, difficultyFilter]);

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
              <div className="tech-card-icon-wrap" style={{ width: '48px', height: '48px', fontSize: '24px', backgroundColor: 'rgba(239, 137, 26, 0.1)', color: '#EF891A' }}>
                <FaAws />
              </div>
              <h1 style={{ fontSize: '36px', fontWeight: '800' }}>AWS Cloud Track</h1>
            </div>
            <p className="hero-sub" style={{ margin: '0', maxWidth: '800px' }}>
              Master AWS Cloud administration and design. Prepare for solutions architect and cloud operations interviews with scenario-based questions covering RDS Multi-AZ failovers, secure VPC designs, IAM roles, S3 lifecycle operations, and database migration pathways.
            </p>
          </div>
        </section>

        {/* Stats Cards */}
        <section style={{ padding: '40px 0', backgroundColor: 'var(--bg-surface)' }}>
          <div className="container">
            <div className="grid-3">
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiCloud /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>{awsQuestions.length} Scenario Units</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Cloud Architecture QA</div>
                </div>
              </div>
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiCpu /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>RDS & Compute</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Multi-AZ & Auto Scaling</div>
                </div>
              </div>
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiTrendingUp /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>VPC & Security</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Transit Gateway & IAM policies</div>
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
                  placeholder="Filter AWS questions..."
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
                  <h3>No AWS questions found matching the criteria</h3>
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
