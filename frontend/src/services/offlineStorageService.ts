// frontend/src/services/offlineStorageService.ts
import { Task } from '../types/task';

class OfflineStorageService {
  private static readonly TASKS_KEY = 'todo_app_tasks';
  private static readonly CONVERSATIONS_KEY = 'todo_app_conversations';
  private static readonly USERS_KEY = 'todo_app_users';
  private static readonly MESSAGES_KEY = 'todo_app_messages';

  // Tasks storage
  static saveTasks(tasks: Task[], userId: string): void {
    try {
      const key = `${this.TASKS_KEY}_${userId}`;
      localStorage.setItem(key, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to local storage:', error);
    }
  }

  static getTasks(userId: string): Task[] {
    try {
      const key = `${this.TASKS_KEY}_${userId}`;
      const tasksStr = localStorage.getItem(key);
      return tasksStr ? JSON.parse(tasksStr) : [];
    } catch (error) {
      console.error('Error getting tasks from local storage:', error);
      return [];
    }
  }

  static addTask(task: Task, userId: string): void {
    try {
      const tasks = this.getTasks(userId);
      // Check if task already exists to avoid duplicates
      const existingIndex = tasks.findIndex(t => t.id === task.id);
      if (existingIndex === -1) {
        tasks.push(task);
      } else {
        // If it exists, update it instead
        tasks[existingIndex] = task;
      }
      this.saveTasks(tasks, userId);

      // Mark as unsynced initially
      this.markAsSynced('task', task.id, userId, false);
    } catch (error) {
      console.error('Error adding task to local storage:', error);
    }
  }

  static updateTask(updatedTask: Task, userId: string): void {
    try {
      const tasks = this.getTasks(userId);
      const index = tasks.findIndex(task => task.id === updatedTask.id);
      if (index !== -1) {
        tasks[index] = updatedTask;
        this.saveTasks(tasks, userId);
      } else {
        // If task doesn't exist, add it
        tasks.push(updatedTask);
        this.saveTasks(tasks, userId);
      }

      // Mark as unsynced when updated
      this.markAsSynced('task', updatedTask.id, userId, false);
    } catch (error) {
      console.error('Error updating task in local storage:', error);
    }
  }

  static deleteTask(taskId: string, userId: string): void {
    try {
      const tasks = this.getTasks(userId);
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      this.saveTasks(filteredTasks, userId);
    } catch (error) {
      console.error('Error deleting task from local storage:', error);
    }
  }

  static clearTasks(userId: string): void {
    try {
      const key = `${this.TASKS_KEY}_${userId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing tasks from local storage:', error);
    }
  }

  // Conversations storage
  static saveConversations(conversations: any[], userId: string): void {
    try {
      const key = `${this.CONVERSATIONS_KEY}_${userId}`;
      localStorage.setItem(key, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations to local storage:', error);
    }
  }

  static getConversations(userId: string): any[] {
    try {
      const key = `${this.CONVERSATIONS_KEY}_${userId}`;
      const convStr = localStorage.getItem(key);
      return convStr ? JSON.parse(convStr) : [];
    } catch (error) {
      console.error('Error getting conversations from local storage:', error);
      return [];
    }
  }

  static addConversation(conversation: any, userId: string): void {
    try {
      const conversations = this.getConversations(userId);
      // Check if conversation already exists to avoid duplicates
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      if (existingIndex === -1) {
        conversations.push(conversation);
      } else {
        // If it exists, update it instead
        conversations[existingIndex] = conversation;
      }
      this.saveConversations(conversations, userId);

      // Mark as unsynced initially
      this.markAsSynced('conversation', conversation.id, userId, false);
    } catch (error) {
      console.error('Error adding conversation to local storage:', error);
    }
  }

  static updateConversation(updatedConversation: any, userId: string): void {
    try {
      const conversations = this.getConversations(userId);
      const index = conversations.findIndex(conv => conv.id === updatedConversation.id);
      if (index !== -1) {
        conversations[index] = updatedConversation;
        this.saveConversations(conversations, userId);
      } else {
        // If conversation doesn't exist, add it
        conversations.push(updatedConversation);
        this.saveConversations(conversations, userId);
      }

      // Mark as unsynced when updated
      this.markAsSynced('conversation', updatedConversation.id, userId, false);
    } catch (error) {
      console.error('Error updating conversation in local storage:', error);
    }
  }

  static deleteConversation(conversationId: string, userId: string): void {
    try {
      const conversations = this.getConversations(userId);
      const filteredConversations = conversations.filter(conv => conv.id !== conversationId);
      this.saveConversations(filteredConversations, userId);
    } catch (error) {
      console.error('Error deleting conversation from local storage:', error);
    }
  }

  static clearConversations(userId: string): void {
    try {
      const key = `${this.CONVERSATIONS_KEY}_${userId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing conversations from local storage:', error);
    }
  }

  // Messages storage
  static saveMessages(messages: any[], conversationId: string, userId: string): void {
    try {
      const key = `${this.MESSAGES_KEY}_${conversationId}_${userId}`;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages to local storage:', error);
    }
  }

  static getMessages(conversationId: string, userId: string): any[] {
    try {
      const key = `${this.MESSAGES_KEY}_${conversationId}_${userId}`;
      const messagesStr = localStorage.getItem(key);
      return messagesStr ? JSON.parse(messagesStr) : [];
    } catch (error) {
      console.error('Error getting messages from local storage:', error);
      return [];
    }
  }

  static addMessage(message: any, conversationId: string, userId: string): void {
    try {
      const messages = this.getMessages(conversationId, userId);
      messages.push(message);
      this.saveMessages(messages, conversationId, userId);
    } catch (error) {
      console.error('Error adding message to local storage:', error);
    }
  }

  static clearMessages(conversationId: string, userId: string): void {
    try {
      const key = `${this.MESSAGES_KEY}_${conversationId}_${userId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing messages from local storage:', error);
    }
  }

  static updateMessage(updatedMessage: any, conversationId: string, userId: string): void {
    try {
      const messages = this.getMessages(conversationId, userId);
      const index = messages.findIndex(msg => msg.id === updatedMessage.id);
      if (index !== -1) {
        messages[index] = updatedMessage;
        this.saveMessages(messages, conversationId, userId);
      }
    } catch (error) {
      console.error('Error updating message in local storage:', error);
    }
  }

  // Sync status tracking
  static markAsSynced(itemType: 'task' | 'conversation' | 'message', id: string, userId: string, synced: boolean = true): void {
    try {
      const key = `sync_status_${itemType}_${id}_${userId}`;
      localStorage.setItem(key, JSON.stringify({
        synced,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error marking item as synced:', error);
    }
  }

  static isSynced(itemType: 'task' | 'conversation' | 'message', id: string, userId: string): boolean {
    try {
      const key = `sync_status_${itemType}_${id}_${userId}`;
      const statusStr = localStorage.getItem(key);
      if (!statusStr) return false;

      const status = JSON.parse(statusStr);
      return status.synced === true;
    } catch (error) {
      console.error('Error checking sync status:', error);
      return false;
    }
  }

  static getUnsyncedItems(itemType: 'task' | 'conversation', userId: string): any[] {
    try {
      let items: any[] = [];
      if (itemType === 'task') {
        items = this.getTasks(userId);
      } else if (itemType === 'conversation') {
        items = this.getConversations(userId);
      }

      return items.filter(item => !this.isSynced(itemType, item.id, userId));
    } catch (error) {
      console.error('Error getting unsynced items:', error);
      return [];
    }
  }

  // Utility methods
  static clearAll(userId: string): void {
    try {
      this.clearTasks(userId);
      this.clearConversations(userId);

      // Clear all message storages for this user
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`${this.MESSAGES_KEY}_`) && key.endsWith(`_${userId}`)) {
          localStorage.removeItem(key);
        }
      });

      // Clear all sync status entries for this user
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sync_status_') && key.includes(userId)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing all offline data:', error);
    }
  }

  static getDataStats(userId: string): { tasksCount: number; conversationsCount: number; messagesCount: number; totalSize: number } {
    try {
      const tasks = this.getTasks(userId);
      const conversations = this.getConversations(userId);

      // Count messages across all conversations
      let messagesCount = 0;
      const allConversationIds = conversations.map(conv => conv.id);
      for (const convId of allConversationIds) {
        const messages = this.getMessages(convId, userId);
        messagesCount += messages.length;
      }

      const tasksSize = JSON.stringify(tasks).length;
      const conversationsSize = JSON.stringify(conversations).length;

      // Calculate messages size
      let messagesSize = 0;
      for (const convId of allConversationIds) {
        const messages = this.getMessages(convId, userId);
        messagesSize += JSON.stringify(messages).length;
      }

      return {
        tasksCount: tasks.length,
        conversationsCount: conversations.length,
        messagesCount,
        totalSize: tasksSize + conversationsSize + messagesSize
      };
    } catch (error) {
      console.error('Error getting data stats:', error);
      return { tasksCount: 0, conversationsCount: 0, messagesCount: 0, totalSize: 0 };
    }
  }
}

export default OfflineStorageService;