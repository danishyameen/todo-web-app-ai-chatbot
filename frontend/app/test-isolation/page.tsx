'use client';

import { useState } from 'react';
import { UserDataTestComponent, testUserSpecificStorage } from '../src/services/UserDataTest';

export default function TestUserIsolationPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const runTest = () => {
    // Capture console logs to display in UI
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    
    const logs: string[] = [];
    
    console.log = (...args) => {
      logs.push(`LOG: ${args.join(' ')}`);
      originalLog.apply(console, args);
    };
    
    console.warn = (...args) => {
      logs.push(`WARN: ${args.join(' ')}`);
      originalWarn.apply(console, args);
    };
    
    console.error = (...args) => {
      logs.push(`ERROR: ${args.join(' ')}`);
      originalError.apply(console, args);
    };
    
    try {
      testUserSpecificStorage();
      setTestResults(logs);
    } catch (error) {
      setTestResults([...logs, `EXCEPTION: ${error}`]);
    } finally {
      // Restore original console methods
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">User Data Isolation Test</h1>
        
        <div className="mb-6">
          <button
            onClick={runTest}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Run User Isolation Test
          </button>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Test Results:</h2>
          {testResults.length > 0 ? (
            <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
              {testResults.map((log, index) => (
                <div 
                  key={index} 
                  className={`mb-1 font-mono text-sm ${
                    log.includes('ERROR') ? 'text-red-600' : 
                    log.includes('WARN') ? 'text-yellow-600' : 
                    log.includes('✓') ? 'text-green-600' : 
                    'text-gray-800'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Click "Run User Isolation Test" to begin...</p>
          )}
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">How this test works:</h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>Creates test tasks for two different users</li>
            <li>Verifies each user only sees their own tasks</li>
            <li>Ensures data is properly isolated by user ID</li>
            <li>Cleans up test data after completion</li>
          </ul>
        </div>
      </div>
    </div>
  );
}