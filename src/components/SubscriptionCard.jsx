import { useEffect, useState } from 'react';
import { FiZap, FiClock } from 'react-icons/fi';
import { isProUser, getSubscription } from '../lib/subscriptionStorage';
import { checkInterviewLimit, getRemainingInterviews, formatNextAvailable } from '../lib/interviewLimits';
import { PRO_PRICE_INR } from '../lib/subscriptionConfig';

export default function SubscriptionCard() {
  const [pro, setPro] = useState(isProUser());
  const [limitInfo, setLimitInfo] = useState(() => checkInterviewLimit());

  useEffect(() => {
    const refresh = () => {
      setPro(isProUser());
      setLimitInfo(checkInterviewLimit());
    };
    refresh();
    window.addEventListener('allpreps-subscription-updated', refresh);
    window.addEventListener('allpreps-readiness-updated', refresh);
    return () => {
      window.removeEventListener('allpreps-subscription-updated', refresh);
      window.removeEventListener('allpreps-readiness-updated', refresh);
    };
  }, []);

  const sub = getSubscription();
  const remaining = getRemainingInterviews();

  return (
    <div className={`subscription-card ${pro ? 'subscription-card-pro' : ''}`}>
      <div className="subscription-card-header">
        <span className="subscription-card-label">Current Plan</span>
        <span className={`subscription-plan-badge ${pro ? 'pro' : 'free'}`}>
          {pro ? <><FiZap /> Pro</> : 'Free'}
        </span>
      </div>

      {pro ? (
        <p className="subscription-card-detail">Unlimited Interviews Enabled</p>
      ) : (
        <>
          <p className="subscription-card-detail">
            {remaining > 0
              ? `${remaining} free interview${remaining !== 1 ? 's' : ''} available this week`
              : '1 Free Interview Every Week'}
          </p>
          {!limitInfo.allowed && limitInfo.nextAvailable && (
            <p className="subscription-card-next">
              <FiClock /> Next free interview: {formatNextAvailable(limitInfo.nextAvailable)}
            </p>
          )}
          <a href="/pricing" className="btn btn-primary btn-sm subscription-upgrade-link">
            Upgrade to Pro — ₹{PRO_PRICE_INR}/mo
          </a>
        </>
      )}

      {sub.source === 'mock_activation' && (
        <p className="subscription-mock-note">Mock Pro subscription (no billing)</p>
      )}
    </div>
  );
}
