import { useState, useMemo } from 'react';
import { FiSearch, FiChevronDown, FiChevronUp, FiBookOpen } from 'react-icons/fi';
import { QUESTIONS_DATA } from '../data/questionsData';



export default function Questions({ selectedCategory, searchQuery, onSearchChange, activeChip }) {
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState({}); // 'answer' or 'command'

  const filtered = useMemo(() => {
    return QUESTIONS_DATA.filter(q => {
      const matchCat =
        (!selectedCategory && !activeChip) ||
        (selectedCategory && q.category === selectedCategory) ||
        (activeChip && q.category.includes(activeChip));

      const matchDiff  = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      const matchSearch = !searchQuery || q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.category.includes(searchQuery.toLowerCase());

      return matchCat && matchDiff && matchSearch;
    });
  }, [selectedCategory, searchQuery, activeChip, difficultyFilter]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    if (!activeTab[id]) {
      setActiveTab(prev => ({ ...prev, [id]: 'answer' }));
    }
  };

  const setTab = (id, tab) => {
    setActiveTab(prev => ({ ...prev, [id]: tab }));
  };

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
                {filtered.length} of {QUESTIONS_DATA.length} questions shown — click any row to reveal the answer.
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="q-controls">
          <div className="q-search-wrap">
            <FiSearch className="q-search-icon" size={15} />
            <input
              type="text"
              className="input-field q-search-field"
              placeholder="Filter questions..."
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
                style={{ textTransform: 'capitalize' }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="q-empty">
            <FiBookOpen size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <h3>No questions match your current filter</h3>
            <p style={{ marginTop: '8px' }}>Try clearing the search or selecting a different topic or difficulty.</p>
          </div>
        ) : (
          <div>
            {/* Header row */}
            <div className="q-table-head">
              <span className="q-th">#</span>
              <span className="q-th">Question</span>
              <span className="q-th">Track</span>
              <span className="q-th">Difficulty</span>
              <span className="q-th" />
            </div>

            {/* Data rows */}
            {filtered.map((q, idx) => {
              const isExpanded = expandedId === q.id;
              const curTab = activeTab[q.id] || 'answer';

              return (
                <div key={q.id}>
                  <div
                    className="q-table-row"
                    onClick={() => toggleExpand(q.id)}
                    style={isExpanded ? { background: 'var(--primary-light)', borderColor: 'rgba(37,99,235,0.3)' } : {}}
                  >
                    <span className="q-row-num">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="q-row-title">{q.title}</span>
                    <span className="q-row-tag">{q.category}</span>
                    <span className="q-row-diff"><span className={`badge badge-${q.difficulty}`}>{q.difficulty}</span></span>
                    <span className="q-row-arrow">
                      {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                  </div>

                  {/* Expanded answer panel */}
                  {isExpanded && (
                    <div className="q-answer-panel fade-up">
                      {/* Tabs */}
                      <div className="q-answer-tabs">
                        <button
                          className={`q-answer-tab ${curTab === 'answer' ? 'q-answer-tab-active' : ''}`}
                          onClick={() => setTab(q.id, 'answer')}
                        >
                          Detailed Answer
                        </button>
                        <button
                          className={`q-answer-tab ${curTab === 'command' ? 'q-answer-tab-active' : ''}`}
                          onClick={() => setTab(q.id, 'command')}
                        >
                          Reference Commands
                        </button>
                      </div>

                      {/* Tab content */}
                      {curTab === 'answer' && (
                        <div className="q-answer-body">
                          <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                            {q.answer}
                          </p>
                        </div>
                      )}

                      {curTab === 'command' && (
                        <div className="q-answer-body">
                          <pre className="q-code-block"><code>{q.command}</code></pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
