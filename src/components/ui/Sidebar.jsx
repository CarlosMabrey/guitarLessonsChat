import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FiHome, 
  FiMusic, 
  FiClock, 
  FiSettings, 
  FiUser, 
  FiGrid, 
  FiChevronLeft, 
  FiChevronRight,
  FiMessageSquare,
  FiFileText,
  FiPlay,
  FiBarChart2
} from 'react-icons/fi';
import { TbProgress } from 'react-icons/tb';
import { clsx } from 'clsx';
import ThemeSwitcher from './ThemeSwitcher';
import SettingsPanel from './SettingsPanel';
import AmbientPlayer from './AmbientPlayer';

const NavigationItem = ({ item, isActive, collapsed, onNavigate }) => {
  const linkRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const { name, href, icon: Icon } = item;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        linkRef.current?.click();
      }
    };

    const link = linkRef.current;
    if (link) {
      link.addEventListener('keydown', handleKeyDown);
      return () => link.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  return (
    <div className="relative group">
      <Link
        ref={linkRef}
        href={href}
        className={clsx(
          'flex items-center px-3 py-2 rounded-md transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
          isActive
            ? 'bg-blue-600 bg-opacity-40 text-blue-400'
            : 'text-gray-400 hover:bg-[#2a3343] hover:text-gray-200',
          collapsed ? 'justify-center' : ''
        )}
        onMouseEnter={() => collapsed && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => collapsed && setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        tabIndex={0}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="w-5 h-5" aria-hidden="true" />
        {!collapsed && <span className="ml-3">{name}</span>}
      </Link>
      
      {collapsed && showTooltip && (
        <div 
          className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded shadow-lg z-50 whitespace-nowrap"
          role="tooltip"
        >
          {name}
          <div className="absolute top-1/2 right-full -mr-1 w-2 h-2 -translate-y-1/2 rotate-45 bg-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default function Sidebar({ isMobile = false, onToggle }) {
  const [showSettings, setShowSettings] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  // Start collapsed by default, but persist user's choice
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved === null) return true; // Default: collapsed
      return saved === 'true';
    }
    return true;
  });
  const [mounted, setMounted] = useState(false);
  const collapseButtonRef = useRef(null);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Songs', href: '/songs', icon: FiMusic },
    { name: 'Practice', href: '/practice', icon: FiClock },
    { name: 'Progress', href: '/progress', icon: TbProgress },
    { name: 'Theory', href: '/theory', icon: FiGrid },
    { name: 'Resources', href: '/resources', icon: FiFileText },  
    { name: 'Chat', href: '/chat', icon: FiMessageSquare }
  ];

  const bottomNav = [
    { name: 'My Profile', href: '/profile', icon: FiUser },
    // Removed old Settings link; settings now managed via modal
  ];

  const allNavItems = [...navigation, ...bottomNav];

  // Handle initial mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    if (!isMobile) {
      const savedCollapsed = localStorage.getItem('sidebarCollapsed');
      if (savedCollapsed !== null) {
        setCollapsed(savedCollapsed === 'true');
      }
    }
  }, [isMobile]);

  // Save collapsed state to localStorage when it changes (desktop only)
  useEffect(() => {
    if (mounted && !isMobile) {
      localStorage.setItem('sidebarCollapsed', collapsed.toString());
    }
  }, [collapsed, mounted, isMobile]);

  const toggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onToggle) onToggle(newCollapsed);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && collapsed) {
        setCollapsed(false);
      }
      
      // Focus management for keyboard navigation
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        toggleCollapse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [collapsed]);

  // Focus trap for keyboard navigation
  useEffect(() => {
    if (collapsed) {
      collapseButtonRef.current?.focus();
    }
  }, [collapsed]);

  if (!mounted) return null;

  return (
    <div 
      className={clsx(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-[#1e2536] border-r border-[#2a3343] transform transition-all duration-300 ease-in-out',
        'focus:outline-none',
        collapsed ? 'w-16' : 'w-64',
        isMobile && !collapsed ? 'translate-x-0' : isMobile ? '-translate-x-full' : 'translate-x-0',
        'md:relative',
        !isMobile && 'h-screen'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header with logo and collapse button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#2a3343]">
        <Link 
          href="/" 
          className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-md p-1"
          aria-label="Go to dashboard"
        >
          <span className="text-2xl" aria-hidden="true">🎸</span>
          {!collapsed && <h1 className="text-xl font-bold ml-2 text-gray-100">GuitarCoach</h1>}
        </Link>
        <button 
          ref={collapseButtonRef}
          onClick={toggleCollapse}
          className="hidden md:flex items-center justify-center text-gray-400 hover:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>
      
      {/* Main Navigation */}
      <nav 
        className="flex-1 overflow-y-auto py-2"
        aria-label="Main menu"
      >
        <ul className="px-2 space-y-1">
          {navigation.map((item) => (
            <li key={item.href}>
              <NavigationItem 
                item={item} 
                isActive={pathname === item.href} 
                collapsed={collapsed} 
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-[#2a3343] py-2">
        <ul className="px-2 space-y-1">
          {bottomNav.map((item) => (
            <li key={item.href}>
              <NavigationItem 
                item={item} 
                isActive={pathname === item.href} 
                collapsed={collapsed} 
              />
            </li>
          ))}
        </ul>
        {/* Settings Wheel (always visible at bottom) */}
        <div className="flex justify-center mt-3">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full bg-[#232a3a] hover:bg-[#2a3343] text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open settings"
          >
            <FiSettings size={22} />
          </button>
        </div>
        {/* Ambient Player */}
        {!collapsed && (
          <div className="border-t border-[#2a3343]">
            <AmbientPlayer collapsed={collapsed} />
          </div>
        )}
        {/* Theme Switcher */}
        <div className="p-2 border-t border-[#2a3343] flex justify-center">
          <ThemeSwitcher compact={collapsed} />
        </div>
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-[#232a3a] rounded-xl shadow-2xl p-6 w-full max-w-md relative">
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white focus:outline-none"
                aria-label="Close settings"
              >
                <span aria-hidden="true">&times;</span>
              </button>
              <h2 className="text-xl font-bold text-gray-100 mb-6">Settings</h2>
              <SettingsPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}