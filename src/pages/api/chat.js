import { OpenAI } from 'openai';
import { getOrCreateEmbeddings, findSimilarItems } from '../../lib/rag/embeddings';
import { getUserProfile } from '../../lib/db'; // Import the user profile functions
import { buildPrompt } from '../../lib/utils/promptBuilder'; // Import the prompt builder utility

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Debug: Log environment variables (don't log full key in production)
  console.log('Environment variables:', {
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    keyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'Not set'
  });

  console.log('Received chat request');
  
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const { messages, apiKey: clientApiKey } = req.body;
    
    // Use client API key if provided, otherwise fall back to environment variable
    const apiKey = clientApiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('No API key provided in request or environment variable');
      return res.status(400).json({ 
        error: 'API key is required. Please set it in the settings or in your .env file as OPENAI_API_KEY' 
      });
    }
    
    console.log('Using API key:', apiKey ? '***' + apiKey.slice(-4) : 'none');

        // Get the last user message
    console.log('All messages:', JSON.stringify(messages, null, 2));
    
    const lastUserMessage = [...messages].reverse().find(msg => msg.sender === 'user');
    const userQuery = lastUserMessage?.content || '';
    
    // Get user profile for context
    let userProfile = null;
    try {
      userProfile = await getUserProfile();
      console.log('User profile loaded:', JSON.stringify(userProfile, null, 2));
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Continue without profile if there's an error
    }
    
    console.log('Last user message:', lastUserMessage);
    console.log('User query:', userQuery);

    // Initialize OpenAI client with better error handling
    console.log('Initializing OpenAI client with key:', apiKey ? '***' + apiKey.slice(-4) : 'No key provided');
    
    if (!apiKey) {
      console.error('No API key provided in request or environment variables');
      return res.status(400).json({ 
        error: 'No API key provided. Please set it in the settings or in your .env.local file as OPENAI_API_KEY'
      });
    }
    
    let openai;
    try {
      openai = new OpenAI({
        apiKey: apiKey,
      });
      console.log('OpenAI client initialized successfully');
    } catch (error) {
      console.error('Error initializing OpenAI client:', error);
      return res.status(500).json({ 
        error: 'Failed to initialize OpenAI client',
        details: error.message
      });
    }

    // Get or create embeddings for the knowledge base
    const knowledgeItems = await getOrCreateEmbeddings(apiKey);
    
    // Find relevant knowledge base items
    const relevantItems = await findSimilarItems(userQuery, knowledgeItems, apiKey, 3);
    
    // Format messages for OpenAI API
    const chatMessages = messages
      .filter(msg => msg.sender === 'user' || msg.sender === 'ai')
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));
    
    // Ensure we don't have consecutive messages from the same role
    const formattedMessages = [];
    let lastRole = null;
    
    for (const msg of chatMessages) {
      if (msg.role !== lastRole) {
        formattedMessages.push(msg);
        lastRole = msg.role;
      }
    }

    // Note: userProfile is already loaded above, no need to get it again
    
    // Create context from relevant knowledge base items
    let contextContent = '';
    if (relevantItems.length > 0) {
      contextContent = 'Relevant information from GuitarCoach:\n' +
        relevantItems.map(item => 
          `- ${item.title}: ${item.content}`
        ).join('\n\n');
    }
    
    // Use the buildPrompt utility to create an optimized system message
    const systemMessage = buildPrompt(userProfile, contextContent);
    
    // Log the token count and savings for debugging/optimization purposes
    const originalPromptLength = JSON.stringify(systemMessage).length;
    console.log('System prompt token usage (approx):', Math.ceil(originalPromptLength / 4), 'tokens');
    console.log('System prompt length:', originalPromptLength, 'characters');

    // Prepare the final messages for the API
    const finalMessages = [systemMessage, ...formattedMessages];
    console.log('Final messages for OpenAI:', JSON.stringify(finalMessages, null, 2));
    
    // Call OpenAI API with better error handling
    console.log('Sending to OpenAI API...');
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: finalMessages,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      
      console.log('OpenAI API Response:', JSON.stringify(completion, null, 2));
      
      if (!completion.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI API: ' + JSON.stringify(completion));
      }
    } catch (error) {
      console.error('OpenAI API Error:', {
        message: error.message,
        status: error.status,
        code: error.code,
        response: error.response?.data,
        stack: error.stack
      });
      
      // Return a more detailed error message
      return res.status(500).json({
        error: 'OpenAI API Error',
        message: error.message,
        details: error.response?.data || {},
        code: error.code
      });
    }
    
    const responseMessage = completion.choices[0].message.content || '';
    
    // Log the response for debugging
    console.log('OpenAI Response:', {
      input: userQuery,
      output: responseMessage,
      usage: completion.usage,
      model: completion.model,
      id: completion.id,
      created: completion.created
    });
    
    console.log('Response message length:', responseMessage.length);
    console.log('Response preview:', responseMessage.substring(0, 200) + '...');

    res.status(200).json({
      message: responseMessage,
      context: relevantItems.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        score: item._score
      }))
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    
    // Handle different types of errors
    let errorMessage = 'An error occurred while processing your request';
    let statusCode = 500;

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      statusCode = error.response.status;
      const errorData = error.response.data;
      errorMessage = errorData.error?.message || JSON.stringify(errorData);
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response received from the API. Please check your internet connection.';
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'Invalid API key. Please check your API key and try again.';
      statusCode = 401;
    } else if (error.message) {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message;
    }

    // If it's a rate limit error, provide more helpful information
    if (error.code === 'rate_limit_exceeded') {
      errorMessage = 'API rate limit exceeded. Please try again later or check your OpenAI usage.';
      statusCode = 429;
    }

    res.status(statusCode).json({
      error: errorMessage,
      code: error.code,
      status: statusCode
    });
  }
}
