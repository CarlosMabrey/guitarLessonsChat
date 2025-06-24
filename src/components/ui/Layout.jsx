import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  FiMenu, 
  FiX, 
  FiHome, 
  FiMusic, 
  FiClock, 
  FiTrendingUp, 
  FiGrid,
  FiZap
} from 'react-icons/fi';
import { clsx } from 'clsx';
import Sidebar from './Sidebar';

export default function Layout({ title, version, children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();
  const pathname = router.pathname;
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };
  
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const handleSidebarToggle = (isCollapsed) => {
    setIsSidebarCollapsed(isCollapsed);
  }; 
  
  // Close mobile sidebar when route changes
  useEffect(() => {
    closeMobileSidebar();
  }, [router.pathname]);
  
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
    <div className="flex h-screen bg-app text-text-primary overflow-hidden">
      {/* Mobile backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0 h-full">
        <Sidebar 
          onToggle={handleSidebarToggle} 
          isMobile={false}
        />
      </div>
      
      {/* Mobile Sidebar */}
      <div className={clsx(
        'fixed lg:hidden z-30 h-full transition-transform duration-300 ease-in-out',
        {
          'translate-x-0': isMobileSidebarOpen,
          '-translate-x-full': !isMobileSidebarOpen
        }
      )}>
        <Sidebar 
          onToggle={handleSidebarToggle} 
          isMobile={true}
        />
      </div>
      
      {/* Main content */}
      <div className={clsx(
        'flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out',
        'h-screen',
        {
          'lg:pl-20': isSidebarCollapsed,
          'lg:pl-10': !isSidebarCollapsed
        }
      )}>
        <header className="h-16 flex items-center justify-between px-4 border-b border-border/50 shadow-sm bg-background-light/80 dark:bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center">
            <button 
              onClick={toggleMobileSidebar}
              className="p-2 rounded-md hover:bg-card-hover mr-2 lg:hidden transition-colors"
              aria-label="Toggle sidebar"
            >
              {isMobileSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background dark:bg-app">
          {children}
        </main>
      </div>
    </div>
  );
} 