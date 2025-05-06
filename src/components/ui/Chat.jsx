'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import { getChatHistory, saveChatMessage, clearChatHistory } from '@/lib/db';

export default function Chat({ songId, initialPrompt = '', onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Load chat history from database on mount
  useEffect(() => {
    const history = getChatHistory(songId);
    if (history.length > 0) {
      setMessages(history);
    } else if (initialPrompt) {
      // If no history but there's an initial prompt, start a new conversation
      const userMessage = {
        id: Date.now().toString(),
        content: initialPrompt,
        sender: 'user'
      };
      
      setMessages([userMessage]);
      saveChatMessage(songId, userMessage);
      simulateAIResponse(initialPrompt);
    }
  }, [songId, initialPrompt]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      content: input,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    saveChatMessage(songId, userMessage);
    simulateAIResponse(input);
    setInput('');
  };
  
  const simulateAIResponse = (userInput) => {
    setIsLoading(true);
    
    // This is a mock function - in production, you would call your actual AI API
    setTimeout(() => {
      const response = generateMockResponse(userInput, songId);
      
      const aiMessage = {
        id: Date.now().toString(),
        content: response,
        sender: 'ai'
      };
      
      setMessages(prev => [...prev, aiMessage]);
      saveChatMessage(songId, aiMessage);
      setIsLoading(false);
    }, 1500); // Simulate API delay
  };
  
  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      clearChatHistory(songId);
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-text-secondary">
              <p className="mb-2">Ask the AI Guitar Coach about this song</p>
              <p className="text-sm">
                Try asking about chords, techniques, difficulty, or practice tips
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-card-hover text-text-primary rounded-bl-none'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-card-hover text-text-primary rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-text-secondary animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-border p-3">
        {messages.length > 0 && (
          <div className="flex justify-between items-center mb-2">
            <button 
              onClick={handleClearChat}
              className="text-xs text-text-secondary hover:text-danger flex items-center"
            >
              <FiTrash2 className="mr-1" size={12} /> Clear chat
            </button>
            <div className="text-xs text-text-secondary">
              {messages.length} messages
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this song..."
            className="input flex-1 mr-2"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="btn btn-primary p-2"
            disabled={!input.trim() || isLoading}
          >
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
}

// Mock AI response generator
function generateMockResponse(input, songId) {
  // This function simulates AI responses based on query keywords
  // In a real application, this would be replaced with actual AI API calls
  
  const lowercaseInput = input.toLowerCase();
  
  if (lowercaseInput.includes('chord') || lowercaseInput.includes('chords')) {
    return "For this song, focus on smooth transitions between chords. Practice the chord shapes slowly at first, making sure each string rings clearly. The F chord might be challenging if you're a beginner - try using the F major barre chord, or simplify with an Fmaj7 until you build finger strength.";
  }
  
  if (lowercaseInput.includes('difficult') || lowercaseInput.includes('hard') || lowercaseInput.includes('challenging')) {
    return "The most challenging parts of this song are the quick chord changes in the chorus and the fingerpicking pattern in the bridge. I suggest breaking these sections down and practicing them separately at 50-60% speed, then gradually increase tempo as you get more comfortable.";
  }
  
  if (lowercaseInput.includes('technique') || lowercaseInput.includes('fingerpicking') || lowercaseInput.includes('picking')) {
    return "This song uses alternating bass fingerpicking. Keep your thumb responsible for the bass notes (E, A, and D strings) while your index, middle, and ring fingers handle the higher strings. Start slowly to develop muscle memory, and make sure your picking hand stays relaxed.";
  }
  
  if (lowercaseInput.includes('progress') || lowercaseInput.includes('improve') || lowercaseInput.includes('practice')) {
    return "To improve on this song, try these steps: 1) Practice the chord progression without rhythm first, just focusing on clean transitions. 2) Add the strumming pattern at 60% speed with a metronome. 3) Incorporate dynamics and gradually increase speed. 4) Record yourself to identify areas for improvement. Consistent daily practice, even just 15 minutes, will yield better results than occasional long sessions.";
  }
  
  if (lowercaseInput.includes('strum') || lowercaseInput.includes('strumming')) {
    return "The main strumming pattern for this song is Down, Down-Up, Up-Down-Up (D, D-U, U-D-U). Start by counting '1, 2-and, and-3-and' while practicing. Keep your wrist loose, and remember that consistent rhythm is more important than speed at first.";
  }
  
  if (lowercaseInput.includes('tab') || lowercaseInput.includes('tablature')) {
    return "The tablature for this song uses standard notation with the top line representing the high E string and the bottom line representing the low E string. The numbers indicate which fret to play on that string. A '0' means play the open string. Practice reading the tab slowly, making sure your fingers are positioned correctly before strumming.";
  }
  
  if (lowercaseInput.includes('beginner') || lowercaseInput.includes('start')) {
    return "If you're a beginner, start by mastering the basic open chords used in this song. Practice switching between them slowly until you can do it without looking. Focus on getting clean sounds with no buzzing or muted strings. Once comfortable, introduce the strumming pattern at a reduced tempo (around 60-70% of the original). Gradually increase speed as your confidence grows.";
  }
  
  if (lowercaseInput.includes('scale') || lowercaseInput.includes('solo')) {
    return "This song is in the key of A minor, so the A minor pentatonic scale (A, C, D, E, G) works well for improvisations. For the solo sections, try using the A minor pentatonic scale in the 5th position. Focus on the phrasing and timing rather than speed - even simple, well-timed notes can sound more musical than fast but sloppy playing.";
  }
  
  // Default response if no keywords match
  return "This song has a moderate difficulty level. Focus on mastering the chord progression first, then add the rhythm and dynamics. The song follows a standard verse-chorus structure, and the techniques you'll practice here (chord transitions, rhythmic strumming, and dynamics) will be useful for many other songs. Is there a specific part you'd like help with?";
} 