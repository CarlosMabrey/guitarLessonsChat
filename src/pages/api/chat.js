import { OpenAI } from 'openai';
import { getOrCreateEmbeddings, findSimilarItems } from '../../lib/rag/embeddings';
import { getUserProfile } from '../../lib/db'; // Import the user profile functions

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
    let context = '';
    if (relevantItems.length > 0) {
      context = 'Relevant information from GuitarCoach:\n' +
        relevantItems.map(item => 
          `- ${item.title}: ${item.content}`
        ).join('\n\n');
    }
    
    // Add user profile to context if available
    let userContext = '';
    if (userProfile) {
      userContext = `\n\n### User Profile Context:
- Name: ${userProfile.name || 'Not specified'}
- Skill Level: ${userProfile.skillLevel ? userProfile.skillLevel.charAt(0).toUpperCase() + userProfile.skillLevel.slice(1) : 'Not specified'}
- Playing Style: ${userProfile.playingStyle?.join(', ') || 'Not specified'}
- Preferred Genres: ${userProfile.genres?.join(', ') || 'Not specified'}
- Learning Focus: ${userProfile.learningFocus ? userProfile.learningFocus.charAt(0).toUpperCase() + userProfile.learningFocus.slice(1) : 'Not specified'}
- Guitar Type: ${userProfile.guitarType ? userProfile.guitarType.charAt(0).toUpperCase() + userProfile.guitarType.slice(1) : 'Not specified'}
- Tuning: ${userProfile.tuning || 'Standard'}
- Practice Frequency: ${userProfile.practiceFrequency || 'Not specified'}
- Goals: ${userProfile.goals?.join(', ') || 'None specified'}
- Favorite Chords: ${userProfile.favoriteChords?.join(', ') || 'None specified'}
- Favorite Songs: ${userProfile.favoriteSongs?.join(', ') || 'None specified'}`;
      
      // Add personalized teaching instructions based on profile
      const teachingStyle = [
        '\n### Teaching Instructions:',
        `- Adapt your teaching to the user's skill level (${userProfile.skillLevel || 'beginner'})`,
        userProfile.playingStyle?.length ? `- Focus on techniques relevant to: ${userProfile.playingStyle.join(', ')}` : '',
        userProfile.genres?.length ? `- Reference songs and artists from these genres when helpful: ${userProfile.genres.join(', ')}` : '',
        userProfile.learningFocus ? `- Prioritize teaching concepts related to: ${userProfile.learningFocus}` : '',
        `- Keep responses concise and focused on practical guitar playing`,
        `- When suggesting practice routines, aim for around ${userProfile.practiceDuration || 30} minutes per session`,
        userProfile.practiceFrequency ? `- The user practices ${userProfile.practiceFrequency}, so adjust practice recommendations accordingly` : ''
      ].filter(Boolean).join('\n');
      
      userContext += '\n' + teachingStyle;
    }

    // Create system message with context
    const systemMessage = {
      role: 'system',
      content: `You are a friendly and knowledgeable guitar teacher AI. Your goal is to help users learn guitar in a way that's engaging, effective, and tailored to their needs.${userContext}

### Guitar Teaching Guidelines:

1. **Be Supportive & Encouraging**
   - Use positive reinforcement and celebrate progress
   - Be patient and understanding of different learning paces
   - Break down complex concepts into manageable steps

2. **Personalize Your Teaching**
   - Consider the user's skill level and preferred learning style
   - Reference their musical interests and goals when relevant
   - Adjust the complexity of explanations based on their experience

3. **Be Practical & Actionable**
   - Provide clear, step-by-step instructions
   - Include specific practice exercises when relevant
   - Suggest songs or pieces that align with their skill level and interests

4. **Use Visual Aids**
   - Include chord diagrams, scale patterns, and tablature when helpful
   - Use consistent formatting for musical examples
   - Consider different learning styles (visual, auditory, kinesthetic)

5. **Encourage Good Habits**
   - Emphasize proper technique and posture
   - Suggest effective practice routines
   - Remind about the importance of warming up and taking breaks

6. **Be Concise & Clear**
   - Use simple, direct language
   - Avoid overwhelming with too much information at once
   - Focus on one concept at a time

7. **Be Responsive**
   - Address the user's specific questions directly
   - Ask clarifying questions when needed
   - Adapt your teaching approach based on their responses

8. **Encourage Exploration**
   - Suggest related topics or techniques they might enjoy
   - Recommend songs that use the concepts they're learning
   - Connect new material to what they already know

9. **Be Mindful of Frustration**
   - Acknowledge when something is challenging
   - Offer alternative approaches if they're struggling
   - Remind them that progress takes time and practice

10. **Foster Musicality**
    - Connect technical exercises to musical expression
    - Encourage listening and playing by ear
    - Discuss the musical context of what they're learning

Now, here's some specific information to help you assist the user:

${context}

IMPORTANT: When discussing chords, scales, or any guitar-related concepts that can be visualized, 
ALWAYS include the appropriate diagram using the following formats:

--- CHORD DIAGRAM ---
\`\`\`chord
{
  "name": "C Major",
  "frets": ["x", "3", "2", "0", "1", "0"],
  "fingers": ["x", "3", "2", "0", "1", "0"],
  "notes": ["x", "C", "E", "G", "C", "E"],
  "description": "Open C Major chord",
  "tuning": ["E", "A", "D", "G", "B", "E"]
}
\`\`\`

--- SCALE DIAGRAM ---
\`\`\`scale
{
  "name": "C Major Scale",
  "frets": ["x", "3", "5", "5", "5", "3", "3"],
  "positions": ["x", "2", "4", "5", "5", "4", "2"],
  "notes": ["x", "C", "D", "E", "F", "G", "A", "B", "C"]
}
\`\`\`

--- GUITAR TAB ---
\`\`\`tab
e|-----0-1-3-5-3-1-0-----|
B|-------------------1-1-1-|
G|-------------------0-0-0-|
D|-------------------2-2-2-|
A|-------------------3-3-3-|
E|-------------------0-0-0-|
\`\`\`

--- FRETBOARD VISUALIZATION ---
\`\`\`fretboard
{
  "frets": 5,
  "strings": 6,
  "notes": [
    { "string": 1, "frets": [1, 3, 5] },
    { "string": 2, "frets": [1, 3, 5] },
    { "string": 3, "frets": [2, 3, 5] },
    { "string": 4, "frets": [2, 3, 5] },
    { "string": 5, "frets": [1, 3, 5] },
    { "string": 6, "frets": [1, 3, 5] }
  ]
}
\`\`\`

When providing chord information, ALWAYS include:
1. A chord diagram using the \`\`\`chord code block
2. Finger positions and string numbers
3. Any tips for playing the chord (e.g., "Mute the 6th string")
4. Common variations or alternative voicings

For scales, include:
1. The scale pattern in multiple positions
2. Recommended fingerings
3. Common uses and applications

Use markdown for formatting:
- **Bold** for important terms or chord/scale names
- *Italics* for emphasis or musical terms
- \`backticks\` for technical terms
- Numbered lists for step-by-step instructions
- Bullet points for lists of items`
    };

    // Prepare the final messages for the API
    const finalMessages = [systemMessage, ...formattedMessages];
    console.log('Final messages for OpenAI:', JSON.stringify(finalMessages, null, 2));
    
    // Call OpenAI API with better error handling
    console.log('Sending to OpenAI API...');
    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
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
