'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiHome, FiMusic, FiClock, FiTrendingUp, FiSettings, FiHelpCircle, FiUser } from 'react-icons/fi';

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
    // Temporarily hidden navigation items
    // { icon: <FiUser size={20} />, label: 'Profile', href: '/profile' },
    // { icon: <FiSettings size={20} />, label: 'Settings', href: '/settings' },
    // { icon: <FiHelpCircle size={20} />, label: 'Help', href: '/help' },
  ];
  
  return (
    <div className="flex h-screen bg-background text-text-primary">
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-card border-r border-border shadow-lg z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center">
            <FiMusic size={24} className="text-primary mr-2" />
            <span className="text-xl font-bold">GuitarCoach</span>
          </Link>
          <button 
            onClick={closeSidebar}
            className="p-2 rounded-full hover:bg-card-hover lg:hidden"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    pathname === item.href 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-card-hover'
                  }`}
                  onClick={closeSidebar}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {version && (
          <div className="absolute bottom-4 left-4 text-xs text-text-muted">
            Version {version}
          </div>
        )}
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 border-b border-border bg-card">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-full hover:bg-card-hover mr-2 lg:hidden"
            >
              <FiMenu size={24} />
            </button>
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
          
          {/* Optional header content on the right */}
          <div className="flex items-center">
            {/* Temporarily hidden user menu */}
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 