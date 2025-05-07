# Setting Up API Keys for GuitarCoach

To enable AI song analysis and web search features in GuitarCoach, you need to set up API keys for OpenAI and SerpAPI (Google Search API). Follow these instructions to get your application working with these services.

## Step 1: Get Your API Keys

### OpenAI API Key
1. Go to [OpenAI's Platform](https://platform.openai.com/api-keys)
2. Create an account or log in
3. Navigate to the API keys section
4. Click "Create new secret key"
5. Give your key a name (e.g., "GuitarCoach App")
6. Copy the API key (you won't be able to see it again)

### SerpAPI Key
1. Go to [SerpAPI](https://serpapi.com/dashboard)
2. Create an account or log in
3. You'll find your API key on the dashboard
4. Copy the API key

## Step 2: Set Environment Variables

There are two ways to add your API keys to the application:

### Option 1: Using a .env.local File (Recommended)

1. Create a file named `.env.local` in the root directory of your project
2. Add the following lines to the file:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SERPAPI_KEY=your_serpapi_key_here
```
3. Replace `your_openai_api_key_here` and `your_serpapi_key_here` with your actual API keys
4. Save the file

### Option 2: Edit the Config File Directly

If you're just testing or developing locally, you can also set the keys directly in the config file:

1. Open `src/lib/config.js`
2. Replace the placeholder values with your actual API keys:
```javascript
export const API_KEYS = {
  OPENAI_API_KEY: "your_actual_openai_key_here",
  SERPAPI_KEY: "your_actual_serpapi_key_here"
};
```

## Step 3: Restart the Application

After setting up your API keys, restart the application for the changes to take effect:

```
npm run dev
```

## Troubleshooting

If you encounter issues with the API integration:

1. Check that your API keys are correctly entered without any extra spaces
2. Verify that your OpenAI account has sufficient credits
3. Check that SerpAPI is working correctly by testing a search on their dashboard
4. Look for error messages in the browser console (F12)

## API Key Security

- **IMPORTANT**: Never commit your API keys to version control
- The `.env.local` file is automatically ignored by Git if you're using the standard Next.js configuration
- If you're deploying the application, use environment variables in your hosting platform (Vercel, Netlify, etc.)

## Features Enabled by APIs

- **OpenAI API**: Powers the AI song analysis feature that provides chord diagrams, practice plans, and song structure
- **SerpAPI**: Enhances AI analysis by finding accurate information about songs online

If you need further assistance, contact the development team or open an issue on GitHub. 