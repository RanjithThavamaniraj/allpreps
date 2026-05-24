import { useState, useMemo, useEffect } from 'react';
import { VscAzure } from 'react-icons/vsc';
import { FiArrowLeft, FiSearch, FiCpu, FiCloud, FiTrendingUp } from 'react-icons/fi';
import { getQuestionsByTech } from '../data/questionLoader';
import Navbar from '../components/Navbar';
import QuestionCard from '../components/QuestionCard';
import Footer from '../components/Footer';

// Helper to generate context-relevant tags based on the question title
function getTags(title) {
  const t = title.toLowerCase();
  const tags = ['azure'];
  if (t.includes('rds') || t.includes('aurora') || t.includes('database')) {
    tags.push('rds-aurora');
  }
  if (t.includes('vpc') || t.includes('peering') || t.includes('transit gateway') || t.includes('subnet') || t.includes('network')) {
    tags.push('vpc-networking');
  }
  if (t.includes('iam') || t.includes('policy') || t.includes('role') || t.includes('access')) {
    tags.push('iam-security');
  }
  if (t.includes('s3') || t.includes('bucket') || t.includes('glacier') || t.includes('storage')) {
    tags.push('s3-storage');
  }
  if (t.includes('migrate') || t.includes('datapump') || t.includes('dms') || t.includes('snowball')) {
    tags.push('migration');
  }
  if (t.includes('ec2') || t.includes('scaling') || t.includes('load balancer') || t.includes('alb')) {
    tags.push('compute-scaling');
  }
  if (tags.length === 1) {
    tags.push('cloud-ops');
  }
  return tags;
}

export default function AzureCloud() {
  const [searchQuery, setSearchQuery] = useState('');
  const [completedIds, setCompletedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('allpreps_completed_questions');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Error reading localStorage:", e);
      return [];
    }
  });

  useEffect(() => {
    const syncCompleted = () => {
      try {
        const stored = localStorage.getItem('allpreps_completed_questions');
        if (stored) {
          setCompletedIds(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Error syncing completed questions:", e);
      }
    };
    syncCompleted();
    window.addEventListener('focus', syncCompleted);
    window.addEventListener('storage', syncCompleted);
    const interval = setInterval(syncCompleted, 1000);
    return () => {
      window.removeEventListener('focus', syncCompleted);
      window.removeEventListener('storage', syncCompleted);
      clearInterval(interval);
    };
  }, []);

  const toggleCompleted = (rawId, e) => {
    e.stopPropagation();
    let updated;
    if (completedIds.includes(rawId)) {
      updated = completedIds.filter(x => x !== rawId);
    } else {
      updated = [...completedIds, rawId];
    }
    setCompletedIds(updated);
    try {
      localStorage.setItem('allpreps_completed_questions', JSON.stringify(updated));
    } catch (err) {
      console.error("Error saving completed questions:", err);
    }
  };
  const [difficultyFilter, setDifficultyFilter] = useState('all');
    
  const azureQuestions = useMemo(() => {
    return getQuestionsByTech('azure').map(q => ({
      id: `azure-${q.id}`,
      rawId: q.id,
      title: q.question,
      difficulty: q.difficulty,
      description: q.question + ' - Scenario-based question covering Azure architecture, RDS databases, IAM security, VPC networks, and S3 storage.',
      details: q.answer,
      solution: q.command,
      tags: q.tags || getTags(q.question)
    }));
  }, []);

  const filteredQuestions = useMemo(() => {
    return azureQuestions.filter((q) => {
      const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      const matchesSearch =
        !searchQuery ||
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesDifficulty && matchesSearch;
    });
  }, [azureQuestions, searchQuery, difficultyFilter]);

  
  
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
              <div className="tech-card-icon-wrap" style={{ width: '48px', height: '48px', fontSize: '24px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <VscAzure />
              </div>
              <h1 style={{ fontSize: '36px', fontWeight: '800' }}>Azure Cloud Track</h1>
            </div>
            <p className="hero-sub" style={{ margin: '0', maxWidth: '800px' }}>
              Master Azure Cloud administration and design. Prepare for solutions architect and cloud operations interviews with scenario-based questions covering RDS Multi-AZ failovers, secure VPC designs, IAM roles, S3 lifecycle operations, and database migration pathways.
            </p>
          </div>
        </section>

        {/* Stats Cards */}
        <section style={{ padding: '40px 0', backgroundColor: 'var(--bg-surface)' }}>
          <div className="container">
            <div className="grid-3">
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiCloud /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>{azureQuestions.length} Scenario Units</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Cloud Architecture QA</div>
                </div>
              </div>
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiCpu /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>RDS & Compute</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Multi-AZ & Auto Scaling</div>
                </div>
              </div>
              <div className="card-saas" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
                <div className="tech-card-icon-wrap" style={{ fontSize: '20px' }}><FiTrendingUp /></div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>VPC & Security</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Transit Gateway & IAM policies</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Controls */}
        <section style={{ padding: '40px 0 20px' }}>
          <div className="container">
            <div className="questions-header-block" style={{ marginBottom: '24px' }}>
              <div className="hero-search-wrap" style={{ flex: '1', maxWidth: '480px' }}>
                <FiSearch className="search-icon-pos" />
                <input
                  type="text"
                  placeholder="Filter Azure questions..."
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
                  <h3>No Azure questions found matching the criteria</h3>
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
      </main>

      <Footer />
    </div>
  );
}
