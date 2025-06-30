# OpenAI API Integration

This document provides a detailed explanation of how the Guitar Lessons Chat application integrates with the OpenAI API to provide AI-powered chat functionality.

## Table of Contents

1. [API Endpoint Structure](#api-endpoint-structure)
2. [Message Processing Flow](#message-processing-flow)
3. [File Upload Processing](#file-upload-processing)
4. [OpenAI API Specifics](#openai-api-specifics)
5. [Error Handling](#error-handling)
6. [Optimization Techniques](#optimization-techniques)

## API Endpoint Structure

The API endpoint for chat functionality is located at `/api/chat.js`. This endpoint handles both text messages and file uploads through a single interface.

The endpoint disables the default NextJS body parser to handle file uploads manually:

```javascript
export const config = {
  api: {
    bodyParser: false, // Required for formidable
  },
};
```

## Message Processing Flow

### 1. Request Handling

The chat API endpoint handles two types of requests:
- JSON requests with text messages
- FormData requests with file uploads

It distinguishes between these request types by examining the `Content-Type` header:

```javascript
if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
  // Handle file upload
} else {
  // Handle text message
}
```

### 2. Context Enhancement

The API enhances user messages with context from several sources:

1. **User Profile**: Retrieves the user's profile details from `profiledb`.
2. **RAG (Retrieval-Augmented Generation)**: Uses embeddings to find relevant information from the knowledge base:

```javascript
const relevantItems = await findSimilarItems(userQuery);
contextContent = 'Relevant information from GuitarCoach:\n' +
  relevantItems.map(item => 
    `- ${item.title}: ${item.content}`
  ).join('\n\n');
```

3. **Prompt Building**: Uses a prompt builder utility to create an optimized system message:

```javascript
const systemMessage = buildPrompt(userProfile, contextContent);
```

### 3. OpenAI API Call

The endpoint formats messages in the OpenAI Chat Completion format and makes the API call:

```javascript
const finalMessages = [systemMessage, ...formattedMessages];

completion = await openai.chat.completions.create({
  model: 'gpt-4.1-mini',
  messages: finalMessages,
  temperature: 0.7,
  max_tokens: 2000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
});
```

### 4. Response Processing

The response from OpenAI is extracted and returned to the client:

```javascript
const responseMessage = completion.choices[0].message.content || '';

res.status(200).json({
  message: responseMessage,
  context: relevantItems.map(item => ({
    id: item.id,
    title: item.title,
    content: item.content,
    score: item._score
  }))
});
```

## File Upload Processing

File uploads are handled using Formidable:

1. **Parse Form**: The form is parsed asynchronously to extract file and field data:

```javascript
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};
```

2. **File Type Detection**: The system detects the file type and validates uploads:

```javascript
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
  }
}
```

3. **File Storage**: Uploaded files are saved with a unique name to prevent collisions.

4. **Content Processing**: For text files, the content is extracted and processed. For images and other files, appropriate processing is applied.

## OpenAI API Specifics

### API Configuration

The API is initialized using either the provided API key or an environment variable:

```javascript
const apiKey = req.body.apiKey || process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });
```

### Models

The application primarily uses `gpt-4.1-mini` for its balance of capability and cost-efficiency.

### Message Formatting

Messages are formatted according to OpenAI's requirements:

```javascript
const formattedMessages = messages.map(msg => ({
  role: msg.sender === 'user' ? 'user' : 'assistant',
  content: msg.content
}));
```

## Error Handling

The API implements robust error handling for different scenarios:

```javascript
try {
  // API call
} catch (error) {
  // Error handling
  let errorMessage = 'An error occurred while processing your request';
  let statusCode = 500;

  if (error.response) {
    // The request was made and the server responded with a status code outside 2xx
    statusCode = error.response.status;
    errorMessage = error.response.data.error?.message || JSON.stringify(error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response received from the API';
  } else if (error.code === 'invalid_api_key') {
    errorMessage = 'Invalid API key';
    statusCode = 401;
  } else if (error.code === 'rate_limit_exceeded') {
    errorMessage = 'API rate limit exceeded';
    statusCode = 429;
  }

  res.status(statusCode).json({
    error: errorMessage,
    code: error.code,
    status: statusCode
  });
}
```

## Optimization Techniques

### 1. Token Usage Monitoring

The API monitors token usage to help optimize costs:

```javascript
const originalPromptLength = JSON.stringify(systemMessage).length;
console.log('System prompt token usage (approx):', Math.ceil(originalPromptLength / 4), 'tokens');
```

### 2. RAG Implementation

The Retrieval-Augmented Generation (RAG) system:
1. Converts user queries to embeddings
2. Finds similar items in the knowledge base
3. Incorporates relevant information in the prompt

This reduces hallucinations and improves response quality by grounding the AI in domain-specific knowledge.

### 3. User Context Preservation

The system maintains user context across sessions:
- Client-side: Storing messages in localStorage
- Message history: Providing conversation context to the API

This creates a more coherent and personalized experience for users.
