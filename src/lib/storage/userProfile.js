// User Profile Storage Utility (localStorage-based)

const PROFILE_KEY = 'guitar_user_profile';

export function getUserProfile() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUserProfile(profile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

export function clearUserProfile() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch {}
}

// Default profile structure for reference
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
