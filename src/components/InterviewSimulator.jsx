import { useState, useEffect } from 'react';
import { MOCK_INTERVIEW_QUESTIONS } from '../data/new_questions/mock_interview';
import { FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import {
  AppIcon,
  AlertTriangle,
  BookOpen,
  Check,
  ClipboardList,
  ThumbsUp,
  Timer,
  Trophy,
  X,
} from './icons';

function FeatureRow({ icon, title, children, highlight = false }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
        ...(highlight
          ? {
              border: '1px dashed rgba(245, 158, 11, 0.25)',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(245, 158, 11, 0.04)',
            }
          : {}),
      }}
    >
      <span style={{ marginTop: '2px', color: highlight ? 'var(--accent)' : 'var(--primary-hover)' }}>
        <AppIcon icon={icon} size="2xl" />
      </span>
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: '700', color: highlight ? 'var(--accent)' : 'var(--text-primary)', marginBottom: '4px' }}>
          {title}
        </h4>
        {children}
      </div>
    </div>
  );
}

function FeedbackLabel({ percentage }) {
  if (percentage >= 90) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <AppIcon icon={Trophy} size="sm" /> Expert Level!
      </span>
    );
  }
  if (percentage >= 70) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <AppIcon icon={ThumbsUp} size="sm" /> Well Prepared!
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <AppIcon icon={BookOpen} size="sm" /> Needs Practice!
    </span>
  );
}

export default function InterviewSimulator() {
  const [questions, setQuestions] = useState(() => {
    const shuffled = [...MOCK_INTERVIEW_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 100);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Timer & Scoring States
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(4500); // 1hr 15mins = 75 mins = 4500s
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [pauseCount, setPauseCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!isStarted || isFinished || !isTimerActive) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStarted, isFinished, isTimerActive]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    if (isTimerActive) {
      if (pauseCount < 2) {
        setIsTimerActive(false);
        setPauseCount(prev => prev + 1);
      }
    } else {
      setIsTimerActive(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
        setSelectedOption(null);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setShowAnswer(false);
        setSelectedOption(null);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleShuffle = (resetToIntro = false) => {
    setIsAnimating(true);
    setTimeout(() => {
      const shuffled = [...MOCK_INTERVIEW_QUESTIONS].sort(() => Math.random() - 0.5);
      setQuestions(shuffled.slice(0, 100));
      setCurrentIndex(0);
      setShowAnswer(false);
      setSelectedOption(null);
      setTimeLeft(4500);
      setScore(0);
      setPauseCount(0);
      setIsFinished(false);
      if (resetToIntro) {
        setIsStarted(false);
        setIsTimerActive(false);
      } else {
        setIsStarted(true);
        setIsTimerActive(true);
      }
      setIsAnimating(false);
    }, 300);
  };

  if (questions.length === 0) return null;

  if (!isStarted) {
    return (
      <section style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <div className="card" style={{ 
          backgroundColor: 'var(--bg-surface)', 
          border: '1px solid var(--border)', 
          padding: '40px', 
          borderRadius: '24px', 
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.5s ease',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Ready to Start?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6', fontSize: '15px' }}>
            Test your knowledge under real-world interview conditions. Review your technical preparation with 100 questions.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px', textAlign: 'left' }}>
            <FeatureRow icon={ClipboardList} title="100 Questions">
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>A randomized set of multiple-choice questions covering full-stack concepts.</p>
            </FeatureRow>

            <FeatureRow icon={Timer} title="1 Hour 15 Minutes">
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>A steady countdown timer to simulate real interview pressure.</p>
            </FeatureRow>

            <FeatureRow icon={AlertTriangle} title="Limited Pauses" highlight>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>You can pause the timer <strong>only twice</strong> during the entire test.</p>
            </FeatureRow>
          </div>

          <button 
            onClick={() => {
              setIsStarted(true);
              setIsTimerActive(true);
            }} 
            className="btn btn-primary w-full" 
            style={{ padding: '16px', fontSize: '16px', fontWeight: '700', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            Start Mock Interview
          </button>
        </div>
      </section>
    );
  }

  if (isFinished) {
    const timeSpent = 4500 - timeLeft;
    const minutesSpent = Math.floor(timeSpent / 60);
    const secondsSpent = timeSpent % 60;
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <section style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <div className="card" style={{ 
          backgroundColor: 'var(--bg-surface)', 
          border: '1px solid var(--border)', 
          padding: '40px', 
          borderRadius: '24px', 
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          animation: 'fadeIn 0.5s ease'
        }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
            Interview Complete!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Here is a breakdown of your performance on these {questions.length} questions.
          </p>

          {/* Score Circle */}
          <div style={{
            position: 'relative',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: `conic-gradient(var(--primary-hover, #10b981) ${percentage}%, var(--bg-base) ${percentage}%)`,
            margin: '0 auto 32px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {score}/{questions.length}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                {percentage}% Correct
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
            <div style={{ backgroundColor: 'var(--bg-base)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                Time Taken
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {minutesSpent}m {secondsSpent}s
              </div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-base)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                Feedback
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: percentage >= 70 ? '#10b981' : '#f59e0b' }}>
                <FeedbackLabel percentage={percentage} />
              </div>
            </div>
          </div>

          <button onClick={() => handleShuffle(true)} className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <FiRefreshCw /> Retake Interview
          </button>
        </div>
      </section>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <section style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {/* Simulator Controls & Progress */}
      <div style={{ marginBottom: '40px', backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Interview Progress
            </span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>

          {/* Timer Display */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            gap: '6px', 
            backgroundColor: 'var(--bg-base)', 
            padding: '10px 16px', 
            borderRadius: '12px', 
            border: '1px solid var(--border)',
            minWidth: '220px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'center' }}>
              <span style={{ 
                fontFamily: 'monospace', 
                fontSize: '18px', 
                fontWeight: '700', 
                color: timeLeft < 300 ? '#ef4444' : 'var(--text-primary)',
                animation: timeLeft < 300 ? 'pulseRed 1s infinite alternate' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <AppIcon icon={Timer} size="sm" />
                {formatTime(timeLeft)}
              </span>
              <button 
                onClick={handleToggleTimer} 
                disabled={pauseCount >= 2 && isTimerActive}
                style={{
                  background: 'none',
                  border: 'none',
                  color: (pauseCount >= 2 && isTimerActive) ? 'var(--text-muted)' : 'var(--text-secondary)',
                  cursor: (pauseCount >= 2 && isTimerActive) ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: (pauseCount >= 2 && isTimerActive) ? 0.5 : 1
                }}
                title={isTimerActive ? "Pause Timer" : "Resume Timer"}
              >
                {isTimerActive ? 'Pause' : 'Resume'}
              </button>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'center', display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
              <AppIcon icon={AlertTriangle} size="xs" />
              Max 2 pauses allowed ({pauseCount}/2 used)
            </span>
          </div>

          <button onClick={() => handleShuffle(false)} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiRefreshCw /> Shuffle Questions
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-base)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: 'var(--primary-hover)', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Question Card */}
      <div 
        className="card"
        style={{ 
          minHeight: '400px', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          transition: 'all 0.3s ease',
          opacity: isAnimating ? 0 : 1,
          transform: isAnimating ? 'translateY(10px)' : 'translateY(0)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <span className="badge badge-primary" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: 'var(--primary-hover)', fontSize: '12px', fontWeight: '600' }}>
            {currentQ.category}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: #{currentQ.id}</span>
        </div>

        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.4', marginBottom: '24px' }}>
            {currentQ.title}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {currentQ.options && currentQ.options.map((option, idx) => {
              let btnStyle = {
                textAlign: 'left',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
                fontSize: '15px',
                cursor: selectedOption === null ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                lineHeight: '1.5',
                width: '100%',
                display: 'block'
              };

              if (selectedOption !== null) {
                if (idx === currentQ.correctOptionIndex) {
                  btnStyle.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                  btnStyle.borderColor = '#10b981';
                } else if (idx === selectedOption) {
                  btnStyle.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  btnStyle.borderColor = '#ef4444';
                } else {
                  btnStyle.opacity = 0.5;
                }
              }

              return (
                <button 
                  key={idx}
                  style={btnStyle}
                  onClick={() => {
                    if (selectedOption === null) {
                      setSelectedOption(idx);
                      setShowAnswer(true);
                      if (idx === currentQ.correctOptionIndex) {
                        setScore(prev => prev + 1);
                      }
                    }
                  }}
                  className={selectedOption === null ? 'option-btn-hover' : ''}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <span style={{ flexGrow: 1 }}>{option}</span>
                    {selectedOption !== null && idx === currentQ.correctOptionIndex && (
                      <AppIcon icon={Check} size="lg" style={{ color: '#10b981' }} />
                    )}
                    {selectedOption !== null && idx === selectedOption && idx !== currentQ.correctOptionIndex && (
                      <AppIcon icon={X} size="lg" style={{ color: '#ef4444' }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showAnswer && (
            <div style={{ animation: 'fadeIn 0.5s ease', marginTop: '16px' }}>
              <h3 style={{ 
                fontSize: '14px', 
                color: selectedOption === currentQ.correctOptionIndex ? '#10b981' : '#ef4444', 
                textTransform: 'uppercase', 
                letterSpacing: '1px', 
                marginBottom: '12px',
                fontWeight: '700'
              }}>
                {selectedOption === currentQ.correctOptionIndex ? 'Correct!' : 'Incorrect'}
              </h3>
              <div style={{ backgroundColor: 'var(--bg-base)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Correct Answer
                    </span>
                    <p style={{ whiteSpace: 'pre-wrap', color: '#10b981', fontSize: '15px', fontWeight: '500', lineHeight: '1.5', margin: '4px 0 0 0' }}>
                      {currentQ.answer}
                    </p>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Explanation
                    </span>
                    <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', fontSize: '15px', lineHeight: '1.7', margin: '4px 0 0 0' }}>
                      {currentQ.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: currentIndex === 0 ? 0.5 : 1 }}
          >
            <FiChevronLeft size={20} /> Previous
          </button>

          <button 
            onClick={() => {
              if (currentIndex === questions.length - 1) {
                setIsFinished(true);
              } else {
                handleNext();
              }
            }} 
            disabled={selectedOption === null}
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: selectedOption === null ? 0.5 : 1 }}
          >
            {currentIndex === questions.length - 1 ? 'Finish & View Results' : 'Next'} <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRed {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0.7; transform: scale(0.98); }
        }
        .option-btn-hover:hover {
          border-color: var(--primary) !important;
          background-color: var(--bg-surface) !important;
        }
      `}</style>
    </section>
  );
}
