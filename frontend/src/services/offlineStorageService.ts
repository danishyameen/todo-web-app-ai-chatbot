// frontend/src/services/offlineStorageService.ts
import { Task } from '../types/task';

class OfflineStorageService {
  private static readonly TASKS_KEY = 'todo_app_tasks';
  private static readonly CONVERSATIONS_KEY = 'todo_app_conversations';
  private static readonly USERS_KEY = 'todo_app_users';

  // Tasks storage
  static saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to local storage:', error);
    }
  }

  static getTasks(): Task[] {
    try {
      const tasksStr = localStorage.getItem(this.TASKS_KEY);
      return tasksStr ? JSON.parse(tasksStr) : [];
    } catch (error) {
      console.error('Error getting tasks from local storage:', error);
      return [];
    }
  }

  static addTask(task: Task): void {
    try {
      const tasks = this.getTasks();
      tasks.push(task);
      this.saveTasks(tasks);
    } catch (error) {
      console.error('Error adding task to local storage:', error);
    }
  }

  static updateTask(updatedTask: Task): void {
    try {
      const tasks = this.getTasks();
      const index = tasks.findIndex(task => task.id === updatedTask.id);
      if (index !== -1) {
        tasks[index] = updatedTask;
        this.saveTasks(tasks);
      }
    } catch (error) {
      console.error('Error updating task in local storage:', error);
    }
  }

  static deleteTask(taskId: string): void {
    try {
      const tasks = this.getTasks();
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      this.saveTasks(filteredTasks);
    } catch (error) {
      console.error('Error deleting task from local storage:', error);
    }
  }

  static clearTasks(): void {
    try {
      localStorage.removeItem(this.TASKS_KEY);
    } catch (error) {
      console.error('Error clearing tasks from local storage:', error);
    }
  }

  // Conversations storage
  static saveConversations(conversations: any[]): void {
    try {
      localStorage.setItem(this.CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations to local storage:', error);
    }
  }

  static getConversations(): any[] {
    try {
      const convStr = localStorage.getItem(this.CONVERSATIONS_KEY);
      return convStr ? JSON.parse(convStr) : [];
    } catch (error) {
      console.error('Error getting conversations from local storage:', error);
      return [];
    }
  }

  static addConversation(conversation: any): void {
    try {
      const conversations = this.getConversations();
      conversations.push(conversation);
      this.saveConversations(conversations);
    } catch (error) {
      console.error('Error adding conversation to local storage:', error);
    }
  }

  static updateConversation(updatedConversation: any): void {
    try {
      const conversations = this.getConversations();
      const index = conversations.findIndex(conv => conv.id === updatedConversation.id);
      if (index !== -1) {
        conversations[index] = updatedConversation;
        this.saveConversations(conversations);
      }
    } catch (error) {
      console.error('Error updating conversation in local storage:', error);
    }
  }

  static deleteConversation(conversationId: string): void {
    try {
      const conversations = this.getConversations();
      const filteredConversations = conversations.filter(conv => conv.id !== conversationId);
      this.saveConversations(filteredConversations);
    } catch (error) {
      console.error('Error deleting conversation from local storage:', error);
    }
  }

  static clearConversations(): void {
    try {
      localStorage.removeItem(this.CONVERSATIONS_KEY);
    } catch (error) {
      console.error('Error clearing conversations from local storage:', error);
    }
  }

  // Sync status tracking
  static markAsSynced(itemType: 'task' | 'conversation', id: string, synced: boolean = true): void {
    try {
      const key = `sync_status_${itemType}_${id}`;
      localStorage.setItem(key, JSON.stringify({
        synced,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error marking item as synced:', error);
    }
  }

  static isSynced(itemType: 'task' | 'conversation', id: string): boolean {
    try {
      const key = `sync_status_${itemType}_${id}`;
      const statusStr = localStorage.getItem(key);
      if (!statusStr) return false;

      const status = JSON.parse(statusStr);
      return status.synced === true;
    } catch (error) {
      console.error('Error checking sync status:', error);
      return false;
    }
  }

  static getUnsyncedItems(itemType: 'task' | 'conversation'): any[] {
    try {
      let items: any[] = [];
      if (itemType === 'task') {
        items = this.getTasks();
      } else if (itemType === 'conversation') {
        items = this.getConversations();
      }

      return items.filter(item => !this.isSynced(itemType, item.id));
    } catch (error) {
      console.error('Error getting unsynced items:', error);
      return [];
    }
  }

  // Utility methods
  static clearAll(): void {
    try {
      this.clearTasks();
      this.clearConversations();

      // Clear all sync status entries
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sync_status_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing all offline data:', error);
    }
  }

  static getDataStats(): { tasksCount: number; conversationsCount: number; totalSize: number } {
    try {
      const tasks = this.getTasks();
      const conversations = this.getConversations();

      const tasksSize = JSON.stringify(tasks).length;
      const conversationsSize = JSON.stringify(conversations).length;

      return {
        tasksCount: tasks.length,
        conversationsCount: conversations.length,
        totalSize: tasksSize + conversationsSize
      };
    } catch (error) {
      console.error('Error getting data stats:', error);
      return { tasksCount: 0, conversationsCount: 0, totalSize: 0 };
    }
  }
}

export default OfflineStorageService;