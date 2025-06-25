'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
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

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tempImgUrl, setTempImgUrl] = useState(null); // persistent temp image url
  const imageInputRef = useRef(null);

  // Chat bar ref and rect for portal positioning
  const chatBarRef = useRef(null);
  const [chatBarRect, setChatBarRect] = useState(null);
  useEffect(() => {
    function updateRect() {
      if (chatBarRef.current) {
        setChatBarRect(chatBarRef.current.getBoundingClientRect());
      }
    }
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, []);

  // Handle image file selection
  // Handle image file selection with feedback for non-image
// Handle image file selection with upload to tempImg for persistence
const handleImageChange = async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (png, jpg, jpeg, gif, webp).');
    if (imageInputRef.current) imageInputRef.current.value = '';
    return;
  }
  setImageFile(file);
  const previewUrl = URL.createObjectURL(file);
  setImagePreview(previewUrl);

  // Upload to /api/tempImg for persistence
  try {
    const formData = new FormData();
    formData.append('file', file);
    const resp = await fetch('/api/tempImg', {
      method: 'POST',
      body: formData,
    });
    const data = await resp.json();
    if (data.tempUrl) {
      setTempImgUrl(data.tempUrl);
    } else {
      setTempImgUrl(null);
    }
  } catch (err) {
    setTempImgUrl(null);
  }
};

  // Handle clipboard paste for images
  const handlePaste = (e) => {
    if (e.clipboardData && e.clipboardData.items) {
      const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'));
      if (item) {
        const file = item.getAsFile();
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        e.preventDefault();
      }
    }
  };

  // Clear image preview
  const clearImagePreview = () => {
  setImageFile(null);
  setImagePreview(null);
  setTempImgUrl(null);
  if (imageInputRef.current) imageInputRef.current.value = '';
};

  // Send image to backend as FormData (now handled by main send button)
  // Send image to backend as FormData, update chat with server URL, and handle fallback
const handleSendImage = async () => {
  if (!imageFile) return;
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: formData,
    });
    const responseData = await response.json().catch(() => ({}));
    // Always update the image message in chat with the server URL and status
    if (onSendMessage) {
      // Use the server URL if available, otherwise keep the previewUrl as fallback
      onSendMessage({
        type: 'image',
        content: responseData.imageUrl || '', // always a string
        fileName: imageFile.name,
        fileType: imageFile.type,
        url: responseData.imageUrl || '',
        previewUrl: imagePreview, // fallback for broken server URL
        tempUrl: tempImgUrl, // persistent temp url for chat history
        sender: 'user',
        timestamp: new Date().toISOString(),
        status: response.ok ? 'uploaded' : 'error',
      });
      // Add the AI response as a separate message
      if (response.ok) {
        onSendMessage({
          content: responseData.message || '[Image processed by AI]',
          sender: 'ai',
          timestamp: new Date().toISOString(),
        });
      } else {
        onSendMessage({
          content: `Sorry, there was an error: ${responseData.message || responseData.error || 'Image upload failed'}`,
          sender: 'ai',
          isError: true,
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    if (onSendMessage) {
      onSendMessage({
        content: `Sorry, there was an error: ${err.message || 'Image upload failed'}`,
        sender: 'ai',
        isError: true,
        timestamp: new Date().toISOString(),
      });
    }
  } finally {
    clearImagePreview();
  }
};


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (isLoading) return;
  // If an image is selected, add to chat and upload
  if (imageFile && imagePreview) {
    // Add image message to chat history (placeholder, status uploading)
    if (onSendMessage) {
  onSendMessage({
    type: 'image',
    content: '', // always a string; will be replaced after upload
    fileName: imageFile.name,
    fileType: imageFile.type,
    previewUrl: imagePreview,
    tempUrl: tempImgUrl, // persistent temp url for chat history
    sender: 'user',
    timestamp: new Date().toISOString(),
    status: 'uploading',
  });
}
await handleSendImage();
return;
  }
  // Otherwise, send text message
  if (!input.trim()) return;
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
            className="relative flex flex-col w-full"
          >
            {/* Floating image preview above chat input */}
            {imagePreview && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 z-20 flex justify-center w-full pointer-events-none">
                <div className="w-80 bg-gray-800 p-2 rounded shadow-lg flex flex-col items-center border border-blue-700 pointer-events-auto">
                  <img src={imagePreview} alt="Preview" className="max-h-32 max-w-full rounded mb-2" />
                  <div className="flex w-full space-x-2">
                    <button
                      className="flex-1 px-3 py-1 rounded bg-gray-600 text-white text-xs hover:bg-gray-700"
                      onClick={clearImagePreview}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="relative w-full">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Message Guitar Coach AI"
                className="w-full py-3 pl-5 pr-20 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none min-h-[50px] max-h-[200px] scrollbar-thin"
                rows={1}
                disabled={isLoading}
                onPaste={handlePaste}
              />
              {/* Image upload icon/button */}
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                style={{ display: 'none' }}
                ref={imageInputRef}
                onChange={handleImageChange}
                disabled={isLoading}
              />
              <button
                type="button"
                title="Upload Image"
                className="absolute right-12 bottom-2 w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white transition-colors"
                onClick={() => !isLoading && imageInputRef.current && imageInputRef.current.click()}
                disabled={isLoading}
                tabIndex={0}
              >
                <FiPaperclip size={18} />
              </button>
              <button
                type="submit"
                disabled={(!input.trim() && !imageFile) || isLoading}
                className={clsx(
                  'absolute right-2 bottom-2 w-8 h-8 rounded-full flex items-center justify-center',
                  (input.trim() || imageFile) && !isLoading
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
