import { useState, useEffect, useRef } from 'react';
import {
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiFlag,
  FiRefreshCw,
  FiBookOpen,
  FiShare2,
  FiExternalLink,
  FiTrendingUp,
} from 'react-icons/fi';
import {
  computeOverallScore,
  getOverallScoreColor,
  getVerdictLabel,
  getTrackLabel,
  getDifficultyLabel,
  formatElapsedTime,
  aggregateTopItems,
  getRecommendedStudyAreas,
  generateShareCardImage,
} from '../utils/mockInterviewUtils';
import { saveCompletedInterview, getUserData } from '../lib/readinessStorage';
import { calculateReadinessScore, getScoreColor, getScoreBand } from '../lib/calculateReadiness';

function QuestionAccordion({ result, index }) {
  const [expanded, setExpanded] = useState(false);
  const [showFullAnswer, setShowFullAnswer] = useState(false);
  const [showFullFollowUp, setShowFullFollowUp] = useState(false);

  const truncate = (text, len = 150) => {
    if (!text || text.length <= len) return text;
    return text.slice(0, len) + '...';
  };

  return (
    <div className="mock-accordion-item">
      <button type="button" className="mock-accordion-header" onClick={() => setExpanded(!expanded)}>
        <div className="mock-accordion-title">
          <span className="mock-accordion-num">Q{index + 1}</span>
          <span className="mock-accordion-cat">{result.category}</span>
          <span className="mock-accordion-score" style={{ color: result.questionScore >= 8 ? 'var(--success)' : result.questionScore >= 5 ? 'var(--warning)' : 'var(--danger)' }}>
            {result.questionScore}/10
          </span>
        </div>
        {expanded ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {expanded && (
        <div className="mock-accordion-body">
          <div className="mock-accordion-section">
            <h4>Question</h4>
            <p>{result.questionText}</p>
          </div>
          <div className="mock-accordion-section">
            <h4>Your Answer</h4>
            <p>
              {showFullAnswer ? result.userAnswer : truncate(result.userAnswer)}
              {result.userAnswer?.length > 150 && (
                <button type="button" className="mock-expand-btn" onClick={() => setShowFullAnswer(!showFullAnswer)}>
                  {showFullAnswer ? 'Show less' : 'Show more'}
                </button>
              )}
            </p>
          </div>
          <div className="mock-accordion-section">
            <h4>AI Evaluation</h4>
            <p>{result.evaluation?.evaluation}</p>
            {result.evaluation?.strengths?.length > 0 && (
              <ul className="mock-strengths">
                {result.evaluation.strengths.map((s, i) => <li key={i}><FiCheck /> {s}</li>)}
              </ul>
            )}
            {result.evaluation?.gaps?.length > 0 && (
              <ul className="mock-gaps">
                {result.evaluation.gaps.map((g, i) => <li key={i}><FiFlag /> {g}</li>)}
              </ul>
            )}
          </div>
          <div className="mock-accordion-section">
            <h4>Follow-up Question</h4>
            <p>{result.followUpQuestion}</p>
          </div>
          <div className="mock-accordion-section">
            <h4>Follow-up Answer</h4>
            <p>
              {showFullFollowUp ? result.followUpAnswer : truncate(result.followUpAnswer)}
              {result.followUpAnswer?.length > 150 && (
                <button type="button" className="mock-expand-btn" onClick={() => setShowFullFollowUp(!showFullFollowUp)}>
                  {showFullFollowUp ? 'Show less' : 'Show more'}
                </button>
              )}
            </p>
          </div>
          <div className="mock-accordion-section">
            <h4>Combined Score</h4>
            <p className="mock-combined-score">{result.questionScore} / 10</p>
          </div>
        </div>
      )}
    </div>
  );
}

function AnimatedReadinessScore({ before, after }) {
  const [display, setDisplay] = useState(before);
  const color = getScoreColor(after);

  useEffect(() => {
    if (before === after) {
      setDisplay(after);
      return;
    }
    let frame;
    const start = performance.now();
    const duration = 1000;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(before + (after - before) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [before, after]);

  return (
    <div className="readiness-update-card">
      <h3><FiTrendingUp /> Updated Readiness Score</h3>
      <div className="readiness-update-scores">
        <div className="readiness-update-before">
          <span className="readiness-update-label">Before</span>
          <span>{before}%</span>
        </div>
        <span className="readiness-update-arrow">→</span>
        <div className="readiness-update-after" style={{ color }}>
          <span className="readiness-update-label">After</span>
          <span className="readiness-update-value">{display}%</span>
        </div>
      </div>
      <p className="readiness-update-band" style={{ color: getScoreColor(display) }}>
        {getScoreBand(display)}
      </p>
    </div>
  );
}

export default function FinalReport({ session, onRetake }) {
  const { settings, questionResults, startTime, endTime } = session;
  const savedRef = useRef(false);
  const [readinessBefore, setReadinessBefore] = useState(null);
  const [readinessAfter, setReadinessAfter] = useState(null);

  const overallPercent = computeOverallScore(questionResults);
  const scoreColor = getOverallScoreColor(overallPercent);
  const verdict = getVerdictLabel(overallPercent);
  const elapsed = endTime - startTime;
  const dateStr = new Date(endTime).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const topStrengths = aggregateTopItems(questionResults, 'strengths', 3);
  const topGaps = aggregateTopItems(questionResults, 'gaps', 3);
  const studyAreas = getRecommendedStudyAreas(topGaps, settings.technology, 3);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    const tech = settings.technology;
    const beforeData = getUserData();
    const before = calculateReadinessScore(tech, beforeData);
    setReadinessBefore(before);

    saveCompletedInterview({
      id: crypto.randomUUID(),
      technology: tech,
      level: settings.difficulty,
      date: new Date(endTime).toISOString(),
      totalScore: overallPercent,
      questionCount: questionResults.length,
      strongAreas: topStrengths,
      weakAreas: topGaps,
      questions: questionResults.map(q => ({
        questionId: q.questionId,
        category: q.category,
        score: q.evaluation?.score ?? 0,
        followUpScore: q.followUpEvaluation?.score ?? 0,
      })),
    });

    const afterData = getUserData();
    const after = calculateReadinessScore(tech, afterData);
    setReadinessAfter(after);
  }, [settings, questionResults, endTime, overallPercent, topStrengths, topGaps]);

  const handleShare = async () => {
    const dataUrl = generateShareCardImage({
      score: overallPercent,
      verdict,
      technology: settings.technology,
      date: dateStr,
    });

    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'allpreps-interview-result.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'AllPreps Mock Interview Result',
          text: `Scored ${overallPercent}% — ${verdict}`,
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'allpreps-interview-result.png';
        link.click();
      }
    } catch {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'allpreps-interview-result.png';
      link.click();
    }
  };

  const circumference = 2 * Math.PI * 70;
  const strokeOffset = circumference - (overallPercent / 100) * circumference;

  return (
    <section className="mock-report container" style={{ padding: '40px 24px 80px' }}>
      <div className="mock-report-header">
        <h2>Interview Complete</h2>
        <p className="mock-report-meta">
          {getTrackLabel(settings.technology)} · {getDifficultyLabel(settings.difficulty)} · {dateStr}
        </p>
        <p className="mock-report-time">Total time: {formatElapsedTime(elapsed)}</p>
      </div>

      <div className="mock-report-score-section">
        <div className="mock-score-circle-wrap">
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
            <circle
              cx="90" cy="90" r="70"
              fill="none"
              stroke={scoreColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              transform="rotate(-90 90 90)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="mock-score-circle-text">
            <span className="mock-score-percent" style={{ color: scoreColor }}>{overallPercent}%</span>
            <span className="mock-score-label">Overall</span>
          </div>
        </div>
        <p className="mock-verdict-label" style={{ color: scoreColor }}>{verdict}</p>
      </div>

      {readinessBefore !== null && readinessAfter !== null && (
        <AnimatedReadinessScore before={readinessBefore} after={readinessAfter} />
      )}

      <div className="mock-report-section">
        <h3>Per-Question Breakdown</h3>
        <div className="mock-accordion">
          {questionResults.map((result, i) => (
            <QuestionAccordion key={`${result.questionId}-${i}`} result={result} index={i} />
          ))}
        </div>
      </div>

      <div className="mock-report-grid">
        <div className="mock-report-card mock-strengths-card">
          <h3><FiCheck /> Strengths Summary</h3>
          {topStrengths.length > 0 ? (
            <ul>
              {topStrengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          ) : (
            <p className="mock-empty-note">Complete more questions to identify patterns.</p>
          )}
        </div>

        <div className="mock-report-card mock-gaps-card">
          <h3><FiFlag /> Gaps Summary</h3>
          {topGaps.length > 0 ? (
            <ul>
              {topGaps.map((g, i) => <li key={i}>{g}</li>)}
            </ul>
          ) : (
            <p className="mock-empty-note">No significant gaps identified.</p>
          )}
        </div>
      </div>

      <div className="mock-report-section">
        <h3><FiBookOpen /> Recommended Study Areas</h3>
        <div className="mock-study-areas">
          {studyAreas.map((area, i) => (
            <a key={i} href={area.link} className="mock-study-area-card">
              <span className="mock-study-topic">{area.topic}</span>
              <span className="mock-study-question">{area.question}</span>
              <FiExternalLink className="mock-study-link-icon" />
            </a>
          ))}
        </div>
      </div>

      <div className="mock-report-actions">
        <button type="button" className="btn btn-primary btn-lg" onClick={onRetake}>
          <FiRefreshCw /> Retake This Interview
        </button>
        <button type="button" className="btn btn-secondary btn-lg" onClick={() => {
          const gap = topGaps[0];
          window.location.href = gap
            ? `/interview-questions?q=${encodeURIComponent(gap)}`
            : '/roadmaps';
        }}>
          <FiBookOpen /> Study Weak Areas
        </button>
        <a href="/readiness" className="btn btn-secondary btn-lg">
          <FiTrendingUp /> View Readiness
        </a>
        <button type="button" className="btn btn-secondary btn-lg" onClick={handleShare}>
          <FiShare2 /> Share Result
        </button>
      </div>
    </section>
  );
}
