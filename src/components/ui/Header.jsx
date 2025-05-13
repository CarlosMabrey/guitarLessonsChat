import Link from 'next/link';
import { FiBell, FiChevronDown, FiDownload, FiUpload } from 'react-icons/fi';
import { clsx } from 'clsx';

export default function Header({ title, version }) {
  return (
    <header className="flex justify-between items-center px-6 py-4">
      <div>
        <h1 className="main-heading">{title}</h1>
        {version && (
          <div className="flex items-center mt-1 text-sm text-text-secondary">
            <span className="w-1.5 h-1.5 bg-success rounded-full mr-2"></span>
            <span>Activated | v {version}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex space-x-1">
          <button className="btn btn-ghost rounded-full w-8 h-8 flex items-center justify-center">
            <FiDownload size={18} />
          </button>
          <button className="btn btn-ghost rounded-full w-8 h-8 flex items-center justify-center">
            <FiUpload size={18} />
          </button>
        </div>
        
        <div className="relative">
          <button className="btn btn-ghost rounded-full w-8 h-8 flex items-center justify-center">
            <FiBell size={18} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full"></span>
          </button>
        </div>
        
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-500 overflow-hidden">
            <img 
              src="/images/avatar-placeholder.png" 
              alt="User avatar" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
} 