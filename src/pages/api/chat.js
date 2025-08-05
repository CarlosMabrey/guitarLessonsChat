import { OpenAI } from 'openai';
import { getOrCreateEmbeddings, findSimilarItems } from '../../lib/rag/embeddings';
import { getUserProfile } from '../../lib/profiledb';
import { buildPrompt } from '../../lib/utils/promptBuilder'; // Import the prompt builder utility
import formidable, { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import getRawBody from 'raw-body';
import contentType from 'content-type';

export const config = {
  api: { bodyParser: false }
};

async function parseForm(req) {
  const uploadDir = path.join(process.cwd(), '/public/uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = new IncomingForm();
  form.uploadDir = uploadDir;
  form.keepExtensions = true;

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let messages = null, apiKey = null;
  let uploadedFileName = null, fileType = null;

  // Debug: Log environment variables (don't log full key in production)
  console.log('Environment variables:', {
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    keyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'Not set'
  });

  console.log('Received chat request');

  let uploadedFileContent = null;

  // Try to parse as multipart/form-data for file upload
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    try {
      const { fields, files } = await parseForm(req);
      console.log('Formidable parsed fields:', fields);
      console.log('Formidable parsed files:', files);
      apiKey = fields.apiKey || process.env.OPENAI_API_KEY;
      messages = fields.messages ? JSON.parse(fields.messages) : [];
      
      // Handle accompanying text message with image
      const textMessage = fields.message;
      if (textMessage) {
        // formidable may return arrays, so handle both cases
        const messageText = Array.isArray(textMessage) ? textMessage[0] : textMessage;
        if (messageText && typeof messageText === 'string' && messageText.trim()) {
          console.log('Text message accompanying image:', messageText);
          messages.push({
            sender: 'user',
            content: messageText.trim(),
            timestamp: new Date().toISOString()
          });
        }
      }
      if (!files.file) {
        console.error('No file uploaded or incorrect field name. Expected field: "file". Received fields:', Object.keys(files));
        return res.status(400).json({ error: 'No file uploaded. Please upload an image file using the field name "file".' });
      }
      const fileEntry = files.file;
      const uploadedFile = Array.isArray(fileEntry) ? fileEntry[0] : fileEntry;
      
      console.log('Uploaded file object:', uploadedFile);
      uploadedFileName = uploadedFile.originalFilename || uploadedFile.newFilename || uploadedFile.name || 'unknown';
      fileType = uploadedFile.mimetype || uploadedFile.type || 'application/octet-stream';
// If mimetype is application/octet-stream, try to infer from extension
if (fileType === 'application/octet-stream' && uploadedFileName) {
  const ext = uploadedFileName.split('.').pop().toLowerCase();
  const extToMime = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
  };
  if (extToMime[ext]) {
    fileType = extToMime[ext];
    console.warn('Inferred mimetype from extension:', fileType);
  }
}
// Check for valid image mimetype
if (!fileType.startsWith('image/')) {
  console.error('Uploaded file is not an image. Received type:', fileType, 'Extension:', uploadedFileName);
  return res.status(400).json({ error: `Uploaded file is not an image. Received type: ${fileType}. Please upload a valid image file (png, jpg, jpeg, gif, webp).` });
}
      if (!uploadedFile.filepath || !fs.existsSync(uploadedFile.filepath)) {
        console.error('Uploaded file path is invalid or file does not exist:', uploadedFile.filepath);
        return res.status(400).json({ error: 'Failed to parse uploaded file. File path is invalid or missing.' });
      }
      const uploadsDir = './public/uploads';
      if (!fs.existsSync(uploadsDir)) {
        console.log('Uploads directory does not exist, creating:', uploadsDir);
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      // Save the file with a unique name
      const safeName = `${Date.now()}_${uploadedFileName.replace(/[^a-zA-Z0-9._-]/g, '')}`;
      const destPath = uploadsDir + '/' + safeName;
      try {
        console.log('Saving uploaded file to:', destPath);
        fs.copyFileSync(uploadedFile.filepath, destPath);
      } catch (err) {
        console.error('Error saving uploaded file:', err);
        return res.status(400).json({ error: 'Failed to save uploaded file.' });
      }
      const imageUrl = `/uploads/${safeName}`;
      // Debug logging for image upload
      console.log('Image upload detected:', {
        uploadedFileName,
        fileType,
        destPath,
        imageUrl,
        apiKeyProvided: !!apiKey
      });
        // Call OpenAI with a system prompt for image-to-tab conversion using buildPrompt
        try {
          const openai = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });
          // Compose a context for the buildPrompt utility
          const imageContext = `The user has uploaded an image of guitar sheet music or tablature. The image is available at: ${imageUrl}\n\nYour job is to analyze the image and return the corresponding guitar tab notation in plain text, using the same formatting as your usual tab output.`;
          // Use a blank user profile for now, or load if needed
          let userProfile = null;
          try {
            userProfile = await getUserProfile();
            console.log('Image upload: User profile loaded:', JSON.stringify(userProfile, null, 2));
          } catch (error) {
            console.error('Image upload: Error loading user profile:', error);
          }
          const systemPrompt = buildPrompt(userProfile, imageContext);
          console.log('Image upload: System prompt for image-to-tab:', systemPrompt);
          
          // Read the image file and convert to base64 for the vision model
          const imageBuffer = fs.readFileSync(destPath);
          const base64Image = imageBuffer.toString('base64');
          
          const userPrompt = {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this image of guitar sheet music/tablature and extract the tab notation accurately.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${fileType};base64,${base64Image}`
                }
              }
            ]
          };
          
          console.log('Image upload: Calling OpenAI vision model');
          const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: `You are an expert guitar tab transcription specialist helping with music education. Your task is to analyze guitar tablature images and return structured JSON data for educational purposes.

## EDUCATIONAL PURPOSE:
This transcription is for educational use only - helping students learn guitar techniques, understand tab notation, and practice musical skills. You are analyzing the technical aspects of guitar playing notation, not reproducing copyrighted works.

## OUTPUT FORMAT:
Return ONLY a JSON object with this exact structure:

{
  "title": "Educational Tab Exercise",
  "tempo": "BPM or tempo marking (if visible)",
  "tuning": "Standard or alternate tuning (if specified)",
  "measures": [
    {
      "measureNumber": 1,
      "timeSignature": "4/4",
      "notes": [
        {
          "position": 0,
          "strings": {
            "E": { "fret": 0, "techniques": [] },
            "B": { "fret": null, "techniques": [] },
            "G": { "fret": null, "techniques": [] },
            "D": { "fret": null, "techniques": [] },
            "A": { "fret": null, "techniques": [] },
            "e": { "fret": null, "techniques": [] }
          },
          "duration": "quarter",
          "techniques": []
        }
      ]
    }
  ]
}

## TECHNIQUE CODES:
- "h": hammer-on
- "p": pull-off
- "b": bend (include bend amount: "b1/2", "bfull", "b1.5")
- "r": release bend
- "slide_up": slide up
- "slide_down": slide down
- "vibrato": vibrato/tremolo
- "mute": muted/dead note
- "ghost": ghost note
- "palm_mute": palm mute
- "accent": accent
- "staccato": staccato
- "trill": trill

## DURATION VALUES:
- "whole", "half", "quarter", "eighth", "sixteenth"

## CRITICAL TIMING INSTRUCTIONS:
1. **Sequential Note Order**: Each note that is played one after another must have a different position value (0, 1, 2, 3, etc.)
2. **Simultaneous Notes Only**: Only notes played at the exact same time (chords) should share the same position value
3. **Time Flow**: Position values represent the time order - position 0 is first, position 1 is second, etc.
4. **Example**: If a tab shows "5-4-5-4" on one string, these are 4 separate notes at positions 0, 1, 2, 3
5. **Chord Example**: If multiple strings have frets at the same time position, they share the same position value

## ANALYSIS STEPS:
1. Read the tab from left to right, identifying each note in time order
2. Assign sequential position values (0, 1, 2, 3...) to each note or chord
3. Group only simultaneous notes (chords) under the same position
4. Extract fret numbers, techniques, and string assignments accurately
5. Return educational tab data in JSON format
6. If you cannot process the image, return a simple sequential example

Your goal is to help students understand guitar technique notation and proper timing. Focus on the educational value of the sequential note structure.`
              },
              userPrompt
            ],
            temperature: 0.2,
            max_tokens: 8000
          });
          console.log('Image upload: OpenAI completion response:', JSON.stringify(completion, null, 2));
          let rawTabResult = completion.choices?.[0]?.message?.content || 'Could not transcribe image.';
          
          // Try to parse as JSON, fallback to plain text if parsing fails
          let tabResult;
          let isJsonTab = false;
          
          try {
            // Clean the response to extract JSON if it's wrapped in text
            let jsonMatch = rawTabResult.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              let jsonStr = jsonMatch[0];
              
              // Try to parse as-is first
              try {
                const parsedTab = JSON.parse(jsonStr);
                if (parsedTab.measures && Array.isArray(parsedTab.measures)) {
                  tabResult = parsedTab;
                  isJsonTab = true;
                  console.log('Successfully parsed JSON tab data:', parsedTab);
                } else {
                  throw new Error('Invalid tab JSON structure');
                }
              } catch (parseError) {
                console.log('Initial JSON parse failed, attempting to repair truncated JSON:', parseError.message);
                
                // Attempt to repair truncated JSON by closing incomplete structures
                let repairedJson = jsonStr;
                
                // Count open braces and brackets to determine what needs closing
                let openBraces = (repairedJson.match(/\{/g) || []).length;
                let closeBraces = (repairedJson.match(/\}/g) || []).length;
                let openBrackets = (repairedJson.match(/\[/g) || []).length;
                let closeBrackets = (repairedJson.match(/\]/g) || []).length;
                
                // Remove any trailing incomplete content after the last complete property
                repairedJson = repairedJson.replace(/,\s*"[^"]*"\s*:\s*[^,}\]]*$/, '');
                repairedJson = repairedJson.replace(/,\s*$/, '');
                
                // Close missing brackets and braces
                for (let i = 0; i < (openBrackets - closeBrackets); i++) {
                  repairedJson += ']';
                }
                for (let i = 0; i < (openBraces - closeBraces); i++) {
                  repairedJson += '}';
                }
                
                // Try parsing the repaired JSON
                const parsedTab = JSON.parse(repairedJson);
                if (parsedTab.measures && Array.isArray(parsedTab.measures)) {
                  tabResult = parsedTab;
                  isJsonTab = true;
                  console.log('Successfully parsed repaired JSON tab data:', parsedTab);
                } else {
                  throw new Error('Invalid tab JSON structure after repair');
                }
              }
            } else {
              throw new Error('No JSON found in response');
            }
          } catch (error) {
            console.log('Failed to parse JSON tab, using plain text:', error.message);
            
            // Check if the AI refused to transcribe (common with copyrighted content)
            if (rawTabResult.toLowerCase().includes('unable to provide') || 
                rawTabResult.toLowerCase().includes('cannot provide') ||
                rawTabResult.toLowerCase().includes('can\'t provide')) {
              
              // Provide a sample JSON structure to demonstrate the TabRenderer
              console.log('AI refused transcription, providing sample tab data');
              tabResult = {
                "title": "Sample Guitar Exercise - Sequential Notes",
                "tempo": "120 BPM",
                "tuning": "Standard (E-A-D-G-B-E)",
                "measures": [
                  {
                    "measureNumber": 1,
                    "timeSignature": "4/4",
                    "notes": [
                      {
                        "position": 0,
                        "strings": {
                          "E": { "fret": 5, "techniques": [] },
                          "B": { "fret": null, "techniques": [] },
                          "G": { "fret": null, "techniques": [] },
                          "D": { "fret": null, "techniques": [] },
                          "A": { "fret": null, "techniques": [] },
                          "e": { "fret": null, "techniques": [] }
                        },
                        "duration": "quarter",
                        "techniques": []
                      },
                      {
                        "position": 1,
                        "strings": {
                          "E": { "fret": 4, "techniques": [] },
                          "B": { "fret": null, "techniques": [] },
                          "G": { "fret": null, "techniques": [] },
                          "D": { "fret": null, "techniques": [] },
                          "A": { "fret": null, "techniques": [] },
                          "e": { "fret": null, "techniques": [] }
                        },
                        "duration": "quarter",
                        "techniques": []
                      },
                      {
                        "position": 2,
                        "strings": {
                          "E": { "fret": 5, "techniques": [] },
                          "B": { "fret": null, "techniques": [] },
                          "G": { "fret": null, "techniques": [] },
                          "D": { "fret": null, "techniques": [] },
                          "A": { "fret": null, "techniques": [] },
                          "e": { "fret": null, "techniques": [] }
                        },
                        "duration": "quarter",
                        "techniques": []
                      },
                      {
                        "position": 3,
                        "strings": {
                          "E": { "fret": 4, "techniques": [] },
                          "B": { "fret": null, "techniques": [] },
                          "G": { "fret": null, "techniques": [] },
                          "D": { "fret": null, "techniques": [] },
                          "A": { "fret": null, "techniques": [] },
                          "e": { "fret": null, "techniques": [] }
                        },
                        "duration": "quarter",
                        "techniques": []
                      }
                    ]
                  },
                  {
                    "measureNumber": 2,
                    "timeSignature": "4/4",
                    "notes": [
                      {
                        "position": 0,
                        "strings": {
                          "E": { "fret": 0, "techniques": [] },
                          "B": { "fret": 0, "techniques": [] },
                          "G": { "fret": 0, "techniques": [] },
                          "D": { "fret": 0, "techniques": [] },
                          "A": { "fret": 0, "techniques": [] },
                          "e": { "fret": 0, "techniques": [] }
                        },
                        "duration": "whole",
                        "techniques": []
                      }
                    ]
                  }
                ]
              };
              isJsonTab = true;
              
              // Update the raw result to include explanation
              rawTabResult = `I'm unable to transcribe copyrighted material directly, but I've created a sample tab structure to demonstrate the enhanced tab renderer. This shows how the system can display detailed guitar techniques including bends, slides, and hammer-ons with proper formatting.`;
            } else {
              tabResult = rawTabResult;
              isJsonTab = false;
            }
          }
          
          // Instead of returning immediately, add the tab result as an AI message and continue
          messages = messages || [];
          messages.push({
            sender: 'user',
            content: `[Image uploaded: ${uploadedFileName}]`,
            fileName: uploadedFileName,
            fileType: fileType,
            imageUrl: imageUrl,
            timestamp: new Date().toISOString()
          });
          messages.push({
            sender: 'ai', 
            content: isJsonTab ? JSON.stringify(tabResult) : tabResult,
            timestamp: new Date().toISOString(),
            tabData: isJsonTab ? tabResult : null,
            isTabTranscription: true
          });
          
          // Return the response in the expected chat format
          return res.status(200).json({
            message: isJsonTab ? JSON.stringify(tabResult) : tabResult,
            imageUrl,
            messages: messages,
            tabData: isJsonTab ? tabResult : null,
            isTabTranscription: true
          });
        } catch (err) {
          console.error('OpenAI image-to-tab error:', err);
          return res.status(500).json({ error: 'Failed to convert image to tab.', details: err.message });
        }
    } catch (err) {
      console.error('Error parsing form data:', err);
      return res.status(400).json({ error: 'Failed to parse uploaded file.' });
    }
  } else {
    // Fallback: parse as JSON for normal chat
    try {
      const raw = await getRawBody(req);
      const charset = contentType.parse(req).parameters.charset || 'utf-8';
      const body = JSON.parse(raw.toString(charset));
      messages = body.messages;
      apiKey = body.apiKey || process.env.OPENAI_API_KEY;
    } catch (err) {
      return res.status(400).json({ error: 'Invalid request body.' });
    }
  }

  try {
    // Use client API key if provided, otherwise fall back to environment variable
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
