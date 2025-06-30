'use client';

import { useState, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import dynamic from 'next/dynamic';
import { FiMenu, FiX, FiSettings, FiPlus } from 'react-icons/fi';
import { AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { clsx } from 'clsx';

// Custom hooks
import useChatState from '@/hooks/chat/useChatState';
import useChatActions from '@/hooks/chat/useChatActions';

// Chat components
import Sidebar from '@/components/chat/Sidebar';
import Overlay from '@/components/chat/Overlay';
import SettingsModal from '@/components/chat/SettingsModal';

// Utils
import { SUGGESTED_PROMPTS } from '@/utils/chat/formatters';

// Dynamically import the Chat component with no SSR to avoid hydration issues
const Chat = dynamic(() => import('@/components/ui/Chat'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-pulse text-text-secondary">Loading chat...</div>
    </div>
  ),
});

/**
 * Main Chat Page component
 */
export default function ChatPage() {
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings } = useSettings();
  
  // Refs
  const inputRef = useRef(null);
  const chatRef = useRef(null);
  
  // Chat state from custom hook
  const chatState = useChatState();
  
  // Chat actions from custom hook
  const chatActions = useChatActions(chatState);
  
  // Helper functions
  const closeSidebar = () => setSidebarOpen(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  // Close settings modal on Escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setIsSettingsOpen(false);
  };

  return (
    <div className={clsx(
      'flex h-screen bg-app text-primary overflow-hidden',
      settings.backgroundEffect && settings.backgroundEffect !== 'none' ? `bg-effect-${settings.backgroundEffect}` : ''
    )}>

      <Head>
        <title>Guitar Practice Assistant</title>
        <meta name="description" content="Your AI guitar practice assistant" />
        <meta name="theme-color" content="#000000" />
      </Head>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onNewChat={chatActions.handleNewChat}
        onChatSelect={chatActions.handleChatSelect}
        onClearChat={chatActions.handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        chats={chatState.chats}
        activeChat={chatState.chatId}
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
              onClick={chatActions.handleNewChat}
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
            messages={chatState.messages}
            onSendMessage={chatActions.handleSendMessage}
            isLoading={chatState.isLoading}
            suggestedPrompts={SUGGESTED_PROMPTS}
            inputRef={inputRef}
          />
          {/* File upload UI */}
          <div className="flex flex-col mt-2">
            <label className="block text-sm font-medium text-gray-200 mb-1">Upload Tab File (.txt, .gp, .pdf)</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".txt,.gp,.gp3,.gp4,.gp5,.gpx,.pdf"
                onChange={chatActions.handleFileChange}
                disabled={chatState.isLoading}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
              <button
                onClick={chatActions.handleSendFile}
                disabled={chatState.isLoading || !chatActions.selectedFile}
                className={`px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50`}
              >
                {chatState.isLoading ? 'Uploading...' : 'Send File'}
              </button>
            </div>
            {chatActions.selectedFile && (
              <div className="text-xs text-gray-300 mt-1">Selected: {chatActions.selectedFile.name}</div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
