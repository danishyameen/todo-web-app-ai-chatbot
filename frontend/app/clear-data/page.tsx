// app/clear-data/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { motion } from 'framer-motion';
import { useTheme } from '../../lib/theme-context';

export default function ClearDataPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle');
  const [log, setLog] = useState<string[]>([]);

  const addToLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const clearAppData = () => {
    setStatus('processing');
    setLog(['Starting to clear application data...']);

    // Clear sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const sessionStorageKeysToRemove: string[] = [];
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (
          key.startsWith('tasks_') || 
          key.includes('task') || 
          key.includes('user') || 
          key.includes('auth') || 
          key.includes('current') ||
          key.includes('csrf') ||
          key === 'currentUser' ||
          key === 'authToken' ||
          key === 'csrfToken' ||
          key.startsWith('better-auth-')
        )) {
          sessionStorageKeysToRemove.push(key);
        }
      }
      
      // Remove all identified keys
      sessionStorageKeysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
        addToLog(`Removed from sessionStorage: ${key}`);
      });
      
      // Also clear all users data if present
      if (sessionStorage.getItem('users')) {
        sessionStorage.removeItem('users');
        addToLog('Removed from sessionStorage: users');
      }
      
      addToLog(`Cleared ${sessionStorageKeysToRemove.length} items from sessionStorage`);
    }
    
    // Clear localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const localStorageKeysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('tasks_') || 
          key.includes('task') || 
          key.includes('user') || 
          key.includes('auth') || 
          key.includes('current') ||
          key.includes('csrf') ||
          key === 'currentUser' ||
          key === 'authToken' ||
          key === 'csrfToken' ||
          key.startsWith('better-auth-')
        )) {
          localStorageKeysToRemove.push(key);
        }
      }
      
      // Remove all identified keys
      localStorageKeysToRemove.forEach(key => {
        localStorage.removeItem(key);
        addToLog(`Removed from localStorage: ${key}`);
      });
      
      // Also clear all users data if present
      if (localStorage.getItem('users')) {
        localStorage.removeItem('users');
        addToLog('Removed from localStorage: users');
      }
      
      addToLog(`Cleared ${localStorageKeysToRemove.length} items from localStorage`);
    }
    
    addToLog('All application data has been cleared from browser storage.');
    setStatus('completed');
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all application data? This will remove all tasks, preferences, and user data from this device. This action cannot be undone.')) {
      clearAppData();
    }
  };

  const handleRefresh = () => {
    window.location.href = '/';
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <Header />

      <main className={`max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl rounded-2xl overflow-hidden`}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className={`px-6 py-6 sm:px-8 border-b ${
                theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100'
              }`}
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
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>Clear Application Data</h3>
                  <p className={`mt-1 max-w-2xl text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Remove all stored data for the Todo Web Application
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="p-6 sm:px-8">
              <div className="mb-6">
                <div className={`p-4 rounded-lg mb-6 ${
                  theme === 'dark' ? 'bg-yellow-900/30 border-l-4 border-yellow-500' : 'bg-yellow-50 border-l-4 border-yellow-400'
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className={`h-5 w-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        <strong>Warning:</strong> This will permanently delete all your tasks, user data, and preferences. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={handleClearData}
                    disabled={status === 'processing'}
                    className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white ${
                      status === 'processing'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200`}
                  >
                    {status === 'processing' ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        <svg className="-ml-1 mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear All Data
                      </>
                    )}
                  </button>

                  {status === 'completed' && (
                    <button
                      onClick={handleRefresh}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                    >
                      <svg className="-ml-1 mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh Page
                    </button>
                  )}
                </div>
              </div>

              {status !== 'idle' && (
                <div className={`mt-6 p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <h4 className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Operation Log:</h4>
                  <div className={`font-mono text-sm p-3 rounded ${
                    theme === 'dark' ? 'bg-gray-800 text-green-400' : 'bg-gray-100 text-gray-800'
                  }`} style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {log.map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                </div>
              )}

              {status === 'completed' && (
                <div className={`mt-6 p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-green-900/30 border-l-4 border-green-500' : 'bg-green-50 border-l-4 border-green-400'
                }`}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className={`h-5 w-5 ${theme === 'dark' ? 'text-green-400' : 'text-green-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                        <strong>Success:</strong> All application data has been successfully cleared from your browser storage.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}