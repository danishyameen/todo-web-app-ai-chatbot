'use client';

import { Suspense } from 'react';
import ChatPageContent from './chat-page-content'; // We'll create this file

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading chat interface...</p>
      </div>
    </div>}>
      <ChatPageContent />
    </Suspense>
  );
}