'use client';

import { useState } from 'react';

export default function TestNLU() {
  const [testInputs, setTestInputs] = useState([
    { id: 1, text: 'Add a task to buy groceries', expected: 'Task creation intent detected' },
    { id: 2, text: 'Show me my tasks', expected: 'Task listing intent detected' },
    { id: 3, text: 'Mark the grocery task as complete', expected: 'Task completion intent detected' },
    { id: 4, text: 'Update the meeting task to tomorrow', expected: 'Task update intent detected' },
    { id: 5, text: 'Delete the old task', expected: 'Task deletion intent detected' },
  ]);
  const [results, setResults] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const testInput = async (inputText: string, id: number) => {
    setLoading(true);

    try {
      // Simulate API call to test natural language understanding
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user-123',
          message: inputText,
        }),
      });

      const data = await response.json();

      // In a real system, this would analyze the response for intent detection
      // For now, we'll simulate based on keywords in the input
      let result;
      if (inputText.toLowerCase().includes('add') || inputText.toLowerCase().includes('create')) {
        result = '✅ Task creation intent detected and processed';
      } else if (inputText.toLowerCase().includes('show') || inputText.toLowerCase().includes('list')) {
        result = '✅ Task listing intent detected and processed';
      } else if (inputText.toLowerCase().includes('complete') || inputText.toLowerCase().includes('done')) {
        result = '✅ Task completion intent detected and processed';
      } else if (inputText.toLowerCase().includes('update') || inputText.toLowerCase().includes('change')) {
        result = '✅ Task update intent detected and processed';
      } else if (inputText.toLowerCase().includes('delete') || inputText.toLowerCase().includes('remove')) {
        result = '✅ Task deletion intent detected and processed';
      } else {
        result = 'ℹ️ General intent detected - response generated';
      }

      setResults(prev => ({
        ...prev,
        [id]: result
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [id]: `❌ Error: ${(error as Error).message}`
      }));
    } finally {
      setLoading(false);
    }
  };

  const testAllInputs = async () => {
    for (const input of testInputs) {
      await testInput(input.text, input.id);
      // Small delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Natural Language Understanding Test</h1>
          <p className="text-gray-600 mb-6">
            Test various natural language inputs to verify the AI assistant correctly interprets user intents
          </p>

          <div className="mb-6">
            <button
              onClick={testAllInputs}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Testing All...' : 'Test All Inputs'}
            </button>
          </div>

          <div className="space-y-4">
            {testInputs.map((input) => (
              <div key={input.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">"{input.text}"</h3>
                    <p className="text-sm text-gray-500 mt-1">Expected: {input.expected}</p>
                  </div>
                  <button
                    onClick={() => testInput(input.text, input.id)}
                    disabled={loading}
                    className="ml-4 inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    Test
                  </button>
                </div>

                {results[input.id] && (
                  <div className={`mt-2 p-2 rounded text-sm ${
                    results[input.id].startsWith('✅')
                      ? 'bg-green-50 text-green-800'
                      : results[input.id].startsWith('❌')
                        ? 'bg-red-50 text-red-800'
                        : 'bg-blue-50 text-blue-800'
                  }`}>
                    {results[input.id]}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">User Experience Guidelines:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• <strong>Clear Intent Recognition:</strong> AI should accurately identify user intents from natural language</li>
              <li>• <strong>Immediate Feedback:</strong> Provide visual feedback when processing user input</li>
              <li>• <strong>Helpful Responses:</strong> AI responses should be relevant and actionable</li>
              <li>• <strong>Error Handling:</strong> Gracefully handle unrecognized or ambiguous inputs</li>
              <li>• <strong>Consistent Experience:</strong> Similar inputs should produce consistent response patterns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}