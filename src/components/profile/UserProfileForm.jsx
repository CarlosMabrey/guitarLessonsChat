import React, { useState, useEffect } from 'react';
import { getUserProfile, saveUserProfile, defaultUserProfile } from '@/lib/storage/userProfile';

/**
 * UserProfileForm - Edit and save user profile (localStorage for now)
 * Fields: name, skillLevel, playingStyle, genres, goals, guitarType, tuning, practicePreferences
 * On save, updates localStorage and optionally calls onChange
 */
export default function UserProfileForm({ onChange }) {
  const [profile, setProfile] = useState(defaultUserProfile);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const stored = getUserProfile();
    if (stored) setProfile(stored);
  }, []);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value.split(',').map((v) => v.trim()).filter(Boolean) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveUserProfile(profile);
    setStatus('Profile saved!');
    if (onChange) onChange(profile);
    setTimeout(() => setStatus(''), 2000);
  };

  return (
    <form className="bg-navy-900 p-6 rounded-xl shadow-lg max-w-xl mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4 text-white">User Profile</h2>
      {status && <div className="mb-2 text-green-400">{status}</div>}
      <div className="mb-3">
        <label className="block text-blue-200 mb-1">Name</label>
        <input
          className="w-full px-3 py-2 rounded bg-navy-800 text-white border border-navy-700 focus:outline-none"
          value={profile.name}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="Your name"
        />
      </div>
      <div className="mb-3">
        <label className="block text-blue-200 mb-1">Skill Level</label>
        <select
          className="w-full px-3 py-2 rounded bg-navy-800 text-white border border-navy-700"
          value={profile.skillLevel}
          onChange={e => handleChange('skillLevel', e.target.value)}
        >
          <option value="">Select skill level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div className="mb-3">
        <label className="block text-blue-200 mb-1">Playing Style (comma-separated)</label>
        <input
          className="w-full px-3 py-2 rounded bg-navy-800 text-white border border-navy-700"
          value={profile.playingStyle.join(', ')}
          onChange={e => handleArrayChange('playingStyle', e.target.value)}
          placeholder="e.g. strumming, fingerpicking"
        />
      </div>
      <div className="mb-3">
        <label className="block text-blue-200 mb-1">Genres (comma-separated)</label>
        <input
          className="w-full px-3 py-2 rounded bg-navy-800 text-white border border-navy-700"
          value={profile.genres.join(', ')}
          onChange={e => handleArrayChange('genres', e.target.value)}
          placeholder="e.g. blues, rock, jazz"
        />
      </div>
      <div className="mb-3">
        <label className="block text-blue-200 mb-1">Goals (comma-separated)</label>
        <input
          className="w-full px-3 py-2 rounded bg-navy-800 text-white border border-navy-700"
          value={profile.goals.join(', ')}
          onChange={e => handleArrayChange('goals', e.target.value)}
          placeholder="e.g. learn barre chords, improvise solos"
        />
      </div>
      <div className="mb-3">
        <label className="block text-blue-200 mb-1">Guitar Type</label>
        <input
          className="w-full px-3 py-2 rounded bg-navy-800 text-white border border-navy-700"
          value={profile.guitarType}
          onChange={e => handleChange('guitarType', e.target.value)}
          placeholder="e.g. acoustic, electric"
        />
      </div>
      <div className="mb-3">
        <label className="block text-blue-200 mb-1">Tuning</label>
        <input
          className="w-full px-3 py-2 rounded bg-navy-800 text-white border border-navy-700"
          value={profile.tuning}
          onChange={e => handleChange('tuning', e.target.value)}
          placeholder="e.g. Standard, Drop D"
        />
      </div>
      <div className="mb-3">
        <label className="block text-blue-200 mb-1">Practice Preferences</label>
        <input
          className="w-full px-3 py-2 rounded bg-navy-800 text-white border border-navy-700"
          value={profile.practicePreferences}
          onChange={e => handleChange('practicePreferences', e.target.value)}
          placeholder="e.g. morning practice, 30 min/day"
        />
      </div>
      <div className="flex justify-end mt-4">
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold">
          Save Profile
        </button>
      </div>
    </form>
  );
}
