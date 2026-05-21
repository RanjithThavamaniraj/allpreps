import { FiTerminal, FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

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
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-btn" aria-label="LinkedIn"><FiLinkedin /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Platform</h4>
          <ul className="footer-links">
            <li><a href="#practice">Interview Questions</a></li>
            <li><a href="#">Mock Evaluations</a></li>
            <li><a href="#topics">Curriculum Tracks</a></li>
            <li><a href="#">Success Stories</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Practice</h4>
          <ul className="footer-links">
            <li><a href="#practice">Oracle DBA</a></li>
            <li><a href="#practice">Linux Admin</a></li>
            <li><a href="#practice">System Design</a></li>
            <li><a href="#practice">DevOps</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Roadmaps</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
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
