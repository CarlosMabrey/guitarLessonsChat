'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiMusic, FiPlay, FiBarChart2, FiMenu, FiX, FiFeather } from 'react-icons/fi';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path) => {
    return pathname === path;
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <FiMusic className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-gray-900">Guitar Coach</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center">
                <FiHome className="mr-1.5" />
                Home
              </div>
            </Link>
            
            <Link 
              href="/dashboard" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/dashboard') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center">
                <FiBarChart2 className="mr-1.5" />
                Dashboard
              </div>
            </Link>
            
            <Link 
              href="/songs" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/songs') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center">
                <FiMusic className="mr-1.5" />
                Songs
              </div>
            </Link>
            
            <Link 
              href="/chords" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/chords') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center">
                <FiFeather className="mr-1.5" />
                Chords
              </div>
            </Link>
            
            <Link 
              href="/practice" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/practice') 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center">
                <FiPlay className="mr-1.5" />
                Practice
              </div>
            </Link>
          </div>
          
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-blue-500 hover:bg-blue-50 focus:outline-none"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            href="/" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/') 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex items-center">
              <FiHome className="mr-1.5" />
              Home
            </div>
          </Link>
          
          <Link 
            href="/dashboard" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/dashboard') 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex items-center">
              <FiBarChart2 className="mr-1.5" />
              Dashboard
            </div>
          </Link>
          
          <Link 
            href="/songs" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/songs') 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex items-center">
              <FiMusic className="mr-1.5" />
              Songs
            </div>
          </Link>
          
          <Link 
            href="/chords" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/chords') 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex items-center">
              <FiFeather className="mr-1.5" />
              Chords
            </div>
          </Link>
          
          <Link 
            href="/practice" 
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/practice') 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex items-center">
              <FiPlay className="mr-1.5" />
              Practice
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
} 