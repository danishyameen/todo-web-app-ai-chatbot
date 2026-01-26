'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../lib/theme-context';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex">
            <div className="flex-shrink-0 flex flex-col items-center">
              <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center">
                <img
                  src="/img/logo.png"
                  alt="Taskly Logo"
                  className="h-24 w-auto object-contain"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const textNode = document.createElement('span');
                      textNode.className = `text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`;
                      textNode.textContent = 'Taskly';
                      parent.appendChild(textNode);
                    }
                  }}
                />
              </Link>
            </div>
            {/* Desktop navigation - hidden on mobile */}
            <nav className="hidden md:ml-6 md:flex md:space-x-8 md:items-center">
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:text-gray-100 hover:border-gray-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/tasks"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:text-gray-100 hover:border-gray-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Tasks
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Desktop user menu - hidden on mobile */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <ThemeToggle />
            {isAuthenticated && user && (
              <div className="relative ml-3">
                <div className="flex items-center">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      theme === 'dark' ? 'focus:ring-blue-400' : 'focus:ring-blue-500'
                    }`}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className={`h-8 w-8 rounded-full ${
                      theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                    } flex items-center justify-center font-medium`}>
                      {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                    </div>
                  </button>
                </div>

                {isMenuOpen && (
                  <div className={`origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ${
                    theme === 'dark' ? 'bg-gray-700 ring-gray-600' : 'bg-white ring-black'
                  } ring-1 ring-opacity-5 focus:outline-none z-50`}>
                    <div className={`px-4 py-2 border-b ${
                      theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <p className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      } truncate`}>{user.name || user.email}</p>
                      <p className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      } truncate`}>{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className={`block px-4 py-2 text-sm ${
                        theme === 'dark'
                          ? 'text-gray-200 hover:bg-gray-600'
                          : 'text-gray-700 hover:bg-gray-100'
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
                        theme === 'dark'
                          ? 'text-gray-200 hover:bg-gray-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <>
                <Link
                  href="/auth/login"
                  className={`px-3 py-2 text-sm font-medium ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-gray-100'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className={`px-3 py-2 text-sm font-medium text-white ${
                    theme === 'dark'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } rounded-md`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button - shown only on mobile */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                  : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
              } focus:outline-none focus:ring-2 focus:ring-inset ${
                theme === 'dark' ? 'focus:ring-blue-500' : 'focus:ring-blue-500'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {/* Menu icon when closed */}
              {!isMenuOpen && (
                <svg className={`block h-6 w-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
              {/* Close icon when open */}
              {isMenuOpen && (
                <svg className={`block h-6 w-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - shown only when menu is open and on mobile */}
      {isMenuOpen && (
        <div className={`md:hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="pt-2 pb-3 space-y-1">
            {/* Theme toggle for mobile */}
            <div className="px-4 py-2">
              <ThemeToggle />
            </div>
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`${
                    theme === 'dark'
                      ? 'bg-blue-900 border-blue-700 text-blue-100'
                      : 'bg-blue-50 border-blue-500 text-blue-700'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/tasks"
                  className={`${
                    theme === 'dark'
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-white'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tasks
                </Link>
                <Link
                  href="/profile"
                  className={`${
                    theme === 'dark'
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-white'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Your Profile
                </Link>
                <button
                  onClick={logout}
                  className={`${
                    theme === 'dark'
                      ? 'w-full text-left border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-white'
                      : 'w-full text-left border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className={`${
                    theme === 'dark'
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-white'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className={`${
                    theme === 'dark'
                      ? 'border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-white'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}