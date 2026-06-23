import { useState, useMemo, useEffect } from 'react';
import { FiSearch, FiBookOpen, FiCheck } from 'react-icons/fi';
import { ALL_QUESTIONS } from '../data/questionLoader';
import AIGuidancePanel from './AIGuidancePanel';
import StructuredAnswer from './StructuredAnswer';
import FrequencyBadge from './FrequencyBadge';
import QuestionProgressSummary from './QuestionProgressSummary';
import {
  DIFFICULTY_LABELS,
  SEARCH_PLACEHOLDER,
  extractInterviewPreview,
  formatCategoryLabel,
  getQuestionTitle,
} from '../lib/questionMeta';
import { getGlobalCompletedIds, subscribeToProgress, toggleTrackQuestion } from '../lib/trackProgress';
import { CHIP_TO_CATEGORY } from '../lib/navigation';
import { trackFounderMetric, FOUNDER_METRICS } from '../lib/founderAnalytics';

export default function Questions({ selectedCategory, searchQuery, onSearchChange, activeChip, productionOnly = false }) {
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [currentTab, setCurrentTab] = useState('details');
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

  const filtered = useMemo(() => {
    const chipCategory = activeChip
      ? (CHIP_TO_CATEGORY[activeChip] || activeChip)
      : null;

    return ALL_QUESTIONS.filter(q => {
      if (productionOnly && !(q.tags || []).includes('production-scenario')) {
        return false;
      }

      const matchCat =
        (!selectedCategory && !chipCategory) ||
        (selectedCategory && q.category === selectedCategory) ||
        (chipCategory && q.category === chipCategory);

      const matchDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      const qText = getQuestionTitle(q).toLowerCase();
      const tagsText = (q.tags || []).join(' ').toLowerCase();
      const answerPreview = extractInterviewPreview(q.answer || '', 500).toLowerCase();
      const search = (searchQuery || '').toLowerCase();
      const matchSearch =
        !search ||
        qText.includes(search) ||
        (q.category && q.category.toLowerCase().includes(search)) ||
        tagsText.includes(search) ||
        answerPreview.includes(search);

      return matchCat && matchDiff && matchSearch;
    });
  }, [selectedCategory, searchQuery, activeChip, difficultyFilter, productionOnly]);

  const progressStats = useMemo(() => {
    const total = filtered.length;
    const completed = filtered.filter(q => completedIds.includes(q.id)).length;
    return { total, completed };
  }, [filtered, completedIds]);

  useEffect(() => {
    if (filtered.length > 0) {
      setSelectedId(prev => (filtered.some(q => q.id === prev) ? prev : filtered[0].id));
      setCurrentTab('details');
    } else {
      setSelectedId(null);
    }
  }, [filtered]);

  useEffect(() => {
    if (!selectedId) return;
    const question = ALL_QUESTIONS.find((q) => q.id === selectedId);
    if (!question) return;
    trackFounderMetric(FOUNDER_METRICS.QUESTIONS_VIEWED, {
      metadata: { questionId: question.id, category: question.category },
    });
  }, [selectedId]);

  const selectedQuestion = useMemo(() => {
    return filtered.find(q => q.id === selectedId) || null;
  }, [filtered, selectedId]);

  const toggleCompleted = (question, e) => {
    e.stopPropagation();
    if (question.category) {
      toggleTrackQuestion(question.category, question.id);
      setCompletedIds(getGlobalCompletedIds());
    }
  };

  return (
    <section className="questions" id="practice">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
          <span className="section-eyebrow">Interview Bank</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: '6px' }}>
                {productionOnly ? 'Production Scenarios' : 'Question Explorer'}
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                {productionOnly
                  ? `${filtered.length} production scenario${filtered.length !== 1 ? 's' : ''} shown`
                  : `${filtered.length} of ${ALL_QUESTIONS.length} questions shown`}
              </p>
            </div>
          </div>
        </div>

        <QuestionProgressSummary
          completed={progressStats.completed}
          total={progressStats.total}
          label="Question explorer progress"
        />

        <div className="md-layout" style={{ marginTop: '24px' }}>
          <div className="md-sidebar">
            <div className="q-controls" style={{ padding: '16px', borderBottom: '1px solid var(--border)', margin: 0 }}>
              <div className="q-search-wrap" style={{ marginBottom: '12px' }}>
                <FiSearch className="q-search-icon" size={15} />
                <input
                  type="text"
                  className="input-field q-search-field"
                  placeholder={SEARCH_PLACEHOLDER}
                  value={searchQuery || ''}
                  onChange={e => onSearchChange && onSearchChange(e.target.value)}
                />
              </div>
              <div className="q-diff-tabs">
                {['all', 'easy', 'medium', 'hard'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficultyFilter(level)}
                    className={`btn btn-sm ${difficultyFilter === level ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ textTransform: 'capitalize', flex: 1, padding: '6px 0' }}
                  >
                    {DIFFICULTY_LABELS[level] || level}
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
                filtered.map((q, idx) => {
                  const completed = completedIds.includes(q.id);
                  const title = getQuestionTitle(q);
                  const preview = extractInterviewPreview(q.answer || '', 100);
                  const isActive = selectedId === q.id;

                  return (
                    <div
                      key={q.id}
                      className={`md-item ${isActive ? 'active' : ''} ${completed ? 'md-item-done' : ''}`}
                      onClick={() => { setSelectedId(q.id); setCurrentTab('details'); }}
                    >
                      <div className="md-item-body">
                        <div className="md-item-head">
                          <button
                            type="button"
                            className={`q-complete-btn q-complete-btn-sm${completed ? ' q-complete-btn-done' : ''}`}
                            aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
                            onClick={(e) => toggleCompleted(q, e)}
                          >
                            {completed && <FiCheck size={10} />}
                          </button>
                          <span className="md-item-num">Q{String(idx + 1).padStart(2, '0')}</span>
                          <h4 className="md-item-title">{title}</h4>
                        </div>
                        <div className="md-item-tags">
                          <span className="md-item-cat">{formatCategoryLabel(q.category)}</span>
                          <span className={`badge badge-${q.difficulty}`}>
                            {DIFFICULTY_LABELS[q.difficulty] || q.difficulty}
                          </span>
                          {q.frequency && <span className="q-freq-text">{q.frequency}</span>}
                          <FrequencyBadge question={q} compact />
                          {completed
                            ? <span className="q-status-badge q-status-done q-status-badge-sm">Done</span>
                            : <span className="q-status-badge q-status-pending q-status-badge-sm">Open</span>}
                        </div>
                        {preview && <p className="md-item-preview">{preview}</p>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="md-content-area fade-up">
            {selectedQuestion ? (
              <div>
                <div className="md-detail-header">
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span className="q-tech-tag" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>
                      {formatCategoryLabel(selectedQuestion.category)}
                    </span>
                    <span className={`badge badge-${selectedQuestion.difficulty}`}>
                      {DIFFICULTY_LABELS[selectedQuestion.difficulty] || selectedQuestion.difficulty}
                    </span>
                    {selectedQuestion.frequency && (
                      <span className={`badge badge-freq badge-freq-${selectedQuestion.frequency.toLowerCase().replace(/\s+/g, '-')}`}>
                        {selectedQuestion.frequency}
                      </span>
                    )}
                    <FrequencyBadge question={selectedQuestion} />
                    {selectedQuestion.role && (
                      <span className="q-tech-tag">{selectedQuestion.role}</span>
                    )}
                    {completedIds.includes(selectedQuestion.id) && (
                      <span className="q-status-badge q-status-done">Completed</span>
                    )}
                  </div>
                  <h2>{getQuestionTitle(selectedQuestion)}</h2>
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
                        type="button"
                        onClick={() => setCurrentTab('details')}
                        className={`q-details-tab-btn ${currentTab === 'details' ? 'q-details-tab-active' : ''}`}
                      >
                        Detailed Answer
                      </button>
                      {selectedQuestion.command && (
                        <button
                          type="button"
                          onClick={() => setCurrentTab('solution')}
                          className={`q-details-tab-btn ${currentTab === 'solution' ? 'q-details-tab-active' : ''}`}
                        >
                          Reference Command
                        </button>
                      )}
                    </div>

                    {currentTab === 'details' && (
                      <div className="q-tab-panel">
                        <StructuredAnswer text={selectedQuestion.answer} />
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

                  <div className="q-ai-sidebar">
                    <AIGuidancePanel
                      question={getQuestionTitle(selectedQuestion)}
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
