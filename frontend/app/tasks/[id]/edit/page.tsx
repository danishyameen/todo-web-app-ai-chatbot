'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../lib/auth-context';
import Header from '../../../../components/Header';
import { apiClient } from '../../../../lib/api-client';

// Helper function to extract the string ID from the param
function extractTaskId(id: string | string[] | undefined): string | null {
  if (Array.isArray(id)) {
    return id[0] || null;
  }
  return id || null;
}

export default function EditTaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const [task, setTask] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    category: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) {
        setError('Task ID not found');
        setLoading(false);
        return;
      }

      // Extract the task ID ensuring it's a string
      if (Array.isArray(id)) {
        if (!id[0]) {
          setError('Task ID not found');
          setLoading(false);
          return;
        }
        try {
          const taskData = await apiClient.getTaskById(id[0]!, token);
          if (taskData) {
            setTask(taskData);
            setFormData({
              title: taskData.title || '',
              description: taskData.description || '',
              status: taskData.status || 'pending',
              priority: taskData.priority || 'medium',
              dueDate: taskData.dueDate || '',
              category: taskData.category || ''
            });
          } else {
            setError('Task not found');
          }
        } catch (err) {
          console.error('Failed to load task:', err);
          setError('Failed to load task for editing');
        } finally {
          setLoading(false);
        }
      } else {
        // Handle the case where id is a string directly
        if (!id) {
          setError('Task ID not found');
          setLoading(false);
          return;
        }
        try {
          const taskData = await apiClient.getTaskById(id!, token);
          if (taskData) {
            setTask(taskData);
            setFormData({
              title: taskData.title || '',
              description: taskData.description || '',
              status: taskData.status || 'pending',
              priority: taskData.priority || 'medium',
              dueDate: taskData.dueDate || '',
              category: taskData.category || ''
            });
          } else {
            setError('Task not found');
          }
        } catch (err) {
          console.error('Failed to load task:', err);
          setError('Failed to load task for editing');
        } finally {
          setLoading(false);
        }
      }
    };

    // Only fetch if we have the necessary data
    if (id && isAuthenticated && token) {
      fetchTask();
    } else if (!id) {
      // If id is not available
      setError('Task ID not found');
      setLoading(false);
    } else if (id && !isAuthenticated) {
      // Not authenticated
      setError('You must be logged in to edit this task');
      setLoading(false);
    } else if (id && isAuthenticated && !token) {
      // Authenticated but no token - this is an error state
      setError('You must be logged in to edit this task');
      setLoading(false);
    }
    // Don't fetch if id is not yet available (still loading)
  }, [id, isAuthenticated, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');

    if (!isAuthenticated || !token) {
      setError('You must be logged in to update this task');
      setSaveLoading(false);
      return;
    }

    try {
      // Update task via API/localStorage
      const taskId = extractTaskId(id);
      if (!taskId) {
        setError('Task ID not found');
        return;
      }
      const updatedTask = await apiClient.updateTask(taskId, formData, token, user?.id);

      // Navigate to dashboard after successful update
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('An error occurred while updating the task. Please try again.');
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    if (!isAuthenticated || !token) {
      setError('You must be logged in to delete this task');
      return;
    }

    try {
      // Delete task via API/localStorage
      const taskId = extractTaskId(id);
      if (!taskId) {
        setError('Task ID not found');
        return;
      }
      await apiClient.deleteTask(taskId, token, user?.id);

      // Add a small delay to ensure data is properly deleted before navigation
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('An error occurred while deleting the task. Please try again.');
    }
  };

  // Check authentication state - only show error if we know for sure user is not authenticated
  if (isAuthenticated === false && loading === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to edit tasks.</p>
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !task && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
          <Link
            href="/tasks"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Task</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Update the details for this task</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Task
                  </button>
                  <Link
                    href={`/tasks/${id}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </div>

            <div className="px-4 py-5 sm:p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
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
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <div className="mt-1">
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="dueDate"
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <div className="mt-1">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
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
            </div>

            <div className="px-4 py-4 bg-gray-50 sm:px-6 flex justify-end space-x-3">
              <Link
                href={`/tasks/${id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saveLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saveLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}