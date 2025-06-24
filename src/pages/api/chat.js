import { OpenAI } from 'openai';
import { getOrCreateEmbeddings, findSimilarItems } from '../../lib/rag/embeddings';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(msg => msg.isUser);
    const userQuery = lastUserMessage?.content || '';

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Get or create embeddings for the knowledge base
    const knowledgeItems = await getOrCreateEmbeddings(apiKey);
    
    // Find relevant knowledge base items
    const relevantItems = await findSimilarItems(userQuery, knowledgeItems, apiKey, 3);
    
    // Format messages for OpenAI API
    const chatMessages = messages.map((msg) => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Create context from relevant knowledge base items
    let context = '';
    if (relevantItems.length > 0) {
      context = 'Relevant information from GuitarCoach:\n' +
        relevantItems.map(item => 
          `- ${item.title}: ${item.content}`
        ).join('\n\n');
    }

    // System message with context
    const systemMessage = {
      role: 'system',
      content: `You are a helpful and knowledgeable guitar practice assistant for the GuitarCoach app. 
      Your role is to help users with:
      - Guitar practice techniques and exercises
      - Music theory questions
      - Chord and scale explanations
      - Practice routines and tips
      - General guitar playing advice
      - Questions about the GuitarCoach app
      
      Be encouraging, patient, and provide clear, actionable advice.
      When appropriate, include specific exercises or practice routines.
      
      Use the following context to inform your responses when relevant, 
      but don't mention it directly unless the user asks for sources:
      
      ${context}
      
      If the user asks about something not covered in the context, 
      use your general knowledge to provide a helpful response.`,
    };

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [systemMessage, ...chatMessages],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseMessage = completion.choices[0].message.content;

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
