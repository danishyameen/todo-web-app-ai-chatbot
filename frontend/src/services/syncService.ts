// frontend/src/services/syncService.ts
import OfflineStorageService from './offlineStorageService';
import { Task } from '../types/task';

class SyncService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000/api';
  private static isSyncing = false;

  // Synchronize tasks with backend
  static async syncTasks(userId: string, token: string): Promise<boolean> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return false;
    }

    this.isSyncing = true;
    let success = false;

    try {
      // Get all local tasks
      const localTasks = OfflineStorageService.getTasks(userId);

      // Get all server tasks
      const serverTasks = await this.fetchServerTasks(userId, token);

      // Create a map of server tasks by ID for quick lookup
      const serverTaskMap = new Map(serverTasks.map(task => [task.id, task]));

      // Process each local task
      for (const localTask of localTasks) {
        const serverTask = serverTaskMap.get(localTask.id);

        if (!serverTask) {
          // Task doesn't exist on server, create it
          await this.createTaskOnServer(localTask, userId, token);
        } else {
          // Task exists on both, check which is newer (compare timestamps)
          const localUpdated = new Date(localTask.updated_at || localTask.created_at);
          const serverUpdated = new Date(serverTask.updated_at || serverTask.created_at);

          if (localUpdated > serverUpdated) {
            // Local task is newer, update server
            await this.updateTaskOnServer(localTask, userId, token);
          } else if (serverUpdated > localUpdated) {
            // Server task is newer, update local
            OfflineStorageService.updateTask(serverTask, userId);
            OfflineStorageService.markAsSynced('task', serverTask.id, userId, true);
          } else {
            // Both are the same, mark as synced
            OfflineStorageService.markAsSynced('task', localTask.id, userId, true);
          }
        }
      }

      // Handle tasks that exist on server but not locally (download them)
      for (const serverTask of serverTasks) {
        const localTask = localTasks.find(task => task.id === serverTask.id);
        if (!localTask) {
          // Task doesn't exist locally, add it
          OfflineStorageService.addTask(serverTask, userId);
          OfflineStorageService.markAsSynced('task', serverTask.id, userId, true);
        }
      }

      success = true;
    } catch (error) {
      console.error('Error during task synchronization:', error);
      success = false;
    } finally {
      this.isSyncing = false;
    }

    return success;
  }

  // Synchronize conversations with backend
  static async syncConversations(userId: string, token: string): Promise<boolean> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return false;
    }

    this.isSyncing = true;
    let success = false;

    try {
      // Get all local conversations
      const localConversations = OfflineStorageService.getConversations(userId);

      // Get all server conversations
      const serverConversations = await this.fetchServerConversations(userId, token);

      // Create a map of server conversations by ID for quick lookup
      const serverConvMap = new Map(serverConversations.map(conv => [conv.id, conv]));

      // Process each local conversation
      for (const localConv of localConversations) {
        const serverConv = serverConvMap.get(localConv.id);

        if (!serverConv) {
          // Conversation doesn't exist on server, create it
          await this.createConversationOnServer(localConv, userId, token);
        } else {
          // Conversation exists on both, check which is newer
          const localUpdated = new Date(localConv.updated_at || localConv.created_at);
          const serverUpdated = new Date(serverConv.updated_at || serverConv.created_at);

          if (localUpdated > serverUpdated) {
            // Local conversation is newer, update server
            await this.updateConversationOnServer(localConv, userId, token);
          } else if (serverUpdated > localUpdated) {
            // Server conversation is newer, update local
            OfflineStorageService.updateConversation(serverConv, userId);
            OfflineStorageService.markAsSynced('conversation', serverConv.id, userId, true);
          } else {
            // Both are the same, mark as synced
            OfflineStorageService.markAsSynced('conversation', localConv.id, userId, true);
          }
        }
      }

      // Handle conversations that exist on server but not locally
      for (const serverConv of serverConversations) {
        const localConv = localConversations.find(conv => conv.id === serverConv.id);
        if (!localConv) {
          // Conversation doesn't exist locally, add it
          OfflineStorageService.addConversation(serverConv, userId);
          OfflineStorageService.markAsSynced('conversation', serverConv.id, userId, true);
        }
      }

      success = true;
    } catch (error) {
      console.error('Error during conversation synchronization:', error);
      success = false;
    } finally {
      this.isSyncing = false;
    }

    return success;
  }

  // Background sync - runs periodically to sync unsynced items
  static async backgroundSync(userId: string, token: string): Promise<void> {
    try {
      // Sync tasks
      const unsyncedTasks = OfflineStorageService.getUnsyncedItems('task', userId);
      for (const task of unsyncedTasks) {
        try {
          await this.createTaskOnServer(task, userId, token);
          OfflineStorageService.markAsSynced('task', task.id, userId, true);
        } catch (error) {
          console.error(`Failed to sync task ${task.id}:`, error);
          // Keep the task marked as unsynced for retry
        }
      }

      // Sync conversations
      const unsyncedConversations = OfflineStorageService.getUnsyncedItems('conversation', userId);
      for (const conversation of unsyncedConversations) {
        try {
          await this.createConversationOnServer(conversation, userId, token);
          OfflineStorageService.markAsSynced('conversation', conversation.id, userId, true);
        } catch (error) {
          console.error(`Failed to sync conversation ${conversation.id}:`, error);
          // Keep the conversation marked as unsynced for retry
        }
      }

      // Note: Messages are handled through the chat API, not direct sync
      // The chat API handles message persistence during conversation flow
      // Sync messages would require a separate endpoint which doesn't exist yet
      console.log('Skipping message sync - handled through chat API');
    } catch (error) {
      console.error('Error during background sync:', error);
    }
  }

  private static async createMessageOnServer(message: any, userId: string, token: string): Promise<void> {
    try {
      // Note: The backend doesn't have a direct message creation endpoint
      // Messages are created as part of the conversation flow when using the chat API
      // For now, we'll skip direct message sync as it's handled by the chat API
      console.warn('Direct message sync not supported, handled through chat API');
      // Mark the message as synced since we can't sync it directly
      if (message.id && message.conversationId) {
        OfflineStorageService.markAsSynced('message', message.id, userId, true);
      }
    } catch (error) {
      console.error('Error syncing message:', error);
      throw error;
    }
  }

  // Helper methods for server communication
  private static async fetchServerTasks(userId: string, token: string): Promise<Task[]> {
    try {
      // Validate token format before making request
      if (!token || typeof token !== 'string') {
        console.warn('No valid token provided for fetching server tasks');
        return [];
      }

      // Check if token is a valid JWT format (has 3 parts separated by dots)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('Invalid token format for fetching server tasks');
        return [];
      }

      const response = await fetch(`${this.API_BASE_URL}/${userId}/tasks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn('Unauthorized access - token may have expired');
          return [];
        }
        throw new Error(`Failed to fetch server tasks: ${response.status}`);
      }

      const result = await response.json();
      // Ensure we return an array of tasks
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error fetching server tasks:', error);
      return []; // Return empty array if offline or any other error
    }
  }

  private static async fetchServerConversations(userId: string, token: string): Promise<any[]> {
    try {
      // Validate token format before making request
      if (!token || typeof token !== 'string') {
        console.warn('No valid token provided for fetching server conversations');
        return [];
      }

      // Check if token is a valid JWT format (has 3 parts separated by dots)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('Invalid token format for fetching server conversations');
        return [];
      }

      const response = await fetch(`${this.API_BASE_URL}/${userId}/conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn('Unauthorized access - token may have expired');
          return [];
        }
        if (response.status === 404) {
          console.warn('Conversations endpoint not found, returning empty array');
          return []; // Return empty array if endpoint doesn't exist
        }
        throw new Error(`Failed to fetch server conversations: ${response.status}`);
      }

      const result = await response.json();
      // Handle different response formats
      if (result.conversations) {
        return result.conversations;
      } else if (Array.isArray(result)) {
        return result;
      } else {
        console.warn('Unexpected server response format for conversations, returning empty array');
        return [];
      }
    } catch (error) {
      console.error('Error fetching server conversations:', error);
      return []; // Return empty array if offline or error
    }
  }

  private static async createTaskOnServer(task: Task, userId: string, token: string): Promise<void> {
    try {
      // Transform task to match backend API expectations
      const taskData = {
        title: task.title,
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        due_date: task.due_date || null,
        category_id: task.category_id || null,
        completed_at: task.completed_at || null
      };

      const response = await fetch(`${this.API_BASE_URL}/${userId}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create task on server: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      // Update local task with server-assigned ID if needed
      if (result.id && result.id !== task.id) {
        // Update local task with server ID and any other server-provided fields
        const updatedTask = {
          ...task,
          id: result.id,
          created_at: result.created_at || task.created_at,
          updated_at: result.updated_at || new Date().toISOString()
        };
        OfflineStorageService.updateTask(updatedTask, userId);
      }
    } catch (error) {
      console.error('Error creating task on server:', error);
      throw error;
    }
  }

  private static async updateTaskOnServer(task: Task, userId: string, token: string): Promise<void> {
    try {
      // Transform task to match backend API expectations
      const taskUpdateData = {
        title: task.title,
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        due_date: task.due_date || null,
        category_id: task.category_id || null,
        completed_at: task.completed_at || null
      };

      const response = await fetch(`${this.API_BASE_URL}/${userId}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskUpdateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update task on server: ${response.status} - ${errorText}`);
      }

      // Update local task timestamp to reflect successful sync
      const updatedTask = {
        ...task,
        updated_at: new Date().toISOString()
      };
      OfflineStorageService.updateTask(updatedTask, userId);
      OfflineStorageService.markAsSynced('task', task.id, userId, true);
    } catch (error) {
      console.error('Error updating task on server:', error);
      throw error;
    }
  }

  private static async createConversationOnServer(conversation: any, userId: string, token: string): Promise<void> {
    try {
      // Transform conversation to match backend API expectations
      const conversationData = {
        title: conversation.title || 'New Conversation',
        user_id: userId  // Use the userId from parameters to ensure correct user association
      };

      const response = await fetch(`${this.API_BASE_URL}/${userId}/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversationData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create conversation on server: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      // Update local conversation with server-assigned ID if needed
      if (result.id && result.id !== conversation.id) {
        // Update local conversation with server ID and any other server-provided fields
        const updatedConversation = {
          ...conversation,
          id: result.id,
          created_at: result.createdAt || conversation.created_at,
          updated_at: result.updatedAt || new Date().toISOString()
        };
        OfflineStorageService.updateConversation(updatedConversation, userId);
      }
    } catch (error) {
      console.error('Error creating conversation on server:', error);
      throw error;
    }
  }

  private static async updateConversationOnServer(conversation: any, userId: string, token: string): Promise<void> {
    try {
      // Transform conversation to match backend API expectations
      const conversationUpdateData = {
        title: conversation.title || 'New Conversation'
      };

      const response = await fetch(`${this.API_BASE_URL}/${userId}/conversations/${conversation.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversationUpdateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update conversation on server: ${response.status} - ${errorText}`);
      }

      // Update local conversation timestamp to reflect successful sync
      const updatedConversation = {
        ...conversation,
        updated_at: new Date().toISOString()
      };
      OfflineStorageService.updateConversation(updatedConversation, userId);
      OfflineStorageService.markAsSynced('conversation', conversation.id, userId, true);
    } catch (error) {
      console.error('Error updating conversation on server:', error);
      throw error;
    }
  }

  // Check if online
  static isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }

  // Start periodic sync when online
  static startPeriodicSync(userId: string, token: string, intervalMinutes: number = 5): NodeJS.Timeout {
    const interval = setInterval(() => {
      if (this.isOnline()) {
        this.backgroundSync(userId, token);
      }
    }, intervalMinutes * 60 * 1000);

    return interval;
  }
}

export default SyncService;