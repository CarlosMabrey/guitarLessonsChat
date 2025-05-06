/**
 * Environment variable handler for Guitar Learning App
 * 
 * To set up API keys:
 * 1. Create a .env.local file in the root of your project
 * 2. Add the following variables:
 *    NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
 *    NEXT_PUBLIC_SERPAPI_KEY=your_serpapi_key_here
 * 
 * You can get API keys from:
 * - OpenAI: https://platform.openai.com/api-keys
 * - SerpAPI: https://serpapi.com/dashboard
 */

// Get environment variables with fallbacks
export function getEnvVar(name, fallback = '') {
  // Check for browser environment
  if (typeof window !== 'undefined') {
    return process.env[`NEXT_PUBLIC_${name}`] || fallback;
  }
  
  // Server environment
  return process.env[name] || fallback;
}

// Load environment variables
export const ENV = {
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY', ''),
  SERPAPI_KEY: getEnvVar('SERPAPI_KEY', ''),
  ENABLE_WEB_SEARCH: getEnvVar('ENABLE_WEB_SEARCH', 'true') === 'true',
  ENABLE_SONG_GENERATION: getEnvVar('ENABLE_SONG_GENERATION', 'true') === 'true',
}; 