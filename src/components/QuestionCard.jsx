import { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiCheck } from 'react-icons/fi';
import AIGuidancePanel from './AIGuidancePanel';
import StructuredAnswer from './StructuredAnswer';
import FrequencyBadge from './FrequencyBadge';
import {
  DIFFICULTY_LABELS,
  extractInterviewPreview,
  formatCategoryLabel,
  getQuestionTitle,
} from '../lib/questionMeta';
import { trackFounderMetric, FOUNDER_METRICS } from '../lib/founderAnalytics';

export default function QuestionCard({ q, idx, completed, onToggleCompleted }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTab, setCurrentTab] = useState('details');

  const title = getQuestionTitle(q);
  const answerText = q.answer || q.details || '';
  const commandText = q.command || q.solution || '';
  const categoryLabel = formatCategoryLabel(q.category || q.tags?.[0]);
  const preview = extractInterviewPreview(answerText);
  const difficultyLabel = DIFFICULTY_LABELS[q.difficulty] || q.difficulty;

  useEffect(() => {
    if (!isExpanded) return;
    trackFounderMetric(FOUNDER_METRICS.QUESTIONS_VIEWED, {
      metadata: { questionId: q.rawId || q.id, category: q.category || q.tags?.[0] },
    });
  }, [isExpanded, q.rawId, q.id, q.category, q.tags]);

  return (
    <div
      className={`q-card ${isExpanded ? 'q-card-expanded' : ''} ${completed ? 'q-card-done' : ''}`}
    >
      <div className="q-summary-row" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="q-card-main">
          <div className="q-card-head">
            {onToggleCompleted && (
              <button
                type="button"
                className={`q-complete-btn${completed ? ' q-complete-btn-done' : ''}`}
                aria-label={completed ? 'Mark as incomplete' : 'Mark as complete'}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompleted(q.rawId || q.id, e);
                }}
              >
                {completed && <FiCheck size={11} />}
              </button>
            )}
            {idx !== undefined && (
              <span className="q-number">Q{String(idx + 1).padStart(2, '0')}</span>
            )}
            <h3 className={`q-title${completed ? ' q-title-done' : ''}`}>{title}</h3>
            {completed && <span className="q-status-badge q-status-done">Completed</span>}
            <span className="q-expand-icon" aria-hidden="true">
              {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </span>
          </div>

          <div className="q-card-meta">
            <span className="q-cat-badge">{categoryLabel}</span>
            <span className={`badge badge-${q.difficulty}`} title={difficultyLabel}>
              {difficultyLabel}
            </span>
            {q.frequency && (
              <span className="q-freq-text">{q.frequency}</span>
            )}
            <FrequencyBadge question={q} />
            {!completed && onToggleCompleted && (
              <span className="q-status-badge q-status-pending">Not started</span>
            )}
          </div>

          {!isExpanded && preview && (
            <p className="q-card-preview">{preview}</p>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="q-expanded-body split-view">
          <div className="q-standard-content">
            <div className="q-details-tabs">
              <button
                type="button"
                onClick={() => setCurrentTab('details')}
                className={`q-details-tab-btn ${currentTab === 'details' ? 'q-details-tab-active' : ''}`}
              >
                Detailed Answer
              </button>
              {commandText && (
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
                <StructuredAnswer text={answerText} />
              </div>
            )}

            {currentTab === 'solution' && commandText && (
              <div className="q-tab-panel">
                <pre className="code-pre-box">
                  <code>{commandText}</code>
                </pre>
              </div>
            )}

            {q.tags && (
              <div className="q-tag-row">
                {q.tags.map(tag => (
                  <span key={tag} className="q-tech-tag q-tag-muted">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="q-ai-sidebar">
            <AIGuidancePanel question={title} tags={q.tags || [q.category]} />
          </div>
        </div>
      )}
    </div>
  );
}
