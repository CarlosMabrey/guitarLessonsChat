import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { parseMessageContent, renderParsedContent } from '@/lib/chat/messageParser';

// Dynamically import components with SSR disabled
const ChatFretboard = dynamic(
  () => import('@/components/chat/ChatFretboard'),
  { ssr: false, loading: () => <div className="p-4 bg-gray-100 rounded">Loading fretboard...</div> }
);

const ChatChord = dynamic(
  () => import('@/components/chat/ChatChord'),
  { ssr: false, loading: () => <div className="p-4 bg-gray-100 rounded">Loading chord...</div> }
);

const ParserDemo = () => {
  const [input, setInput] = useState(`
Here's a simple C major scale:

\`\`\`tab
e|-----------------0--1--|
B|--------------1--------|
G|-----------2-----------|
D|--------2--------------|
A|-----0-----------------|
E|--3--------------------|
\`\`\`

And here's a [C] chord followed by a [G] chord. Here's a more detailed chord:

\`\`\`chord
{
  "name": "C major",
  "notes": ["C", "E", "G"],
  "voicing": [
    {"string": 5, "fret": 3, "note": "C"},
    {"string": 4, "fret": 2, "note": "E"},
    {"string": 3, "fret": 0, "note": "G"},
    {"string": 2, "fret": 1, "note": "C"},
    {"string": 1, "fret": 0, "note": "E"}
  ]
}
\`\`\`

And an interactive fretboard:

\`\`\`fretboard
{
  "tuning": ["E2", "A2", "D3", "G3", "B3", "E4"],
  "notes": [
    {
      "string": 6,
      "fret": 3,
      "note": "G",
      "duration": "q",
      "highlight": true,
      "label": "Root",
      "color": "#3b82f6"
    },
    {
      "string": 5,
      "fret": 5,
      "note": "D",
      "duration": "q",
      "highlight": true,
      "label": "5th",
      "color": "#10b981"
    }
  ],
  "showFretNumbers": true,
  "showNoteNames": true
}
\`\`\`
`);

  const parsed = parseMessageContent(input);

  // Custom components for rendering
  const components = useMemo(() => ({
    TextComponent: ({ children }) => (
      <div className="mb-4 text-gray-800">{children}</div>
    ),
    TabComponent: ({ content }) => (
      <div className="my-4 p-4 bg-gray-50 rounded-md border border-gray-200">
        <pre className="font-mono text-sm whitespace-pre-wrap">{content.join('\n')}</pre>
      </div>
    ),
    ChordComponent: (props) => {
      const { isDetailed, voicing, notes, fullName } = props;
      
      // For simple chords, just show the chord name
      if (!isDetailed) {
        return (
          <div className="my-2">
            <ChatChord chord={fullName} showInfo={true} size="small" />
          </div>
        );
      }
      
      // For detailed chords, show the full visualization
      return (
        <div className="my-4">
          <ChatChord 
            chord={fullName}
            voicing={voicing}
            notes={notes}
            interactive={false}
            showInfo={true}
            size="medium"
          />
        </div>
      );
    },
    FretboardComponent: (props) => (
      <div className="my-4">
        <ChatFretboard 
          {...props} 
          interactive={false}
          width="100%"
          maxWidth={500}
        />
      </div>
    )
  }), []); // Close useMemo with dependency array

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Message Parser Demo</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Input</h2>
          <textarea
            className="w-full h-96 p-4 border rounded-md font-mono text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Rendered Output</h2>
          <div className="border rounded-md p-6 bg-white">
            {renderParsedContent(parsed, components)}
            
            {/* Debug view toggle */}
            <details className="mt-8 text-sm">
              <summary className="text-gray-500 cursor-pointer">Debug View</summary>
              <pre className="mt-2 p-4 bg-gray-50 rounded text-xs overflow-x-auto">
                {JSON.stringify(parsed, (key, value) => 
                  typeof value === 'function' ? '[Function]' : value, 
                2
                )}
              </pre>
            </details>
          </div>
          

        </div>
      </div>
    </div>
  );
};

export default ParserDemo;
