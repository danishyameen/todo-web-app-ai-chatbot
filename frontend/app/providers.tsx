'use client';

// Vercel deployment fix - using relative paths
import { AuthProvider } from '../lib/auth-context';
import { ThemeProvider } from '../lib/theme-context';
import { SyncProvider } from './sync-provider';
import { ReactNode } from 'react';
import AiChatbot from '../components/AiChatbot';
import ClientOnlyWrapper from '../components/ClientOnlyWrapper';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClientOnlyWrapper>
      <ThemeProvider>
        <AuthProvider>
          <SyncProvider>
            {children}
            <AiChatbot />
          </SyncProvider>
        </AuthProvider>
      </ThemeProvider>
    </ClientOnlyWrapper>
  );
}