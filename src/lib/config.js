/**
 * Application Configuration
 * 
 * This file contains global configuration settings for the application.
 * For sensitive information, use environment variables in .env.local
 */

// Config file for API keys and environment variables
// In a production app, these would be loaded from environment variables

import { ENV } from './env';

// API Keys - loaded from environment variables
export const API_KEYS = {
  OPENAI_API_KEY: ENV.OPENAI_API_KEY || "your_openai_api_key_here",
  SERPAPI_KEY: ENV.SERPAPI_KEY || "your_serpapi_key_here"
};

// API Configuration
export const API_CONFIG = {
  // Feature flags for enabling/disabling real API calls
  USE_REAL_APIS: {
    SPOTIFY: process.env.NEXT_PUBLIC_USE_REAL_SPOTIFY_API === 'true',
    YOUTUBE: process.env.NEXT_PUBLIC_USE_REAL_YOUTUBE_API === 'true',
    SONGSTERR: true // Songsterr API is always used since it's core functionality
  },
  
  // API Keys (these should be set in .env.local)
  KEYS: {
    SPOTIFY_CLIENT_ID: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET,
    YOUTUBE_API_KEY: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
  },
  
  // API Endpoints
  ENDPOINTS: {
    SPOTIFY: {
      TOKEN: 'https://accounts.spotify.com/api/token',
      SEARCH: 'https://api.spotify.com/v1/search',
      TRACK: 'https://api.spotify.com/v1/tracks'
    },
    YOUTUBE: {
      SEARCH: 'https://www.googleapis.com/youtube/v3/search',
      VIDEOS: 'https://www.googleapis.com/youtube/v3/videos'
    },
    SONGSTERR: {
      SEARCH: 'https://www.songsterr.com/a/ra/songs.json',
      SONG: 'https://www.songsterr.com/a/ra/song.json'
    }
  }
};

// Application settings
export const APP_CONFIG = {
  // UI settings
  UI: {
    THEME: 'dark', // 'light' or 'dark'
    DEFAULT_PRACTICE_TIME: 20, // minutes
  },
  
  // Default song settings
  DEFAULTS: {
    SONG: {
      DIFFICULTY: 3,
      TEMPO: 120,
      KEY: 'C',
      GENRE: 'Rock',
      ALBUM: 'Unknown Album'
    }
  }
};

// Debug settings
export const DEBUG = {
  ENABLED: process.env.NODE_ENV === 'development',
  LOG_API_CALLS: process.env.NODE_ENV === 'development',
  MOCK_DATA: process.env.NODE_ENV === 'development'
};

// Feature flags - loaded from environment variables
export const FEATURES = {
  ENABLE_WEB_SEARCH: ENV.ENABLE_WEB_SEARCH,
  ENABLE_SONG_GENERATION: ENV.ENABLE_SONG_GENERATION,
  ENABLE_CHORD_DIAGRAMS: true
}; 