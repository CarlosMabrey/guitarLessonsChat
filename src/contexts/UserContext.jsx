'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile as updateProfile } from '@/lib/db';

export const UserContext = createContext({
  userProfile: null,
  isLoading: true,
  updateUserProfile: async () => {},
  refreshUserProfile: async () => {}
});

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await getUserProfile();
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      await updateProfile(updates);
      return await loadUserProfile();
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  return (
    <UserContext.Provider
      value={{
        userProfile,
        isLoading,
        updateUserProfile,
        refreshUserProfile: loadUserProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
