import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCheck } from 'react-icons/fi';
import AIGuidancePanel from './AIGuidancePanel';

export default function QuestionCard({ q, idx, completed, onToggleCompleted }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTab, setCurrentTab] = useState('details');

  return (
    <div
      className={`q-card ${isExpanded ? 'tech-grid-card-active' : ''}`}
      style={{
        borderColor: completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
        boxShadow: completed ? '0 0 12px rgba(16, 185, 129, 0.03)' : 'none'
      }}
    >
      <div className="q-summary-row" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="q-title-side" style={{ display: 'flex', alignItems: 'center' }}>
          {onToggleCompleted && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompleted(q.rawId || q.id);
              }}
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
          )}
          {idx !== undefined && <span className="q-number" style={{ marginRight: '8px' }}>#{String(idx + 1).padStart(2, '0')}</span>}
          <h3 className="q-title" style={{ 
            textDecoration: completed ? 'line-through' : 'none', 
            color: completed ? 'var(--text-secondary)' : 'var(--text-primary)',
            margin: 0
          }}>{q.question}</h3>
        </div>

        <div className="q-meta-side">
          {q.category && <span className="q-row-tag" style={{marginRight: '12px'}}>{q.category}</span>}
          <span className={`badge badge-${q.difficulty}`}>{q.difficulty}</span>
          {isExpanded ? <FiChevronUp className="chevron" /> : <FiChevronDown className="chevron" />}
        </div>
      </div>

      {isExpanded && (
        <div className="q-expanded-body split-view">
          {/* Left Column: Standard Content */}
          <div className="q-standard-content">
            {q.description && <p className="q-desc-text">{q.description}</p>}

            <div className="q-details-tabs">
              <button
                onClick={() => setCurrentTab('details')}
                className={`q-details-tab-btn ${currentTab === 'details' ? 'q-details-tab-active' : ''}`}
              >
                Detailed Answer
              </button>
              {q.command && (
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
                <p className="q-desc-text" style={{ whiteSpace: 'pre-wrap' }}>
                  {q.answer}
                </p>
              </div>
            )}

            {currentTab === 'solution' && q.command && (
              <div className="q-tab-panel">
                <pre className="code-pre-box">
                  <code>{q.command}</code>
                </pre>
              </div>
            )}

            {/* Tags */}
            {q.tags && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                {q.tags.map(tag => (
                  <span key={tag} className="q-tech-tag" style={{ color: 'var(--text-secondary)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Right Column: AI Guidance Panel */}
          <div className="q-ai-sidebar">
            <AIGuidancePanel question={q.question} tags={q.tags || [q.category]} />
          </div>
        </div>
      )}
    </div>
  );
}
