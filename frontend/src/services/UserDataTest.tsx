// test-user-data-storage.tsx
// Simple test to verify user-specific data storage functionality

import React from 'react';
import UserDataService from '../src/services/UserDataService';

// Mock user data for testing
const USER_1_ID = 'user-1-uuid';
const USER_2_ID = 'user-2-uuid';

// Test function to verify user-specific storage
export const testUserSpecificStorage = () => {
  console.log('Starting user-specific storage test...');
  
  // Clear any existing data for clean test
  UserDataService.clearUserData(USER_1_ID);
  UserDataService.clearUserData(USER_2_ID);
  
  // Create test tasks for user 1
  const user1Task = {
    id: 'task-1-for-user-1',
    title: 'User 1 Task',
    description: 'This task belongs to user 1',
    status: 'pending' as const,
    priority: 'medium' as const,
    due_date: null,
    completed_at: null,
    user_id: USER_1_ID,
    category_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Aliases for compatibility
    dueDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    userId: USER_1_ID,
    userName: 'User 1',
    categoryId: null
  };
  
  // Create test tasks for user 2
  const user2Task = {
    id: 'task-1-for-user-2',
    title: 'User 2 Task',
    description: 'This task belongs to user 2',
    status: 'pending' as const,
    priority: 'high' as const,
    due_date: null,
    completed_at: null,
    user_id: USER_2_ID,
    category_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Aliases for compatibility
    dueDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    userId: USER_2_ID,
    userName: 'User 2',
    categoryId: null
  };
  
  // Add tasks for each user
  UserDataService.addTask(user1Task, USER_1_ID);
  UserDataService.addTask(user2Task, USER_2_ID);
  
  // Verify that each user only sees their own tasks
  const user1Tasks = UserDataService.getTasks(USER_1_ID);
  const user2Tasks = UserDataService.getTasks(USER_2_ID);
  
  console.log('User 1 tasks count:', user1Tasks.length); // Should be 1
  console.log('User 2 tasks count:', user2Tasks.length); // Should be 1
  
  // Verify task ownership
  if (user1Tasks.length === 1 && user1Tasks[0].user_id === USER_1_ID) {
    console.log('✓ User 1 task correctly stored with correct user_id');
  } else {
    console.error('✗ User 1 task incorrectly stored');
  }
  
  if (user2Tasks.length === 1 && user2Tasks[0].user_id === USER_2_ID) {
    console.log('✓ User 2 task correctly stored with correct user_id');
  } else {
    console.error('✗ User 2 task incorrectly stored');
  }
  
  // Test stats calculation
  const user1Stats = UserDataService.getTaskStats(USER_1_ID);
  const user2Stats = UserDataService.getTaskStats(USER_2_ID);
  
  console.log('User 1 stats total:', user1Stats.total); // Should be 1
  console.log('User 2 stats total:', user2Stats.total); // Should be 1
  
  // Clean up test data
  UserDataService.clearUserData(USER_1_ID);
  UserDataService.clearUserData(USER_2_ID);
  
  console.log('User-specific storage test completed!');
};

// Component for manual testing in browser
export const UserDataTestComponent: React.FC = () => {
  const runTest = () => {
    testUserSpecificStorage();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>User Data Storage Test</h2>
      <p>This component tests the user-specific data storage functionality.</p>
      <button 
        onClick={runTest}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Run Test
      </button>
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>How it works:</strong></p>
        <ol>
          <li>Adds a task for User 1</li>
          <li>Adds a task for User 2</li>
          <li>Verifies each user only sees their own tasks</li>
          <li>Cleans up test data</li>
        </ol>
        <p>Check the browser console for test results.</p>
      </div>
    </div>
  );
};