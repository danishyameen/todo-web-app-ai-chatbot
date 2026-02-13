'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [user, setUser] = useState<any>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Don't show prompt if already installed
    if (standalone) {
      return;
    }

    // CRITICAL: Show for ALL users (new and old), not just logged-in users
    // Check if dismissed recently (within last 3 days)
    const dismissedTime = localStorage.getItem('pwa_install_dismissed_time');
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    
    if (dismissedTime && (Date.now() - parseInt(dismissedTime)) < threeDaysInMs) {
      return; // Recently dismissed, don't annoy user
    }

    // For Android/Chrome - listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt immediately (no delay) for maximum visibility
      setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS - show manual instructions after short delay
    if (iOS && !standalone) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
    }

    // For browsers that don't fire beforeinstallprompt (already installed PWA support)
    // Still show on first visit or after 3 days
    if (!iOS) {
      setTimeout(() => {
        if (!deferredPrompt) {
          setShowPrompt(true);
        }
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [user]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismiss time - will show again after 3 days
    localStorage.setItem('pwa_install_dismissed_time', Date.now().toString());
  };

  // Don't render if already installed
  if (isStandalone) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <img
                    src="/img/logo.png"
                    alt="Taskly Logo"
                    className="h-12 w-12 rounded-xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Install Taskly App
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {isIOS
                      ? 'Apne device pe install karein for offline access! Safari mein Share button dabayein aur "Add to Home Screen" select karein.'
                      : 'Install karein aur offline bhi use karein! Faster access aur better experience ke liye.'}
                  </p>

                  {isIOS && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center text-xs text-blue-800 dark:text-blue-200">
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c-.25.78.143 1.63.914 1.94l.548.22a.999.999 0 001.22-.628l.818-2.552a5.99 5.99 0 00-2.682-1.532zM15 13a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        <span>
                          Safari → Share → Add to Home Screen
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex space-x-3">
                    {!isIOS && deferredPrompt && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleInstallClick}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Install Now
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDismiss}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                    >
                      {isIOS ? 'OK, Got it!' : 'Maybe Later'}
                    </motion.button>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Decorative bottom bar */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
