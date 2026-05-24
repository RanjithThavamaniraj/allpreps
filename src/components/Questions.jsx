import { useState, useMemo, useEffect } from 'react';
import { FiSearch, FiBookOpen } from 'react-icons/fi';
import { ALL_QUESTIONS } from '../data/questionLoader';
import AIGuidancePanel from './AIGuidancePanel';

export default function Questions({ selectedCategory, searchQuery, onSearchChange, activeChip }) {
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [currentTab, setCurrentTab] = useState('details');

  const filtered = useMemo(() => {
    return ALL_QUESTIONS.filter(q => {
      const matchCat =
        (!selectedCategory && !activeChip) ||
        (selectedCategory && q.category === selectedCategory) ||
        (activeChip && q.category.includes(activeChip));

      const matchDiff  = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      const matchSearch = !searchQuery || (q.question && q.question.toLowerCase().includes(searchQuery.toLowerCase())) || (q.category && q.category.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCat && matchDiff && matchSearch;
    }).sort((a, b) => b.id - a.id); // Show newest questions first
  }, [selectedCategory, searchQuery, activeChip, difficultyFilter]);

  // Auto-select first item when filter changes
  useEffect(() => {
    if (filtered.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedId(filtered[0].id);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentTab('details');
    } else {
      setSelectedId(null);
    }
  }, [filtered]);

  const selectedQuestion = useMemo(() => {
    return filtered.find(q => q.id === selectedId) || null;
  }, [filtered, selectedId]);

  return (
    <section className="questions" id="practice">
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
          <span className="section-eyebrow">Interview Bank</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: '6px' }}>Popular Interview Questions</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                {filtered.length} of {ALL_QUESTIONS.length} questions shown.
              </p>
            </div>
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div className="md-layout">
          {/* Left: Sidebar List */}
          <div className="md-sidebar">
            <div className="q-controls" style={{ padding: '16px', borderBottom: '1px solid var(--border)', margin: 0 }}>
              <div className="q-search-wrap" style={{ marginBottom: '12px' }}>
                <FiSearch className="q-search-icon" size={15} />
                <input
                  type="text"
                  className="input-field q-search-field"
                  placeholder="Search questions..."
                  value={searchQuery || ''}
                  onChange={e => onSearchChange && onSearchChange(e.target.value)}
                />
              </div>
              <div className="q-diff-tabs">
                {['all', 'easy', 'medium', 'hard'].map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficultyFilter(level)}
                    className={`btn btn-sm ${difficultyFilter === level ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ textTransform: 'capitalize', flex: 1, padding: '6px 0' }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="md-list">
              {filtered.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', opacity: 0.5 }}>
                  <FiBookOpen size={24} style={{ marginBottom: '12px' }} />
                  <p>No questions found.</p>
                </div>
              ) : (
                filtered.map((q, idx) => (
                  <div 
                    key={q.id} 
                    className={`md-item ${selectedId === q.id ? 'active' : ''}`}
                    onClick={() => { setSelectedId(q.id); setCurrentTab('details'); }}
                  >
                    <div className="md-item-num">{String(idx + 1).padStart(2, '0')}</div>
                    <div className="md-item-content">
                      <h4>{q.question}</h4>
                      <div className="md-item-tags">
                        <span className="md-item-cat">{q.category}</span>
                        <span className={`badge badge-${q.difficulty}`}>{q.difficulty}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Content Area */}
          <div className="md-content-area fade-up">
            {selectedQuestion ? (
              <div>
                <div className="md-detail-header">
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span className="q-tech-tag" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>
                      {selectedQuestion.category}
                    </span>
                    <span className={`badge badge-${selectedQuestion.difficulty}`}>
                      {selectedQuestion.difficulty}
                    </span>
                  </div>
                  <h2>{selectedQuestion.question}</h2>
                  {selectedQuestion.description && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '8px' }}>
                      {selectedQuestion.description}
                    </p>
                  )}
                </div>

                <div className="md-detail-body">
                  <div className="q-standard-content">
                    <div className="q-details-tabs">
                      <button
                        onClick={() => setCurrentTab('details')}
                        className={`q-details-tab-btn ${currentTab === 'details' ? 'q-details-tab-active' : ''}`}
                      >
                        Detailed Answer
                      </button>
                      {selectedQuestion.command && (
                        <button
                          onClick={() => setCurrentTab('solution')}
                          className={`q-details-tab-btn ${currentTab === 'solution' ? 'q-details-tab-active' : ''}`}
                        >
                          Reference Command
                        </button>
                      )}
                    </div>

                    {currentTab === 'details' && (
                      <div className="q-tab-panel">
                        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                          {selectedQuestion.answer}
                        </p>
                      </div>
                    )}

                    {currentTab === 'solution' && selectedQuestion.command && (
                      <div className="q-tab-panel">
                        <pre className="code-pre-box">
                          <code>{selectedQuestion.command}</code>
                        </pre>
                      </div>
                    )}

                    {selectedQuestion.tags && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '24px' }}>
                        {selectedQuestion.tags.map(tag => (
                          <span key={tag} className="q-tech-tag" style={{ color: 'var(--text-secondary)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI Panel in the right column of the detail body */}
                  <div className="q-ai-sidebar">
                    <AIGuidancePanel 
                      question={selectedQuestion.question} 
                      tags={selectedQuestion.tags || [selectedQuestion.category]} 
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', opacity: 0.3 }}>
                <h3>Select a question to view details</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
