// src/components/CardPreviewManager.jsx
'use client';

import { useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';

// Import all card components you want to preview
import Card1 from '@/components/your-cards/Card1';
import Card2 from '@/components/your-cards/Card2';
// ... import other cards

const cardComponents = [
  { id: 'card1', name: 'Basic Card', component: Card1 },
  { id: 'card2', name: 'Profile Card', component: Card2 },
  // ... add more cards
];

export default function CardPreviewManager() {
  const [previews, setPreviews] = useState([]);

  const addPreview = (cardType) => {
    setPreviews([...previews, { 
      id: Date.now(), 
      type: cardType 
    }]);
  };

  const removePreview = (id) => {
    setPreviews(previews.filter(preview => preview.id !== id));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Add Card Previews</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {cardComponents.map(({ id, name }) => (
            <button
              key={id}
              onClick={() => addPreview(id)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <FiPlus className="inline mr-1" /> {name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {previews.map(({ id, type }) => {
          const card = cardComponents.find(c => c.id === type);
          const CardComponent = card?.component;
          
          return (
            <div key={id} className="relative group">
              <button
                onClick={() => removePreview(id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Remove card"
              >
                <FiX size={16} />
              </button>
              <div className="h-full">
                {CardComponent ? <CardComponent /> : <div>Card not found</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}