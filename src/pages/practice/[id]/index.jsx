'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/ui/Layout';
import { FiArrowLeft, FiClock, FiMusic, FiPlay, FiPause } from 'react-icons/fi';

export default function PracticePage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Practice</h1>
      
      <div className="p-6 bg-green-100 text-green-700 rounded-md mb-6">
        <p className="font-bold">Success!</p>
        <p>This is the App Router version of the Practice page.</p>
      </div>
      
      <div className="p-6 bg-blue-50 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-3">Navigation Test</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard" className="text-blue-600 hover:underline">Dashboard</Link>
          </li>
          <li>
            <Link href="/songs" className="text-blue-600 hover:underline">Songs</Link>
          </li>
          <li>
            <Link href="/progress" className="text-blue-600 hover:underline">Progress</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}