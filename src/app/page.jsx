'use client';

import Link from 'next/link';
import { FiPlay, FiBook, FiVideo, FiMusic } from 'react-icons/fi';
import PageContainer from '@/components/layout/PageContainer';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Guitar Coach</h1>
      <p className="text-lg">Your journey to guitar mastery starts here.</p>
    </div>
  );
} 