import { FiCheck, FiX } from 'react-icons/fi';
import { PRO_PRICE_INR } from '../lib/subscriptionConfig';
import { trackEvent } from '../lib/analytics';

const BENEFITS = [
  'Unlimited AI Interviews',
  'Detailed Feedback Reports',
  'Readiness Tracking',
  'Weak Area Analysis',
  'Personalized Learning Plans',
];

export default function UpgradeModal({ open, onClose, onUpgrade }) {
  if (!open) return null;

  const handleUpgrade = () => {
    trackEvent('upgrade_clicked');
    onUpgrade?.();
  };

  return (
    <div className="upgrade-modal-overlay" onClick={onClose} role="presentation">
      <div className="upgrade-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <button type="button" className="upgrade-modal-close" onClick={onClose} aria-label="Close">
          <FiX />
        </button>

        <h2>Unlock Unlimited Interview Practice</h2>
        <p className="upgrade-modal-sub">
          You&apos;ve already completed your free interview this week.
          Upgrade to continue improving your readiness score.
        </p>

        <ul className="upgrade-modal-benefits">
          {BENEFITS.map(b => (
            <li key={b}><FiCheck /> {b}</li>
          ))}
        </ul>

        <p className="upgrade-modal-price">₹{PRO_PRICE_INR}<span>/month</span></p>

        <div className="upgrade-modal-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={handleUpgrade}>
            Upgrade to Pro
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
