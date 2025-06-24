import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSend, FiSettings, FiMessageSquare, FiRefreshCw, FiTrash2, FiCopy } from 'react-icons/fi';
import { clsx } from 'clsx';
import Head from 'next/head';

// Message component for individual chat messages
const Message = ({ message, isUser }) => {
  return (
    <div className={clsx(
      'flex mb-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div
        className={clsx(
          'rounded-lg px-4 py-3 max-w-[80%]',
          isUser
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-card-light dark:bg-card-dark text-text-primary rounded-bl-none',
          'shadow-sm'
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
};

// Settings modal component
const SettingsModal = ({ isOpen, onClose, apiKey, setApiKey, onSave }) => {
  const [localApiKey, setLocalApiKey] = useState(apiKey);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background dark:bg-card rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">OpenAI API Settings</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium mb-1">
              OpenAI API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-border rounded-md bg-background-light dark:bg-card-dark text-text-primary"
            />
            <p className="text-xs text-text-secondary mt-1">
              Your API key is stored locally in your browser
            </p>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-card-hover"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(localApiKey);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary-dark"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Suggested prompts for the user
const SUGGESTED_PROMPTS = [
  "What are some good warm-up exercises?",
  "How do I improve my chord transitions?",
  "Explain the CAGED system",
  "Help me create a practice routine"
];

// Load messages from localStorage
const loadMessages = () => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('chat_messages');
  return saved ? JSON.parse(saved) : [];};

export default function ChatPage() {
  const [messages, setMessages] = useState(() => {
    const savedMessages = loadMessages();
    return savedMessages.length > 0 
      ? savedMessages 
      : [{
          id: Date.now(),
          content: "Hello! I'm your guitar practice assistant. How can I help you today?",
          isUser: false,
          timestamp: new Date().toISOString()
        }];
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const messagesEndRef = useRef(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key') || '';
    setApiKey(savedApiKey);
  }, []);

  // Save API key to localStorage when it changes
  const saveApiKey = (key) => {
    localStorage.setItem('openai_api_key', key);
    setApiKey(key);
  };

  // Clear chat history
  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([{
        id: Date.now(),
        content: "I've cleared our chat history. How can I help you today?",
        isUser: false,
        timestamp: new Date().toISOString()
      }]);
      localStorage.removeItem('chat_messages');
    }
  };

  // Copy message to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      content: inputValue,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check if API key is set
      if (!apiKey) {
        throw new Error('Please set your OpenAI API key in settings');
      }

      // Call OpenAI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          apiKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const data = await response.json();
      
      // Add assistant's response
      const assistantMessage = {
        id: Date.now() + 1,
        content: data.message,
        isUser: false,
        timestamp: new Date().toISOString(),
        context: data.context || []
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        content: `Error: ${error.message}. Please check your API key and try again.`,
        isUser: false,
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Guitar Coach AI</title>
        <meta name="description" content="AI-powered guitar practice assistant" />
      </Head>

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Guitar Coach AI</h1>
          <div className="flex space-x-2">
            <button
              onClick={clearChat}
              className="p-2 rounded-md hover:bg-card-hover transition-colors text-text-secondary hover:text-text-primary"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <FiTrash2 size={18} />
            </button>
            <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-md hover:bg-card-hover transition-colors text-text-secondary hover:text-text-primary"
              aria-label="Refresh"
              title="Refresh"
            >
              <FiRefreshCw size={18} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-md hover:bg-card-hover transition-colors text-text-secondary hover:text-text-primary"
              aria-label="Settings"
              title="Settings"
            >
              <FiSettings size={20} />
            </button>
          </div>
        </div>

        {/* Suggested prompts */}
        {messages.length <= 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {SUGGESTED_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputValue(prompt);
                  // Auto-focus the input after a small delay
                  setTimeout(() => {
                    document.querySelector('input[type="text"]')?.focus();
                  }, 50);
                }}
                className="p-3 text-left rounded-lg border border-border hover:border-primary/30 hover:bg-card-hover/50 transition-colors text-sm text-text-secondary hover:text-text-primary"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-6 pr-2">
          {messages.map((message) => (
            <div key={message.id} className="group relative">
              <Message
                message={message}
                isUser={message.isUser}
              />
              {!message.isUser && (
                <button
                  onClick={() => copyToClipboard(message.content)}
                  className="absolute right-2 top-2 p-1 rounded-md opacity-0 group-hover:opacity-100 bg-card/80 hover:bg-card-hover transition-all"
                  title="Copy to clipboard"
                >
                  <FiCopy size={16} className="text-text-secondary" />
                </button>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSendMessage} className="mt-4">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Ask me anything about guitar practice..."
              className="w-full px-4 py-3 pr-12 rounded-lg border border-border bg-background-light dark:bg-card-dark text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70"
              disabled={isLoading || !apiKey}
              aria-label="Type your message"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim() || !apiKey}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-primary border-r-primary border-transparent rounded-full animate-spin"></div>
              ) : (
                <FiSend size={20} />
              )}
            </button>
          </div>
          <p className="text-xs text-text-secondary mt-2 text-center">
            {!apiKey ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="text-primary hover:underline"
                >
                  Set your OpenAI API key
                </button>{' '}
                to start chatting
              </>
            ) : (
              <span>Press Enter to send • Shift+Enter for new line</span>
            )}
          </p>
        </form>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        onSave={saveApiKey}
      />
    </>
  );
}
