import { useState, useMemo, useEffect } from 'react';
import { FiArrowLeft, FiGitBranch, FiSearch, FiCpu, FiTrendingUp } from 'react-icons/fi';
import { getQuestionsByTech } from '../data/questionLoader';
import Navbar from '../components/Navbar';
import QuestionCard from '../components/QuestionCard';
import Footer from '../components/Footer';
import ProductionScenariosCallout from '../components/ProductionScenariosCallout';
import ReadinessTechStrip from '../components/ReadinessScore/ReadinessTechStrip';
import { getGlobalCompletedIds, subscribeToProgress, toggleTrackQuestion } from '../lib/trackProgress';

const TRACK_ID = 'devops';

// Helper to generate context-relevant tags based on the question title
function getTags(title) {
  const t = title.toLowerCase();
  const tags = ['devops'];
  if (t.includes('docker') || t.includes('container') || t.includes('image')) {
    tags.push('docker');
  }
  if (t.includes('kubernetes') || t.includes('k8s') || t.includes('pod') || t.includes('statefulset') || t.includes('helm') || t.includes('ebs')) {
    tags.push('kubernetes');
  }
  if (t.includes('pipeline') || t.includes('ci/cd') || t.includes('gitops') || t.includes('argocd') || t.includes('action') || t.includes('jenkins')) {
    tags.push('ci-cd');
  }
  if (t.includes('terraform') || t.includes('iac') || t.includes('ansible')) {
    tags.push('infrastructure-as-code');
  }
  if (t.includes('monitor') || t.includes('alert') || t.includes('prometheus') || t.includes('grafana')) {
    tags.push('monitoring');
  }
  if (tags.length === 1) {
    tags.push('engineering-operations');
  }
  return tags;
}

export default function DevOps() {
  const [searchQuery, setSearchQuery] = useState('');
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

  const toggleCompleted = (rawId, e) => {
    e.stopPropagation();
    toggleTrackQuestion(TRACK_ID, rawId);
    setCompletedIds(getGlobalCompletedIds());
  };
  const [difficultyFilter, setDifficultyFilter] = useState('all');
    
  const devopsQuestions = useMemo(() => {
    return getQuestionsByTech('devops').map(q => ({
      id: `dev-${q.id}`,
      rawId: q.id,
      title: q.question,
      difficulty: q.difficulty,
      description: q.question + ' - Scenario-based question covering Docker, Kubernetes, CI/CD, GitOps, Infrastructure as Code, and monitoring.',
      details: q.answer,
      solution: q.command,
      tags: q.tags || getTags(q.question)
    }));
  }, []);

  const filteredQuestions = useMemo(() => {
    return devopsQuestions.filter((q) => {
      const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      const matchesSearch =
        !searchQuery ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDifficulty && matchesSearch;
    });
  }, [devopsQuestions, searchQuery, difficultyFilter]);

  
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flexGrow: 1, paddingBottom: '80px' }}>
        {/* Header Banner */}
        <section className="hero-bg" style={{ padding: '60px 0 40px', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ textAlign: 'left' }}>
            <a href="/" className="btn btn-secondary btn-sm" style={{ marginBottom: '24px' }}>
              <FiArrowLeft /> Back to Home
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div className="tech-card-icon-wrap" style={{ width: '48px', height: '48px', fontSize: '24px', backgroundColor: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent)' }}>
                <FiGitBranch />
              </div>
              <h1 style={{ fontSize: '36px', fontWeight: '800' }}>DevOps Track</h1>
            </div>
            <p className="hero-sub" style={{ margin: '0', maxWidth: '800px' }}>
              Master DevOps and Platform Engineering. Prepare for senior DevOps, Platform Engineer, and SRE interviews with scenario-based questions covering Docker multi-stage builds, Kubernetes persistent storage, Helm chart templating, Terraform state management, GitHub Actions pipelines, and Prometheus alerts.
            </p>
          </div>
        </section>

        {/* Stats Cards */}
        <section style={{ padding: '40px 0', backgroundColor: 'var(--bg-surface)' }}>
          <div className="container">
            <div className="grid-3">
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiGitBranch /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>{devopsQuestions.length} Scenario Units</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Platform Infrastructure QA</div>
                </div>
              </div>
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiCpu /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>Orchestration</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Kubernetes & Docker container environments</div>
                </div>
              </div>
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiTrendingUp /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>Automated Pipelines</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>GitOps & Git pipelines</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ReadinessTechStrip trackId={TRACK_ID} />

        {/* Filter Controls */}
        <section style={{ padding: '40px 0 20px' }}>
          <div className="container">
            <div className="questions-header-block" style={{ marginBottom: '24px' }}>
              <div className="hero-search-wrap" style={{ flex: '1', maxWidth: '480px' }}>
                <FiSearch className="search-icon-pos" />
                <input
                  type="text"
                  placeholder="Filter DevOps questions..."
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

            {/* Questions list */}
            <div className="question-list-stack">
              {filteredQuestions.length === 0 ? (
                <div className="empty-questions">
                  <h3>No DevOps questions found matching the criteria</h3>
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

        <ProductionScenariosCallout trackId="devops" />
      </main>

      <Footer />
    </div>
  );
}
