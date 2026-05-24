import { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ALL_QUESTIONS } from '../data/questionLoader';
import { FaDatabase, FaLinux, FaAws } from 'react-icons/fa';
import { FiDatabase, FiTerminal, FiGitBranch, FiAward, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { SiGooglecloud } from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';

const TRACKS = [
  { id: 'oracle dba', name: 'Oracle DBA', icon: <FaDatabase /> },
  { id: 'linux', name: 'Linux Admin', icon: <FaLinux /> },
  { id: 'sql', name: 'SQL', icon: <FiDatabase /> },
  { id: 'aws', name: 'AWS Cloud', icon: <FaAws /> },
  { id: 'azure', name: 'Azure Cloud', icon: <VscAzure /> },
  { id: 'google', name: 'Google Cloud', icon: <SiGooglecloud /> },
  { id: 'shell scripting', name: 'Shell Scripting', icon: <FiTerminal /> },
  { id: 'devops', name: 'DevOps', icon: <FiGitBranch /> },
];

export default function Roadmaps() {
  const [selectedTrack, setSelectedTrack] = useState('oracle dba');
  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('allpreps_completed_questions');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Error reading localStorage:", e);
      return [];
    }
  });
    const [activeTabs, setActiveTabs] = useState({}); // Stores active tab ('answer' or 'command') per question ID
  const [user, setUser] = useState(null);

  // Sync user and completed questions from localStorage reactively
  useEffect(() => {
    const syncData = () => {
      try {
        const storedUser = localStorage.getItem('allpreps_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }

        const storedCompleted = localStorage.getItem('allpreps_completed_questions');
        if (storedCompleted) {
          setCompletedIds(JSON.parse(storedCompleted));
        }
      } catch (e) {
        console.error("Error syncing with localStorage:", e);
      }
    };

    syncData();
    window.addEventListener('focus', syncData);
    window.addEventListener('storage', syncData);

    const interval = setInterval(syncData, 1000);

    return () => {
      window.removeEventListener('focus', syncData);
      window.removeEventListener('storage', syncData);
      clearInterval(interval);
    };
  }, []);

  // Filter questions for the selected track
  const trackQuestions = useMemo(() => {
    return ALL_QUESTIONS.filter(q => q.category === selectedTrack);
  }, [selectedTrack]);

  // Group questions by difficulty
  const groupedQuestions = useMemo(() => {
    const easy = trackQuestions.filter(q => q.difficulty === 'easy');
    const medium = trackQuestions.filter(q => q.difficulty === 'medium');
    const hard = trackQuestions.filter(q => q.difficulty === 'hard');
    return { easy, medium, hard };
  }, [trackQuestions]);

  // Calculations for progress
  const progressMetrics = useMemo(() => {
    const total = trackQuestions.length;
    if (total === 0) return { total: 0, completed: 0, pct: 0, easyCompleted: 0, easyTotal: 0, medCompleted: 0, medTotal: 0, hardCompleted: 0, hardTotal: 0 };

    const trackQuestionIds = trackQuestions.map(q => q.id);
    const completedInTrack = completedIds.filter(id => trackQuestionIds.includes(id));
    const completed = completedInTrack.length;
    const pct = Math.round((completed / total) * 100);

    const easyTotal = groupedQuestions.easy.length;
    const easyCompleted = groupedQuestions.easy.filter(q => completedIds.includes(q.id)).length;

    const medTotal = groupedQuestions.medium.length;
    const medCompleted = groupedQuestions.medium.filter(q => completedIds.includes(q.id)).length;

    const hardTotal = groupedQuestions.hard.length;
    const hardCompleted = groupedQuestions.hard.filter(q => completedIds.includes(q.id)).length;

    return {
      total,
      completed,
      pct,
      easyCompleted,
      easyTotal,
      medCompleted,
      medTotal,
      hardCompleted,
      hardTotal
    };
  }, [trackQuestions, groupedQuestions, completedIds]);

  // Compute all tracks progress summary
  const allTracksProgress = useMemo(() => {
    return TRACKS.map(t => {
      const questions = ALL_QUESTIONS.filter(q => q.category === t.id);
      const total = questions.length;
      const questionIds = questions.map(q => q.id);
      const completed = completedIds.filter(id => questionIds.includes(id)).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        ...t,
        completed,
        total,
        pct
      };
    });
  }, [completedIds]);

  const toggleCompleted = (id, e) => {
    e.stopPropagation(); // Avoid expanding/collapsing when clicking the checkbox
    let updated;
    if (completedIds.includes(id)) {
      updated = completedIds.filter(x => x !== id);
    } else {
      updated = [...completedIds, id];
    }
    setCompletedIds(updated);
    try {
      localStorage.setItem('allpreps_completed_questions', JSON.stringify(updated));
    } catch (err) {
      console.error("Error updating localStorage:", err);
    }
  };

  const toggleQuestionExpanded = (id) => {
    null;
    if (!activeTabs[id]) {
      setActiveTabs(prev => ({ ...prev, [id]: 'answer' }));
    }
  };

  const setQuestionTab = (id, tab, e) => {
    e.stopPropagation();
    setActiveTabs(prev => ({ ...prev, [id]: tab }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flexGrow: 1, paddingBottom: '80px' }}>
        {/* Page Header */}
        <header className="page-header" style={{ padding: '60px 0 40px', background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <span className="section-eyebrow" style={{ display: 'inline-block', marginBottom: '8px' }}>Learning Pathways</span>
            <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
              Interactive Roadmaps
            </h1>
            <p className="page-sub" style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
              Follow a structured roadmap sorted from Easy to Hard. Check off questions as you master them to track your progress.
            </p>
          </div>
        </header>

        {/* Track Selector Tabs */}
        <div className="container" style={{ marginTop: '40px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
            {TRACKS.map(t => {
              const isActive = selectedTrack === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTrack(t.id); null; }}
                  className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    textTransform: 'none'
                  }}
                >
                  <span style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>{t.icon}</span>
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="container">
          <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>
            {/* ── LEFT: Roadmap Phases ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {/* Phase 1: Easy */}
              <div className="roadmap-phase">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
                    1
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Phase 1: Foundations (Easy)</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Get started with core syntax, initial concepts, and setup routines.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '18px', borderLeft: '2px dashed var(--border)' }}>
                  {groupedQuestions.easy.map((q, idx) => (
                    <RoadmapItem
                      key={q.id}
                      q={q}
                      idx={idx}
                      completed={completedIds.includes(q.id)}
                      isExpanded={false}
                      activeTab={activeTabs[q.id] || 'answer'}
                      onToggleExpand={() => toggleQuestionExpanded(q.id)}
                      onToggleComplete={(e) => toggleCompleted(q.id, e)}
                      onTabChange={(tab, e) => setQuestionTab(q.id, tab, e)}
                    />
                  ))}
                </div>
              </div>

              {/* Phase 2: Medium */}
              <div className="roadmap-phase">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(234,179,8,0.15)', color: '#eab308', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
                    2
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Phase 2: Core Engineering (Medium)</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Advance to backup logic, networking, partitioning, and resource monitoring.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '18px', borderLeft: '2px dashed var(--border)' }}>
                  {groupedQuestions.medium.map((q, idx) => (
                    <RoadmapItem
                      key={q.id}
                      q={q}
                      idx={idx}
                      completed={completedIds.includes(q.id)}
                      isExpanded={false}
                      activeTab={activeTabs[q.id] || 'answer'}
                      onToggleExpand={() => toggleQuestionExpanded(q.id)}
                      onToggleComplete={(e) => toggleCompleted(q.id, e)}
                      onTabChange={(tab, e) => setQuestionTab(q.id, tab, e)}
                    />
                  ))}
                </div>
              </div>

              {/* Phase 3: Hard */}
              <div className="roadmap-phase">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
                    3
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>Phase 3: Production Outages & Tuning (Hard)</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Master high-availability, clustering, severe issue recoveries, and query optimization.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '18px', borderLeft: '2px dashed var(--border)' }}>
                  {groupedQuestions.hard.map((q, idx) => (
                    <RoadmapItem
                      key={q.id}
                      q={q}
                      idx={idx}
                      completed={completedIds.includes(q.id)}
                      isExpanded={false}
                      activeTab={activeTabs[q.id] || 'answer'}
                      onToggleExpand={() => toggleQuestionExpanded(q.id)}
                      onToggleComplete={(e) => toggleCompleted(q.id, e)}
                      onTabChange={(tab, e) => setQuestionTab(q.id, tab, e)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Progress Sidebar ── */}
            <div style={{ position: 'sticky', top: '100px' }}>
              <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <FiAward size={22} style={{ color: 'var(--primary-hover)' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {user ? `${user.name}'s Statistics` : 'Track Statistics'}
                  </h3>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: '600' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Overall Mastery</span>
                    <span style={{ color: 'var(--primary-hover)' }}>{progressMetrics.pct}%</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-base)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: 'var(--primary-hover)', width: `${progressMetrics.pct}%`, transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    {progressMetrics.completed} of {progressMetrics.total} questions checked as learned
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  {/* Easy stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                      Foundations (Easy)
                    </span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {progressMetrics.easyCompleted} / {progressMetrics.easyTotal}
                    </span>
                  </div>

                  {/* Medium stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#eab308' }} />
                      Core Engineering (Medium)
                    </span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {progressMetrics.medCompleted} / {progressMetrics.medTotal}
                    </span>
                  </div>

                  {/* Hard stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                      Expert Scenarios (Hard)
                    </span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {progressMetrics.hardCompleted} / {progressMetrics.hardTotal}
                    </span>
                  </div>
                </div>

                {progressMetrics.pct === 100 && (
                  <div style={{ marginTop: '24px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center', color: '#22c55e', fontSize: '13px', fontWeight: '600' }}>
                    🎉 Track fully completed! Excellent job!
                  </div>
                )}

                {/* All Tracks Summary */}
                <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    All Tracks Summary
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {allTracksProgress.map(track => {
                      const isCurrent = track.id === selectedTrack;
                      return (
                        <div 
                          key={track.id} 
                          onClick={() => { setSelectedTrack(track.id); null; }}
                          style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '4px',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            backgroundColor: isCurrent ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                            transition: 'all 0.2s ease',
                            border: isCurrent ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid transparent'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', color: isCurrent ? 'var(--primary-hover)' : 'var(--text-muted)' }}>
                                {track.icon}
                              </span>
                              <span style={{ fontWeight: isCurrent ? '700' : '400', color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                {track.name}
                              </span>
                            </span>
                            <span style={{ fontWeight: '600', color: isCurrent ? 'var(--primary-hover)' : 'var(--text-muted)' }}>
                              {track.pct}%
                            </span>
                          </div>
                          <div style={{ height: '4px', backgroundColor: 'var(--bg-base)', borderRadius: '100px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', backgroundColor: isCurrent ? 'var(--primary-hover)' : 'var(--primary)', opacity: isCurrent ? 1 : 0.6, width: `${track.pct}%`, transition: 'width 0.4s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function RoadmapItem({ q, idx, completed, isExpanded, activeTab, onToggleExpand, onToggleComplete, onTabChange }) {
  return (
    <div
      className="card"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: completed ? 'rgba(34,197,94,0.2)' : 'var(--border)',
        cursor: 'pointer',
        padding: '0',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        boxShadow: completed ? '0 0 12px rgba(34,197,94,0.03)' : 'none'
      }}
      onClick={onToggleExpand}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: '16px' }}>
        {/* Custom Progress Checkbox */}
        <div
          onClick={onToggleComplete}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            border: completed ? '2px solid #22c55e' : '2px solid var(--border)',
            backgroundColor: completed ? '#22c55e' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
        >
          {completed && <span/>}
        </div>

        {/* Index & Title */}
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', width: '22px' }}>
          {String(idx + 1).padStart(2, '0')}
        </span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: completed ? 'var(--text-secondary)' : 'var(--text-primary)',
            textDecoration: completed ? 'line-through' : 'none',
            flexGrow: 1
          }}
        >
          {q.question}
        </span>

        {/* Action Toggle */}
        <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </span>
      </div>

      {/* Accordion content */}
      {isExpanded && (
        <div
          style={{
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg-base)',
            padding: '20px'
          }}
          onClick={e => e.stopPropagation()} // Stop propagation to avoid closing when reading content
        >
          {/* Tabs */}
          <div className="q-answer-tabs" style={{ marginBottom: '14px' }}>
            <button
              className={`q-answer-tab ${activeTab === 'answer' ? 'q-answer-tab-active' : ''}`}
              onClick={(e) => onTabChange('answer', e)}
            >
              Detailed Answer
            </button>
            <button
              className={`q-answer-tab ${activeTab === 'command' ? 'q-answer-tab-active' : ''}`}
              onClick={(e) => onTabChange('command', e)}
            >
              Reference Commands
            </button>
          </div>

          {/* Body Content */}
          {activeTab === 'answer' && (
            <div className="q-answer-body" style={{ margin: 0, padding: 0, background: 'transparent', border: 'none' }}>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                {q.answer}
              </p>
            </div>
          )}

          {activeTab === 'command' && (
            <div className="q-answer-body" style={{ margin: 0, padding: 0, background: 'transparent', border: 'none' }}>
              <pre className="q-code-block" style={{ margin: 0 }}><code style={{ fontSize: '12.5px' }}>{q.command}</code></pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
