import { useState, useEffect } from 'react';
import Home from './pages/Home';
import MockInterviews from './pages/MockInterviews';
import InterviewQuestions from './pages/InterviewQuestions';
import Technologies from './pages/Technologies';
import Roadmaps from './pages/Roadmaps';
import OracleDBA from './pages/OracleDBA';
import LinuxAdmin from './pages/LinuxAdmin';
import SQLAdmin from './pages/SQLAdmin';
import AWSCloud from './pages/AWSCloud';
import ShellScripting from './pages/ShellScripting';
import DevOps from './pages/DevOps';
import AzureCloud from './pages/AzureCloud';
import GoogleCloud from './pages/GoogleCloud';
import Readiness from './pages/Readiness';
import Auth from './pages/Auth';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Intercept anchor clicks to avoid full page reload
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.href && anchor.host === window.location.host) {
        const url = new URL(anchor.href);
        const path = url.pathname;
        
        // Handle routes, ignore hash links (anchors) or external links
        if (path !== '/' || !url.hash) {
          e.preventDefault();
          window.history.pushState({}, '', path + url.hash);
          setCurrentPath(path);
          // If there is a hash, scroll to it, otherwise scroll to top
          if (url.hash) {
            const id = url.hash.slice(1);
            let retries = 8;
            const attemptScroll = () => {
              const el = document.getElementById(id);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else if (retries > 0) {
                retries--;
                setTimeout(attemptScroll, 80);
              }
            };
            attemptScroll();
          } else {
            window.scrollTo(0, 0);
          }
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  switch (currentPath) {
    case '/oracle-dba':
      return <OracleDBA />;
    case '/linux-admin':
      return <LinuxAdmin />;
    case '/sql-admin':
      return <SQLAdmin />;
    case '/aws-cloud':
      return <AWSCloud />;
    case '/shell-scripting':
      return <ShellScripting />;
    case '/devops':
      return <DevOps />;
    case '/azure-cloud':
      return <AzureCloud />;
    case '/google-cloud':
      return <GoogleCloud />;
    case '/mock-interviews':
      return <MockInterviews />;
    case '/interview-questions':
      return <InterviewQuestions />;
    case '/technologies':
      return <Technologies />;
    case '/roadmaps':
      return <Roadmaps />;
    case '/readiness':
      return <Readiness />;
    case '/auth':
      return <Auth />;
    default:
      return <Home />;
  }
}

export default App;

