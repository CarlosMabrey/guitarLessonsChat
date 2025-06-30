'use client';

import { useRouter } from 'next/router';
import Link from 'next/link';
import { clsx } from 'clsx';
import { 
  FiHome, FiMusic, FiClock, FiGrid, 
  FiMessageSquare, FiChevronLeft, FiChevronRight, 
  FiSettings, FiPlus, FiTrash2 
} from 'react-icons/fi';
import { TbProgress } from 'react-icons/tb';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import AmbientPlayerChatSidebar from '@/pages/chat/AmbientPlayerChatSidebar';

/**
 * Collapsible Sidebar component for chat navigation
 */
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
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                router.pathname === '/chat'
                  ? 'bg-blue-600 bg-opacity-40 text-blue-400'
                  : 'text-gray-400 hover:bg-[#2a3343] hover:text-gray-200'
              }`}
            >
              <FiMessageSquare className="w-5 h-5" />
              {!isCollapsed && <span className="ml-3">Chat</span>}
            </Link>
          </li>
        </ul>
      </nav>
      
      {/* Chat History */}
      <div className="flex flex-col flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {!isCollapsed && (
          <div className="p-3 border-b border-[#2a3343]">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <FiPlus size={18} />
              <span>New Chat</span>
            </button>
          </div>
        )}
        
        {isCollapsed ? (
          <div className="flex-1 flex flex-col items-center py-3 space-y-2">
            <button
              onClick={onNewChat}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              title="New Chat"
            >
              <FiPlus size={18} />
            </button>
          </div>
        ) : (
          <div className="p-2">
            <h3 className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500 font-semibold">Recent Chats</h3>
            <ul className="space-y-1">
              {chats.map(chat => (
                <li key={chat.id}>
                  <button
                    onClick={() => onChatSelect(chat.id)}
                    className={`w-full flex flex-col text-left px-3 py-2 rounded-md transition-colors ${
                      activeChat === chat.id
                        ? 'bg-accent text-gray-100'
                        : 'text-gray-300 hover:bg-[#2a3343] hover:text-gray-100'
                    }`}
                  >
                    <span className="font-medium truncate">{chat.title || 'New Chat'}</span>
                    <span className="text-xs text-gray-400 flex justify-between">
                      <span className="truncate">{chat.lastMessage || 'No messages yet'}</span>
                      <span className="ml-2 whitespace-nowrap">{formatChatDate(chat.updatedAt)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Bottom Controls */}
      <div className="p-3 border-t border-[#2a3343] flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center">
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-400 hover:text-white rounded-md transition-colors"
              title="Settings"
            >
              <FiSettings size={20} />
            </button>
            <button
              onClick={onClearChat}
              className="p-2 text-gray-400 hover:text-white rounded-md transition-colors ml-2"
              title="Clear chats"
            >
              <FiTrash2 size={20} />
            </button>
          </div>
        )}
        {isCollapsed ? (
          <div className="w-full flex flex-col items-center space-y-4">
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-400 hover:text-white rounded-md transition-colors"
              title="Settings"
            >
              <FiSettings size={20} />
            </button>
            <ThemeSwitcher compact={true} />
          </div>
        ) : (
          <ThemeSwitcher />
        )}
      </div>

      {/* Ambient Player for background music */}
      <div className={`border-t border-[#2a3343] p-2 ${isCollapsed ? 'hidden' : 'block'}`}>
        <AmbientPlayerChatSidebar />
      </div>
    </div>
  );
};

export default Sidebar;
