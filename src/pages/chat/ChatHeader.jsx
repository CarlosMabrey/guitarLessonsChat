import React from 'react';
import { FiMenu, FiX, FiPlus, FiSettings } from 'react-icons/fi';

export default function ChatHeader({
  sidebarOpen,
  setSidebarOpen,
  handleNewChat,
  setIsSettingsOpen
}) {
  return (
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
          <h1 className="text-lg font-bold">Guitar Coach AI</h1>
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
  );
}
