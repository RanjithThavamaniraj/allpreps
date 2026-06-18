import { useState, useMemo, useEffect } from 'react';
import { FiArrowLeft, FiTerminal, FiSearch, FiCpu, FiTrendingUp } from 'react-icons/fi';
import { getQuestionsByTech } from '../data/questionLoader';
import Navbar from '../components/Navbar';
import QuestionCard from '../components/QuestionCard';
import Footer from '../components/Footer';
import ProductionScenariosCallout from '../components/ProductionScenariosCallout';
import ReadinessTechStrip from '../components/ReadinessScore/ReadinessTechStrip';
import { getGlobalCompletedIds, subscribeToProgress, toggleTrackQuestion } from '../lib/trackProgress';

const TRACK_ID = 'shell scripting';

// Helper to generate context-relevant tags based on the question title
function getTags(title) {
  const t = title.toLowerCase();
  const tags = ['bash'];
  if (t.includes('loop') || t.includes('while') || t.includes('for') || t.includes('parallel') || t.includes('xargs')) {
    tags.push('control-flow');
  }
  if (t.includes('variable') || t.includes('parameter') || t.includes('expansion') || t.includes('concat') || t.includes('length')) {
    tags.push('variables-expansion');
  }
  if (t.includes('array') || t.includes('list')) {
    tags.push('arrays');
  }
  if (t.includes('trap') || t.includes('signal') || t.includes('exit') || t.includes('error') || t.includes('lock')) {
    tags.push('error-handling');
  }
  if (t.includes('sed') || t.includes('awk') || t.includes('grep') || t.includes('regex') || t.includes('text') || t.includes('parse')) {
    tags.push('text-processing');
  }
  if (t.includes('cron') || t.includes('schedule') || t.includes('monitor') || t.includes('alert')) {
    tags.push('automation');
  }
  if (tags.length === 1) {
    tags.push('scripting-core');
  }
  return tags;
}

export default function ShellScripting() {
  const [searchQuery, setSearchQuery] = useState('');
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
  const [difficultyFilter, setDifficultyFilter] = useState('all');
    
  const shellQuestions = useMemo(() => {
    return getQuestionsByTech('shell scripting').map(q => ({
      id: `sh-${q.id}`,
      rawId: q.id,
      title: q.question,
      difficulty: q.difficulty,
      description: q.question + ' - Scenario-based question covering Bash shell scripting, automation scripts, text manipulation, and scheduling.',
      details: q.answer,
      solution: q.command,
      tags: q.tags || getTags(q.question)
    }));
  }, []);

  const filteredQuestions = useMemo(() => {
    return shellQuestions.filter((q) => {
      const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      const matchesSearch =
        !searchQuery ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDifficulty && matchesSearch;
    });
  }, [shellQuestions, searchQuery, difficultyFilter]);

  
  
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
              <div className="tech-card-icon-wrap" style={{ width: '48px', height: '48px', fontSize: '24px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                <FiTerminal />
              </div>
              <h1 style={{ fontSize: '36px', fontWeight: '800' }}>Shell Scripting Track</h1>
            </div>
            <p className="hero-sub" style={{ margin: '0', maxWidth: '800px' }}>
              Master Shell Scripting and automation. Prepare for DevOps, DBA, and SRE scripting rounds with scenario-based questions covering command-line options parsing, array processing, parameter expansions, multi-threaded worker loops, lock file creation, and log monitoring scripts.
            </p>
          </div>
        </section>

        {/* Stats Cards */}
        <section style={{ padding: '40px 0', backgroundColor: 'var(--bg-surface)' }}>
          <div className="container">
            <div className="grid-3">
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiTerminal /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>{shellQuestions.length} Scenario Units</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Bash Scripting QA</div>
                </div>
              </div>
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiCpu /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>Process Controls</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Traps, Locks & Signals</div>
                </div>
              </div>
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiTrendingUp /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>Regex & Parsing</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Automated Text processing</div>
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
                  placeholder="Filter Scripting questions..."
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
                  <h3>No Shell Scripting questions found matching the criteria</h3>
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

        <ProductionScenariosCallout trackId="shell scripting" />
      </main>

      <Footer />
    </div>
  );
}
