'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { chatService } from '../../lib/chat-service';
import Header from '../../components/Header';
import { useAuth } from '../../lib/auth-context';
import UserDataService from '../../src/services/UserDataService';

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
  createdAt: string;
  updatedAt: string;
};

export default function SimpleChatPageContent() {
  const { user, token, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userIdFromUrl = searchParams.get('userId');

  // Use the authenticated user's ID if available, otherwise fall back to URL or localStorage
  const [userId] = useState<string>(userIdFromUrl || user?.id || localStorage.getItem('userId') || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations from localStorage on mount using UserDataService
  useEffect(() => {
    const currentUserId = user?.id || localStorage.getItem('anonymousUserId') || userId;
    if (currentUserId) {
      const savedConversations = UserDataService.getConversations(currentUserId);
      if (savedConversations.length > 0) {
        setConversations(savedConversations);
      }
    }
  }, [userId, user]);

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

    // Check authentication first
    if (!isAuthenticated || !user || !token) {
      const authErrorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'User not authenticated. Please log in to use the AI chatbot. You need to be authenticated to manage your tasks.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, authErrorMessage]);
      return;
    }

    // Use the authenticated user's ID
    const currentUserId = user.id;

    // Add user message to the conversation
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      // Handle local task operations
      let responseText = '';

      // Handle specific task-related commands
      if (currentInput.toLowerCase().includes("create") || currentInput.toLowerCase().includes("add")) {
        // Create a new task
        const now = new Date();
        const newTask = {
          id: uuidv4(),
          title: currentInput.trim(),
          description: currentInput.trim(),
          status: 'pending' as const,
          priority: 'medium' as const,
          due_date: null,
          completed_at: null,
          user_id: currentUserId,
          category_id: null,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          dueDate: null,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          completedAt: null,
          userId: currentUserId,
          userName: user?.name || user?.email?.split('@')[0] || 'Anonymous User',
          categoryId: null
        };

        UserDataService.addTask(newTask, currentUserId);
        window.dispatchEvent(new CustomEvent('userTaskUpdate', { detail: { userId: currentUserId, action: 'add', taskId: newTask.id } }));
        responseText = `I've created a new task: "${newTask.title}"`;
      } else if (currentInput.toLowerCase().includes("update") || currentInput.toLowerCase().includes("change")) {
        const userTasks = UserDataService.getTasks(currentUserId);
        if (userTasks.length > 0) {
          const now = new Date();
          const taskToUpdate = userTasks[0];
          const updatedTask = {
            ...taskToUpdate,
            title: currentInput.trim(),
            updated_at: now.toISOString()
          };

          UserDataService.updateTask(taskToUpdate.id, updatedTask, currentUserId);
          window.dispatchEvent(new CustomEvent('userTaskUpdate', { detail: { userId: currentUserId, action: 'update', taskId: taskToUpdate.id } }));
          responseText = `I've updated the task to: "${updatedTask.title}"`;
        } else {
          responseText = "I couldn't find any tasks to update. Please create a task first.";
        }
      } else if (currentInput.toLowerCase().includes("delete all") || currentInput.toLowerCase().includes("remove all")) {
        UserDataService.deleteAllTasks(currentUserId);
        window.dispatchEvent(new CustomEvent('userTaskUpdate', { detail: { userId: currentUserId, action: 'deleteAll' } }));
        responseText = "I've deleted all your tasks.";
      } else if (currentInput.toLowerCase().includes("delete") || currentInput.toLowerCase().includes("remove")) {
        const userTasks = UserDataService.getTasks(currentUserId);
        if (userTasks.length > 0) {
          const taskToDelete = userTasks[0];
          UserDataService.deleteTask(taskToDelete.id, currentUserId);
          window.dispatchEvent(new CustomEvent('userTaskUpdate', { detail: { userId: currentUserId, action: 'delete', taskId: taskToDelete.id } }));
          responseText = `I've deleted the task "${taskToDelete.title}".`;
        } else {
          responseText = "I couldn't find any tasks to delete.";
        }
      } else if (currentInput.toLowerCase().includes("complete") || currentInput.toLowerCase().includes("finish")) {
        const userTasks = UserDataService.getTasks(currentUserId);
        if (userTasks.length > 0) {
          const now = new Date();
          const taskToComplete = userTasks[0];
          const completedTask = {
            ...taskToComplete,
            status: 'completed' as const,
            completed_at: now.toISOString(),
            updated_at: now.toISOString()
          };

          UserDataService.updateTask(taskToComplete.id, completedTask, currentUserId);
          window.dispatchEvent(new CustomEvent('userTaskUpdate', { detail: { userId: currentUserId, action: 'update', taskId: taskToComplete.id } }));
          responseText = `I've marked "${taskToComplete.title}" as completed.`;
        } else {
          responseText = "I couldn't find any tasks to mark as completed.";
        }
      } else if (currentInput.toLowerCase().includes("show") || currentInput.toLowerCase().includes("list")) {
        const userTasks = UserDataService.getTasks(currentUserId);
        if (userTasks.length > 0) {
          responseText = `You have ${userTasks.length} task(s):\n\n${userTasks.map((task, index) => `${index + 1}. ${task.title} (${task.status})`).join('\n')}`;
        } else {
          responseText = "You don't have any tasks yet.";
        }
      } 
      // Navigation commands (Multi-language support)
      else if (
        currentInput.toLowerCase().includes("go to") || 
        currentInput.toLowerCase().includes("open") || 
        currentInput.toLowerCase().includes("navigate") ||
        currentInput.toLowerCase().includes("take me to") ||
        currentInput.toLowerCase().includes("show me") && (currentInput.toLowerCase().includes("page") || currentInput.toLowerCase().includes("dashboard") || currentInput.toLowerCase().includes("profile")) ||
        currentInput.toLowerCase().match(/^(mujhe|mujko).*(page|par|pe).*(le chalo|dikhao|kholo)/) ||
        currentInput.toLowerCase().match(/.*(page|par|pe).*(jana|jao|chalo)/)
      ) {
        // Extract destination
        let destination = currentInput.toLowerCase();
        
        // Detect destination and navigate
        if (destination.includes("dashboard") || destination.includes("home")) {
          router.push("/dashboard");
          responseText = "📍 Navigating to Dashboard...";
        } else if (destination.includes("task") && !destination.includes("create") && !destination.includes("new")) {
          router.push("/tasks");
          responseText = "📍 Navigating to Tasks page...";
        } else if (destination.includes("create") || destination.includes("new task")) {
          router.push("/tasks/new");
          responseText = "📍 Opening new task creation page...";
        } else if (destination.includes("profile") || destination.includes("account") || destination.includes("setting")) {
          router.push("/profile");
          responseText = "📍 Navigating to Profile/Settings page...";
        } else if (destination.includes("chat")) {
          responseText = "You're already on the chat page! 😊";
        } else {
          responseText = "I can navigate you to:\n- Dashboard (home)\n- Tasks page\n- Create new task\n- Profile/Settings\n\nJust say 'go to [page name]'";
        }
      }
      // Settings/Theme commands
      else if (
        currentInput.toLowerCase().includes("change theme") ||
        currentInput.toLowerCase().includes("dark mode") ||
        currentInput.toLowerCase().includes("light mode") ||
        currentInput.toLowerCase().includes("settings")
      ) {
        responseText = "⚙️ To change theme and settings, please go to your Profile page. I'll take you there!";
        setTimeout(() => router.push("/profile"), 1000);
      }
      // Review/Feedback commands
      else if (
        currentInput.toLowerCase().includes("review") ||
        currentInput.toLowerCase().includes("feedback") ||
        currentInput.toLowerCase().includes("rate") && currentInput.toLowerCase().includes("app")
      ) {
        const ratingMatch = currentInput.match(/(\d)\s*(star|rating)/i);
        const rating = ratingMatch ? ratingMatch[1] : "5";
        responseText = `⭐ Thank you for your ${rating}-star feedback! Your review helps us improve the app. We appreciate your support! 🙏`;
      }
      else {
        responseText = "I can help you with:\n\n📋 Tasks:\n- Create: 'Add buy groceries'\n- List: 'Show my tasks'\n- Complete: 'Mark task as done'\n- Delete: 'Delete task'\n\n🧭 Navigation:\n- 'Go to dashboard'\n- 'Open tasks page'\n- 'Take me to profile'\n\n⚙️ Settings:\n- 'Change theme'\n- 'Go to settings'\n\n⭐ Feedback:\n- 'Give 5 star review'\n- 'Submit feedback'\n\nTry any command in English, Urdu, or Hindi!";
      }

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save or update conversation
      if (messages.length === 0) {
        // Create new conversation
        const newConversationId = uuidv4();
        const newConversation: Conversation = {
          id: newConversationId,
          userId: currentUserId,
          title: currentInput.substring(0, 30) + (currentInput.length > 30 ? '...' : ''),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Save conversation to localStorage via UserDataService
        UserDataService.addConversation(newConversation, currentUserId);
        
        // Update state
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newConversationId);

        // Save user message to localStorage
        UserDataService.addMessage({
          id: userMessage.id,
          conversationId: newConversationId,
          userId: currentUserId,
          role: userMessage.role,
          content: userMessage.content,
          timestamp: userMessage.timestamp.toISOString()
        }, newConversationId, currentUserId);

        // Save assistant message to localStorage
        UserDataService.addMessage({
          id: assistantMessage.id,
          conversationId: newConversationId,
          userId: currentUserId,
          role: assistantMessage.role,
          content: assistantMessage.content,
          timestamp: assistantMessage.timestamp.toISOString()
        }, newConversationId, currentUserId);
      } else if (activeConversationId) {
        // Update existing conversation timestamp
        UserDataService.updateConversation(activeConversationId, {
          updatedAt: new Date().toISOString()
        }, currentUserId);

        // Save both messages to localStorage
        UserDataService.addMessage({
          id: userMessage.id,
          conversationId: activeConversationId,
          userId: currentUserId,
          role: userMessage.role,
          content: userMessage.content,
          timestamp: userMessage.timestamp.toISOString()
        }, activeConversationId, currentUserId);

        UserDataService.addMessage({
          id: assistantMessage.id,
          conversationId: activeConversationId,
          userId: currentUserId,
          role: assistantMessage.role,
          content: assistantMessage.content,
          timestamp: assistantMessage.timestamp.toISOString()
        }, activeConversationId, currentUserId);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setActiveConversationId(null);
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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for conversations */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200/50 flex flex-col shadow-lg"
            >
              <div className="p-4 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={startNewConversation}
                  className="mt-3 w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-xl text-sm transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                >
                  New Chat
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.map(conversation => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 border-b border-gray-100/50 cursor-pointer hover:bg-gray-50/80 ${
                      activeConversationId === conversation.id ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => {
                      // Load the conversation messages
                      const currentUserId = user?.id || localStorage.getItem('anonymousUserId') || userId;
                      const savedMessages = UserDataService.getMessages(conversation.id, currentUserId);
                      
                      if (savedMessages.length > 0) {
                        // Convert string dates back to Date objects
                        const messagesWithDates = savedMessages.map(msg => ({
                          ...msg,
                          timestamp: new Date(msg.timestamp)
                        }));
                        setMessages(messagesWithDates);
                        setActiveConversationId(conversation.id);
                      } else {
                        console.log('No messages found for conversation:', conversation.id);
                      }
                    }}
                  >
                    <div className="font-medium text-sm text-gray-800 truncate">
                      {conversation.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(conversation.updatedAt).toLocaleDateString()} {new Date(conversation.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200/50 text-sm text-gray-500">
                User: {user?.email || user?.name || (userId ? userId.substring(0, 8) + '...' : 'Anonymous')}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile toggle button */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden fixed top-20 left-4 z-10 bg-white/80 backdrop-blur-lg p-2 rounded-lg shadow-md border border-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="bg-white/70 backdrop-blur-lg border-b border-gray-200/50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">AI Task Assistant</h1>
                <p className="text-sm text-gray-500">Ask me to create, list, update, or complete tasks</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Online</span>
              </div>
            </div>
          </div>

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white/30 to-gray-50/30">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <motion.div
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="relative mb-6"
                >
                  <div className="bg-gradient-to-br from-blue-400 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <motion.div
                    animate={{ y: [-5, 0, -5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg font-medium text-gray-800 mb-1"
                >
                  Welcome to AI Task Assistant!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-500 max-w-md"
                >
                  I can help you manage your tasks using natural language. Try asking me to add, list, update, or complete tasks.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg"
                >
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-left border border-blue-100 shadow-sm">
                    <p className="text-sm font-medium text-blue-800">Try asking:</p>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700">
                      <li className="flex items-center"><span className="mr-2 text-blue-500">•</span>"Add a task to buy groceries"</li>
                      <li className="flex items-center"><span className="mr-2 text-blue-500">•</span>"Show my tasks"</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-left border border-green-100 shadow-sm">
                    <p className="text-sm font-medium text-green-800">Or try:</p>
                    <ul className="mt-2 space-y-1 text-sm text-green-700">
                      <li className="flex items-center"><span className="mr-2 text-green-500">•</span>"Mark task as complete"</li>
                      <li className="flex items-center"><span className="mr-2 text-green-500">•</span>"Update task due date"</li>
                    </ul>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <div className="space-y-6 max-w-3xl mx-auto">
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
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`max-w-[85%] rounded-2xl px-5 py-3.5 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none shadow-md'
                            : isConfirmationMessage(message.content)
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-bl-none border border-green-200 shadow-sm'
                              : isError(message.content)
                                ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 rounded-bl-none border border-red-200 shadow-sm'
                                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-bl-none border border-gray-200 shadow-sm'
                        }`}
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
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-2xl rounded-bl-none px-5 py-3.5 max-w-[85%] shadow-sm border border-gray-200">
                      <div className="flex space-x-2">
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
          <div className="bg-white/70 backdrop-blur-lg border-t border-gray-200/50 p-4 shadow-lg">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="flex rounded-xl border border-gray-300 bg-white p-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Message AI Task Assistant..."
                  className="flex-1 border-0 focus:ring-0 focus:outline-none py-2.5 px-4 text-gray-800 rounded-xl"
                  disabled={isLoading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Send
                </motion.button>
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                AI Task Assistant can help you manage tasks with natural language
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}