import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiTerminal, FiArrowRight } from 'react-icons/fi';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // Close mobile menu on resize
  useEffect(() => {
    const close = () => { if (window.innerWidth > 860) setOpen(false); };
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <a href="/" className="brand">
          <FiTerminal className="brand-icon" />
          AllPreps
        </a>

        <div className="nav-links">
          <a href="/interview-questions" className="nav-link">Interview Questions</a>
          <a href="/mock-interviews"         className="nav-link">Mock Interviews</a>
          <a href="/technologies"            className="nav-link">Technologies</a>
          <a href="/roadmaps"                className="nav-link">Roadmaps</a>
        </div>

        <div className="nav-ctas">
          <button className="btn btn-ghost btn-sm">Sign In</button>
          <a href="/mock-interviews" className="btn btn-primary btn-sm">
            Get Started <FiArrowRight size={13} />
          </a>
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
          <a href="/interview-questions" className="mobile-link" onClick={() => setOpen(false)}>Interview Questions</a>
          <a href="/mock-interviews"         className="mobile-link" onClick={() => setOpen(false)}>Mock Interviews</a>
          <a href="/technologies"            className="mobile-link" onClick={() => setOpen(false)}>Technologies</a>
          <a href="/roadmaps"                className="mobile-link" onClick={() => setOpen(false)}>Roadmaps</a>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button className="btn btn-secondary btn-sm w-full">Sign In</button>
            <a href="/mock-interviews" className="btn btn-primary btn-sm w-full" onClick={() => setOpen(false)}>Get Started</a>
          </div>
        </div>
      )}
    </nav>
  );
}
