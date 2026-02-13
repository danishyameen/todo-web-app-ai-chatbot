'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { useAuth } from '../../lib/auth-context';

export default function SimpleChatPageContent() {
  const { user, token, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userIdFromUrl = searchParams.get('userId');

  // Use the authenticated user's ID if available, otherwise fall back to URL or localStorage
  const [userId] = useState<string>(userIdFromUrl || user?.id || localStorage.getItem('userId') || '');

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="bg-white/70 backdrop-blur-lg border-b border-gray-200/50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">Task Management</h1>
                <p className="text-sm text-gray-500">AI chat functionality has been disabled</p>
              </div>
            </div>
          </div>

          {/* Disabled chat content */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white/30 to-gray-50/30 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center text-center max-w-lg"
            >
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative mb-6"
              >
                <div className="bg-gradient-to-br from-gray-400 to-gray-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg font-medium text-gray-800 mb-2"
              >
                AI Chat Bot Disabled
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 mb-4"
              >
                The AI chat functionality has been disabled on this page. 
                You can manage your tasks using the dedicated task management features.
              </motion.p>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/tasks')}
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Manage Tasks
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center rounded-lg bg-gradient-to-r from-gray-500 to-gray-700 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Go to Dashboard
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}