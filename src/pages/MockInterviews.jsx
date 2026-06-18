import { useEffect } from 'react';
import Navbar    from '../components/Navbar';
import MockInterview from '../components/MockInterview';
import Footer    from '../components/Footer';

export default function MockInterviews() {
  // Load initial scroll or hash anchor on mount
  useEffect(() => {
    // Scroll to section hash if specified in URL
    const hash = window.location.hash;
    if (hash) {
      const id = hash.slice(1);
      let retries = 8;
      const attemptScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else if (retries > 0) {
          retries--;
          setTimeout(attemptScroll, 80);
        }
      };
      attemptScroll();
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flexGrow: 1 }}>
        <header className="page-header" style={{ padding: '60px 0 40px', background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <span className="section-eyebrow" style={{ display: 'inline-block', marginBottom: '8px' }}>Practice Zone</span>
            <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px', letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
              Mock Interviews
            </h1>
            <p className="page-sub" style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
              AI-powered mock interviews with real-time evaluation, follow-up questions, and a detailed performance report.
            </p>
          </div>
        </header>

        <MockInterview />
      </main>

      <Footer />
    </div>
  );
}
