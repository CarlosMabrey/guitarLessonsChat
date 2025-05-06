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
  OPENAI_MODEL: "gpt-4o",  // or gpt-3.5-turbo for a more economical option
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.7,
  SEARCH_RESULT_COUNT: 5
};

// Feature flags - loaded from environment variables
export const FEATURES = {
  ENABLE_WEB_SEARCH: ENV.ENABLE_WEB_SEARCH,
  ENABLE_SONG_GENERATION: ENV.ENABLE_SONG_GENERATION,
  ENABLE_CHORD_DIAGRAMS: true
}; 