// Local database implementation for Practice Sessions/Routines using localStorage

const PRACTICE_KEY = 'guitarCoach_practice';

export const initializePractice = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(PRACTICE_KEY)) {
    localStorage.setItem(PRACTICE_KEY, JSON.stringify([]));
  }
};

export const getAllPracticeSessions = () => {
  if (typeof window === 'undefined') return [];
  try {
    const sessions = localStorage.getItem(PRACTICE_KEY);
    return sessions ? JSON.parse(sessions) : [];
  } catch (error) {
    console.error('Error retrieving practice sessions:', error);
    return [];
  }
};

export const getPracticeSessionsBySongId = (songId) => {
  const sessions = getAllPracticeSessions();
  return sessions.filter(session => session.songId === songId);
};

export const addPracticeSession = (session) => {
  if (typeof window === 'undefined') return false;
  try {
    const sessions = getAllPracticeSessions();
    const newSession = {
      ...session,
      id: session.id || `practice-${Date.now()}`,
      date: session.date || new Date().toISOString()
    };
    sessions.push(newSession);
    localStorage.setItem(PRACTICE_KEY, JSON.stringify(sessions));
    return newSession;
  } catch (error) {
    console.error('Error adding practice session:', error);
    return false;
  }
};

export const removePracticeSession = (id) => {
  if (typeof window === 'undefined') return false;
  try {
    const sessions = getAllPracticeSessions();
    const updated = sessions.filter(s => s.id !== id);
    localStorage.setItem(PRACTICE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error removing practice session:', error);
    return false;
  }
};

// Initialize practice sessions on module import
if (typeof window !== 'undefined') {
  initializePractice();
}
