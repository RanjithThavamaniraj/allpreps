import { FiTerminal, FiGithub, FiTwitter } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="/" className="footer-logo">
            <FiTerminal className="footer-logo-icon" />
            AllPreps
          </a>
          <p className="footer-desc">
            The leading interview preparation platform for database administrators,
            systems engineers, and cloud architects.
          </p>
          <div className="footer-socials">
            <a href="https://github.com"   target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="GitHub"><FiGithub /></a>
            <a href="https://twitter.com"  target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="Twitter"><FiTwitter /></a>
          </div>
        </div>

      </div>

      <div className="footer-bar">
        <div className="container footer-bar-inner">
          <p>© {new Date().getFullYear()} AllPreps Inc. All rights reserved.</p>
          <div className="footer-bar-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
