// Local database implementation for User Profile using localStorage

const PROFILE_KEY = 'guitarCoach_user_profile';

export const initializeProfile = (defaultProfile = {}) => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(PROFILE_KEY)) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
  }
};

export const getUserProfile = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveUserProfile = (profile) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
};

export const clearUserProfile = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {}
};

export const defaultUserProfile = {
  name: '',
  skillLevel: '',
  playingStyle: [],
  genres: [],
  goals: [],
  guitarType: '',
  tuning: '',
  practicePreferences: '',
};

// Initialize profile on module import
if (typeof window !== 'undefined') {
  initializeProfile(defaultUserProfile);
}
