'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FiArrowLeft, FiUser, FiGuitar, FiMusic, FiAward, FiTarget, FiClock } from 'react-icons/fi';
import UserProfileEditor from '@/components/profile/UserProfileEditor';
import Layout from '@/components/ui/Layout';
import { useUser } from '@/contexts/UserContext';

export default function ProfilePage() {
  const { userProfile, isLoading, updateUserProfile } = useUser();
  const [showEditor, setShowEditor] = useState(false);
  const [localProfile, setLocalProfile] = useState(null);

  useEffect(() => {
    if (userProfile) {
      setLocalProfile(userProfile);
    }
  }, [userProfile]);

  const handleSave = async (updatedProfile) => {
    try {
      await updateUserProfile(updatedProfile);
      setShowEditor(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Layout title="My Profile" version="1.0.0">
      <Head>
        <title>My Profile | Guitar Coach</title>
        <meta name="description" content="View and edit your guitar learning profile" />
      </Head>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            <FiArrowLeft className="mr-1" /> Back to Dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your guitar learning preferences and track your progress
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {showEditor ? (
            <div className="p-6">
              <UserProfileEditor 
                onSave={handleSave} 
                onCancel={() => setShowEditor(false)} 
              />
            </div>
          ) : (
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    <FiUser className="inline mr-2" />
                    My Profile
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Update your guitar learning preferences to get personalized recommendations
                  </p>
                </div>
                <button
                  onClick={() => setShowEditor(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Profile
                </button>
              </div>

              {localProfile ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <FiUser className="inline mr-2" /> Basic Information
                      </h3>
                      <p className="text-gray-900 dark:text-white">
                        {localProfile.name || 'Not specified'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Skill Level: <span className="font-medium text-gray-700 dark:text-gray-200">
                          {localProfile.skillLevel ? localProfile.skillLevel.charAt(0).toUpperCase() + localProfile.skillLevel.slice(1) : 'Not specified'}
                        </span>
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <FiGuitar className="inline mr-2" /> Guitar Details
                      </h3>
                      <p className="text-gray-900 dark:text-white">
                        {localProfile.guitarType ? localProfile.guitarType.charAt(0).toUpperCase() + localProfile.guitarType.slice(1) : 'Not specified'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Tuning: <span className="font-medium text-gray-700 dark:text-gray-200">
                          {localProfile.tuning || 'Standard'}
                        </span>
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <FiMusic className="inline mr-2" /> Music Preferences
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {localProfile.genres && localProfile.genres.length > 0 ? (
                          localProfile.genres.map((genre, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                              {genre}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">No genres specified</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <FiAward className="inline mr-2" /> Playing Style
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {localProfile.playingStyle && localProfile.playingStyle.length > 0 ? (
                          localProfile.playingStyle.map((style, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {style}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">No styles specified</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <FiTarget className="inline mr-2" /> Learning Focus
                      </h3>
                      <p className="text-gray-900 dark:text-white">
                        {localProfile.learningFocus ? localProfile.learningFocus.charAt(0).toUpperCase() + localProfile.learningFocus.slice(1) : 'Not specified'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        <FiClock className="inline mr-2" /> Practice
                      </h3>
                      <p className="text-gray-900 dark:text-white">
                        {localProfile.practiceFrequency || 'Not specified'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Session Duration: <span className="font-medium text-gray-700 dark:text-gray-200">
                          {localProfile.practiceDuration || '30'} minutes
                        </span>
                      </p>
                    </div>
                  </div>

                  {localProfile.goals && localProfile.goals.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                        My Learning Goals
                      </h3>
                      <ul className="space-y-2">
                        {localProfile.goals.map((goal, i) => (
                          <li key={i} className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
