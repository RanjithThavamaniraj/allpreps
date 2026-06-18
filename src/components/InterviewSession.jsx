import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiCheck,
  FiFlag,
  FiSend,
  FiChevronRight,
  FiAlertCircle,
  FiRefreshCw,
  FiSkipForward,
  FiWifiOff,
} from 'react-icons/fi';
import {
  evaluateAnswer,
  evaluateFollowUp,
  computeQuestionScore,
  getScoreColor,
  getDifficultyLabel,
  getTrackLabel,
  formatElapsedTime,
  saveDraftToStorage,
  loadDraftFromStorage,
  clearDraftFromStorage,
} from '../utils/mockInterviewUtils';

const PHASE = {
  ANSWER: 'answer',
  EVALUATING: 'evaluating',
  FOLLOWUP: 'followup',
  FOLLOWUP_EVALUATING: 'followup_evaluating',
  COMPLETE: 'complete',
};

function ScoreBadge({ score }) {
  const color = getScoreColor(score);
  return (
    <span className="mock-score-badge" style={{ backgroundColor: `${color}22`, color, borderColor: `${color}55` }}>
      {score}/10
    </span>
  );
}

function VerdictBadge({ verdict }) {
  const color = verdict === 'Strong' ? 'var(--success)' : verdict === 'Acceptable' ? 'var(--warning)' : 'var(--danger)';
  return (
    <span className="mock-verdict-badge" style={{ color, borderColor: `${color}55`, backgroundColor: `${color}15` }}>
      {verdict}
    </span>
  );
}

export default function InterviewSession({ settings, questions, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState(PHASE.ANSWER);
  const [answer, setAnswer] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [followUpEvaluation, setFollowUpEvaluation] = useState(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [showReconnect, setShowReconnect] = useState(false);
  const threadRef = useRef(null);
  const draftRestored = useRef(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const avgScore = completedQuestions.length
    ? completedQuestions.reduce((s, q) => s + (q.questionScore ?? 0), 0) / completedQuestions.length
    : 0;
  const currentScorePercent = Math.round(avgScore * 10);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [completedQuestions, phase, evaluation, followUpEvaluation, currentIndex]);

  useEffect(() => {
    if (draftRestored.current) return;
    const draft = loadDraftFromStorage();
    if (draft?.settings?.technology === settings.technology) {
      draftRestored.current = true;
    }
  }, [settings.technology]);

  const persistDraft = useCallback((extra = {}) => {
    saveDraftToStorage({
      settings,
      currentIndex,
      answer,
      followUpAnswer,
      completedQuestions,
      timestamp: Date.now(),
      ...extra,
    });
  }, [settings, currentIndex, answer, followUpAnswer, completedQuestions]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || phase === PHASE.EVALUATING) return;

    setPhase(PHASE.EVALUATING);
    setError(null);
    setErrorType(null);
    setShowReconnect(false);

    try {
      const result = await evaluateAnswer({
        settings,
        question: currentQuestion,
        userAnswer: answer.trim(),
      });
      setEvaluation(result);
      setFollowUpQuestion(result.follow_up_question || '');
      setPhase(PHASE.FOLLOWUP);
      clearDraftFromStorage();
    } catch (err) {
      const isTimeout = err.name === 'AbortError';
      const isNetwork = err.message?.includes('fetch') || err.message?.includes('network') || !navigator.onLine;

      if (isNetwork) {
        persistDraft();
        setShowReconnect(true);
      }

      setError(err.message || 'Evaluation failed');
      setErrorType(isTimeout ? 'timeout' : 'api');
      setPhase(PHASE.ANSWER);
    }
  };

  const handleSubmitFollowUp = async () => {
    if (!followUpAnswer.trim() || phase === PHASE.FOLLOWUP_EVALUATING) return;

    setPhase(PHASE.FOLLOWUP_EVALUATING);
    setError(null);
    setErrorType(null);

    try {
      const result = await evaluateFollowUp({
        settings,
        question: currentQuestion,
        userAnswer: answer.trim(),
        followUpQuestion,
        followUpAnswer: followUpAnswer.trim(),
      });
      setFollowUpEvaluation(result);

      const questionResult = {
        questionId: currentQuestion.questionId,
        questionText: currentQuestion.questionText,
        category: currentQuestion.category,
        userAnswer: answer.trim(),
        evaluation,
        followUpQuestion,
        followUpAnswer: followUpAnswer.trim(),
        followUpEvaluation: result,
        questionScore: computeQuestionScore(evaluation, result),
      };

      setCompletedQuestions(prev => [...prev, questionResult]);
      setPhase(PHASE.COMPLETE);
      clearDraftFromStorage();
    } catch (err) {
      const isTimeout = err.name === 'AbortError';
      setError(err.message || 'Follow-up evaluation failed');
      setErrorType(isTimeout ? 'timeout' : 'api');
      setPhase(PHASE.FOLLOWUP);
    }
  };

  const handleRetry = () => {
    setError(null);
    setErrorType(null);
    if (phase === PHASE.ANSWER || !evaluation) {
      handleSubmitAnswer();
    } else {
      handleSubmitFollowUp();
    }
  };

  const handleSkip = () => {
    const questionResult = {
      questionId: currentQuestion.questionId,
      questionText: currentQuestion.questionText,
      category: currentQuestion.category,
      userAnswer: answer.trim() || '(skipped)',
      evaluation: evaluation || { score: 0, evaluation: 'Skipped', strengths: [], gaps: ['Question skipped'] },
      followUpQuestion: followUpQuestion || '(skipped)',
      followUpAnswer: followUpAnswer.trim() || '(skipped)',
      followUpEvaluation: followUpEvaluation || { score: 0, evaluation: 'Skipped', verdict: 'Weak' },
      questionScore: evaluation && followUpEvaluation
        ? computeQuestionScore(evaluation, followUpEvaluation)
        : 0,
      skipped: true,
    };

    const updated = [...completedQuestions, questionResult];
    setError(null);

    if (currentIndex < totalQuestions - 1) {
      setCompletedQuestions(updated);
      setCurrentIndex(prev => prev + 1);
      setPhase(PHASE.ANSWER);
      setAnswer('');
      setFollowUpAnswer('');
      setEvaluation(null);
      setFollowUpEvaluation(null);
      setFollowUpQuestion('');
    } else {
      onComplete({
        settings,
        questionResults: updated,
        startTime,
        endTime: Date.now(),
      });
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
      setPhase(PHASE.ANSWER);
      setAnswer('');
      setFollowUpAnswer('');
      setEvaluation(null);
      setFollowUpEvaluation(null);
      setFollowUpQuestion('');
      setError(null);
    } else {
      onComplete({
        settings,
        questionResults: completedQuestions,
        startTime,
        endTime: Date.now(),
      });
    }
  };

  const isEvaluating = phase === PHASE.EVALUATING || phase === PHASE.FOLLOWUP_EVALUATING;
  const canSubmitAnswer = phase === PHASE.ANSWER && answer.trim().length > 0 && !isEvaluating;
  const canSubmitFollowUp = phase === PHASE.FOLLOWUP && followUpAnswer.trim().length > 0 && !isEvaluating;

  return (
    <section className="mock-session">
      <div className="mock-session-layout">
        <div className="mock-thread-panel">
          <div className="mock-thread" ref={threadRef}>
            {completedQuestions.map((q, idx) => (
              <div key={`done-${q.questionId}-${idx}`} className="mock-question-block">
                <div className="mock-card mock-question-card">
                  <div className="mock-card-meta">
                    <span className="mock-q-num">Question {idx + 1}</span>
                    <span className="mock-category-tag">{q.category}</span>
                  </div>
                  <p className="mock-question-text">{q.questionText}</p>
                </div>

                <div className="mock-user-bubble">{q.userAnswer}</div>

                <div className="mock-card mock-eval-card">
                  <div className="mock-eval-header">
                    <span>AI Evaluation</span>
                    <ScoreBadge score={q.evaluation?.score ?? 0} />
                  </div>
                  <p>{q.evaluation?.evaluation}</p>
                  {q.evaluation?.strengths?.length > 0 && (
                    <ul className="mock-strengths">
                      {q.evaluation.strengths.map((s, i) => (
                        <li key={i}><FiCheck /> {s}</li>
                      ))}
                    </ul>
                  )}
                  {q.evaluation?.gaps?.length > 0 && (
                    <ul className="mock-gaps">
                      {q.evaluation.gaps.map((g, i) => (
                        <li key={i}><FiFlag /> {g}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mock-card mock-followup-card">
                  <div className="mock-card-meta">
                    <span className="mock-followup-label">Follow-up</span>
                  </div>
                  <p>{q.followUpQuestion}</p>
                </div>

                <div className="mock-user-bubble">{q.followUpAnswer}</div>

                <div className="mock-card mock-eval-card mock-followup-eval">
                  <div className="mock-eval-header">
                    <span>Follow-up Evaluation</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <ScoreBadge score={q.followUpEvaluation?.score ?? 0} />
                      <VerdictBadge verdict={q.followUpEvaluation?.verdict ?? 'Weak'} />
                    </div>
                  </div>
                  <p>{q.followUpEvaluation?.evaluation}</p>
                </div>

                <div className="mock-question-divider">
                  <span>Question {idx + 1} complete — Score: {q.questionScore}/10</span>
                </div>
              </div>
            ))}

            {currentIndex >= completedQuestions.length && (
              <div className="mock-question-block">
                <div className="mock-card mock-question-card">
                  <div className="mock-card-meta">
                    <span className="mock-q-num">Question {currentIndex + 1} of {totalQuestions}</span>
                    <span className="mock-category-tag">{currentQuestion.category}</span>
                  </div>
                  <p className="mock-question-text">{currentQuestion.questionText}</p>
                </div>

                {answer.trim() && phase !== PHASE.ANSWER && (
                  <div className="mock-user-bubble">{answer}</div>
                )}

                {evaluation && (
                  <div className="mock-card mock-eval-card">
                    <div className="mock-eval-header">
                      <span>AI Evaluation</span>
                      <ScoreBadge score={evaluation.score ?? 0} />
                    </div>
                    <p>{evaluation.evaluation}</p>
                    {evaluation.strengths?.length > 0 && (
                      <ul className="mock-strengths">
                        {evaluation.strengths.map((s, i) => (
                          <li key={i}><FiCheck /> {s}</li>
                        ))}
                      </ul>
                    )}
                    {evaluation.gaps?.length > 0 && (
                      <ul className="mock-gaps">
                        {evaluation.gaps.map((g, i) => (
                          <li key={i}><FiFlag /> {g}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {followUpQuestion && (
                  <div className="mock-card mock-followup-card">
                    <div className="mock-card-meta">
                      <span className="mock-followup-label">Follow-up</span>
                    </div>
                    <p>{followUpQuestion}</p>
                  </div>
                )}

                {followUpAnswer.trim() && phase !== PHASE.FOLLOWUP && (
                  <div className="mock-user-bubble">{followUpAnswer}</div>
                )}

                {followUpEvaluation && (
                  <div className="mock-card mock-eval-card mock-followup-eval">
                    <div className="mock-eval-header">
                      <span>Follow-up Evaluation</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <ScoreBadge score={followUpEvaluation.score ?? 0} />
                        <VerdictBadge verdict={followUpEvaluation.verdict ?? 'Weak'} />
                      </div>
                    </div>
                    <p>{followUpEvaluation.evaluation}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mock-input-area">
            {showReconnect && (
              <div className="mock-reconnect-banner">
                <FiWifiOff />
                <span>Connection lost. Your answer was saved locally.</span>
                <button type="button" className="btn btn-sm btn-primary" onClick={handleRetry}>Reconnect & Retry</button>
              </div>
            )}

            {error && (
              <div className="mock-error-banner">
                <FiAlertCircle />
                <span>
                  {errorType === 'timeout'
                    ? 'Evaluation taking longer than expected.'
                    : 'Could not evaluate answer.'}
                </span>
                <div className="mock-error-actions">
                  <button type="button" className="btn btn-sm btn-primary" onClick={handleRetry}>
                    <FiRefreshCw /> Retry
                  </button>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={handleSkip}>
                    <FiSkipForward /> Skip this question
                  </button>
                </div>
              </div>
            )}

            {isEvaluating && (
              <div className="mock-loading">
                <div className="mock-loading-pulse" />
                <p>Evaluating your answer...</p>
                <span className="mock-loading-hint">Usually takes 3–5 seconds</span>
              </div>
            )}

            {phase === PHASE.ANSWER && !isEvaluating && (
              <>
                <textarea
                  className="mock-answer-input"
                  rows={4}
                  placeholder="Type your answer here. Take your time — there's no per-question timer."
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!canSubmitAnswer}
                  onClick={handleSubmitAnswer}
                >
                  <FiSend /> Submit Answer
                </button>
              </>
            )}

            {phase === PHASE.FOLLOWUP && !isEvaluating && (
              <>
                <textarea
                  className="mock-answer-input"
                  rows={3}
                  placeholder="Answer the follow-up question..."
                  value={followUpAnswer}
                  onChange={e => setFollowUpAnswer(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!canSubmitFollowUp}
                  onClick={handleSubmitFollowUp}
                >
                  <FiSend /> Submit Answer
                </button>
              </>
            )}

            {phase === PHASE.COMPLETE && (
              <button type="button" className="btn btn-primary btn-lg" onClick={handleNextQuestion}>
                {currentIndex < totalQuestions - 1 ? (
                  <>Next Question <FiChevronRight /></>
                ) : (
                  <>View Final Report <FiChevronRight /></>
                )}
              </button>
            )}
          </div>
        </div>

        <aside className="mock-stats-sidebar">
          <div className="mock-stat-item">
            <span className="mock-stat-label">Question</span>
            <span className="mock-stat-value">{currentIndex + 1} of {totalQuestions}</span>
          </div>
          <div className="mock-stat-item">
            <span className="mock-stat-label">Time Elapsed</span>
            <span className="mock-stat-value">{formatElapsedTime(elapsed)}</span>
          </div>
          <div className="mock-stat-item">
            <span className="mock-stat-label">Current Score</span>
            <span className="mock-stat-value" style={{ color: completedQuestions.length ? getScoreColor(Math.round(avgScore)) : 'var(--text-primary)' }}>
              {completedQuestions.length ? `${currentScorePercent}%` : '—'}
            </span>
          </div>
          <div className="mock-stat-item">
            <span className="mock-stat-label">Difficulty</span>
            <span className="mock-stat-value">{getDifficultyLabel(settings.difficulty)}</span>
          </div>
          <div className="mock-stat-item mock-stat-track">
            <span className="mock-stat-label">Track</span>
            <span className="mock-stat-value">{getTrackLabel(settings.technology)}</span>
          </div>
        </aside>

        <div className="mock-stats-strip">
          <span>Q {currentIndex + 1}/{totalQuestions}</span>
          <span>Score: {completedQuestions.length ? `${currentScorePercent}%` : '—'}</span>
        </div>
      </div>
    </section>
  );
}
