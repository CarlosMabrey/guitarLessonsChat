'use client';

import { useState } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import Modal from './Modal';
import Chat from './Chat';

export default function ChatButton({ songId, title, className = '' }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);
  
  return (
    <>
      <button
        onClick={openChat}
        className={`btn btn-primary flex items-center ${className}`}
      >
        <FiMessageCircle className="mr-2" />
        AI Breakdown
      </button>
      
      <Modal
        isOpen={isChatOpen}
        onClose={closeChat}
        title={`AI Guitar Coach: ${title}`}
        size="lg"
      >
        <Chat 
          songId={songId} 
          initialPrompt={`Help me learn "${title}". What should I focus on?`}
          onClose={closeChat}
        />
      </Modal>
    </>
  );
} 