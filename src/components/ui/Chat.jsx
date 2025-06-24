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
      <div className="absolute bottom-full left-0 right-0 mb-2 px-4">
        <div className="flex items-center justify-center space-x-2 bg-muted/70 backdrop-blur-md text-muted-foreground text-xs py-1.5 px-3 rounded-full border border-muted/40">
          <span className="animate-pulse">Guitar Coach AI is thinking...</span>
        </div>
      </div>
    );
  };

  return (
    <div className={clsx('flex flex-col h-full relative', className)}>
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-border/30 scrollbar-track-transparent">
        {messages.length === 0 && showSuggestions ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="max-w-2xl w-full mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                <FiMessageSquare className="text-primary" size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">How can I help you today?</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
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
                    className="p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-all duration-200 group text-left"
                  >
                    {item.title ? (
                      <>
                        <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
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
                className={clsx('flex', message.sender === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={clsx(
                    'relative max-w-[85%] md:max-w-[75%] lg:max-w-[65%] p-4 rounded-2xl',
                    message.sender === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-muted/30 text-white border border-muted/50 rounded-tl-sm'
                  )}
                >
                  {message.sender === 'ai' && (
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                        <FiMessageSquare className="text-primary" size={14} />
                      </div>
                      <span className="text-xs font-medium text-primary">Guitar Coach AI</span>
                    </div>
                  )}
                  <MessageRenderer 
                    message={message} 
                    isTyping={isLoading && index === messages.length - 1 && message.sender === 'ai'}
                  />
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} className="h-16" />
          </AnimatePresence>
        )}
      </div>
      <div className="border-t border-muted/30 bg-card/80 backdrop-blur-md">
        {renderInputStatus()}
        <div className="px-4 pt-4 pb-6 max-w-4xl mx-auto">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className={clsx(
              'relative border rounded-xl shadow-md',
              isFocused ? 'border-primary/50 ring-2 ring-primary/20' : 'border-muted/30'
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
                placeholder="Ask about chords, scales, songs, or techniques..."
                className="w-full py-3 pl-5 pr-14 bg-card text-white placeholder-muted-foreground focus:outline-none resize-none min-h-[60px] max-h-[200px] rounded-xl scrollbar-thin"
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={clsx(
                  'absolute right-3 bottom-3 w-10 h-10 rounded-full flex items-center justify-center',
                  input.trim() && !isLoading
                    ? 'bg-primary text-white hover:bg-primary/90 shadow'
                    : 'bg-muted text-muted-foreground/50'
                )}
              >
                <FiSend size={18} />
              </button>
            </div>
          </form>
          <div className="mt-3 text-center text-xs text-muted-foreground">
            Guitar Coach AI · May produce inaccuracies · {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
