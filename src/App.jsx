import { useState, useEffect, useCallback } from 'react';
import Home from './pages/Home';
import MockInterviews from './pages/MockInterviews';
import InterviewQuestions from './pages/InterviewQuestions';
import Technologies from './pages/Technologies';
import Roadmaps from './pages/Roadmaps';
import OracleDBA from './pages/OracleDBA';
import LinuxAdmin from './pages/LinuxAdmin';
import PostgreSQL from './pages/PostgreSQL';
import MySQL from './pages/MySQL';
import AWSCloud from './pages/AWSCloud';
import ShellScripting from './pages/ShellScripting';
import DevOps from './pages/DevOps';
import AzureCloud from './pages/AzureCloud';
import GoogleCloud from './pages/GoogleCloud';
import Databricks from './pages/Databricks';
import Snowflake from './pages/Snowflake';
import Kubernetes from './pages/Kubernetes';
import Terraform from './pages/Terraform';
import Readiness from './pages/Readiness';
import Pricing from './pages/Pricing';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminProInterest from './pages/AdminProInterest';
import Auth from './pages/Auth';
import { getRouteKey, scrollToHash } from './lib/navigation';

function dispatchNavigate() {
  window.dispatchEvent(new Event('allpreps-navigate'));
}

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [routeKey, setRouteKey] = useState(getRouteKey);

  const syncLocation = useCallback(() => {
    setCurrentPath(window.location.pathname);
    setRouteKey(getRouteKey());
    dispatchNavigate();
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', syncLocation);
    window.addEventListener('allpreps-route-change', syncLocation);
    return () => {
      window.removeEventListener('popstate', syncLocation);
      window.removeEventListener('allpreps-route-change', syncLocation);
    };
  }, [syncLocation]);

  useEffect(() => {
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a');
      if (!anchor?.href || anchor.host !== window.location.host) return;
      if (anchor.target === '_blank') return;

      const url = new URL(anchor.href);
      const nextUrl = url.pathname + url.search + url.hash;

      e.preventDefault();
      window.history.pushState({}, '', nextUrl);
      setCurrentPath(url.pathname);
      setRouteKey(url.pathname + url.search);
      dispatchNavigate();

      if (url.hash) {
        requestAnimationFrame(() => scrollToHash(url.hash));
      } else {
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  switch (currentPath) {
    case '/oracle-dba':
      return <OracleDBA key={routeKey} />;
    case '/linux-admin':
      return <LinuxAdmin key={routeKey} />;
    case '/sql-admin':
    case '/postgresql':
      return <PostgreSQL key={routeKey} />;
    case '/mysql':
      return <MySQL key={routeKey} />;
    case '/aws-cloud':
      return <AWSCloud key={routeKey} />;
    case '/shell-scripting':
      return <ShellScripting key={routeKey} />;
    case '/devops':
      return <DevOps key={routeKey} />;
    case '/azure-cloud':
      return <AzureCloud key={routeKey} />;
    case '/google-cloud':
      return <GoogleCloud key={routeKey} />;
    case '/databricks':
      return <Databricks key={routeKey} />;
    case '/snowflake':
      return <Snowflake key={routeKey} />;
    case '/kubernetes':
      return <Kubernetes key={routeKey} />;
    case '/terraform':
      return <Terraform key={routeKey} />;
    case '/mock-interviews':
      return <MockInterviews key={routeKey} />;
    case '/interview-questions':
      return <InterviewQuestions key={routeKey} />;
    case '/technologies':
      return <Technologies key={routeKey} />;
    case '/roadmaps':
      return <Roadmaps key={routeKey} />;
    case '/readiness':
      return <Readiness key={routeKey} />;
    case '/pricing':
      return <Pricing key={routeKey} />;
    case '/admin/analytics':
      return <AdminAnalytics key={routeKey} />;
    case '/admin/pro-interest':
      return <AdminProInterest key={routeKey} />;
    case '/auth':
      return <Auth key={routeKey} />;
    default:
      return <Home key={routeKey} />;
  }
}

export default App;
