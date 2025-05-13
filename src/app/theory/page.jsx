'use client';

import Link from 'next/link';
import { FiGrid, FiMusic, FiBook } from 'react-icons/fi';
import AppNav from '@/components/ui/AppNav';

export default function TheoryPage() {
  const theoryTools = [
    {
      id: 'tonnetz',
      title: 'Tonnetz Chord Visualizer',
      description: 'Interactive 3D visualization for exploring chord relationships and music theory',
      icon: FiGrid,
      href: '/theory/tonnetz'
    },
    // Additional theory tools can be added here in the future
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="main-heading mb-6">Music Theory Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theoryTools.map(tool => {
          const Icon = tool.icon;
          
          return (
            <Link 
              key={tool.id}
              href={tool.href}
              className="card hover:bg-card-hover transition-colors p-6 flex flex-col"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full text-primary mr-4">
                  <Icon size={24} />
                </div>
                <h2 className="text-xl font-semibold">{tool.title}</h2>
              </div>
              
              <p className="text-text-secondary mb-4 flex-grow">
                {tool.description}
              </p>
              
              <div className="text-primary font-medium">
                Explore &rarr;
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 