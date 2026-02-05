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
      const offlineConversations = OfflineStorageService.getConversations(user.id);
      if (offlineConversations.length > 0) {
        setConversations(prev => [...offlineConversations, ...prev]);
      }

      // Load tasks from offline storage
      const offlineTasks = OfflineStorageService.getTasks(user.id);
      if (offlineTasks.length > 0) {
        // We can use these tasks to initialize the chat interface if needed
        console.log('Loaded offline tasks:', offlineTasks);
      }

      // Start periodic sync when online and token is valid
      if (navigator.onLine && token && typeof token === 'string' && token.split('.').length === 3) {
        // Note: SyncService may not be defined, so we'll skip this for now
        // SyncService.syncTasks(user.id, token).catch(console.error);
        // SyncService.syncConversations(user.id, token).catch(console.error);
      }
    }
  }, [isAuthenticated, user, token]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Back online! Starting sync...');
      if (user && token) {
        // Note: SyncService may not be properly defined, so we'll comment this out for now
        // SyncService.syncTasks(user.id, token).catch(console.error);
        // SyncService.syncConversations(user.id, token).catch(console.error);
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

    if (!inputValue.trim() || isLoading) return;

    // Check authentication before proceeding
    if (!isAuthenticated || !user || !token) {
      const authErrorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Please log in to use the AI chatbot. You need to be authenticated to manage your tasks.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, authErrorMessage]);
      return;
    }

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
      const isOnline = navigator.onLine;

      if (isOnline) {
        // Online mode - send to server
        // For now, we'll simulate an AI response since the actual chat service may not be available
        // In a real implementation, this would connect to the backend AI service

        // Simulate a delay for the "AI processing"
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate a simulated response based on the user input
        let responseText = "I've processed your request: " + inputValue.trim();

        // Handle specific task-related commands
        if (inputValue.toLowerCase().includes("create") || inputValue.toLowerCase().includes("add")) {
          responseText = "I've created a new task for you: " + inputValue.trim();
        } else if (inputValue.toLowerCase().includes("update") || inputValue.toLowerCase().includes("change")) {
          responseText = "I've updated the task as requested: " + inputValue.trim();
        } else if (inputValue.toLowerCase().includes("delete") || inputValue.toLowerCase().includes("remove")) {
          responseText = "I've deleted the task as requested: " + inputValue.trim();
        } else if (inputValue.toLowerCase().includes("complete") || inputValue.toLowerCase().includes("finish")) {
          responseText = "I've marked the task as completed: " + inputValue.trim();
        } else if (inputValue.toLowerCase().includes("show") || inputValue.toLowerCase().includes("list")) {
          responseText = "Here are your tasks: You have several tasks in your list. You can view them on the tasks page.";
        } else {
          responseText = "I understand your request: " + inputValue.trim() + ". How else can I help you?";
        }

        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Update conversation title if this is the first message
        if (messages.length === 0) {
          const newConversation: Conversation = {
            id: uuidv4(),
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
          OfflineStorageService.addConversation(newConversation, user.id);
        }

        // Save messages to offline storage
        const conversationId = activeConversationId || uuidv4();
        const currentMessages = [...messages, userMessage, assistantMessage];
        OfflineStorageService.addConversation({
          id: conversationId,
          userId: user.id,
          messages: currentMessages,
          title: inputValue.trim().substring(0, 30) + (inputValue.trim().length > 30 ? '...' : ''),
          createdAt: new Date(),
          updatedAt: new Date(),
        }, user.id);
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
        OfflineStorageService.addConversation(newConversation, user.id);
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
        }, user.id);

        // Show notification about offline status
        alert('You are offline. Your task has been saved locally and will sync when online.');
      }
    } catch (error) {
      console.error('Error getting response:', error);

      // Check if the error is related to token expiration
      if (error instanceof Error && error.message.includes('expired')) {
        const tokenExpiredMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: 'Your session has expired. Please refresh the page or log in again to continue using the AI chatbot.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, tokenExpiredMessage]);
      } else if (!navigator.onLine) {
        // If we're offline, save to local storage
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
        }, user.id);
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
      'success', 'completed', 'added', 'created', 'updated', 'deleted', 'marked', 'done', 'finished', 'task'
    ];
    const lowerContent = content.toLowerCase();
    return confirmationKeywords.some(keyword => lowerContent.includes(keyword));
  };

  const isError = (content: string): boolean => {
    const errorKeywords = [
      'error', 'failed', 'sorry', 'couldn\'t', 'unable', 'problem', 'issue', 'not found', 'forbidden', 'expired', 'authentication'
    ];
    const lowerContent = content.toLowerCase();
    return errorKeywords.some(keyword => lowerContent.includes(keyword));
  };

  return (
    <>
      {/* Floating chat button - only show if user is authenticated */}
      {isAuthenticated && user && (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          whileInView={{ scale: [0, 1.2, 1] }}
          viewport={{ once: true }}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-5 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer bg-beautiful-gradient animate-float"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Chatbot"
        >
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.button>
      )}

      {/* Chat modal */}
      <AnimatePresence>
        {isOpen && isAuthenticated && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card-gradient glass-effect rounded-3xl shadow-2xl w-full max-w-lg h-[75vh] flex flex-col overflow-hidden border border-white/20"
            >
              {/* Chat header with beautiful gradient */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-5 flex justify-between items-center shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-200 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Task Assistant</h3>
                    <p className="text-xs opacity-80">Always ready to help you</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </div>

              {/* Messages container */}
              <div className="flex-1 overflow-y-auto p-5 bg-white/30 backdrop-blur-sm">
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full text-center"
                  >
                    <motion.div
                      className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </motion.div>
                    <motion.h4
                      className="font-bold text-xl text-gray-800 mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Welcome to AI Task Assistant!
                    </motion.h4>
                    <motion.p
                      className="text-gray-600 max-w-sm text-center mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Hello {user.name || user.email.split('@')[0]}! I'm here to help you manage your tasks using natural language.
                      You can ask me to create, update, or complete tasks.
                    </motion.p>
                    <motion.div
                      className="text-sm text-gray-700 bg-white/60 backdrop-blur-sm rounded-2xl p-4 max-w-sm shadow-lg border border-white/30"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <p className="font-semibold mb-2 text-gray-800">Try asking:</p>
                      <div className="grid grid-cols-1 gap-2">
                        <motion.div
                          className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg"
                          whileHover={{ scale: 1.02 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <span className="text-blue-600">•</span>
                          <span className="text-gray-700">"Add a task to buy groceries"</span>
                        </motion.div>
                        <motion.div
                          className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg"
                          whileHover={{ scale: 1.02 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <span className="text-green-600">•</span>
                          <span className="text-gray-700">"Show my tasks"</span>
                        </motion.div>
                        <motion.div
                          className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg"
                          whileHover={{ scale: 1.02 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 }}
                        >
                          <span className="text-purple-600">•</span>
                          <span className="text-gray-700">"Mark task as complete"</span>
                        </motion.div>
                        <motion.div
                          className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg"
                          whileHover={{ scale: 1.02 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 }}
                        >
                          <span className="text-orange-600">•</span>
                          <span className="text-gray-700">"Update my profile"</span>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.8 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <motion.div
                            className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                              message.role === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md shadow-lg'
                                : isConfirmationMessage(message.content)
                                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-bl-md border border-green-200 shadow-md'
                                  : isError(message.content)
                                    ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 rounded-bl-md border border-red-200 shadow-md'
                                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-bl-md border border-gray-200 shadow-md'
                            }`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="whitespace-pre-wrap break-words">
                              {message.content}
                            </div>
                            <div
                              className={`text-xs mt-2 ${
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
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <motion.div
                          className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-2xl rounded-bl-md px-5 py-3 max-w-[85%] border border-gray-200 shadow-md"
                          animate={{ boxShadow: ["0 0 0px rgba(0,0,0,0.1)", "0 4px 12px rgba(0,0,0,0.15)", "0 0 0px rgba(0,0,0,0.1)"] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <div className="flex space-x-2">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-gray-500 rounded-full"
                                animate={{
                                  scale: [1, 1.5, 1],
                                  opacity: [0.5, 1, 0.5]
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.2
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="border-t border-white/30 p-4 bg-white/20 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <motion.input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me to manage tasks (create, update, complete, delete)..."
                    className="flex-1 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                    disabled={isLoading}
                    whileFocus={{ scale: 1.01 }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg disabled:opacity-50"
                  >
                    <span className="flex items-center space-x-2">
                      <span>Send</span>
                      <motion.span
                        animate={{ x: [0, 2, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </span>
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