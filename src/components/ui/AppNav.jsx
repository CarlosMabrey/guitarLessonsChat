'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiMusic, FiBook, FiActivity, FiGrid } from 'react-icons/fi';

export default function AppNav() {
  const pathname = usePathname();
  
  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: FiHome },
    { href: '/songs', label: 'Songs', icon: FiMusic },
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
            
            return (
              <Link 
                key={link.href}
                href={link.href}
                className={`flex items-center ${isActive 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-blue-600'}`}
              >
                <Icon className="mr-1" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 