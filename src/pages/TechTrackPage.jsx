import { useState, useMemo, useEffect } from 'react';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import { getQuestionsByTech } from '../data/questionLoader';
import Navbar from '../components/Navbar';
import QuestionCard from '../components/QuestionCard';
import Footer from '../components/Footer';
import ProductionScenariosCallout from '../components/ProductionScenariosCallout';
import ReadinessTechStrip from '../components/ReadinessScore/ReadinessTechStrip';
import { getGlobalCompletedIds, subscribeToProgress, toggleTrackQuestion } from '../lib/trackProgress';

export default function TechTrackPage({
  trackId,
  idPrefix,
  title,
  description,
  icon,
  iconStyle = {},
  searchPlaceholder,
  stats = [],
  emptyTitle,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [completedIds, setCompletedIds] = useState(() => getGlobalCompletedIds());
  const [difficultyFilter, setDifficultyFilter] = useState('all');

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

  const toggleCompleted = (rawId, e) => {
    e.stopPropagation();
    toggleTrackQuestion(trackId, rawId);
    setCompletedIds(getGlobalCompletedIds());
  };

  const trackQuestions = useMemo(() => {
    return getQuestionsByTech(trackId).map(q => ({
      id: `${idPrefix}-${q.id}`,
      rawId: q.id,
      title: q.question,
      difficulty: q.difficulty,
      description: q.question,
      details: q.answer,
      solution: q.command,
      tags: q.tags || [trackId],
    }));
  }, [trackId, idPrefix]);

  const filteredQuestions = useMemo(() => {
    return trackQuestions.filter((q) => {
      const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      const matchesSearch =
        !searchQuery ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesDifficulty && matchesSearch;
    });
  }, [trackQuestions, searchQuery, difficultyFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flexGrow: 1, paddingBottom: '80px' }}>
        <section className="hero-bg" style={{ padding: '60px 0 40px', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ textAlign: 'left' }}>
            <a href="/" className="btn btn-secondary btn-sm" style={{ marginBottom: '24px' }}>
              <FiArrowLeft /> Back to Home
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div
                className="tech-card-icon-wrap"
                style={{ width: '48px', height: '48px', fontSize: '24px', ...iconStyle }}
              >
                {icon}
              </div>
              <h1 style={{ fontSize: '36px', fontWeight: '800' }}>{title}</h1>
            </div>
            <p className="hero-sub" style={{ margin: '0', maxWidth: '800px' }}>
              {description}
            </p>
          </div>
        </section>

        {stats.length > 0 && (
          <section style={{ padding: '40px 0', backgroundColor: 'var(--bg-surface)' }}>
            <div className="container">
              <div className="grid-3">
                {stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="card-saas"
                    style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}
                  >
                    <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}>
                      {stat.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: '700' }}>{stat.value}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <ReadinessTechStrip trackId={trackId} />

        <section style={{ padding: '40px 0 20px' }}>
          <div className="container">
            <div className="questions-header-block" style={{ marginBottom: '24px' }}>
              <div className="hero-search-wrap" style={{ flex: '1', maxWidth: '480px' }}>
                <FiSearch className="search-icon-pos" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field search-input-field"
                />
              </div>

              <div className="questions-filter-tabs">
                {['all', 'easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficultyFilter(level)}
                    className={`btn btn-sm ${
                      difficultyFilter === level ? 'btn-primary' : 'btn-secondary'
                    }`}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="question-list-stack">
              {filteredQuestions.length === 0 ? (
                <div className="empty-questions">
                  <h3>{emptyTitle || `No ${title} questions found matching the criteria`}</h3>
                  <p>Try resetting the search bar or changing the difficulty filter.</p>
                </div>
              ) : (
                filteredQuestions.map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    q={q}
                    idx={idx}
                    completed={completedIds.includes(q.rawId)}
                    onToggleCompleted={toggleCompleted}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        <ProductionScenariosCallout trackId={trackId} />
      </main>

      <Footer />
    </div>
  );
}
