import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fetchProInterest } from '../lib/proInterest';
import { PRO_INTEREST_TRACKS, PAYMENT_INTEREST_OPTIONS } from '../lib/proInterestTracks';

export default function AdminProInterest() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackFilter, setTrackFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  useEffect(() => {
    fetchProInterest().then(data => {
      setEntries(data);
      setLoading(false);
    });
    const refresh = () => fetchProInterest().then(setEntries);
    window.addEventListener('allpreps-pro-interest-updated', refresh);
    return () => window.removeEventListener('allpreps-pro-interest-updated', refresh);
  }, []);

  const filtered = useMemo(() => {
    return entries.filter(entry => {
      const matchTrack = trackFilter === 'all' || entry.track === trackFilter;
      const matchPayment = paymentFilter === 'all' || entry.payment_interest === paymentFilter;
      return matchTrack && matchPayment;
    });
  }, [entries, trackFilter, paymentFilter]);

  const yesCount = entries.filter(e => e.payment_interest === 'Yes').length;
  const maybeCount = entries.filter(e => e.payment_interest === 'Maybe').length;
  const noCount = entries.filter(e => e.payment_interest === 'No').length;

  return (
    <div className="page-shell">
      <Navbar />
      <main className="admin-page">
        <div className="container">
          <header className="admin-header">
            <h1>Pro Interest Submissions</h1>
            <p>Early access leads captured before payment integration.</p>
            <div className="admin-header-links">
              <a href="/admin" className="btn btn-primary btn-sm">Founder Dashboard →</a>
              <a href="/admin/analytics" className="btn btn-secondary btn-sm">Monetization</a>
            </div>
          </header>

          <div className="admin-metrics-grid admin-metrics-grid-4">
            <div className="admin-metric-card">
              <span className="admin-metric-label">Total Submissions</span>
              <span className="admin-metric-value">{entries.length}</span>
            </div>
            <div className="admin-metric-card admin-metric-yes">
              <span className="admin-metric-label">Would Pay Yes</span>
              <span className="admin-metric-value">{yesCount}</span>
            </div>
            <div className="admin-metric-card admin-metric-maybe">
              <span className="admin-metric-label">Maybe</span>
              <span className="admin-metric-value">{maybeCount}</span>
            </div>
            <div className="admin-metric-card admin-metric-no">
              <span className="admin-metric-label">No</span>
              <span className="admin-metric-value">{noCount}</span>
            </div>
          </div>

          <section className="admin-filter-bar">
            <div className="admin-filter-field">
              <label htmlFor="track-filter">Technology Track</label>
              <select
                id="track-filter"
                className="input-field"
                value={trackFilter}
                onChange={e => setTrackFilter(e.target.value)}
              >
                <option value="all">All tracks</option>
                {PRO_INTEREST_TRACKS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="admin-filter-field">
              <label htmlFor="payment-filter">Payment Interest</label>
              <select
                id="payment-filter"
                className="input-field"
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
              >
                <option value="all">All responses</option>
                {PAYMENT_INTEREST_OPTIONS.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </section>

          {loading ? (
            <p>Loading submissions…</p>
          ) : filtered.length === 0 ? (
            <p className="admin-empty">No submissions match the current filters.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Technology Track</th>
                    <th>Would Pay ₹299</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filtered].reverse().map((entry, idx) => (
                    <tr key={`${entry.email}-${entry.timestamp}-${idx}`}>
                      <td>{entry.name}</td>
                      <td><a href={`mailto:${entry.email}`}>{entry.email}</a></td>
                      <td>{entry.track}</td>
                      <td>
                        <span className={`admin-badge admin-badge-${entry.payment_interest.toLowerCase()}`}>
                          {entry.payment_interest}
                        </span>
                      </td>
                      <td>{new Date(entry.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="admin-data-note">
            Leads stored in <code>data/pro-interest.json</code> via dev API. Email notifications require{' '}
            <code>RESEND_API_KEY</code> and <code>ADMIN_NOTIFICATION_EMAIL</code> in <code>.env</code>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
