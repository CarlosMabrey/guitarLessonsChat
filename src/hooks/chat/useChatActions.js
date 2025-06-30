'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom hook for chat message and file handling actions
 */
export default function useChatActions({
  chatId,
  setChatId,
  messages,
  setMessages,
  isLoading,
  setIsLoading,
  isNewChat,
  setIsNewChat,
  chats,
  setChats,
  apiKey
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const router = useRouter();

  /**
   * Handle sending a text message
   * @param {string} message - Message content to send
   */
  const handleSendMessage = async (message) => {
    // Handle image messages
    if (typeof message === 'object' && message.type === 'image') {
      // Add the image message immediately (with previewUrl if present)
      const imageMsg = {
        id: `img_${Date.now()}`,
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, imageMsg]);
      return;
    }

    // Handle text messages as before
    if (typeof message === 'string' && !message.trim()) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // Update local state
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // If this is a new chat, update the URL with the chat ID
    if (isNewChat && chatId) {
      router.push(`/chat?id=${chatId}`, undefined, { shallow: true });
      setIsNewChat(false);
    }

    // Get AI response
    setIsLoading(true);
    try {
      // Only send messages with valid content to the backend
      const validMessages = updatedMessages.filter(
        m =>
          (typeof m.content === 'string' && m.content.length > 0) ||
          (Array.isArray(m.content))
      );
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: validMessages,
          chatId,
          apiKey: apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const responseData = await response.json();
      const responseMessage = responseData.message;
      const aiMessage = {
        id: `msg_${Date.now()}_ai`,
        content: responseMessage,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        metadata: responseData.metadata || {}
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);

      const errorMessage = {
        id: `err_${Date.now()}`,
        content: `Sorry, there was an error: ${error.message || 'Please try again'}`,
        sender: 'ai',
        isError: true,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle file selection from input
   * @param {Event} e - File input change event
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  /**
   * Handle sending a file as a chat message
   */
  const handleSendFile = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    
    try {
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(selectedFile);
      
      // First add the image message to the UI immediately so user sees their upload
      const imageMessage = {
        id: `img_${Date.now()}`,
        type: 'image',
        content: `Uploaded image: ${selectedFile.name}`,
        sender: 'user',
        timestamp: new Date().toISOString(),
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        previewUrl: previewUrl,
        status: 'uploading'
      };
      
      setMessages(prev => [...prev, imageMessage]);
      
      // If this is a new chat, update the URL with the chat ID
      if (isNewChat && chatId) {
        router.push(`/chat?id=${chatId}`, undefined, { shallow: true });
        setIsNewChat(false);
      }
      
      // Send to the API
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('chatId', chatId || '');
      formData.append('apiKey', apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || '');
      
      // Include current message history for context
      formData.append('messages', JSON.stringify(messages));

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });
      
      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('API Error Response:', responseData);
        throw new Error(
          responseData.message || 
          responseData.error?.message || 
          'Unknown error uploading file.'
        );
      }
      
      // Important: Update the image message with the server URL first and store updated messages
      let updatedMessages = [];
      
      setMessages(prev => {
        // Create a new array with the updated image message
        updatedMessages = prev.map(msg => 
          msg.id === imageMessage.id 
            ? { ...msg, url: responseData.imageUrl, status: 'uploaded' }
            : msg
        );
        return updatedMessages;
      });
      
      // Wait a moment for the state update to process
      setTimeout(() => {
        // Now add the AI response as a separate message, ensuring we use the latest message array
        const aiMessage = {
          id: `msg_${Date.now()}_ai`,
          content: responseData.message,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          metadata: {
            imageProcessed: true,
            originalImage: responseData.imageUrl
          }
        };
        
        // Use the stored updated messages as the base to make sure we don't lose the image
        setMessages(prev => [...prev, aiMessage]);
      }, 100);
      setSelectedFile(null);
      
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(previewUrl);
      
    } catch (error) {
      console.error('Error processing image:', error);
      
      const errorMessage = {
        id: `err_${Date.now()}`,
        content: `Sorry, there was an error processing your image: ${error.message || 'Please try again'}`,
        sender: 'ai',
        isError: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Start a new chat session
   */
  const handleNewChat = () => {
    const newChatId = `chat_${uuidv4()}`;
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      lastMessage: '',
      updatedAt: new Date().toISOString()
    };
    
    // Update chats list
    setChats(prevChats => [newChat, ...prevChats]);
    
    // Update local storage
    localStorage.setItem(`chat_${newChatId}`, JSON.stringify({
      ...newChat,
      messages: []
    }));
    
    // Update state
    setChatId(newChatId);
    setMessages([]);
    setIsNewChat(true);
    
    // Update URL
    router.push(`/chat?id=${newChatId}`, undefined, { shallow: true });
    
    return newChatId;
  };

  /**
   * Handle chat selection from sidebar
   * @param {string} selectedChatId - ID of the selected chat
   */
  const handleChatSelect = (selectedChatId) => {
    const chatData = localStorage.getItem(`chat_${selectedChatId}`);
    if (chatData) {
      const { messages: savedMessages } = JSON.parse(chatData);
      setChatId(selectedChatId);
      setMessages(savedMessages);
      setIsNewChat(false);
      router.push(`/chat?id=${selectedChatId}`, undefined, { shallow: true });
    }
  };

  return {
    selectedFile,
    setSelectedFile,
    handleSendMessage,
    handleFileChange,
    handleSendFile,
    handleNewChat,
    handleChatSelect
  };
}
