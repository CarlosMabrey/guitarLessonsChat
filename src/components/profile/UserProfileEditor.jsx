'use client';

import React, { useState, useEffect } from 'react';
import { FiUser, FiMusic, FiAward, FiTarget, FiClock, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function UserProfileEditor({ onSave, onCancel, initialData = {} }) {
  const [formData, setFormData] = useState({
    name: '',
    skillLevel: 'beginner',
    guitarType: 'acoustic',
    tuning: 'EADGBE',
    genres: [],
    playingStyle: [],
    learningFocus: '',
    practiceFrequency: 'daily',
    practiceDuration: '30',
    goals: []
  });
  
  const [newGenre, setNewGenre] = useState('');
  const [newStyle, setNewStyle] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form with initialData if provided
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        genres: initialData.genres || [],
        playingStyle: initialData.playingStyle || [],
        goals: initialData.goals || []
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddGenre = (e) => {
    e.preventDefault();
    if (newGenre.trim() && !formData.genres.includes(newGenre.trim())) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, newGenre.trim()]
      }));
      setNewGenre('');
    }
  };

  const handleRemoveGenre = (genreToRemove) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(genre => genre !== genreToRemove)
    }));
  };

  const handleAddStyle = (e) => {
    e.preventDefault();
    if (newStyle.trim() && !formData.playingStyle.includes(newStyle.trim())) {
      setFormData(prev => ({
        ...prev,
        playingStyle: [...prev.playingStyle, newStyle.trim()]
      }));
      setNewStyle('');
    }
  };

  const handleRemoveStyle = (styleToRemove) => {
    setFormData(prev => ({
      ...prev,
      playingStyle: prev.playingStyle.filter(style => style !== styleToRemove)
    }));
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (newGoal.trim() && !formData.goals.includes(newGoal.trim())) {
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (goalToRemove) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter(goal => goal !== goalToRemove)
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.practiceDuration && isNaN(formData.practiceDuration)) {
      newErrors.practiceDuration = 'Please enter a valid number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        practiceDuration: parseInt(formData.practiceDuration, 10) || 30
      });
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-md p-6">
          <div className="flex items-center mb-6">
            <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900 mr-3">
              <FiMusic className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`block w-full rounded-md shadow-sm ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                placeholder="Your name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Skill Level
              </label>
              <select
                id="skillLevel"
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="professional">Professional</option>
              </select>
            </div>
          </div>
        </div>

        {/* Guitar Details */}
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-md p-6">
          <div className="flex items-center mb-6">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900 mr-3">
              <FiMusic className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Guitar Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="guitarType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Guitar Type
              </label>
              <select
                id="guitarType"
                name="guitarType"
                value={formData.guitarType}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              >
                <option value="acoustic">Acoustic</option>
                <option value="electric">Electric</option>
                <option value="classical">Classical</option>
                <option value="bass">Bass</option>
              </select>
            </div>

            <div>
              <label htmlFor="tuning" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tuning
              </label>
              <input
                type="text"
                id="tuning"
                name="tuning"
                value={formData.tuning}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                placeholder="EADGBE"
              />
            </div>
          </div>
        </div>

        {/* Music Preferences */}
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-md p-6">
          <div className="flex items-center mb-6">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900 mr-3">
              <FiMusic className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Music Preferences</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Favorite Genres
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.genres.map((genre, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                    {genre}
                    <button
                      type="button"
                      onClick={() => handleRemoveGenre(genre)}
                      className="ml-1.5 inline-flex text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 focus:outline-none"
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex mt-2">
                <input
                  type="text"
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  placeholder="Add a genre"
                />
                <button
                  type="button"
                  onClick={handleAddGenre}
                  className="inline-flex items-center px-4 py-2 border border-l-0 border-indigo-500 text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiPlus className="h-4 w-4 mr-1" /> Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Playing Style
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.playingStyle.map((style, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {style}
                    <button
                      type="button"
                      onClick={() => handleRemoveStyle(style)}
                      className="ml-1.5 inline-flex text-green-500 hover:text-green-700 dark:hover:text-green-300 focus:outline-none"
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex mt-2">
                <input
                  type="text"
                  value={newStyle}
                  onChange={(e) => setNewStyle(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  placeholder="Add a playing style"
                />
                <button
                  type="button"
                  onClick={handleAddStyle}
                  className="inline-flex items-center px-4 py-2 border border-l-0 border-green-500 text-sm font-medium rounded-r-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FiPlus className="h-4 w-4 mr-1" /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Goals */}
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-md p-6">
          <div className="flex items-center mb-6">
            <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900 mr-3">
              <FiTarget className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Learning Goals</h3>
          </div>
          
          <div>
            <label htmlFor="learningFocus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Primary Learning Focus
            </label>
            <select
              id="learningFocus"
              name="learningFocus"
              value={formData.learningFocus}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm mb-6"
            >
              <option value="">Select a focus area</option>
              <option value="chords">Chords & Progressions</option>
              <option value="scales">Scales & Modes</option>
              <option value="technique">Technique & Dexterity</option>
              <option value="improvisation">Improvisation</option>
              <option value="music_theory">Music Theory</option>
              <option value="song_learning">Song Learning</option>
            </select>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              My Goals
            </label>
            <ul className="space-y-2 mb-4">
              {formData.goals.map((goal, index) => (
                <li key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="text-gray-800 dark:text-gray-200">{goal}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(goal)}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                placeholder="Add a learning goal"
              />
              <button
                type="button"
                onClick={handleAddGoal}
                className="inline-flex items-center px-4 py-2 border border-l-0 border-yellow-500 text-sm font-medium rounded-r-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <FiPlus className="h-4 w-4 mr-1" /> Add Goal
              </button>
            </div>
          </div>
        </div>

        {/* Practice Preferences */}
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-md p-6">
          <div className="flex items-center mb-6">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 mr-3">
              <FiClock className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Practice Preferences</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="practiceFrequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Practice Frequency
              </label>
              <select
                id="practiceFrequency"
                name="practiceFrequency"
                value={formData.practiceFrequency}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              >
                <option value="daily">Daily</option>
                <option value="several_times_week">Several times a week</option>
                <option value="weekly">Once a week</option>
                <option value="few_times_month">A few times a month</option>
              </select>
            </div>

            <div>
              <label htmlFor="practiceDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Typical Practice Session (minutes)
              </label>
              <input
                type="number"
                id="practiceDuration"
                name="practiceDuration"
                value={formData.practiceDuration}
                onChange={handleChange}
                min="5"
                max="240"
                className={`block w-full rounded-md border ${errors.practiceDuration ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm`}
              />
              {errors.practiceDuration && <p className="mt-1 text-sm text-red-600">{errors.practiceDuration}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}