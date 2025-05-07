'use client';

import React, { useState, useEffect } from 'react';
import { FiHome, FiMusic, FiClock, FiZap } from 'react-icons/fi';
import { TbProgress } from 'react-icons/tb';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PageContainer({ 
  children, 
  title = 'Guitar Lessons', 
  showNav = true 
}) {
  const pathname = usePathname();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: FiHome },
    { name: 'Songs', href: '/songs', icon: FiMusic },
    { name: 'Practice', href: '/practice', icon: FiClock },
    { name: 'Progress', href: '/progress', icon: TbProgress },
    { name: 'Tab Test', href: '/unified-tab-test', icon: FiZap }
  ];
  
  return (
    <div className="min-h-screen bg-background-primary text-text-primary flex">
      {showNav && (
        <div className="w-16 md:w-64 bg-background-secondary border-r border-border">
          <div className="h-16 flex items-center justify-center md:justify-start px-4 border-b border-border">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">🎸</span>
              <h1 className="text-xl font-bold hidden md:block ml-2">GuitarCoach</h1>
            </Link>
          </div>
          
          <nav className="p-2">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                      pathname === item.href
                        ? 'bg-primary text-white'
                        : 'hover:bg-background-primary/80 text-text-secondary'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span className="hidden md:inline">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
      
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {title && <h1 className="sr-only">{title}</h1>}
          {children}
        </div>
      </main>
    </div>
  );
} 