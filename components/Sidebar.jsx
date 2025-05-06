import { useRouter } from 'next/router';
import Link from 'next/link';

const Sidebar = () => {
  const router = useRouter();
  
  const isActive = (path) => {
    return router.pathname.startsWith(path);
  };
  
  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Songs', path: '/songs' },
    { label: 'Practice', path: '/practice' },
    { label: 'Progress', path: '/progress' },
  ];
  
  return (
    <div className="fixed top-0 left-0 w-64 h-full bg-gray-800 text-white overflow-y-auto">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold">Guitar Coach</h2>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                href={item.path}
                className={`flex items-center px-6 py-3 hover:bg-gray-700 ${isActive(item.path) ? 'bg-indigo-600' : ''}`}
              >
                <span className="ml-2">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 