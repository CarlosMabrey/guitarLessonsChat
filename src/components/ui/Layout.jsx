'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiMenu, 
  FiX, 
  FiHome, 
  FiMusic, 
  FiClock, 
  FiTrendingUp, 
  FiSettings, 
  FiHelpCircle, 
  FiUser,
  FiCode,
  FiZap,
  FiGrid
} from 'react-icons/fi';
import ThemeSwitcher from './ThemeSwitcher';
import Sidebar from './Sidebar';

export default function Layout({ title, version, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  
  // Navigation items
  const navItems = [
    { icon: <FiHome size={20} />, label: 'Dashboard', href: '/dashboard' },
    { icon: <FiMusic size={20} />, label: 'Songs', href: '/songs' },
    { icon: <FiClock size={20} />, label: 'Practice', href: '/practice' },
    { icon: <FiTrendingUp size={20} />, label: 'Progress', href: '/progress' },
    { icon: <FiGrid size={20} />, label: 'Theory', href: '/theory' },
    { icon: <FiZap size={20} />, label: 'Tab Test', href: '/unified-tab-test' },
    // Temporarily hidden navigation items
    // { icon: <FiUser size={20} />, label: 'Profile', href: '/profile' },
    // { icon: <FiSettings size={20} />, label: 'Settings', href: '/settings' },
    // { icon: <FiHelpCircle size={20} />, label: 'Help', href: '/help' },
  ];
  
  return (
    <div className="flex h-screen bg-app text-text-primary">
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={closeSidebar}
        />
      )}
      
      {/* Desktop sidebar - always visible */}
      <div className="hidden lg:block relative z-10">
        <Sidebar />
      </div>
      
      {/* Mobile sidebar - conditionally visible */}
      {isSidebarOpen && (
        <div className="fixed inset-y-0 left-0 z-30 lg:hidden">
          <Sidebar />
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-20">
        <header className="h-16 flex items-center justify-between px-4 border-b border-border shadow-sm bg-background-light">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-card mr-2 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <FiMenu size={20} />
            </button>
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          
          {/* Header content on the right */}
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-app">
          {children}
        </main>
      </div>
    </div>
  );
} 