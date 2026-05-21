import { useState } from 'react';
import { MOCK_INTERVIEW_QUESTIONS } from '../data/new_questions/mock_interview';
import { FiChevronLeft, FiChevronRight, FiRefreshCw, FiEye } from 'react-icons/fi';

export default function InterviewSimulator() {
  const [questions, setQuestions] = useState(() => [...MOCK_INTERVIEW_QUESTIONS]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
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
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleShuffle = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setCurrentIndex(0);
      setShowAnswer(false);
      setIsAnimating(false);
    }, 300);
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <section style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      {/* Simulator Controls & Progress */}
      <div style={{ marginBottom: '40px', backgroundColor: 'var(--bg-surface)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Interview Progress
            </span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>
          <button onClick={handleShuffle} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <span className="badge badge-primary" style={{ backgroundColor: 'rgba(37,99,235,0.15)', color: 'var(--primary-hover)', fontSize: '12px', fontWeight: '600' }}>
            {currentQ.category}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: #{currentQ.id}</span>
        </div>

        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.4', marginBottom: '24px' }}>
            {currentQ.title}
          </h2>

          {!showAnswer ? (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <button onClick={() => setShowAnswer(true)} className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <FiEye size={18} /> Reveal Answer
              </button>
            </div>
          ) : (
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Reference Answer</h3>
              <div style={{ backgroundColor: 'var(--bg-base)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                  {currentQ.answer}
                </p>
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
            onClick={handleNext} 
            disabled={currentIndex === questions.length - 1}
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: currentIndex === questions.length - 1 ? 0.5 : 1 }}
          >
            Next <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
