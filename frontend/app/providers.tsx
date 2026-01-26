'use client';

// Vercel deployment fix - using relative paths
import { AuthProvider } from '../lib/auth-context';
import { ThemeProvider } from '../lib/theme-context';
import { SyncProvider } from './sync-provider';
import { ReactNode } from 'react';
import AiChatbot from '../components/AiChatbot';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SyncProvider>
          {children}
          <AiChatbot />
        </SyncProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}