# Guitar Coach AI - Chat Feature Documentation

## Overview
The chat feature in Guitar Coach AI enables interactive conversations with an AI guitar coach, supporting text, chord diagrams, tablature, and more.

---

## 1. Key Components

### `/src/components/chat/MessageRenderer.jsx`
- **Purpose:** Renders each chat message, supporting mixed content (text, chords, tabs, etc.).
- **How it works:**
  - Parses incoming message content (string, array, or object).
  - Converts content into typed blocks for rendering.
  - Uses strict type validation to prevent rendering bugs (e.g., `[object Object]`).
  - Handles fallback rendering for unknown or malformed content.
  - Recursively renders arrays and supports markdown.

### `/src/components/chat/ChatChord.jsx`
- **Purpose:** Renders chord diagrams in chat.
- **How it works:**
  - Receives chord data (string or object).
  - Parses and displays chord structure and voicing.
  - Handles interactive and display-only modes.

### `/src/components/chat/ChatFretboard.jsx`
- **Purpose:** Renders fretboard visualizations in chat.
- **How it works:**
  - Receives tuning and notes.
  - Calculates fret range and highlights notes.
  - Visualizes finger positions and note labels.

### `/src/lib/chat/messageParser.js`
- **Purpose:** Parses message strings into structured blocks (text, chord, tab, etc.).
- **How it works:**
  - Detects and extracts music notation from raw text (e.g., ```tab ...```, chord blocks, inline chords).
  - Returns a list of content blocks with types for the renderer.

---

## 2. Chat API & Backend

### `/src/pages/api/chat.js`
- **Purpose:** Handles chat POST requests, processes messages, and returns AI responses.
- **How it works:**
  - Receives message array and (optionally) API key.
  - Uses OpenAI API (or other models) to generate responses.
  - Loads user profile for context.
  - Returns response in a structured format.
- **How to change the model:**
  - Edit the `model` parameter in the OpenAI API call (e.g., `model: "gpt-4"`).
- **Where to put API keys:**
  - Preferred: Set `OPENAI_API_KEY` in your `.env` file or environment variables.
  - Optional: Pass `apiKey` in the POST body (for per-user/session keys).

---

## 3. Chat History & Storage

### `/src/lib/db/index.js`
- **Purpose:** Manages local storage of songs and progress, and may be used for chat history.
- **How it works:**
  - Functions like `getSongs`, `removeSong`, and `getProgressStats` interact with `localStorage`.
  - Chat history is typically stored per-session with a unique key (see `/src/pages/chat/index.jsx`).
  - Each chat session contains an array of messages, timestamps, and metadata.

### Chat History Example Structure
```json
{
  "id": "chat_123",
  "title": "Blues Progression Analysis",
  "messages": [
    {
      "id": "msg_1",
      "content": "Can you analyze this progression?",
      "sender": "user",
      "timestamp": "2025-06-25T07:00:00Z"
    },
    {
      "id": "msg_2",
      "content": "Here is a 12-bar blues tab...",
      "sender": "ai",
      "timestamp": "2025-06-25T07:00:02Z"
    }
  ],
  "createdAt": "2025-06-25T07:00:00Z",
  "updatedAt": "2025-06-25T07:00:02Z"
}
```

---

## 4. How the Chat Works (Flow)
1. **User types a message** in the chat input (`Chat.jsx`).
2. **Message is added** to the local state and displayed immediately.
3. **Message is sent** to the backend API (`/api/chat.js`).
4. **API processes** the message, generates an AI response, and returns it.
5. **Response is parsed** (using `messageParser.js`), converted to blocks, and rendered by `MessageRenderer.jsx`.
6. **Chat history** is updated and saved in local storage.

---

## 5. Configuration & Customization
- **Change the AI model:** Edit the `model` field in `/src/pages/api/chat.js` (e.g., `model: "gpt-4"`).
- **API keys:**
  - Set `OPENAI_API_KEY` in `.env` for global use.
  - Or, pass `apiKey` in the POST body for user/session-specific keys.
- **Add new message types:**
  - Extend `messageParser.js` to detect new block types.
  - Update `MessageRenderer.jsx` to handle new types.

---

## 6. Additional Notes
- **Markdown rendering** is handled in `MessageRenderer.jsx` using `ReactMarkdown`.
- **Chord and fretboard rendering** use dynamic imports and custom visualization components.
- **Error handling** is built into both frontend and backend for robust operation.
- **ChatButton.jsx** and modal logic can be used to launch chat from other parts of the app.

---

## 7. Troubleshooting
- **Messages not appearing:** Check browser console and API key settings.
- **Formatting issues:** Ensure messageParser and renderer logic are up to date.
- **API errors:** Confirm environment variables and network connectivity.

---

## 8. Extending the Chat Feature
- To add new music notation types, update both the parser and renderer.
- For persistent chat history, connect `/src/lib/db/index.js` to a backend database.
- To support additional AI models, update `/src/pages/api/chat.js` with new provider logic.

---

*For further questions, see the code comments in each file or contact the maintainers.*
