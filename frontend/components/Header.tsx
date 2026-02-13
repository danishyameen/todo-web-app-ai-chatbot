'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/auth-context';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../lib/theme-context';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/profile', label: 'Profile' },
    { href: '/chat', label: 'AI Chat' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-xl border-gray-200/60 shadow-sm"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.img
              src="/img/logo.png"
              alt="Taskly Logo"
              className="h-20 w-auto object-contain"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              onError={(e) => {
                // Fallback to text if image fails to load
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const textNode = document.createElement('div');
                  textNode.className = 'w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center';

                  const span = document.createElement('span');
                  span.className = 'text-white font-bold text-2xl';
                  span.textContent = 'T';

                  textNode.appendChild(span);
                  parent.appendChild(textNode);
                }
              }}
            />
          </Link>

          {/* Navigation - Show only when authenticated */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <Link key={item.href} href={item.href as any}>
                  <motion.div
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    {item.label}
                  </motion.div>
                </Link>
              ))}
            </nav>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <>
                <motion.div
                  className="hidden sm:block text-sm text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="font-medium">Hi, {user.name || user.email.split('@')[0]}</span>
                </motion.div>
                <motion.div
                  className="relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`h-8 w-8 rounded-full flex items-center justify-center font-medium overflow-hidden ${
                      theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name || 'User'} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -10 }}
                        className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                        } ring-1 ring-black ring-opacity-5 z-50`}
                      >
                        <div className={`px-4 py-2 border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                            {user.name || user.email}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {user.email}
                          </p>
                        </div>
                        <Link
                          href="/profile"
                          className={`block px-4 py-2 text-sm ${
                            theme === 'dark' ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Your Profile
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            theme === 'dark' ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link href="/auth/login">
                  <motion.button
                    className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link href="/auth/signup">
                  <motion.button
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Show only when authenticated */}
      {isAuthenticated && (
        <div className="md:hidden px-4 pb-3">
          <div className="flex overflow-x-auto space-x-2 py-2 hide-scrollbar">
            {navItems.map((item, index) => (
              <Link key={item.href} href={item.href as any}>
                <motion.div
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  {item.label}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.header>
  );
}