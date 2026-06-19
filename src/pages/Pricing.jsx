import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiCheck } from 'react-icons/fi';
import { FREE_FEATURES, PRO_FEATURES, PRO_PRICE_INR } from '../lib/subscriptionConfig';
import { trackEvent } from '../lib/analytics';
import ProInterestModal from '../components/ProInterestModal';

export default function Pricing() {
  const [showProInterest, setShowProInterest] = useState(false);

  const handleUpgrade = () => {
    trackEvent('upgrade_clicked');
    setShowProInterest(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        <header className="page-header" style={{ padding: '60px 0 40px', background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <span className="section-eyebrow">Pricing</span>
            <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px' }}>
              Simple, Transparent Pricing
            </h1>
            <p className="page-sub" style={{ maxWidth: '560px', margin: '0 auto', color: 'var(--text-secondary)' }}>
              Experience AllPreps for free. Join the early access list when you&apos;re ready for unlimited interview practice.
            </p>
          </div>
        </header>

        <section className="pricing-section container">
          <div className="pricing-grid">
            <div className="pricing-card">
              <h2>Free</h2>
              <p className="pricing-price">₹0</p>
              <ul className="pricing-features">
                {FREE_FEATURES.map(f => (
                  <li key={f}><FiCheck /> {f}</li>
                ))}
              </ul>
              <a href="/mock-interviews" className="btn btn-secondary btn-lg">Get Started</a>
            </div>

            <div className="pricing-card pricing-card-pro">
              <span className="pricing-popular">Most Popular</span>
              <h2>Pro</h2>
              <p className="pricing-price">₹{PRO_PRICE_INR}<span>/month</span></p>
              <ul className="pricing-features">
                {PRO_FEATURES.map(f => (
                  <li key={f}><FiCheck /> {f}</li>
                ))}
              </ul>
              <button type="button" className="btn btn-primary btn-lg" onClick={handleUpgrade}>
                Upgrade to Pro
              </button>
              <p className="pricing-note">Early access — subscriptions launching soon</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <ProInterestModal
        open={showProInterest}
        onClose={() => setShowProInterest(false)}
        defaultTrack="Oracle DBA"
      />
    </div>
  );
}
