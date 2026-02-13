'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import Header from '../../../components/Header';
import { apiClient } from '../../../lib/api-client';
import { motion } from 'framer-motion';
import { useTheme } from '../../../lib/theme-context';
import UserDataService from '../../../src/services/UserDataService';

export default function CreateTaskPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    category: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.title.trim()) {
      setError('Title is required');
      setIsLoading(false);
      return;
    }

    if (!isAuthenticated || !token) {
      setError('You must be logged in to create a task');
      setIsLoading(false);
      return;
    }

    try {
      // Determine if we're online or offline
      const isOnline = navigator.onLine;

      if (isOnline) {
        // Online mode - create task via API first, skip local update since we'll add it manually
        const taskData = await apiClient.createTask(formData, token, user?.id, true);
        
        // Add to user-specific storage for offline access
        UserDataService.addTask(taskData, user!.id);

        // Add a small delay to ensure data is saved before navigation
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      } else {
        // Offline mode - create optimistic task
        const optimisticTask = {
          id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
          title: formData.title,
          description: formData.description,
          status: formData.status as 'pending' | 'in-progress' | 'completed',
          priority: formData.priority as 'low' | 'medium' | 'high',
          due_date: formData.dueDate || null,
          completed_at: null,
          user_id: user?.id || '',
          category_id: null,
          category: formData.category || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Aliases for compatibility
          dueDate: formData.dueDate || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: null,
          userId: user?.id || '',
          userName: user?.name || user?.email?.split('@')[0] || 'User',
          categoryId: null
        };

        // Add to user-specific storage
        UserDataService.addTask(optimisticTask, user!.id);

        // Show notification about offline status
        alert('You are offline. Your task has been saved locally and will sync when online.');

        // Add a small delay to ensure data is saved before navigation
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError('An error occurred while creating the task. Please try again.');
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to create tasks.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <Header />

      <main className={`max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl rounded-2xl overflow-hidden`}>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mx-4 mt-4 ${theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'}`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className={`h-5 w-5 ${theme === 'dark' ? 'text-red-400' : 'text-red-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className={`px-6 py-6 border-b ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100'
                } sm:px-8`}
              >
                <div className="flex items-center">
                  <img
                    src="/img/logo.png"
                    alt="Taskly Logo"
                    className="h-10 w-auto object-contain mr-4"
                    onError={(e) => {
                      // Fallback to text if image fails to load
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const textNode = document.createElement('h3');
                        textNode.className = `text-xl leading-6 font-bold ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`;
                        textNode.textContent = 'Taskly';
                        parent.appendChild(textNode);
                      }
                    }}
                  />
                  <div>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Create New Task</h3>
                    <p className={`mt-1 max-w-2xl text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Fill in the details for your new task</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className={`px-6 py-6 sm:px-8 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                <div className="sm:col-span-6">
                  <label htmlFor="title" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Title *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className={`appearance-none relative block w-full px-4 py-3 border ${
                        theme === 'dark'
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                          : 'border-gray-300 placeholder-gray-500 text-gray-900'
                      } rounded-lg focus:outline-none focus:ring-2 ${
                        theme === 'dark' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500'
                      } sm:text-sm transition duration-200`}
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="description" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-4 py-3 border ${
                        theme === 'dark'
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                          : 'border-gray-300 placeholder-gray-500 text-gray-900'
                      } rounded-lg focus:outline-none focus:ring-2 ${
                        theme === 'dark' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500'
                      } sm:text-sm transition duration-200`}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="status" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Status
                  </label>
                  <div className="mt-1">
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-4 py-3 border ${
                        theme === 'dark'
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 text-gray-900'
                      } rounded-lg focus:outline-none focus:ring-2 ${
                        theme === 'dark' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500'
                      } sm:text-sm transition duration-200`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="priority" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Priority
                  </label>
                  <div className="mt-1">
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-4 py-3 border ${
                        theme === 'dark'
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 text-gray-900'
                      } rounded-lg focus:outline-none focus:ring-2 ${
                        theme === 'dark' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500'
                      } sm:text-sm transition duration-200`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="dueDate" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Due Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      name="dueDate"
                      id="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-4 py-3 border ${
                        theme === 'dark'
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 text-gray-900'
                      } rounded-lg focus:outline-none focus:ring-2 ${
                        theme === 'dark' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500'
                      } sm:text-sm transition duration-200`}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="category" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Category
                  </label>
                  <div className="mt-1">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full px-4 py-3 border ${
                        theme === 'dark'
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 text-gray-900'
                      } rounded-lg focus:outline-none focus:ring-2 ${
                        theme === 'dark' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500'
                      } sm:text-sm transition duration-200`}
                    >
                      <option value="">Select a category</option>
                      <option value="Personal">Personal</option>
                      <option value="Work">Work</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Health">Health</option>
                      <option value="Education">Education</option>
                      <option value="Finance">Finance</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className={`px-6 py-6 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                } sm:px-8 flex justify-end space-x-4 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <Link
                  href="/tasks"
                  className={`inline-flex items-center px-6 py-3 border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 bg-gray-600 hover:bg-gray-500'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  } text-base font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Task'
                  )}
                </button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}