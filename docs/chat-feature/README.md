# Chat Feature Documentation

This document provides an overview of the refactored chat feature in the Guitar Lessons Chat application. The chat functionality has been broken down into multiple files to improve maintainability and separation of concerns.

## Table of Contents

1. [Directory Structure](#directory-structure)
2. [Components](#components)
3. [Hooks](#hooks)
4. [Utilities](#utilities)
5. [Integration](#integration)
6. [OpenAI API Integration](#openai-api-integration)

## Directory Structure

The chat feature code has been organized into the following directory structure:

```
src/
├── components/
│   ├── chat/
│   │   ├── Sidebar.jsx         # Chat sidebar component
│   │   ├── Overlay.jsx         # Mobile overlay when sidebar is open
│   │   └── SettingsModal.jsx   # Settings modal component
│   └── ui/
│       └── Chat.jsx            # Main chat UI component (existed previously)
├── hooks/
│   └── chat/
│       ├── useChatState.js     # Hook for managing chat state
│       └── useChatActions.js   # Hook for chat actions (send message, upload file, etc.)
├── utils/
│   └── chat/
│       └── formatters.js       # Utility functions for formatting chat data
└── pages/
    ├── api/
    │   └── chat.js             # Chat API endpoint
    └── chat/
        ├── index.jsx           # Main chat page entry point
        ├── ChatPage.jsx        # Main chat page component
        └── AmbientPlayerChatSidebar.jsx  # Ambient player component (existed previously)
```

## Components

### Sidebar Component (`src/components/chat/Sidebar.jsx`)

The Sidebar component is responsible for:
- Displaying the navigation menu
- Showing the list of chat history
- Allowing the user to select, create, or clear chats
- Toggling the sidebar collapse state
- Accessing settings

### Overlay Component (`src/components/chat/Overlay.jsx`)

A simple component that displays an overlay on mobile devices when the sidebar is open.

### SettingsModal Component (`src/components/chat/SettingsModal.jsx`)

Displays the settings panel in a modal dialog with animations.

## Hooks

### useChatState (`src/hooks/chat/useChatState.js`)

This custom hook manages the state related to chat functionality:

- Loads chat history from localStorage on component mount
- Handles checking for chat ID in URL parameters
- Creates new chat sessions
- Saves messages to localStorage when they change
- Updates the chat list when new messages are added

### useChatActions (`src/hooks/chat/useChatActions.js`)

This custom hook contains all the action handlers for the chat feature:

- `handleSendMessage`: Sends a text message to the AI
- `handleFileChange`: Handles file selection for upload
- `handleSendFile`: Uploads and processes a file
- `handleNewChat`: Creates a new chat session
- `handleChatSelect`: Loads a selected chat session

## Utilities

### formatters.js (`src/utils/chat/formatters.js`)

Contains utility functions for formatting chat data:
- `formatChatDate`: Formats dates in a user-friendly way (today, yesterday, etc.)
- `SUGGESTED_PROMPTS`: Defines suggested prompts for the empty chat state

## Integration

The integration point is the main Chat page (`src/pages/chat/index.jsx`), which imports the `ChatPage` component. The `ChatPage` component uses all the custom hooks and components to provide the complete chat experience.

## OpenAI API Integration

The chat feature communicates with the OpenAI API through the `/api/chat.js` endpoint. This API integration handles:

1. Processing text messages from the user
2. Sending files for analysis
3. Generating AI responses using the OpenAI Chat Completions API

The API endpoint accepts both JSON requests (for text messages) and FormData requests (for file uploads).

When a message is sent:
1. The `handleSendMessage` function in `useChatActions` sends a POST request to `/api/chat`
2. The API fetches a response from OpenAI
3. The response is returned and added to the chat history

For file uploads:
1. The `handleSendFile` function creates a FormData object with the file
2. The file is sent to `/api/chat` for processing
3. The API interacts with OpenAI to analyze the file content
4. The response is displayed in the chat

This refactoring improves code maintainability by separating concerns and making individual components more focused on their specific responsibilities.
