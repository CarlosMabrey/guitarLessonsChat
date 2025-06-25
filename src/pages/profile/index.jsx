'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  FiArrowLeft, 
  FiUser, 
  FiMusic, 
  FiAward, 
  FiTarget, 
  FiClock,
  FiEdit2,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import Layout from '@/components/ui/Layout';
import { useUser } from '@/contexts/UserContext';

// Import both profile editors
import UserProfileEditor from '@/components/profile/UserProfileEditor';
import UserProfileForm from '@/components/profile/UserProfileForm';

// Helper function to get skill level display text
const getSkillLevelDisplay = (level) => {
  if (!level) return 'Not specified';
  return level.charAt(0).toUpperCase() + level.slice(1);
};

// Helper function to get practice frequency display text
const getPracticeFrequencyDisplay = (frequency) => {
  const frequencyMap = {
    'daily': 'Daily',
    'several_times_week': 'Several times a week',
    'weekly': 'Once a week',
    'few_times_month': 'A few times a month',
    'occasionally': 'Occasionally'
  };
  return frequencyMap[frequency] || frequency || 'Not specified';
};

export default function ProfilePage() {
  const { userProfile, isLoading, updateUserProfile } = useUser();
  const [showEditor, setShowEditor] = useState(false);
  const [localProfile, setLocalProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [useLegacyForm, setUseLegacyForm] = useState(false); // Toggle between editors

  // Initialize local profile state when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setLocalProfile(userProfile);
      if (userProfile.updatedAt) {
        setLastUpdated(new Date(userProfile.updatedAt).toLocaleString());
      }
    }
  }, [userProfile]);

  // Handle saving the profile
  const handleSave = async (updatedProfile) => {
    setIsSaving(true);
    try {
      await updateUserProfile(updatedProfile);
      setLocalProfile(updatedProfile);
      setLastUpdated(new Date().toLocaleString());
      setShowEditor(false);
      toast.success('Profile updated successfully!', {
        icon: <FiCheckCircle className="text-green-500" />,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.', {
        icon: <FiAlertCircle className="text-red-500" />,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setShowEditor(!showEditor);
  };

  // Loading state
  if (isLoading || (!localProfile && !showEditor)) {
    return (
      <Layout title="Loading Profile..." version="1.0.0">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Profile" version="1.0.0">
      <Head>
        <title>My Profile | Guitar Coach</title>
        <meta name="description" content="View and edit your guitar learning profile" />
      </Head>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              <FiArrowLeft className="mr-1" /> Back to Dashboard
            </Link>
            {lastUpdated && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {lastUpdated}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {localProfile?.name || 'My Profile'}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage your guitar learning preferences and track your progress
              </p>
            </div>
            {!showEditor && (
              <button
                onClick={toggleEditMode}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FiEdit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-all duration-200">
          {!localProfile ? (
            <div className="p-6">Loading profile...</div>
          ) : showEditor ? (
            <div className="p-6">
              <div className="flex justify-end mb-4">
                <button
                  className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-200 mr-2 border border-slate-300 dark:border-slate-600"
                  onClick={() => setUseLegacyForm((prev) => !prev)}
                >
                  Switch to {useLegacyForm ? 'New Editor' : 'Legacy Form'}
                </button>
              </div>
              {useLegacyForm ? (
                <UserProfileForm
                  onChange={async (updatedProfile) => {
                    await handleSave(updatedProfile);
                    setShowEditor(false);
                  }}
                />
              ) : (
                <UserProfileEditor
                  initialData={localProfile}
                  onSave={handleSave}
                  onCancel={toggleEditMode}
                />
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mr-3">
                      <FiUser className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Basic Information</h2>
                  </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {localProfile?.name || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Skill Level</p>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {getSkillLevelDisplay(localProfile?.skillLevel)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Guitar Details */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50 mr-3">
                        <FiMusic className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Guitar Details</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Guitar Type</p>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {localProfile?.guitarType ? 
                            localProfile.guitarType.charAt(0).toUpperCase() + localProfile.guitarType.slice(1) : 
                            'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tuning</p>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {localProfile?.tuning || 'Standard (EADGBE)'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Music Preferences */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50 mr-3">
                        <FiMusic className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Music Preferences</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Favorite Genres</p>
                        <div className="flex flex-wrap gap-2">
                          {localProfile?.genres?.length > 0 ? (
                            localProfile.genres.map((genre, i) => (
                              <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                                {genre}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No genres specified</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Playing Style</p>
                        <div className="flex flex-wrap gap-2">
                          {localProfile?.playingStyle?.length > 0 ? (
                            localProfile.playingStyle.map((style, i) => (
                              <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                                {style}
                              </span>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No styles specified</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Learning & Practice */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/50 mr-3">
                        <FiTarget className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Learning & Practice</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Primary Learning Focus</p>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {localProfile?.learningFocus ? 
                            localProfile.learningFocus.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ') : 
                            'Not specified'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Practice Frequency</p>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {getPracticeFrequencyDisplay(localProfile?.practiceFrequency)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Session Duration</p>
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {localProfile?.practiceDuration || '30'} minutes
                        </p>
                      </div>
                    </div>
                  </div>

                {/* Learning Goals */}
                {localProfile?.goals?.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50 mr-3">
                        <FiAward className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">My Learning Goals</h2>
                    </div>
                    
                    <ul className="space-y-3">
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
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
