import React from 'react';
import Link from 'next/link';
import { FiHome, FiMusic, FiClock, FiGrid, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { TbProgress } from 'react-icons/tb';
import { useRouter } from 'next/router';
import clsx from 'clsx';

export default function Sidebar({
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
}) {
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
            <span className="w-5 h-5 flex items-center justify-center"><svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M10 4v12m6-6H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
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
              <div key={chat.id} className={clsx(
                'relative w-full flex items-center px-3 py-2 text-sm transition-colors rounded-md group',
                isCollapsed ? 'justify-center' : 'justify-between',
                activeChat === chat.id
                  ? 'bg-blue-600 bg-opacity-40 text-blue-400'
                  : 'text-gray-400 hover:bg-[#2a3343] hover:text-gray-200')}
                title={chat.title}
              >
                <button
                  onClick={() => onChatSelect && onChatSelect(chat.id)}
                  className="flex items-center flex-1 min-w-0"
                  style={{ pointerEvents: activeChat === chat.id ? 'auto' : 'auto' }}
                >
                  <span className="w-5 h-5 flex-shrink-0 mr-2">💬</span>
                  {!isCollapsed && (
                    <div className="ml-1 text-left truncate">
                      <div className="truncate">{chat.title}</div>
                      <div className="text-xs text-gray-500">
                        {chat.updatedAt ? new Date(chat.updatedAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                  )}
                </button>
                {/* Show X only on active chat */}
                {!isCollapsed && activeChat === chat.id && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (window.confirm('Delete this chat?')) {
                        // Remove from localStorage
                        localStorage.removeItem(`chat_${chat.id}`);
                        // Remove from chat_history
                        const chats = JSON.parse(localStorage.getItem('chat_history') || '[]');
                        const newChats = chats.filter(c => c.id !== chat.id);
                        localStorage.setItem('chat_history', JSON.stringify(newChats));
                        // Optionally, trigger a state update via custom event
                        window.dispatchEvent(new Event('chatListChanged'));
                      }
                    }}
                    className="ml-2 text-xs text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                    title="Delete chat"
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                )}
                {!isCollapsed && activeChat === chat.id && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 ml-2"></span>
                )}
              </div>
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
            <span className="w-5 h-5 flex items-center justify-center"><svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            {!isCollapsed && <span>Clear Conversations</span>}
          </button>
          <button
            onClick={onOpenSettings}
            className={clsx(
              "w-full flex items-center text-gray-400 hover:text-white transition-colors p-2 rounded-md mt-1",
              isCollapsed ? "justify-center" : "space-x-2"
            )}
          >
            <span className="w-5 h-5 flex items-center justify-center"><svg viewBox="0 0 20 20" fill="none" className="w-5 h-5"><path d="M10 4v12m6-6H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            {!isCollapsed && <span>Settings</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
