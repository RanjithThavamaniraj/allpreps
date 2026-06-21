import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Questions from '../components/Questions';
import Footer from '../components/Footer';
import { parseInterviewQuestionsSearch, scrollToHash } from '../lib/navigation';

export default function InterviewQuestions() {
  const initial = parseInterviewQuestionsSearch();
  const [searchQuery, setSearchQuery] = useState(initial.q);
  const [activeChip] = useState(initial.chip);
  const productionOnly = initial.productionOnly;

  useEffect(() => {
    if (window.location.hash) {
      scrollToHash(window.location.hash);
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flexGrow: 1 }}>
        <header className="page-header" style={{ padding: '60px 0 40px', background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <span className="section-eyebrow" style={{ display: 'inline-block', marginBottom: '8px' }}>
              {productionOnly ? 'Production Scenarios' : 'Interview Bank'}
            </span>
            <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
              {productionOnly ? 'Production Scenario Questions' : 'Interview Questions'}
            </h1>
            <p className="page-sub" style={{ maxWidth: '640px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
              {productionOnly
                ? 'Real-world infrastructure incidents and troubleshooting scenarios — filter by technology using track links or search below.'
                : 'Explore our extensive bank of scenario-based interview questions across all technology tracks.'}
            </p>
          </div>
        </header>

        <div id="practice">
          <Questions
            selectedCategory=""
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeChip={activeChip}
            productionOnly={productionOnly}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
