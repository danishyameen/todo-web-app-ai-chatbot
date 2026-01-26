'use client';

import { useState } from 'react';

export default function TestChatAPI() {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('Test message for API');

  const testChatAPI = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user-123',
          message: testMessage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult(`✅ Success! Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        setTestResult(`❌ Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      setTestResult(`❌ Exception: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGETAPI = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch(`/api/chat?userId=test-user-123&conversationId=conv-test-123`, {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult(`✅ GET Success! Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        setTestResult(`❌ GET Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('GET Test error:', error);
      setTestResult(`❌ GET Exception: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Chat API Connection Test</h1>

          <div className="space-y-6">
            <div>
              <label htmlFor="testMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Test Message:
              </label>
              <input
                type="text"
                id="testMessage"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter test message"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={testChatAPI}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test POST API'}
              </button>

              <button
                onClick={testGETAPI}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test GET API'}
              </button>
            </div>

            {testResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Test Result:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap break-all bg-white p-3 rounded border">
                  {testResult}
                </pre>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">API Endpoint Information:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><strong>POST /api/chat</strong>: Send a message to the AI assistant</li>
                <li><strong>GET /api/chat</strong>: Retrieve conversation history</li>
                <li className="mt-3 text-xs italic">
                  Note: In a production environment, these would connect to the backend Chat API & Conversation Agent
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}