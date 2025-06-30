'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { useSettings } from '@/context/SettingsContext';

/**
 * Custom hook for managing chat state
 * Handles loading, saving, and managing chat data
 */
export default function useChatState() {
  const { apiKey } = useSettings();
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewChat, setIsNewChat] = useState(true);
  const [chats, setChats] = useState([]);
  const router = useRouter();

  // Load chats and API key from localStorage on mount
  useEffect(() => {
    // Load chat history
    const savedChats = JSON.parse(localStorage.getItem('chat_history') || '[]');
    setChats(savedChats);
    
    // Check for chat ID in URL or create a new one
    const urlParams = new URLSearchParams(window.location.search);
    const urlChatId = urlParams.get('id');
    
    if (urlChatId) {
      // Load existing chat
      const chatData = localStorage.getItem(`chat_${urlChatId}`);
      if (chatData) {
        const { messages: savedMessages, title } = JSON.parse(chatData);
        setChatId(urlChatId);
        setMessages(savedMessages);
        setIsNewChat(false);
      }
    } else if (savedChats.length > 0) {
      // Load most recent chat
      const mostRecentChat = savedChats[0];
      const chatData = localStorage.getItem(`chat_${mostRecentChat.id}`);
      if (chatData) {
        const { messages: savedMessages } = JSON.parse(chatData);
        setChatId(mostRecentChat.id);
        setMessages(savedMessages);
        setIsNewChat(false);
        router.push(`/chat?id=${mostRecentChat.id}`, undefined, { shallow: true });
      }
    } else {
      // Create new chat
      const newChatId = `chat_${uuidv4()}`;
      setChatId(newChatId);
      setIsNewChat(true);
    }
  }, [router]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (chatId) {
      // Save the chat
      const firstContent = messages[0]?.content;
      const title =
        typeof firstContent === 'string'
          ? firstContent.substring(0, 30)
          : messages[0]?.fileName
            ? `[Image] ${messages[0].fileName}`
            : 'New Chat';
      const lastMsg = messages[messages.length - 1];
      const lastMessage =
        typeof lastMsg?.content === 'string'
          ? lastMsg.content
          : lastMsg?.fileName
            ? `[Image] ${lastMsg.fileName}`
            : '';
      const chatData = {
        id: chatId,
        title,
        lastMessage,
        updatedAt: new Date().toISOString(),
        messages: messages
      };
      
      // Save chat data
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(chatData));
      
      // Update chat list
      setChats(prevChats => {
        const existingChatIndex = prevChats.findIndex(chat => chat.id === chatId);
        const newChats = [...prevChats];
        
        if (existingChatIndex >= 0) {
          // Update existing chat
          newChats[existingChatIndex] = {
            ...newChats[existingChatIndex],
            title: chatData.title,
            lastMessage: chatData.lastMessage,
            updatedAt: chatData.updatedAt
          };
        } else if (messages.length > 0) {
          // Only add to chat list if there are messages
          newChats.unshift({
            id: chatId,
            title: chatData.title,
            lastMessage: chatData.lastMessage,
            updatedAt: chatData.updatedAt
          });
        }
        
        // Save updated chat list
        if (messages.length > 0) {
          localStorage.setItem('chat_history', JSON.stringify(newChats));
        }
        return newChats;
      });
    }
  }, [messages, chatId]);

  return {
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
  };
}
