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
      const localTasks = OfflineStorageService.getTasks();

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
            OfflineStorageService.updateTask(serverTask);
            OfflineStorageService.markAsSynced('task', serverTask.id, true);
          } else {
            // Both are the same, mark as synced
            OfflineStorageService.markAsSynced('task', localTask.id, true);
          }
        }
      }

      // Handle tasks that exist on server but not locally (download them)
      for (const serverTask of serverTasks) {
        const localTask = localTasks.find(task => task.id === serverTask.id);
        if (!localTask) {
          // Task doesn't exist locally, add it
          OfflineStorageService.addTask(serverTask);
          OfflineStorageService.markAsSynced('task', serverTask.id, true);
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
      const localConversations = OfflineStorageService.getConversations();

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
            OfflineStorageService.updateConversation(serverConv);
            OfflineStorageService.markAsSynced('conversation', serverConv.id, true);
          } else {
            // Both are the same, mark as synced
            OfflineStorageService.markAsSynced('conversation', localConv.id, true);
          }
        }
      }

      // Handle conversations that exist on server but not locally
      for (const serverConv of serverConversations) {
        const localConv = localConversations.find(conv => conv.id === serverConv.id);
        if (!localConv) {
          // Conversation doesn't exist locally, add it
          OfflineStorageService.addConversation(serverConv);
          OfflineStorageService.markAsSynced('conversation', serverConv.id, true);
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
      const unsyncedTasks = OfflineStorageService.getUnsyncedItems('task');
      for (const task of unsyncedTasks) {
        try {
          await this.createTaskOnServer(task, userId, token);
          OfflineStorageService.markAsSynced('task', task.id, true);
        } catch (error) {
          console.error(`Failed to sync task ${task.id}:`, error);
          // Keep the task marked as unsynced for retry
        }
      }

      // Sync conversations
      const unsyncedConversations = OfflineStorageService.getUnsyncedItems('conversation');
      for (const conversation of unsyncedConversations) {
        try {
          await this.createConversationOnServer(conversation, userId, token);
          OfflineStorageService.markAsSynced('conversation', conversation.id, true);
        } catch (error) {
          console.error(`Failed to sync conversation ${conversation.id}:`, error);
          // Keep the conversation marked as unsynced for retry
        }
      }
    } catch (error) {
      console.error('Error during background sync:', error);
    }
  }

  // Helper methods for server communication
  private static async fetchServerTasks(userId: string, token: string): Promise<Task[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${userId}/tasks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch server tasks: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching server tasks:', error);
      return []; // Return empty array if offline
    }
  }

  private static async fetchServerConversations(userId: string, token: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${userId}/conversations`, { // Assuming there's a conversations endpoint
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch server conversations: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching server conversations:', error);
      return []; // Return empty array if offline
    }
  }

  private static async createTaskOnServer(task: Task, userId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${userId}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task on server: ${response.status}`);
      }

      const result = await response.json();
      // Update local task with server-assigned ID if needed
      if (result.id && result.id !== task.id) {
        // Update local task with server ID
        const updatedTask = { ...task, id: result.id };
        OfflineStorageService.updateTask(updatedTask);
      }
    } catch (error) {
      console.error('Error creating task on server:', error);
      throw error;
    }
  }

  private static async updateTaskOnServer(task: Task, userId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${userId}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task on server: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating task on server:', error);
      throw error;
    }
  }

  private static async createConversationOnServer(conversation: any, userId: string, token: string): Promise<void> {
    try {
      // Note: This is a simplified implementation - you may need to adjust based on your API
      const response = await fetch(`${this.API_BASE_URL}/${userId}/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversation),
      });

      if (!response.ok) {
        throw new Error(`Failed to create conversation on server: ${response.status}`);
      }

      const result = await response.json();
      // Update local conversation with server-assigned ID if needed
      if (result.id && result.id !== conversation.id) {
        // Update local conversation with server ID
        const updatedConversation = { ...conversation, id: result.id };
        OfflineStorageService.updateConversation(updatedConversation);
      }
    } catch (error) {
      console.error('Error creating conversation on server:', error);
      throw error;
    }
  }

  private static async updateConversationOnServer(conversation: any, userId: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${userId}/conversations/${conversation.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversation),
      });

      if (!response.ok) {
        throw new Error(`Failed to update conversation on server: ${response.status}`);
      }
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