import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiTerminal } from 'react-icons/fi';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

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
    };
    checkUser();
    
    // Listen for changes across tabs or windows
    const handleStorageChange = () => checkUser();
    const handleMessage = (e) => {
      if (e.data && e.data.type === 'ALLPREPS_AUTH_SUCCESS') {
        checkUser();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('message', handleMessage);

    // Polling backup to catch fast changes in the same frame/window
    const interval = setInterval(checkUser, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('message', handleMessage);
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
          <div className="brand-v2-icon-wrap">
            <FiTerminal size={16} />
          </div>
          AllPreps
        </a>

        <div className="nav-links">
          <a href="/technologies"        className="nav-link">Technologies</a>
          <a href="/interview-questions" className="nav-link">Interview Questions</a>
          <a href="/mock-interviews"     className="nav-link">Mock Interviews</a>
          <a href="/roadmaps"            className="nav-link">Track your progress</a>
        </div>

        <div className="nav-ctas">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                Hi, {user.name || 'User'}
              </span>
              <button onClick={handleSignOut} className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', fontSize: '13px' }}>
                Sign Out
              </button>
            </div>
          ) : (
            <a href="/auth" target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">Sign In</a>
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
          <a href="/interview-questions" className="mobile-link" onClick={() => setOpen(false)}>Interview Questions</a>
          <a href="/mock-interviews"     className="mobile-link" onClick={() => setOpen(false)}>Mock Interviews</a>
          <a href="/roadmaps"            className="mobile-link" onClick={() => setOpen(false)}>Track your progress</a>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '600', paddingLeft: '8px' }}>
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
