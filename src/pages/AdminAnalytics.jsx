import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fetchAnalytics, getUpgradeIntentRate, getProInterestConversionRate } from '../lib/analytics';
import { isProUser, setMockPlan, getSubscription } from '../lib/subscriptionStorage';
import { PLANS, MOCK_PLAN_OVERRIDE } from '../lib/subscriptionConfig';

function MetricCard({ label, value, highlight }) {
  return (
    <div className={`admin-metric-card ${highlight ? 'admin-metric-highlight' : ''}`}>
      <span className="admin-metric-label">{label}</span>
      <span className="admin-metric-value">{value}</span>
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [plan, setPlan] = useState(getSubscription().plan);

  useEffect(() => {
    fetchAnalytics().then(setData);
    const refresh = () => fetchAnalytics().then(setData);
    window.addEventListener('allpreps-analytics-updated', refresh);
    return () => window.removeEventListener('allpreps-analytics-updated', refresh);
  }, []);

  const intentRate = data ? getUpgradeIntentRate(data) : 0;
  const conversionRate = data ? getProInterestConversionRate(data) : 0;

  const handlePlanToggle = (newPlan) => {
    setMockPlan(newPlan);
    setPlan(newPlan);
  };

  if (!data) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="container admin-page"><p>Loading analytics...</p></main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />
      <main className="admin-page">
        <div className="container">
          <header className="admin-header">
            <h1>Monetization Analytics</h1>
            <p>Validate upgrade demand before building payment infrastructure.</p>
            <div className="admin-header-links">
              <a href="/admin" className="btn btn-primary btn-sm">Founder Dashboard →</a>
              <a href="/admin/pro-interest" className="btn btn-secondary btn-sm">Pro Interest</a>
            </div>
          </header>

          <div className="admin-metrics-grid admin-metrics-grid-5">
            <MetricCard label="Interview Starts" value={data.interview_started} />
            <MetricCard label="Weekly Limit Hits" value={data.weekly_limit_hit} />
            <MetricCard label="Upgrade Clicks" value={data.upgrade_clicked} />
            <MetricCard label="Pro Interest Submissions" value={data.pro_interest_submitted || 0} highlight />
            <MetricCard label="Upgrade Intent Rate" value={`${intentRate}%`} />
          </div>

          <p className="admin-formula">
            Upgrade Intent Rate = upgrade_clicked ÷ weekly_limit_hit × 100
            {' · '}
            Pro Conversion = pro_interest_submitted ÷ upgrade_clicked × 100 ({conversionRate}%)
          </p>

          <section className="admin-dev-panel">
            <h2>Mock Subscription Mode</h2>
            <p>Switch between Free and Pro for testing limits and Pro-gated features (no payment).</p>
            {MOCK_PLAN_OVERRIDE && (
              <p className="admin-env-note">Env override active: VITE_MOCK_PLAN={MOCK_PLAN_OVERRIDE}</p>
            )}
            <div className="admin-plan-toggle">
              <button
                type="button"
                className={`btn btn-sm ${plan === PLANS.FREE ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handlePlanToggle(PLANS.FREE)}
                disabled={!!MOCK_PLAN_OVERRIDE}
              >
                Free
              </button>
              <button
                type="button"
                className={`btn btn-sm ${plan === PLANS.PRO ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handlePlanToggle(PLANS.PRO)}
                disabled={!!MOCK_PLAN_OVERRIDE}
              >
                Pro
              </button>
            </div>
            <p className="admin-current-plan">Current: {isProUser() ? 'Pro' : 'Free'}</p>
          </section>

          <p className="admin-data-note">
            Analytics stored in <code>data/analytics.json</code> via dev API. Static builds use localStorage mirror.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
