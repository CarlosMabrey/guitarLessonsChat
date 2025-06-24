import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiMusic, 
  FiPlay, 
  FiBarChart2, 
  FiSettings, 
  FiHelpCircle, 
  FiUser, 
  FiGrid, 
  FiChevronLeft, 
  FiChevronRight,
  FiFileText 
} from 'react-icons/fi';
import { clsx } from 'clsx';
import ThemeSwitcher from './ThemeSwitcher';

const navItems = [
  { icon: FiHome, label: 'Dashboard', href: '/dashboard' },
  { icon: FiMusic, label: 'Songs', href: '/songs' },
  { icon: FiFileText, label: 'Tabs', href: '/tabs' },
  { icon: FiPlay, label: 'Practice', href: '/practice' },
  { icon: FiBarChart2, label: 'Progress', href: '/progress' },
  { icon: FiGrid, label: 'Theory', href: '/theory' },
  // { icon: FiUser, label: 'Profile', href: '/profile' },
  // { icon: FiSettings, label: 'Settings', href: '/settings' },
  // { icon: FiHelpCircle, label: 'Help', href: '/help' },
];

export default function Sidebar({ onToggle, isMobile = false }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle initial mount to prevent hydration mismatch and load state from localStorage
  useEffect(() => {
    setMounted(true);
    
    // Only load from localStorage on desktop
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

  // Handle toggling the sidebar
  const toggleSidebar = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onToggle) onToggle(newCollapsed);
  };

  if (!mounted) return null;

  return (
    <aside
      className={clsx(
        'h-full flex flex-col transition-all duration-300 ease-in-out',
        'bg-background-light/95 dark:bg-card/95 backdrop-blur-md',
        'border-r border-border/50',
        'shadow-lg',
        'py-4',
        'flex flex-col justify-between',
        'overflow-hidden',
        {
          'w-64': !collapsed,
          'w-20': collapsed,
          'fixed lg:relative': isMobile,
          'z-30': isMobile,
          'translate-x-0': isMobile && !collapsed,
          '-translate-x-full': isMobile && collapsed,
        }
      )}
      aria-label="Sidebar navigation"
    >
      {/* Logo - Clickable */}
      <div 
        className={clsx(
          'flex items-center px-3 pb-6 pt-1 cursor-pointer',
          'transition-colors duration-200',
          'hover:bg-card-hover/30 rounded-lg mx-2',
          collapsed ? 'justify-center' : 'justify-start'
        )}
        onClick={toggleSidebar}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSidebar();
          }
        }}
      >
        <div className={clsx(
          'flex items-center',
          collapsed ? 'justify-center w-full' : 'gap-3',
        )}>
          <div className="w-10 h-10 flex items-center justify-center bg-active rounded-lg shadow-md overflow-hidden">
            <Image
              src="/guitarlogo.png"
              alt="Guitar Coach Logo"
              width={32}
              height={32}
              className="object-contain"
            />
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

      {/* Bottom section with theme switcher */}
      <div className="mt-auto">
        <div className={clsx(
          'py-4 border-t border-border/30',
          'flex items-center justify-center',
          collapsed ? 'px-2' : 'px-4'
        )}>
          <ThemeSwitcher compact={collapsed} />
        </div>
      </div>
    </aside>
  );
}