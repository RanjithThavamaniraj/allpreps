import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { AppIcon, PartyPopper } from './icons';
import { PRO_INTEREST_TRACKS, PAYMENT_INTEREST_OPTIONS } from '../lib/proInterestTracks';
import { submitProInterest } from '../lib/proInterest';

export default function ProInterestModal({ open, onClose, defaultTrack = 'Oracle DBA' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [track, setTrack] = useState(defaultTrack);
  const [paymentInterest, setPaymentInterest] = useState('Maybe');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setTrack(defaultTrack);
    }
  }, [open, defaultTrack]);

  if (!open) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setTrack(defaultTrack);
    setPaymentInterest('Maybe');
    setError('');
    setSuccess(false);
    setSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      await submitProInterest({
        name: trimmedName,
        email: trimmedEmail,
        track,
        payment_interest: paymentInterest,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="upgrade-modal-overlay" onClick={handleClose} role="presentation">
      <div
        className="upgrade-modal pro-interest-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pro-interest-title"
      >
        <button type="button" className="upgrade-modal-close" onClick={handleClose} aria-label="Close">
          <FiX />
        </button>

        {success ? (
          <div className="pro-interest-success">
            <div className="pro-interest-success-icon" aria-hidden="true">
              <AppIcon icon={PartyPopper} size="3xl" />
            </div>
            <h2 id="pro-interest-title">Thank you!</h2>
            <p>
              You&apos;ve been added to the AllPreps Pro Early Access List.
            </p>
            <p className="pro-interest-success-sub">
              We&apos;ll notify you when subscriptions become available.
            </p>
            <button type="button" className="btn btn-primary btn-lg" onClick={handleClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 id="pro-interest-title">Join the AllPreps Pro Early Access List</h2>
            <p className="upgrade-modal-sub pro-interest-sub">
              We&apos;re preparing AllPreps Pro. Leave your details and we&apos;ll notify you when subscriptions become available.
            </p>

            <form className="pro-interest-form" onSubmit={handleSubmit}>
              <div className="pro-interest-field">
                <label htmlFor="pro-interest-name">Full Name *</label>
                <input
                  id="pro-interest-name"
                  type="text"
                  className="input-field"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  autoComplete="name"
                />
              </div>

              <div className="pro-interest-field">
                <label htmlFor="pro-interest-email">Email Address *</label>
                <input
                  id="pro-interest-email"
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="pro-interest-field">
                <label htmlFor="pro-interest-track">Primary Technology Track</label>
                <select
                  id="pro-interest-track"
                  className="input-field"
                  value={track}
                  onChange={e => setTrack(e.target.value)}
                >
                  {PRO_INTEREST_TRACKS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <fieldset className="pro-interest-field pro-interest-radio-group">
                <legend>Would you pay ₹299/month for unlimited mock interviews?</legend>
                <div className="pro-interest-radio-options">
                  {PAYMENT_INTEREST_OPTIONS.map(option => (
                    <label key={option} className="pro-interest-radio">
                      <input
                        type="radio"
                        name="payment_interest"
                        value={option}
                        checked={paymentInterest === option}
                        onChange={() => setPaymentInterest(option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {error && <p className="pro-interest-error" role="alert">{error}</p>}

              <div className="upgrade-modal-actions pro-interest-actions">
                <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                  {submitting ? 'Joining…' : 'Join Early Access'}
                </button>
                <button type="button" className="btn btn-secondary btn-lg" onClick={handleClose} disabled={submitting}>
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
