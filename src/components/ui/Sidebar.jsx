import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiMusic, FiPlay, FiBarChart2, FiSettings, FiHelpCircle, FiUser, FiGrid, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { clsx } from 'clsx';
import ThemeSwitcher from './ThemeSwitcher';

const navItems = [
  { icon: FiHome, label: 'Dashboard', href: '/dashboard' },
  { icon: FiMusic, label: 'Songs', href: '/songs' },
  { icon: FiPlay, label: 'Practice', href: '/practice' },
  { icon: FiBarChart2, label: 'Progress', href: '/progress' },
  { icon: FiGrid, label: 'Theory', href: '/theory' },
  // { icon: FiUser, label: 'Profile', href: '/profile' },
  // { icon: FiSettings, label: 'Settings', href: '/settings' },
  // { icon: FiHelpCircle, label: 'Help', href: '/help' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle initial mount to prevent hydration mismatch and load state from localStorage
  useEffect(() => {
    setMounted(true);
    
    // Load collapsed state from localStorage
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      setCollapsed(savedCollapsed === 'true');
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebarCollapsed', collapsed.toString());
    }
  }, [collapsed, mounted]);

  // Handle toggling the sidebar
  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  if (!mounted) return null;

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen z-20 flex flex-col transition-all duration-300 ease-in-out',
        'bg-background-light/80 backdrop-blur-md',
        'border-r border-border/50',
        'shadow-lg',
        'py-4',
        collapsed ? 'w-20' : 'w-64',
        'lg:translate-x-0',
        '-translate-x-0' // Always show on mobile since it's managed in Layout.jsx
      )}
      aria-label="Sidebar navigation"
    >
      {/* Toggle Button */}
      <button
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={toggleSidebar}
        className={clsx(
          'absolute -right-3 top-6 z-30 w-6 h-6 flex items-center justify-center rounded-full',
          'bg-card-hover dark:bg-card',
          'border border-border',
          'shadow-md',
          'transition-all duration-200',
          'hover:scale-110',
          'focus:outline-none focus:ring-2 focus:ring-active',
        )}
        tabIndex={0}
      >
        {collapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
      </button>

      {/* Logo */}
      <div className="flex items-center px-3 pb-6 pt-1">
        <div className={clsx(
          'flex items-center',
          collapsed ? 'justify-center w-full' : 'gap-3'
        )}>
          <div className="w-10 h-10 flex items-center justify-center bg-active rounded-lg text-white font-bold text-lg shadow-md">
            🎸
          </div>
          {!collapsed && (
            <span className="ml-1 text-lg font-semibold text-text-primary">
              GuitarCoach
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center rounded-md transition-colors group',
                collapsed ? 'justify-center px-2' : 'px-3',
                'py-2',
                isActive 
                  ? 'bg-active/20 text-active' 
                  : 'text-text-secondary hover:bg-card-hover hover:text-text-primary',
              )}
              tabIndex={0}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute left-0 w-1 h-6 bg-active rounded-r-full" />
              )}
              
              <span className={clsx(
                'flex items-center justify-center',
                isActive && 'text-active',
                'transition-all duration-200',
                collapsed ? 'mx-0' : 'mr-3',
              )}>
                <Icon size={20} />
              </span>
              
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 rounded bg-card text-xs font-medium opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-50 whitespace-nowrap shadow-md">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Theme Switcher at bottom of sidebar */}
      <div className={clsx(
        'mt-auto pt-4 pb-2 border-t border-border/30', 
        collapsed ? 'flex justify-center' : 'px-4'
      )}> 
        <ThemeSwitcher compact={collapsed} />
      </div>
    </aside>
  );
}