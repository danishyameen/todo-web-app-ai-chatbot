'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import Header from '../../components/Header';
import SkeletonLoader from '../../components/SkeletonLoader';
import { apiClient } from '../../lib/api-client';
import { motion } from 'framer-motion';
import { useTheme } from '../../lib/theme-context';

export default function TasksPage() {
  const { user, token, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingAll, setDeletingAll] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      // Add a small delay to ensure all state updates are processed before redirect
      const timer = setTimeout(() => {
        router.push('/');
      }, 100);
      return () => clearTimeout(timer);
    }

    const fetchTasks = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        const tasksData = await apiClient.getTasks(token);
        setTasks(tasksData || []);
        setFilteredTasks(tasksData || []);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        // Fallback to empty array or show error message
        setTasks([]);
        setFilteredTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [isAuthenticated, token, router]);

  // Always render the component structure to ensure consistent hooks
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to view your tasks.</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
      return;
    }

    if (!isAuthenticated || !token) {
      setError('You must be logged in to delete tasks');
      return;
    }

    setDeletingAll(true);
    setError('');

    try {
      // Delete all tasks for this user via API/localStorage
      await apiClient.deleteAllTasks(token);

      // Update the tasks state to be empty
      setTasks([]);
      setFilteredTasks([]);
    } catch (err) {
      console.error('Error deleting all tasks:', err);
      setError('An error occurred while deleting all tasks. Please try again.');
    } finally {
      setDeletingAll(false);
    }
  };

  // Apply filters whenever filters change
  useEffect(() => {
    let result = [...tasks];

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(task => task.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      result = result.filter(task => task.priority === filters.priority);
    }

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(
        task =>
          task.title?.toLowerCase().includes(searchTerm) ||
          task.description?.toLowerCase().includes(searchTerm) ||
          task.category?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredTasks(result);
  }, [filters, tasks]);

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        <Header />
        <main className={`max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl rounded-2xl overflow-hidden`}>
            <div className={`px-6 py-6 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100'} sm:px-8 flex justify-between items-center`}>
              <SkeletonLoader className="h-8 w-48" />
              <SkeletonLoader className="h-12 w-40" />
            </div>
            <div className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {[...Array(5)].map((_, index) => (
                <div key={index} className={`px-6 py-6 sm:px-8 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}>
                  <div className="flex items-center justify-between">
                    <SkeletonLoader className="h-6 w-64" />
                    <div className="ml-2 flex-shrink-0 flex">
                      <SkeletonLoader className="h-6 w-24" />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <div className="sm:flex">
                      <SkeletonLoader className="h-5 w-40 mr-6" />
                      <SkeletonLoader className="h-5 w-32" />
                    </div>
                    <SkeletonLoader className="h-5 w-24" />
                  </div>
                  <div className="mt-3">
                    <SkeletonLoader className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to view your tasks.</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <Header />

      <main className={`max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-4 ${theme === 'dark' ? 'bg-red-900/30 border-l-4 border-red-500' : 'bg-red-50 border-l-4 border-red-400'} p-4 rounded-lg`}
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

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl rounded-2xl p-6 mb-6 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="status-filter" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Status
                </label>
                <select
                  id="status-filter"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className={`block w-full pl-3 pr-10 py-3 text-base border ${
                    theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white'
                  } focus:outline-none focus:ring-2 ${
                    theme === 'dark' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500'
                  } sm:text-sm rounded-lg transition duration-200`}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority-filter" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Priority
                </label>
                <select
                  id="priority-filter"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className={`block w-full pl-3 pr-10 py-3 text-base border ${
                    theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white'
                  } focus:outline-none focus:ring-2 ${
                    theme === 'dark' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500'
                  } sm:text-sm rounded-lg transition duration-200`}
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="search" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className={`block w-full pl-4 pr-10 py-3 text-base border ${
                    theme === 'dark'
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white'
                  } focus:outline-none focus:ring-2 ${
                    theme === 'dark' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-blue-500 focus:border-blue-500'
                  } sm:text-sm rounded-lg transition duration-200`}
                />
              </div>
            </div>

            {/* Delete All Button */}
            {tasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mt-6 flex justify-end"
              >
                <button
                  onClick={handleDeleteAll}
                  disabled={deletingAll}
                  className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900'
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200`}
                >
                  {deletingAll ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting All...
                    </span>
                  ) : (
                    'Delete All Tasks'
                  )}
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Tasks List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl rounded-2xl overflow-hidden`}
          >
            <div className={`px-6 py-6 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100'} sm:px-8 flex justify-between items-center`}>
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
                      textNode.className = `text-xl leading-6 font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`;
                      textNode.textContent = 'Taskly';
                      parent.appendChild(textNode);
                    }
                  }}
                />
                <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Tasks</h3>
              </div>
              <Link
                href="/tasks/new"
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200`}
              >
                Add New Task
              </Link>
            </div>
            <ul className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredTasks.length === 0 ? (
                <motion.li
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className={`px-6 py-16 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}
                >
                  <svg className={`mx-auto h-16 w-16 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className={`mt-4 text-lg font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>No tasks</h3>
                  <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Get started by creating a new task.</p>
                  <div className="mt-6">
                    <Link
                      href="/tasks/new"
                      className={`inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200`}
                    >
                      Create new task
                    </Link>
                  </div>
                </motion.li>
              ) : (
                filteredTasks.map((task, index) => (
                  <motion.li
                    key={task.id || task._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Link href={`/tasks/${task.id || task._id}`} className={`block ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-blue-50'} transition-colors duration-200`}>
                      <div className={`px-6 py-6 sm:px-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div className="flex items-center justify-between">
                          <p className={`text-base font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'} truncate`}>{task.title}</p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                              {task.status?.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-between">
                          <div className="sm:flex">
                            <div className={`mr-6 flex items-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                              <svg className={`flex-shrink-0 mr-2 h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                            </div>
                            <div className={`mt-2 flex items-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} sm:mt-0`}>
                              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getPriorityColor(task.priority)}`}></span>
                              {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || 'None'} priority
                            </div>
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            {task.category || 'Uncategorized'}
                          </div>
                        </div>
                        {task.description && (
                          <div className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            <p className="truncate">{task.description}</p>
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.li>
                ))
              )}
            </ul>
          </motion.div>

          {/* Pagination */}
          {filteredTasks.length > 0 && (
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} px-6 py-4 flex items-center justify-between border-t ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              } sm:px-8 mt-6 rounded-b-xl`}
            >
              <div className="hidden sm:block">
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(filteredTasks.length, 10)}</span> of{' '}
                  <span className="font-medium">{filteredTasks.length}</span> results
                </p>
              </div>
              <div className="flex-1 flex justify-between sm:justify-end">
                <button
                  disabled
                  className={`relative inline-flex items-center px-4 py-2 border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  } text-sm font-medium rounded-lg disabled:opacity-50 transition-colors duration-200`}
                >
                  Previous
                </button>
                <button
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  } text-sm font-medium rounded-lg transition-colors duration-200`}
                >
                  Next
                </button>
              </div>
            </motion.nav>
          )}
        </motion.div>
      </main>
    </div>
  );
}