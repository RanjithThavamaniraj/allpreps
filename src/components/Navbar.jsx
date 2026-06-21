import { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { LogoIcon } from './Logo';
import { isProUser } from '../lib/subscriptionStorage';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [pro, setPro] = useState(isProUser());

  useEffect(() => {
    const close = () => { if (window.innerWidth > 860) setOpen(false); };
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const checkUser = () => {
      try {
        const stored = localStorage.getItem('allpreps_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Error reading user state:", e);
      }
      setPro(isProUser());
    };
    checkUser();

    const handleStorageChange = () => checkUser();
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'ALLPREPS_AUTH_SUCCESS') {
        checkUser();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('message', handleMessage);
    window.addEventListener('allpreps-subscription-updated', checkUser);

    const interval = setInterval(checkUser, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('allpreps-subscription-updated', checkUser);
      clearInterval(interval);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('allpreps_user');
    setUser(null);
    window.location.reload();
  };

  return (
    <nav className={`navbar-v2 ${scrolled ? 'navbar-v2-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <a href="/" className="brand-v2">
          <LogoIcon size={28} />
          AllPreps
        </a>

        <div className="nav-links">
          <a href="/technologies"        className="nav-link">Technologies</a>
          <a href="/interview-questions" className="nav-link">Interview Guides</a>
          <a href="/mock-interviews"     className="nav-link">Mock Interviews</a>
          <a href="/readiness"           className="nav-link">Readiness</a>
          <a href="/interview-questions?filter=production-scenarios#practice" className="nav-link">Production Scenarios</a>
          <a href="/pricing"             className="nav-link">Pricing</a>
          <a href="/roadmaps"            className="nav-link">Resources</a>
        </div>

        <div className="nav-ctas">
          {user ? (
            <div className="nav-user">
              {pro && <span className="nav-pro-badge">PRO</span>}
              <span className="nav-user-name">
                Hi, {user.name || 'User'}
              </span>
              <button onClick={handleSignOut} className="btn btn-ghost btn-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <>
              {pro && <span className="nav-pro-badge">PRO</span>}
              <a href="/auth" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Sign In</a>
            </>
          )}
        </div>

        <button
          className="btn btn-ghost btn-sm menu-btn"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {open && (
        <div className="mobile-menu">
          <a href="/technologies"        className="mobile-link" onClick={() => setOpen(false)}>Technologies</a>
          <a href="/interview-questions" className="mobile-link" onClick={() => setOpen(false)}>Interview Guides</a>
          <a href="/mock-interviews"     className="mobile-link" onClick={() => setOpen(false)}>Mock Interviews</a>
          <a href="/readiness"           className="mobile-link" onClick={() => setOpen(false)}>Readiness</a>
          <a href="/interview-questions?filter=production-scenarios#practice" className="mobile-link" onClick={() => setOpen(false)}>Production Scenarios</a>
          <a href="/pricing"             className="mobile-link" onClick={() => setOpen(false)}>Pricing</a>
          <a href="/roadmaps"            className="mobile-link" onClick={() => setOpen(false)}>Resources</a>

          <div className="mobile-menu-footer">
            {pro && <span className="nav-pro-badge mobile-pro-badge">PRO</span>}
            {user ? (
              <div className="mobile-user">
                <span className="nav-user-name">
                  Hi, {user.name || 'User'}
                </span>
                <button onClick={() => { handleSignOut(); setOpen(false); }} className="btn btn-secondary btn-sm w-full">
                  Sign Out
                </button>
              </div>
            ) : (
              <a href="/auth" target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm w-full" onClick={() => setOpen(false)}>Sign In</a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
