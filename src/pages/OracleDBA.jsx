import { useState, useMemo, useEffect } from 'react';
import { FiArrowLeft, FiDatabase, FiSearch, FiCpu, FiTrendingUp } from 'react-icons/fi';
import { getQuestionsByTech } from '../data/questionLoader';
import Navbar from '../components/Navbar';
import QuestionCard from '../components/QuestionCard';
import Footer from '../components/Footer';
import ProductionScenariosCallout from '../components/ProductionScenariosCallout';
import ReadinessTechStrip from '../components/ReadinessScore/ReadinessTechStrip';
import { getGlobalCompletedIds, subscribeToProgress, toggleTrackQuestion } from '../lib/trackProgress';

const TRACK_ID = 'oracle dba';

export default function OracleDBA() {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [completedIds, setCompletedIds] = useState(() => getGlobalCompletedIds());

  useEffect(() => {
    const syncCompleted = () => setCompletedIds(getGlobalCompletedIds());
    syncCompleted();
    window.addEventListener('focus', syncCompleted);
    const unsub = subscribeToProgress(syncCompleted);
    return () => {
      window.removeEventListener('focus', syncCompleted);
      unsub();
    };
  }, []);

  const toggleCompleted = (rawId, e) => {
    e.stopPropagation();
    toggleTrackQuestion(TRACK_ID, rawId);
    setCompletedIds(getGlobalCompletedIds());
  };

  const oracleQuestions = useMemo(() => {
    return getQuestionsByTech('oracle dba').map(q => ({
      id: `ora-${q.id}`,
      rawId: q.id,
      title: q.question,
      difficulty: q.difficulty,
      description: q.question + ' - Scenario questions covering key DBA concepts, memory architectures, performance tuning, and high-availability.',
      details: q.answer,
      solution: q.command || '',
      tags: q.tags || []
    }));
  }, []);

  const filteredQuestions = useMemo(() => {
    return oracleQuestions.filter((q) => {
      const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      const matchesSearch =
        !searchQuery ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDifficulty && matchesSearch;
    });
  }, [oracleQuestions, searchQuery, difficultyFilter]);

  
  
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
              <div className="tech-card-icon-wrap" style={{ width: '48px', height: '48px', fontSize: '24px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)' }}>
                <FiDatabase />
              </div>
              <h1 style={{ fontSize: '36px', fontWeight: '800' }}>Oracle DBA Track</h1>
            </div>
            <p className="hero-sub" style={{ margin: '0', maxWidth: '800px' }}>
              Deep dive into Oracle Database Administration. Prepare for senior DBA interviews with scenario questions covering SGA/PGA optimization, RMAN disaster recovery, Real Application Clusters (RAC), Active Data Guard, and ASM storage rebalancing.
            </p>
          </div>
        </section>

        {/* DBA Stats Cards */}
        <section style={{ padding: '40px 0', backgroundColor: 'var(--bg-surface)' }}>
          <div className="container">
            <div className="grid-3">
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiDatabase /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>{oracleQuestions.length} Scenario Units</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Standard QA & Scenarios</div>
                </div>
              </div>
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiCpu /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>RAC & RMAN Focus</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Production Level Recovery</div>
                </div>
              </div>
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiTrendingUp /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>High Success Rate</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>94% Candidate Clearance</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ReadinessTechStrip trackId={TRACK_ID} />

        {/* Filter Controls */}
        <section style={{ padding: '40px 0 20px' }}>
          <div className="container">
            <div className="questions-header-block" style={{ marginBottom: '24px' }}>
              <div className="hero-search-wrap" style={{ flex: '1', maxWidth: '480px' }}>
                <FiSearch className="search-icon-pos" />
                <input
                  type="text"
                  placeholder="Filter DBA questions..."
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
                  <h3>No DBA questions found matching the criteria</h3>
                  <p>Try resetting the search bar or changing the difficulty filter.</p>
                </div>
              ) : (
                filteredQuestions.map((q, idx) => (
                  <QuestionCard 
                    key={q.id} 
                    q={q} 
                    idx={idx} 
                    completed={completedIds.includes(q.rawId)} 
                    onToggleCompleted={toggleCompleted} 
                  />
                ))
              )}
            </div>
          </div>
        </section>

        <ProductionScenariosCallout trackId="oracle dba" />
      </main>

      <Footer />
    </div>
  );
}
