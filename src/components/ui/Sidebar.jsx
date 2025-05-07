import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiMusic, FiPlay, FiBarChart2, FiSettings, FiHelpCircle, FiUser } from 'react-icons/fi';
import { clsx } from 'clsx';
import ThemeSwitcher from './ThemeSwitcher';

const navItems = [
  { icon: FiHome, label: 'Dashboard', href: '/dashboard' },
  { icon: FiMusic, label: 'Songs', href: '/songs' },
  { icon: FiPlay, label: 'Practice', href: '/practice' },
  { icon: FiBarChart2, label: 'Progress', href: '/progress' },
  { icon: FiUser, label: 'Profile', href: '/profile' },
  { icon: FiSettings, label: 'Settings', href: '/settings' },
  { icon: FiHelpCircle, label: 'Help', href: '/help' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 py-6 flex flex-col items-center bg-background-light border-r border-border z-10">
      <div className="mb-6">
        <div className="w-10 h-10 flex items-center justify-center bg-primary rounded-md text-white font-bold text-xl">
          G
        </div>
      </div>

      <nav className="flex-1 w-full flex flex-col items-center space-y-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={clsx(
                "sidebar-icon group relative",
                isActive && "text-primary"
              )}
            >
              <Icon size={20} />
              <div className="absolute left-14 px-2 py-1 bg-card rounded-md text-sm font-medium invisible opacity-0 -translate-x-2 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                {item.label}
              </div>
              {isActive && (
                <div className="absolute left-0 w-0.5 h-5 bg-primary rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Theme Switcher at bottom of sidebar */}
      <div className="mt-auto mb-6">
        <ThemeSwitcher compact={true} />
      </div>
    </aside>
  );
}