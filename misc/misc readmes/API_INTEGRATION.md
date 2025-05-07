# API Integration Guide

This guide explains how to set up and use the real APIs for Spotify and YouTube in the Guitar Learning App.

## Overview

The app can automatically fetch information from the following sources:

1. **Songsterr** - For guitar tabs
2. **Spotify** - For track information and embedding
3. **YouTube** - For guitar lessons, tutorials, and music videos

By default, the app uses mock data for development purposes. To use real APIs, you need to:

1. Create API keys for each service
2. Add these keys to your environment variables
3. Enable the API integrations in your configuration

## Setting Up API Keys

### Spotify API Setup

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Log in with your Spotify account (create one if needed)
3. Click "Create an App"
4. Fill in the app name and description (e.g., "Guitar Learning App")
5. Accept the terms and create the app
6. Once created, note your **Client ID** and **Client Secret**

### YouTube API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to "APIs & Services" > "Library"
4. Search for "YouTube Data API v3" and enable it
5. Go to "APIs & Services" > "Credentials"
6. Click "Create Credentials" > "API Key"
7. Copy your new **API Key**

## Configuration

1. Copy the `env.example` file to `.env.local`
2. Add your API keys to the appropriate fields:

```
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
```

3. Enable the APIs by setting the feature flags to `true`:

```
NEXT_PUBLIC_USE_REAL_SPOTIFY_API=true
NEXT_PUBLIC_USE_REAL_YOUTUBE_API=true
```

## Usage

Once configured, the app will automatically use the real APIs when:

- Searching for songs
- Adding new songs to your library
- Viewing song details
- Displaying Spotify and YouTube embeds

The results from the real APIs will include:

- **Spotify** - Track information, album art, and playable embeds
- **YouTube** - Guitar tutorials, lessons, covers, and official videos

## API Quotas and Limitations

Be aware of the following limitations:

- The **YouTube Data API** has a daily quota (typically 10,000 units)
  - Each search request uses about 100 units
  - The app is designed to minimize API calls by caching results

- The **Spotify Web API** has rate limits (typically 5-10 requests/second)
  - The app implements token caching to reduce authentication calls

## Troubleshooting

If you encounter issues with the API integrations:

1. Check your `.env.local` file to ensure the keys are correct
2. Check the browser console for any API errors
3. Verify that the feature flags are set to `true`
4. Ensure your API keys have the correct permissions
5. Check if you've exceeded your API quotas or rate limits

## Fallback Behavior

If an API call fails or no results are found, the app will automatically fall back to:

1. Mock data for development
2. Previously cached data if available
3. Generic placeholder information

This ensures the app remains functional even when APIs are unavailable.

## Advanced Customization

You can modify the API behaviors in the following files:

- `src/lib/config.js` - API configuration settings
- `src/lib/services/spotifyApi.js` - Spotify API client
- `src/lib/services/youtubeApi.js` - YouTube API client
- `src/lib/songLinkService.js` - Main service that coordinates API calls 