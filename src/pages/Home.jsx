import Navbar           from '../components/Navbar';
import Hero             from '../components/Hero';
import TechGrid         from '../components/TechGrid';
import LearningPath     from '../components/LearningPath';
import QuestionsPreview from '../components/QuestionsPreview';
import WhyAllPreps      from '../components/WhyAllPreps';
import Footer           from '../components/Footer';

export default function Home() {
  return (
    <div className="page-shell">
      <Navbar />

      <main>
        <Hero />
        <TechGrid />
        <LearningPath />
        <QuestionsPreview />
        <WhyAllPreps />
      </main>

      <Footer />
    </div>
  );
}
