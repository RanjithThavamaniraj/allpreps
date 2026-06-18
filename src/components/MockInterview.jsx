import { useState } from 'react';
import InterviewSetup from './InterviewSetup';
import InterviewSession from './InterviewSession';
import FinalReport from './FinalReport';
import { selectInterviewQuestions } from '../utils/mockInterviewUtils';

const SCREENS = {
  SETUP: 'setup',
  SESSION: 'session',
  REPORT: 'report',
};

export default function MockInterview() {
  const [screen, setScreen] = useState(SCREENS.SETUP);
  const [session, setSession] = useState(null);

  const handleStart = ({ settings, questions }) => {
    setSession({
      settings,
      questions,
      questionResults: [],
      startTime: Date.now(),
      endTime: null,
    });
    setScreen(SCREENS.SESSION);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplete = (completedSession) => {
    setSession(completedSession);
    setScreen(SCREENS.REPORT);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetake = () => {
    if (!session?.settings) {
      setScreen(SCREENS.SETUP);
      return;
    }

    const questions = selectInterviewQuestions({
      technology: session.settings.technology,
      difficulty: session.settings.difficulty,
      count: session.settings.questionCount,
    });

    setSession({
      settings: session.settings,
      questions,
      questionResults: [],
      startTime: Date.now(),
      endTime: null,
    });
    setScreen(SCREENS.SESSION);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (screen === SCREENS.SETUP) {
    return <InterviewSetup onStart={handleStart} />;
  }

  if (screen === SCREENS.SESSION && session) {
    return (
      <InterviewSession
        settings={session.settings}
        questions={session.questions}
        onComplete={handleComplete}
      />
    );
  }

  if (screen === SCREENS.REPORT && session) {
    return (
      <FinalReport
        session={session}
        onRetake={handleRetake}
      />
    );
  }

  return <InterviewSetup onStart={handleStart} />;
}
