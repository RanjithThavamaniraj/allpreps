import { useState } from 'react';
import { FiMail, FiLock, FiUser, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { navigateTo } from '../lib/navigation';
import { trackFounderMetric, FOUNDER_METRICS } from '../lib/founderAnalytics';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'verify'
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('allpreps_registered_name', fullName);
      trackFounderMetric(FOUNDER_METRICS.REGISTRATIONS, { metadata: { source: 'register' } });
      setMode('verify');
    }, 1500);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const registeredName = localStorage.getItem('allpreps_registered_name') || email.split('@')[0];
      const userData = {
        email: email,
        name: registeredName,
        loggedIn: true
      };
      localStorage.setItem('allpreps_user', JSON.stringify(userData));
      window.dispatchEvent(new Event('allpreps-auth-updated'));
      navigateTo('/');
    }, 1500);
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Email verified successfully! You can now log in.');
      setMode('login');
    }, 1500);
  };

  return (
    <div className="auth-page">
      <div className="auth-container fade-up">
        
        {/* Back link */}
        {mode !== 'verify' && (
          <a href="/" className="auth-back">
            <FiArrowLeft /> Back to Home
          </a>
        )}

        {mode === 'verify' ? (
          <div className="auth-verify">
            <FiCheckCircle className="verify-icon" size={48} />
            <h2 className="auth-title">Check your email</h2>
            <p className="auth-sub">
              We've sent a verification link to <strong>{email || 'your email address'}</strong>. 
              Please verify your email to activate your account.
            </p>
            <button 
              className="btn btn-primary w-full" 
              style={{ padding: '12px', marginTop: '24px' }} 
              onClick={handleVerify}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Simulate Email Verification'}
            </button>
            <button 
              className="btn btn-ghost w-full" 
              style={{ marginTop: '12px' }}
              onClick={() => setMode('login')}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <h2 className="auth-title">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="auth-sub">
                {mode === 'login' 
                  ? 'Enter your credentials to access your dashboard' 
                  : 'Join AllPreps and start mastering enterprise interviews'}
              </p>
            </div>

            <div className="auth-tabs">
              <button 
                className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => setMode('login')}
              >
                Sign In
              </button>
              <button 
                className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => setMode('register')}
              >
                Register
              </button>
            </div>

            <form className="auth-form" onSubmit={mode === 'login' ? handleLogin : handleRegister}>
              {mode === 'register' && (
                <div className="auth-input-group">
                  <FiUser className="auth-input-icon" />
                  <input 
                    type="text" 
                    className="input-field auth-input" 
                    placeholder="Full Name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required 
                  />
                </div>
              )}

              <div className="auth-input-group">
                <FiMail className="auth-input-icon" />
                <input 
                  type="email" 
                  className="input-field auth-input" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="auth-input-group">
                <FiLock className="auth-input-icon" />
                <input 
                  type="password" 
                  className="input-field auth-input" 
                  placeholder="Password" 
                  required 
                />
              </div>

              {mode === 'login' && (
                <div className="auth-options">
                  <label className="auth-checkbox">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <span className="auth-forgot" style={{ opacity: 0.5, cursor: 'default' }}>Password reset coming soon</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full" style={{ padding: '12px', fontSize: '15px' }} disabled={loading}>
                {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button className="btn btn-secondary w-full" style={{ padding: '12px' }} onClick={() => alert("Google Auth not implemented in demo")}>
              <svg style={{ width: '18px', height: '18px', marginRight: '8px' }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}
