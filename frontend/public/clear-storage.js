// Script to clear all application data from browser storage
// This will remove all user data, tasks, authentication tokens, etc.

console.log('Clearing all application data from browser storage...');

// Clear sessionStorage
if (typeof window !== 'undefined' && window.sessionStorage) {
  // Get all keys that start with common prefixes used by the app
  const sessionStorageKeysToRemove = [];
  
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
    console.log(`Removed from sessionStorage: ${key}`);
  });
  
  // Also clear all users data if present
  if (sessionStorage.getItem('users')) {
    sessionStorage.removeItem('users');
    console.log('Removed from sessionStorage: users');
  }
  
  console.log(`Cleared ${sessionStorageKeysToRemove.length} items from sessionStorage`);
}

// Clear localStorage
if (typeof window !== 'undefined' && window.localStorage) {
  // Get all keys that start with common prefixes used by the app
  const localStorageKeysToRemove = [];
  
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
    console.log(`Removed from localStorage: ${key}`);
  });
  
  // Also clear all users data if present
  if (localStorage.getItem('users')) {
    localStorage.removeItem('users');
    console.log('Removed from localStorage: users');
  }
  
  console.log(`Cleared ${localStorageKeysToRemove.length} items from localStorage`);
}

console.log('All application data has been cleared from browser storage.');
console.log('You can now refresh the page to start with a clean application state.');