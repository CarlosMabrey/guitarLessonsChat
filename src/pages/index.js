import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Use a short timeout to ensure the router is ready
    const redirectTimer = setTimeout(() => {
      router.push('/dashboard');
    }, 100);
    
    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <p className="text-lg mb-4">Redirecting to dashboard...</p>
      <Link 
        href="/dashboard" 
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Click here if not redirected
      </Link>
    </div>
  );
} 