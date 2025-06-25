'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { FiSend, FiMessageSquare, FiMic, FiPaperclip } from 'react-icons/fi';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import MessageRenderer from '@/components/chat/MessageRenderer';

const Chat = ({
  messages = [],
  onSendMessage,
  isLoading = false,
  suggestedPrompts = [],
  inputRef,
  className = ''
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const formRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    onSendMessage(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' }
    })
  };

  const renderInputStatus = () => {
    if (!isLoading) return null;
    return (
      <div className="absolute bottom-full left-0 right-0 mb-1 px-4">
        <div className="flex items-center justify-center space-x-2 bg-black/70 text-gray-300 text-xs py-1.5 px-3 rounded-full">
          <span className="animate-pulse">Guitar Coach AI is thinking...</span>
        </div>
      </div>
    );
  };

  return (
    <div className={clsx('flex flex-col h-full relative', className)}>
      <div className="flex-1 overflow-y-auto py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-700/30 scrollbar-track-transparent">
        {messages.length === 0 && showSuggestions ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="max-w-2xl w-full mx-auto">
              <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center mb-6 mx-auto">
                <FiMessageSquare className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">How can I help you today?</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Ask me about guitar techniques, song analysis, practice tips, or anything else guitar-related.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {suggestedPrompts.map((item, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.2 }}
                    onClick={() => handleSuggestionClick(item.prompt || item)}
                    className="p-4 rounded-xl bg-gray-900 hover:bg-gray-800 transition-all duration-200 group text-left border border-gray-700/50"
                  >
                    {item.title ? (
                      <>
                        <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </>
                    ) : (
                      <p className="text-white">{item}</p>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id || index}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={messageVariants}
              >
                <MessageRenderer 
                  message={message} 
                  isTyping={isLoading && index === messages.length - 1 && message.sender === 'ai'}
                />
              </motion.div>
            ))}
            <div ref={messagesEndRef} className="h-16" />
          </AnimatePresence>
        )}
      </div>
      <div className="pb-3">
        {renderInputStatus()}
        <div className="px-4 pt-3 max-w-4xl mx-auto">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className={clsx(
              'relative border bg-gray-900 rounded-full shadow-md overflow-hidden',
              isFocused ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-gray-700'
            )}
          >
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Message Guitar Coach AI"
                className="w-full py-3 pl-5 pr-14 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none min-h-[50px] max-h-[200px] scrollbar-thin"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={clsx(
                  'absolute right-2 bottom-2 w-8 h-8 rounded-full flex items-center justify-center',
                  input.trim() && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-700 text-gray-400'
                )}
              >
                <FiSend size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
