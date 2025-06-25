'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FiMenu, FiX, FiSettings, FiMessageSquare, FiPlus, FiHome, FiTrash2, FiGrid, FiMusic, FiClock, FiZap, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { TbProgress } from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { v4 as uuidv4 } from 'uuid';
import { clsx } from 'clsx';
import Link from 'next/link';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';

// Dynamically import the Chat component with no SSR to avoid hydration issues
const Chat = dynamic(() => import('@/components/ui/Chat'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-pulse text-text-secondary">Loading chat...</div>
    </div>
  ),
});

// Function to format chat date
const formatChatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};

// Collapsible Sidebar component with improved styling
const Sidebar = ({ 
  isOpen, 
  onClose, 
  onNewChat, 
  onClearChat, 
  onChatSelect, 
  onOpenSettings, 
  isCollapsed, 
  toggleCollapse, 
  activeChat,
  chats = []
}) => {
  const router = useRouter();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: FiHome },
    { name: 'Songs', href: '/songs', icon: FiMusic },
    { name: 'Practice', href: '/practice', icon: FiClock },
    { name: 'Progress', href: '/progress', icon: TbProgress },
    { name: 'Theory', href: '/theory', icon: FiGrid },
  ];

  return (
    <div className={clsx(
      'fixed inset-y-0 left-0 z-40 flex flex-col bg-[#1e2536] border-r border-[#2a3343] transform transition-all duration-300 ease-in-out',
      isCollapsed ? 'w-16' : 'w-64',
      isOpen ? 'translate-x-0' : '-translate-x-full',
      'md:relative md:translate-x-0'
    )}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#2a3343]">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-blue-400">🎸</span>
          {!isCollapsed && <h1 className="text-xl font-bold ml-2 text-gray-100">GuitarCoach</h1>}
        </Link>
        <button 
          onClick={toggleCollapse}
          className="hidden md:flex items-center justify-center text-gray-400 hover:text-white p-1 rounded-lg"
        >
          {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>
      
      {/* App Navigation */}
      <nav className="p-2 border-b border-[#2a3343]">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  router.pathname === item.href
                    ? 'bg-blue-600 bg-opacity-40 text-blue-400'
                    : 'text-gray-400 hover:bg-[#2a3343] hover:text-gray-200'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            </li>
          ))}
          <li>
            <Link 
              href="/chat" 
              className="flex items-center px-3 py-2 rounded-md transition-colors bg-blue-600 bg-opacity-40 text-blue-400"
            >
              <FiMessageSquare className="w-5 h-5" />
              {!isCollapsed && <span className="ml-3">Chat</span>}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Chat-specific section */}
      <div className="flex-1 flex flex-col">
        <div className="p-2 border-b border-[#2a3343]">
          <button
            onClick={onNewChat}
            className={clsx(
              "w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 transition-colors",
              isCollapsed ? "px-2" : "px-4 space-x-2"
            )}
          >
            <FiPlus size={18} />
            {!isCollapsed && <span>New Chat</span>}
          </button>
        </div>
        
        {/* Chat history */}
        <div className="flex-1 overflow-y-auto py-2">
          {chats.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400 text-center">
              No chats yet
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect && onChatSelect(chat.id)}
                className={clsx(
                  'w-full flex items-center px-3 py-2 text-sm transition-colors rounded-md group',
                  isCollapsed ? 'justify-center' : 'justify-between',
                  activeChat === chat.id
                    ? 'bg-blue-600 bg-opacity-40 text-blue-400'
                    : 'text-gray-400 hover:bg-[#2a3343] hover:text-gray-200'
                )}
                title={chat.title}
              >
                <div className="flex items-center overflow-hidden">
                  <FiMessageSquare className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <div className="ml-3 text-left truncate">
                      <div className="truncate">{chat.title}</div>
                      <div className="text-xs text-gray-500">
                        {formatChatDate(chat.updatedAt || chat.createdAt || new Date().toISOString())}
                      </div>
                    </div>
                  )}
                </div>
                {!isCollapsed && activeChat === chat.id && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 ml-2"></span>
                )}
              </button>
            ))
          )}
        </div>
        
        {/* Footer controls */}
        <div className="p-2 border-t border-[#2a3343]">
          <button
            onClick={onClearChat}
            className={clsx(
              "w-full flex items-center text-gray-400 hover:text-red-500 transition-colors p-2 rounded-md",
              isCollapsed ? "justify-center" : "space-x-2"
            )}
          >
            <FiTrash2 size={18} />
            {!isCollapsed && <span>Clear Conversations</span>}
          </button>
          <button
            onClick={onOpenSettings}
            className={clsx(
              "w-full flex items-center text-gray-400 hover:text-white transition-colors p-2 rounded-md mt-1",
              isCollapsed ? "justify-center" : "space-x-2"
            )}
          >
            <FiSettings size={18} />
            {!isCollapsed && <span>Settings</span>}
          </button>
        </div>
      </div>
      
      <div className="p-2 border-t border-[#2a3343] flex justify-center">
        <ThemeSwitcher compact={isCollapsed} />
      </div>
    </div>
  );
};

// Overlay for mobile when sidebar is open
const Overlay = ({ isOpen, onClick }) => (
  <div
    className={clsx(
      'fixed inset-0 bg-black/70 z-30 transition-opacity md:hidden',
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewChat, setIsNewChat] = useState(true);
  const router = useRouter();
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  // Load chats and API key from localStorage on mount
  const [chats, setChats] = useState([]);

  useEffect(() => {
    // Load API key
    const savedApiKey = localStorage.getItem('openai_api_key') || '';
    setApiKey(savedApiKey);
    
    // Load chat history
    const savedChats = JSON.parse(localStorage.getItem('chat_history') || '[]');
    setChats(savedChats);
    
    // Check for chat ID in URL or create a new one
    const urlParams = new URLSearchParams(window.location.search);
    const urlChatId = urlParams.get('id');
    
    if (urlChatId) {
      // Load existing chat
      const chatData = localStorage.getItem(`chat_${urlChatId}`);
      if (chatData) {
        const { messages: savedMessages, title } = JSON.parse(chatData);
        setChatId(urlChatId);
        setMessages(savedMessages);
        setIsNewChat(false);
      }
    } else if (savedChats.length > 0) {
      // Load most recent chat
      const mostRecentChat = savedChats[0];
      const chatData = localStorage.getItem(`chat_${mostRecentChat.id}`);
      if (chatData) {
        const { messages: savedMessages } = JSON.parse(chatData);
        setChatId(mostRecentChat.id);
        setMessages(savedMessages);
        setIsNewChat(false);
        router.push(`/chat?id=${mostRecentChat.id}`, undefined, { shallow: true });
      }
    } else {
      // Create new chat
      const newChatId = `chat_${uuidv4()}`;
      setChatId(newChatId);
      setIsNewChat(true);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0 && chatId) {
      // Save the chat
      const chatData = {
        id: chatId,
        title: messages[0]?.content?.substring(0, 30) || 'New Chat',
        lastMessage: messages[messages.length - 1]?.content || '',
        updatedAt: new Date().toISOString(),
        messages: messages
      };
      
      // Save chat data
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(chatData));
      
      // Update chat list
      setChats(prevChats => {
        const existingChatIndex = prevChats.findIndex(chat => chat.id === chatId);
        const newChats = [...prevChats];
        
        if (existingChatIndex >= 0) {
          // Update existing chat
          newChats[existingChatIndex] = {
            ...newChats[existingChatIndex],
            title: chatData.title,
            lastMessage: chatData.lastMessage,
            updatedAt: chatData.updatedAt
          };
        } else {
          // Add new chat
          newChats.unshift({
            id: chatId,
            title: chatData.title,
            lastMessage: chatData.lastMessage,
            updatedAt: chatData.updatedAt
          });
        }
        
        // Save updated chat list
        localStorage.setItem('chat_history', JSON.stringify(newChats));
        return newChats;
      });
    }
  }, [messages, chatId]);

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
    router.push(`/chat?id=${newChatId}`, undefined, { shallow: true });
    setSidebarOpen(false);
  };
  
  // Handle chat selection from sidebar
  const handleChatSelect = (selectedChatId) => {
    const chatData = localStorage.getItem(`chat_${selectedChatId}`);
    if (chatData) {
      const { messages: savedMessages } = JSON.parse(chatData);
      setChatId(selectedChatId);
      setMessages(savedMessages);
      setIsNewChat(false);
      router.push(`/chat?id=${selectedChatId}`, undefined, { shallow: true });
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-app text-primary overflow-hidden">
      <Head>
        <title>Guitar Practice Assistant</title>
        <meta name="description" content="Your AI guitar practice assistant" />
        <meta name="theme-color" content="#000000" />
      </Head>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onNewChat={handleNewChat}
        onChatSelect={handleChatSelect}
        onClearChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        chats={chats}
        activeChat={chatId}
      />
      
      {/* Overlay for mobile */}
      <Overlay isOpen={sidebarOpen} onClick={closeSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-full hover:bg-accent mr-3 lg:hidden transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold">
                Guitar Coach AI
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleNewChat}
              className="p-2 rounded-xl hover:bg-accent transition-colors text-muted hover:text-white"
              title="New chat"
            >
              <FiPlus size={20} />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl hover:bg-accent transition-colors text-muted hover:text-white"
              title="Settings"
            >
              <FiSettings size={20} />
            </button>
          </div>
        </header>

        {/* Chat Component */}
        <div className="flex-1 overflow-hidden relative px-4">
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
