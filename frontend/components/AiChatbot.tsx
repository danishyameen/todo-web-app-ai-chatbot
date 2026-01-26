'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/auth-context';
import { chatService } from '../lib/chat-service';
import { v4 as uuidv4 } from 'uuid';
import OfflineStorageService from '../src/services/offlineStorageService';
import SyncService from '../src/services/syncService';

// Types for our chat system
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type Conversation = {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function AiChatbot() {
  const { user, token, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only initialize if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && token) {
      // Load conversations from localStorage on mount
      const savedConversations = localStorage.getItem(`conversations_${user.id}`);
      if (savedConversations) {
        try {
          const parsedConversations = JSON.parse(savedConversations);
          setConversations(parsedConversations);
        } catch (e) {
          console.error('Error parsing conversations:', e);
        }
      }

      // Load conversations from offline storage
      const offlineConversations = OfflineStorageService.getConversations();
      if (offlineConversations.length > 0) {
        setConversations(prev => [...offlineConversations, ...prev]);
      }

      // Load tasks from offline storage
      const offlineTasks = OfflineStorageService.getTasks();
      if (offlineTasks.length > 0) {
        // We can use these tasks to initialize the chat interface if needed
        console.log('Loaded offline tasks:', offlineTasks);
      }

      // Start periodic sync when online
      if (SyncService.isOnline()) {
        SyncService.syncTasks(user.id, token).catch(console.error);
        SyncService.syncConversations(user.id, token).catch(console.error);
      }
    }
  }, [isAuthenticated, user, token]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Back online! Starting sync...');
      if (user && token) {
        SyncService.syncTasks(user.id, token).catch(console.error);
        SyncService.syncConversations(user.id, token).catch(console.error);
      }
    };

    const handleOffline = () => {
      console.log('Went offline. Working in offline mode...');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, token]);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading || !isAuthenticated || !user) return;

    // Add user message to the conversation
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Determine if we're online or offline
      const isOnline = SyncService.isOnline();

      if (isOnline) {
        // Online mode - send to server
        const response = await chatService.sendMessage({
          userId: user.id,
          message: inputValue.trim(),
          conversationId: activeConversationId || undefined
        });

        if (response.success && response.data) {
          const assistantMessage: Message = {
            id: uuidv4(),
            role: 'assistant',
            content: response.data.response || 'I processed your request successfully.',
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, assistantMessage]);

          // Update conversation title if this is the first message
          if (messages.length === 0) {
            const newConversation: Conversation = {
              id: response.conversationId || uuidv4(),
              userId: user.id,
              title: inputValue.trim().substring(0, 30) + (inputValue.trim().length > 30 ? '...' : ''),
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            setConversations(prev => [newConversation, ...prev]);
            setActiveConversationId(newConversation.id);

            // Save to localStorage
            localStorage.setItem(`conversations_${user.id}`, JSON.stringify([newConversation, ...conversations]));

            // Also save to offline storage
            OfflineStorageService.addConversation(newConversation);
          }

          // Save messages to offline storage
          const currentMessages = [...messages, userMessage, assistantMessage];
          OfflineStorageService.addConversation({
            id: response.conversationId || activeConversationId || uuidv4(),
            userId: user.id,
            messages: currentMessages,
            title: inputValue.trim().substring(0, 30) + (inputValue.trim().length > 30 ? '...' : ''),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          const errorMessage: Message = {
            id: uuidv4(),
            role: 'assistant',
            content: response.message || 'Sorry, I encountered an error processing your request. Please try again.',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } else {
        // Offline mode - save to local storage and show temporary response
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: 'You are currently offline. Your message has been saved and will be processed when you reconnect to the internet.',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Save to offline storage for later sync
        const conversationId = activeConversationId || uuidv4();
        const newConversation: Conversation = {
          id: conversationId,
          userId: user.id,
          title: inputValue.trim().substring(0, 30) + (inputValue.trim().length > 30 ? '...' : ''),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Save to offline storage
        OfflineStorageService.addConversation(newConversation);
        OfflineStorageService.addTask({
          id: uuidv4(),
          title: inputValue.trim(),
          description: inputValue.trim(),
          status: 'pending',
          priority: 'medium',
          due_date: null,
          completed_at: null,
          user_id: user.id,
          category_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        // Show notification about offline status
        alert('You are offline. Your task has been saved locally and will sync when online.');
      }
    } catch (error) {
      console.error('Error getting response:', error);

      // If we're offline, save to local storage
      if (!SyncService.isOnline()) {
        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: 'You are currently offline. Your message has been saved and will be processed when you reconnect to the internet.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Save to offline storage
        const conversationId = activeConversationId || uuidv4();
        OfflineStorageService.addConversation({
          id: conversationId,
          userId: user.id,
          messages: [...messages, userMessage],
          title: inputValue.trim().substring(0, 30) + (inputValue.trim().length > 30 ? '...' : ''),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        const errorMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isConfirmationMessage = (content: string): boolean => {
    const confirmationKeywords = [
      'success', 'completed', 'added', 'created', 'updated', 'deleted', 'marked', 'done', 'finished'
    ];
    const lowerContent = content.toLowerCase();
    return confirmationKeywords.some(keyword => lowerContent.includes(keyword));
  };

  const isError = (content: string): boolean => {
    const errorKeywords = [
      'error', 'failed', 'sorry', 'couldn\'t', 'unable', 'problem', 'issue', 'not found', 'forbidden'
    ];
    const lowerContent = content.toLowerCase();
    return errorKeywords.some(keyword => lowerContent.includes(keyword));
  };

  if (!isAuthenticated || !user) {
    return null; // Don't show chatbot if user is not authenticated
  }

  return (
    <>
      {/* Floating chat button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Open AI Chatbot"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </motion.button>

      {/* Chat modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[70vh] flex flex-col overflow-hidden"
            >
              {/* Chat header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">AI Task Assistant</h3>
                  <p className="text-xs opacity-80">Ask me to manage your tasks</p>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Messages container */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-gradient-to-br from-blue-400 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-800 mb-1">Welcome to AI Task Assistant!</h4>
                    <p className="text-sm text-gray-500 max-w-xs">
                      I can help you manage your tasks using natural language.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                              message.role === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none'
                                : isConfirmationMessage(message.content)
                                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-bl-none border border-green-200'
                                  : isError(message.content)
                                    ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 rounded-bl-none border border-red-200'
                                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-bl-none border border-gray-200'
                            }`}
                          >
                            <div className="whitespace-pre-wrap break-words">
                              {message.content}
                            </div>
                            <div
                              className={`text-xs mt-1 ${
                                message.role === 'user'
                                  ? 'text-blue-100'
                                  : isConfirmationMessage(message.content)
                                    ? 'text-green-600'
                                    : isError(message.content)
                                      ? 'text-red-600'
                                      : 'text-gray-500'
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-2xl rounded-bl-none px-4 py-2.5 max-w-[80%] border border-gray-200">
                          <div className="flex space-x-1">
                            <motion.div
                              className="w-2 h-2 bg-gray-500 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-gray-500 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                              className="w-2 h-2 bg-gray-500 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="border-t border-gray-200 p-3 bg-white">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me to manage tasks..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}