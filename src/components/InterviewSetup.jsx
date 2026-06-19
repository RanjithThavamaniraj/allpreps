import { useState } from 'react';
import { FiPlay, FiCpu, FiBarChart2, FiHash, FiLayers, FiInfo } from 'react-icons/fi';
import {
  TECHNOLOGY_TRACKS,
  DIFFICULTY_LEVELS,
  QUESTION_COUNTS,
  INTERVIEW_STYLES,
  selectInterviewQuestions,
} from '../utils/mockInterviewUtils';
import { PRODUCTION_SCENARIOS_URL } from '../utils/productionScenarios';
import { checkInterviewLimit, getRemainingInterviews, formatNextAvailable } from '../lib/interviewLimits';
import { isProUser } from '../lib/subscriptionStorage';
import { trackEvent } from '../lib/analytics';
import UpgradeModal from './UpgradeModal';
import ProInterestModal from './ProInterestModal';
import { trackLabelToProInterest } from '../lib/proInterestTracks';

export default function InterviewSetup({ onStart }) {
  const initialTech = (() => {
    const params = new URLSearchParams(window.location.search);
    const tech = params.get('tech');
    if (tech && TECHNOLOGY_TRACKS.some(t => t.id === tech)) return tech;
    return 'oracle dba';
  })();

  const [technology, setTechnology] = useState(initialTech);
  const [difficulty, setDifficulty] = useState('mid');
  const [questionCount, setQuestionCount] = useState(10);
  const [interviewStyle, setInterviewStyle] = useState('mixed');
  const [error, setError] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showProInterest, setShowProInterest] = useState(false);

  const pro = isProUser();
  const remaining = getRemainingInterviews();
  const limitInfo = checkInterviewLimit();

  const handleStart = () => {
    const limit = checkInterviewLimit();
    if (!limit.allowed) {
      trackEvent('weekly_limit_hit');
      setShowUpgrade(true);
      return;
    }

    const questions = selectInterviewQuestions({ technology, difficulty, count: questionCount });
    if (questions.length === 0) {
      setError('No questions found for this track and difficulty. Try a different combination.');
      return;
    }

    trackEvent('interview_started');

    const settings = {
      technology,
      difficulty,
      questionCount: questions.length,
      interviewStyle,
    };

    onStart({ settings, questions });
  };

  const handleUpgrade = () => {
    setShowUpgrade(false);
    setShowProInterest(true);
  };

  return (
    <>
      <section className="mock-setup container" style={{ padding: '40px 24px 80px' }}>
        <div className="card mock-setup-card">
          <div className="mock-setup-header">
            <h2>Configure Your Interview</h2>
            <p>Set your track, difficulty, and style. The AI interviewer will evaluate your answers in real time.</p>
          </div>

          <div className="mock-setup-plan-banner">
            <FiInfo />
            {pro ? (
              <span>Pro plan — unlimited interviews enabled</span>
            ) : remaining > 0 ? (
              <span>{remaining} free interview{remaining !== 1 ? 's' : ''} remaining this week</span>
            ) : limitInfo.nextAvailable ? (
              <span>Next free interview: {formatNextAvailable(limitInfo.nextAvailable)}</span>
            ) : (
              <span>1 free interview every 7 days on the Free plan</span>
            )}
            {!pro && (
              <a href="/pricing" className="mock-setup-plan-link">Upgrade</a>
            )}
          </div>

          <div className="mock-setup-grid">
            <div className="mock-setup-field">
              <label><FiCpu /> Technology Track</label>
              <select value={technology} onChange={e => setTechnology(e.target.value)}>
                {TECHNOLOGY_TRACKS.map(track => (
                  <option key={track.id} value={track.id}>{track.label}</option>
                ))}
              </select>
            </div>

            <div className="mock-setup-field">
              <label><FiBarChart2 /> Difficulty</label>
              <div className="mock-setup-options">
                {DIFFICULTY_LEVELS.map(level => (
                  <button
                    key={level.id}
                    type="button"
                    className={`mock-setup-option ${difficulty === level.id ? 'active' : ''}`}
                    onClick={() => setDifficulty(level.id)}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mock-setup-field">
              <label><FiHash /> Number of Questions</label>
              <div className="mock-setup-options">
                {QUESTION_COUNTS.map(count => (
                  <button
                    key={count}
                    type="button"
                    className={`mock-setup-option ${questionCount === count ? 'active' : ''}`}
                    onClick={() => setQuestionCount(count)}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div className="mock-setup-field">
              <label><FiLayers /> Interview Style</label>
              <div className="mock-setup-options mock-setup-options-wrap">
                {INTERVIEW_STYLES.map(style => (
                  <button
                    key={style.id}
                    type="button"
                    className={`mock-setup-option ${interviewStyle === style.id ? 'active' : ''}`}
                    onClick={() => setInterviewStyle(style.id)}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mock-error-banner">{error}</div>
          )}

          <button type="button" className="btn btn-primary btn-lg mock-start-btn" onClick={handleStart}>
            <FiPlay /> Start Interview
          </button>

          <p className="mock-setup-crosslink">
            Want scenario-based practice instead?{' '}
            <a href={PRODUCTION_SCENARIOS_URL}>→ Try Production Scenarios</a>
          </p>
        </div>
      </section>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgrade={handleUpgrade}
      />

      <ProInterestModal
        open={showProInterest}
        onClose={() => setShowProInterest(false)}
        defaultTrack={trackLabelToProInterest(TECHNOLOGY_TRACKS.find(t => t.id === technology)?.label)}
      />
    </>
  );
}
