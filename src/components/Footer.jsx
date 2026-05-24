import { FiGithub } from 'react-icons/fi';
import { LogoIcon } from './Logo';


export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="/" className="footer-logo">
            <LogoIcon size={24} />
            AllPreps
          </a>
          <p className="footer-desc">
            Industry Standard Preparation for your Interviews.
          </p>
          <span className="footer-tagline">Oracle DBA • Linux • SQL • AWS • DevOps</span>
          <span className="footer-built">Built by Ranjith T</span>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Platform</h4>
          <div className="footer-links">
            <a href="/technologies">Technologies</a>
            <a href="/mock-interviews">Mock Interviews</a>
            <a href="/interview-questions">Interview Guides</a>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Connect</h4>
          <div className="footer-links">
            <a href="https://github.com/RanjithThavamaniraj" target="_blank" rel="noopener noreferrer">
              <FiGithub /> GitHub
            </a>

          </div>
        </div>
      </div>

      <div className="footer-bar">
        <div className="container footer-bar-inner">
          <p>© 2026 AllPreps. Built for builders and learners.</p>
          <div className="footer-bar-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
