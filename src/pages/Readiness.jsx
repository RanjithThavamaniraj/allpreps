import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReadinessDashboard from '../components/ReadinessScore/ReadinessDashboard';

export default function Readiness() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        <ReadinessDashboard />
      </main>
      <Footer />
    </div>
  );
}
