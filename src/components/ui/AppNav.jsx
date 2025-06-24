'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiMusic, FiBook, FiActivity, FiGrid } from 'react-icons/fi';

export default function AppNav() {
  const pathname = usePathname();
  
  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: FiHome },
    { href: '/songs', label: 'Songs', icon: FiMusic },
    { 
      href: '/tabs', 
      label: 'Tabs', 
      icon: FiMusic,
      subItems: [
        { href: '/tabs', label: 'My Tabs' },
        { href: '/tabs/midi-viewer', label: 'MIDI Viewer' }
      ]
    },
    { href: '/practice', label: 'Practice', icon: FiBook },
    { href: '/progress', label: 'Progress', icon: FiActivity },
    { href: '/theory', label: 'Theory', icon: FiGrid },
  ];
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md p-4 z-10">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="font-bold text-xl text-blue-600">
          Guitar App
        </Link>
        
        <div className="flex space-x-6">
          {links.map(link => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            const hasSubItems = link.subItems && link.subItems.length > 0;
            
            return (
              <div key={link.href} className="relative group">
                <Link 
                  href={link.href}
                  className={`flex items-center ${isActive 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-600 hover:text-blue-600'}`}
                >
                  <Icon className="mr-1" />
                  {link.label}
                  {hasSubItems && (
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>
                
                {hasSubItems && (
                  <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {link.subItems.map(subItem => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`block px-4 py-2 text-sm ${pathname === subItem.href 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 