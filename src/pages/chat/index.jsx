'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FiMenu, FiX, FiSettings, FiMessageSquare, FiPlus, FiHome, FiTrash2} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';

// Dynamically import the Chat component with no SSR to avoid hydration issues
const Chat = dynamic(() => import('@/components/ui/Chat'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-pulse text-text-secondary">Loading chat...</div>
    </div>
  ),
});

// Sidebar component
const Sidebar = ({ isOpen, onClose, onNewChat, onClearChat }) => {
  const [chats, setChats] = useState([{ id: 1, title: 'New Chat' }]);
  const [activeChat, setActiveChat] = useState(1);

  return (
    <div className={clsx(
      'fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border/30 transform transition-transform duration-300 ease-in-out',
      'md:relative md:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border/30">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg py-2 px-4 transition-colors"
          >
            <FiPlus size={18} />
            <span>New Chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={clsx(
                'w-full text-left px-4 py-3 text-sm font-medium transition-colors',
                activeChat === chat.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-card-hover/50'
              )}
            >
              <div className="truncate">{chat.title}</div>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-border/30">
          <button
            onClick={onClearChat}
            className="w-full flex items-center space-x-2 text-text-secondary hover:text-danger transition-colors p-2 rounded-lg"
          >
            <FiTrash2 size={18} />
            <span>Clear Conversations</span>
          </button>
          <button
            onClick={() => {}}
            className="w-full flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg"
          >
            <FiSettings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Overlay for mobile when sidebar is open
const Overlay = ({ isOpen, onClick }) => (
  <div
    className={clsx(
      'fixed inset-0 bg-black/50 z-30 transition-opacity md:hidden',
      isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    )}
    onClick={onClick}
  />
);

// Settings modal component
const SettingsModal = ({ isOpen, onClose, apiKey, setApiKey, onSave }) => {
  const [localApiKey, setLocalApiKey] = useState(apiKey);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card/95 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-border/30 shadow-2xl transform transition-all duration-300 scale-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-text-primary">API Settings</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-card-hover/50 transition-colors text-text-secondary hover:text-text-primary"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-text-secondary mb-2">
              OpenAI API Key
            </label>
            <div className="relative">
              <input
                id="api-key"
                type="password"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 bg-card-hover/50 border border-border/30 rounded-xl text-text-primary placeholder-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-200"
              />
            </div>
            <p className="mt-2 text-xs text-text-secondary/70">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium rounded-xl border border-border/30 bg-transparent hover:bg-card-hover/50 text-text-primary transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(localApiKey);
                onClose();
              }}
              className="px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Suggested prompts for the user
// const SUGGESTED_PROMPTS = [
//   {
//     title: "Warm-up Exercises",
//     description: "Get personalized warm-up routines",
//     prompt: "What are some good warm-up exercises for intermediate players?"
//   },
//   {
//     title: "Chord Transitions",
//     description: "Improve your chord changes",
//     prompt: "How do I improve my chord transitions between G, C, and D?"
//   },
//   {
//     title: "Music Theory",
//     description: "Understand the CAGED system",
//     prompt: "Can you explain the CAGED system for guitar?"
//   },
//   {
//     title: "Practice Routine",
//     description: "Create a custom practice plan",
//     prompt: "Help me create a 30-minute daily practice routine"
//   }
// ];

// Suggested prompts to show when chat is empty
const SUGGESTED_PROMPTS = [
  {
    title: "Song Analysis",
    description: "Break down chords, structure, and techniques",
    icon: "🎸",
    prompt: "Can you analyze the chord progression and structure of this song?"
  },
  {
    title: "Practice Tips",
    description: "Get personalized practice recommendations",
    icon: "🎯",
    prompt: "What are some effective practice techniques for this song?"
  },
  {
    title: "Technique Help",
    description: "Master specific playing techniques",
    icon: "✋",
    prompt: "Can you explain the strumming pattern for this song?"
  },
  {
    title: "Music Theory",
    description: "Understand the theory behind the music",
    icon: "🎼",
    prompt: "What music theory concepts are used in this song?"
  }
];

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewChat, setIsNewChat] = useState(true);
  const router = useRouter();
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key') || '';
    setApiKey(savedApiKey);
    
    // Generate a new chat ID if none exists
    if (!chatId) {
      const newChatId = `chat_${uuidv4()}`;
      setChatId(newChatId);
      setIsNewChat(true);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;
    
    const userMessage = {
      id: `msg_${Date.now()}`,
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    // Update local state
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // If this is a new chat, update the URL with the chat ID
    if (isNewChat && chatId) {
      router.push(`/chat?id=${chatId}`, undefined, { shallow: true });
      setIsNewChat(false);
    }
    
    // Get AI response
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          apiKey: apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY
        }),
      });
      
      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('API Error Response:', responseData);
        throw new Error(
          responseData.message || 
          responseData.error?.message || 
          `Error: ${response.status} ${response.statusText}`
        );
      }
      
      const data = responseData;
      
      const aiMessage = {
        id: `msg_${Date.now()}`,
        content: data.message,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        metadata: data.metadata || {}
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage = {
        id: `err_${Date.now()}`,
        content: `Sorry, there was an error: ${error.message || 'Please try again'}`,
        sender: 'ai',
        isError: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start a new chat
  const handleNewChat = () => {
    const newChatId = `chat_${uuidv4()}`;
    setChatId(newChatId);
    setMessages([]);
    setIsNewChat(true);
    router.push('/chat', undefined, { shallow: true });
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-text-primary overflow-hidden">
      <Head>
        <title>Guitar Practice Assistant</title>
        <meta name="description" content="Your AI guitar practice assistant" />
        <meta name="theme-color" content="#030712" />
      </Head>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onNewChat={handleNewChat}
        onClearChat={handleNewChat}
      />
      
      {/* Overlay for mobile */}
      <Overlay isOpen={sidebarOpen} onClick={closeSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full hover:bg-card-hover/50 mr-2 lg:hidden transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <FiMessageSquare className="text-white" size={18} />
              </div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-text-primary to-text-primary/80 bg-clip-text text-transparent">
                Guitar Coach AI
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewChat}
              className="p-2 rounded-xl hover:bg-card-hover/50 transition-colors text-text-secondary hover:text-text-primary"
              title="New chat"
            >
              <FiPlus size={20} />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl hover:bg-card-hover/50 transition-colors text-text-secondary hover:text-text-primary"
              title="Settings"
            >
              <FiSettings size={20} />
            </button>
          </div>
        </header>

        {/* Chat Component */}
        <div className="flex-1 overflow-hidden relative">
          <Chat 
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            suggestedPrompts={SUGGESTED_PROMPTS}
            inputRef={inputRef}
          />
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
    </div>
  );
}
