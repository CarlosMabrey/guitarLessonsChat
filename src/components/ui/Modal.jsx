'use client';

import { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const modalRef = useRef(null);
  
  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto'; // Re-enable scrolling when modal is closed
    };
  }, [isOpen, onClose]);
  
  // Handle click outside to close
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full'
  };
  
  const modalSizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleOutsideClick}
    >
      <div 
        ref={modalRef}
        className={`${modalSizeClass} w-full h-[80vh] bg-card rounded-lg shadow-xl flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-medium">{title}</h3>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-card-hover transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>
        )}
        
        <div className={`flex-1 overflow-auto ${!title ? 'pt-4' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
} 