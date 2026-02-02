'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../lib/auth-context';
import SyncService from '../src/services/syncService';
import OfflineStorageService from '../src/services/offlineStorageService';

interface SyncContextType {
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncTime: Date | null;
  syncNow: () => Promise<void>;
  getOfflineDataStats: () => { tasksCount: number; conversationsCount: number; totalSize: number };
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    // Only run on client side where window and navigator are available
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    const handleOnline = () => {
      setIsOnline(true);
      console.log('Device is now online. Initiating sync...');
      if (user && token) {
        syncNow();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Device is now offline.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, token]);

  // Perform sync
  const syncNow = async () => {
    if (!isAuthenticated || !user || !token) {
      console.log('User not authenticated, skipping sync');
      return;
    }

    if (!isOnline) {
      console.log('Device is offline, sync skipped');
      return;
    }

    setIsSyncing(true);

    try {
      console.log('Starting sync...');

      // Sync tasks
      const tasksSuccess = await SyncService.syncTasks(user.id, token);
      console.log('Tasks sync result:', tasksSuccess);

      // Sync conversations
      const conversationsSuccess = await SyncService.syncConversations(user.id, token);
      console.log('Conversations sync result:', conversationsSuccess);

      setLastSyncTime(new Date());

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Error during sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Background sync periodically
  useEffect(() => {
    if (isAuthenticated && user && token && isOnline) {
      // Initial sync after authentication
      syncNow();

      // Set up periodic sync (every 5 minutes)
      const interval = setInterval(() => {
        if (isOnline) {
          syncNow();
        }
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, token, isOnline]);

  const getOfflineDataStats = () => {
    if (!user) {
      return { tasksCount: 0, conversationsCount: 0, totalSize: 0 };
    }
    return OfflineStorageService.getDataStats(user.id);
  };

  const value: SyncContextType = {
    isSyncing,
    isOnline,
    lastSyncTime,
    syncNow,
    getOfflineDataStats
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};