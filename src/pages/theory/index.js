import Link from 'next/link';
import { FiGrid, FiMusic, FiBook } from 'react-icons/fi';
import Layout from '../../components/ui/Layout';

export default function TheoryPage() {
  const theoryTools = [
    {
      id: 'tonnetz',
      title: 'Tonnetz Chord Visualizer',
      description: 'Interactive 3D visualization for exploring chord relationships and music theory',
      icon: FiGrid,
      href: '/theory/tonnetz'
    },
    {
      id: 'circle-of-fifths',
      title: 'Circle of Fifths',
      description: 'Interactive visualization of the circle of fifths',
      icon: FiMusic,
      href: '/theory/circle-of-fifths'
    },
    {
      id: 'fretboard',
      title: 'Fretboard Visualizer',
      description: 'Visualize musical scales and chords on a fretboard.',
      icon: FiMusic,
      href: '/theory/fretboard'
    },

    {
      id: 'piano-visualizer',
      title: 'Piano Visualizer',
      description: 'Visualize musical scales and chords on a piano keyboard.',
      icon: FiMusic,
      href: '/theory/piano'
    },
    {
      id: 'scales',
      title: 'Scale Explorer',
      description: 'Explore musical scales with note breakdowns, audio demos, and related chords.',
      icon: FiMusic,
      href: '/theory/scales'
    },
    {
      id: 'ear-training',
      title: 'Ear Training Tool',
      description: 'Practice identifying intervals, chords, and scales by ear with interactive quizzes.',
      icon: FiMusic,
      href: '/theory/ear-training'
    },
    {
      id: 'cheatsheet',
      title: 'Music Theory Cheatsheet',
      description: 'Quick reference for chords, scales, intervals, modes, and progressions.',
      icon: FiBook,
      href: '/theory/cheatsheet'
    },
    {
      id: 'chord-progressions',
      title: 'Chord Progressions',
      description: 'Create and explore chord progressions with interactive tools.',
      icon: FiBook,
      href: '/theory/progressions'
    },
    {
      id: 'chord-function-graph',
      title: 'Chord Function Graph',
      description: 'Visualize harmonic functions (tonic, dominant, subdominant) within a key using interactive graphs.',
      icon: FiBook,
      href: '/theory/functions'
    }
    // Additional theory tools can be added here in the future
  ];

  return (
    <Layout title="Music Theory Tools">
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
    </Layout>
  );
} 