// frontend/src/services/UserDataService.ts
// Comprehensive service for managing all user-specific data in localStorage

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string | null;
  completed_at?: string | null;
  user_id: string;
  user_name?: string;
  category_id?: string | null;
  category?: string;
  created_at: string;
  updated_at: string;
  // Aliases for compatibility
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
  userId?: string;
  userName?: string;
  categoryId?: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  review?: string;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  conversationId: string;
  userId: string;
  timestamp: string;
}

export interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

class UserDataService {
  private static readonly PREFIX = 'todo_app_';

  // Tasks management
  static saveTasks(tasks: Task[], userId: string): void {
    try {
      const key = `${this.PREFIX}tasks_${userId}`;
      localStorage.setItem(key, JSON.stringify(tasks));
      
      // Dispatch a custom event to notify other components of the change
      window.dispatchEvent(new CustomEvent('userTaskUpdate', { detail: { userId, action: 'save' } }));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  static getTasks(userId: string): Task[] {
    try {
      const key = `${this.PREFIX}tasks_${userId}`;
      const tasksStr = localStorage.getItem(key);
      return tasksStr ? JSON.parse(tasksStr) : [];
    } catch (error) {
      console.error('Error getting tasks from localStorage:', error);
      return [];
    }
  }

  static addTask(task: Task, userId: string): void {
    try {
      const tasks = this.getTasks(userId);
      
      // Ensure the task has the correct user_id
      const taskWithCorrectUserId = {
        ...task,
        user_id: userId,
        userId: userId
      };

      tasks.push(taskWithCorrectUserId);
      this.saveTasks(tasks, userId);
      
      // Dispatch a custom event to notify other components of the change
      window.dispatchEvent(new CustomEvent('userTaskUpdate', { detail: { userId, action: 'add', taskId: task.id } }));
    } catch (error) {
      console.error('Error adding task to localStorage:', error);
    }
  }

  static updateTask(taskId: string, updatedTask: Partial<Task>, userId: string): void {
    try {
      const tasks = this.getTasks(userId);
      const taskIndex = tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          ...updatedTask,
          user_id: userId,
          userId: userId,
          updated_at: new Date().toISOString()
        };
        this.saveTasks(tasks, userId);
        
        // Dispatch a custom event to notify other components of the change
        window.dispatchEvent(new CustomEvent('userTaskUpdate', { detail: { userId, action: 'update', taskId } }));
      }
    } catch (error) {
      console.error('Error updating task in localStorage:', error);
    }
  }

  static deleteTask(taskId: string, userId: string): void {
    try {
      const tasks = this.getTasks(userId);
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      this.saveTasks(filteredTasks, userId);
      
      // Dispatch a custom event to notify other components of the change
      window.dispatchEvent(new CustomEvent('userTaskUpdate', { detail: { userId, action: 'delete', taskId } }));
    } catch (error) {
      console.error('Error deleting task from localStorage:', error);
    }
  }

  static deleteAllTasks(userId: string): void {
    try {
      const key = `${this.PREFIX}tasks_${userId}`;
      localStorage.removeItem(key);
      
      // Dispatch a custom event to notify other components of the change
      window.dispatchEvent(new CustomEvent('userTaskUpdate', { detail: { userId, action: 'deleteAll' } }));
    } catch (error) {
      console.error('Error deleting all tasks from localStorage:', error);
    }
  }

  // Conversations management
  static saveConversations(conversations: Conversation[], userId: string): void {
    try {
      const key = `${this.PREFIX}conversations_${userId}`;
      localStorage.setItem(key, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations to localStorage:', error);
    }
  }

  static getConversations(userId: string): Conversation[] {
    try {
      const key = `${this.PREFIX}conversations_${userId}`;
      const convStr = localStorage.getItem(key);
      return convStr ? JSON.parse(convStr) : [];
    } catch (error) {
      console.error('Error getting conversations from localStorage:', error);
      return [];
    }
  }

  static addConversation(conversation: Conversation, userId: string): void {
    try {
      const conversations = this.getConversations(userId);
      
      // Ensure the conversation has the correct user_id
      const conversationWithCorrectUserId = {
        ...conversation,
        userId: userId
      };

      conversations.push(conversationWithCorrectUserId);
      this.saveConversations(conversations, userId);
    } catch (error) {
      console.error('Error adding conversation to localStorage:', error);
    }
  }

  static updateConversation(conversationId: string, updatedConversation: Partial<Conversation>, userId: string): void {
    try {
      const conversations = this.getConversations(userId);
      const convIndex = conversations.findIndex(conv => conv.id === conversationId);
      if (convIndex !== -1) {
        conversations[convIndex] = {
          ...conversations[convIndex],
          ...updatedConversation,
          userId: userId
        };
        this.saveConversations(conversations, userId);
      }
    } catch (error) {
      console.error('Error updating conversation in localStorage:', error);
    }
  }

  static deleteConversation(conversationId: string, userId: string): void {
    try {
      const conversations = this.getConversations(userId);
      const filteredConversations = conversations.filter(conv => conv.id !== conversationId);
      this.saveConversations(filteredConversations, userId);
    } catch (error) {
      console.error('Error deleting conversation from localStorage:', error);
    }
  }

  // Messages management
  static saveMessages(messages: Message[], conversationId: string, userId: string): void {
    try {
      const key = `${this.PREFIX}messages_${conversationId}_${userId}`;
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  }

  static getMessages(conversationId: string, userId: string): Message[] {
    try {
      const key = `${this.PREFIX}messages_${conversationId}_${userId}`;
      const messagesStr = localStorage.getItem(key);
      return messagesStr ? JSON.parse(messagesStr) : [];
    } catch (error) {
      console.error('Error getting messages from localStorage:', error);
      return [];
    }
  }

  static addMessage(message: Message, conversationId: string, userId: string): void {
    try {
      const messages = this.getMessages(conversationId, userId);
      
      // Ensure the message has the correct user_id and conversation_id
      const messageWithCorrectIds = {
        ...message,
        userId: userId,
        conversationId: conversationId
      };

      messages.push(messageWithCorrectIds);
      this.saveMessages(messages, conversationId, userId);
    } catch (error) {
      console.error('Error adding message to localStorage:', error);
    }
  }

  static updateMessage(messageId: string, updatedMessage: Partial<Message>, conversationId: string, userId: string): void {
    try {
      const messages = this.getMessages(conversationId, userId);
      const msgIndex = messages.findIndex(msg => msg.id === messageId);
      if (msgIndex !== -1) {
        messages[msgIndex] = {
          ...messages[msgIndex],
          ...updatedMessage
        };
        this.saveMessages(messages, conversationId, userId);
      }
    } catch (error) {
      console.error('Error updating message in localStorage:', error);
    }
  }

  static deleteMessage(messageId: string, conversationId: string, userId: string): void {
    try {
      const messages = this.getMessages(conversationId, userId);
      const filteredMessages = messages.filter(msg => msg.id !== messageId);
      this.saveMessages(filteredMessages, conversationId, userId);
    } catch (error) {
      console.error('Error deleting message from localStorage:', error);
    }
  }

  // Categories management
  static saveCategories(categories: Category[], userId: string): void {
    try {
      const key = `${this.PREFIX}categories_${userId}`;
      localStorage.setItem(key, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  }

  static getCategories(userId: string): Category[] {
    try {
      const key = `${this.PREFIX}categories_${userId}`;
      const catsStr = localStorage.getItem(key);
      return catsStr ? JSON.parse(catsStr) : [];
    } catch (error) {
      console.error('Error getting categories from localStorage:', error);
      return [];
    }
  }

  static addCategory(category: Category, userId: string): void {
    try {
      const categories = this.getCategories(userId);
      
      // Ensure the category has the correct user_id
      const categoryWithCorrectUserId = {
        ...category,
        userId: userId
      };

      categories.push(categoryWithCorrectUserId);
      this.saveCategories(categories, userId);
    } catch (error) {
      console.error('Error adding category to localStorage:', error);
    }
  }

  static updateCategory(categoryId: string, updatedCategory: Partial<Category>, userId: string): void {
    try {
      const categories = this.getCategories(userId);
      const catIndex = categories.findIndex(cat => cat.id === categoryId);
      if (catIndex !== -1) {
        categories[catIndex] = {
          ...categories[catIndex],
          ...updatedCategory,
          userId: userId
        };
        this.saveCategories(categories, userId);
      }
    } catch (error) {
      console.error('Error updating category in localStorage:', error);
    }
  }

  static deleteCategory(categoryId: string, userId: string): void {
    try {
      const categories = this.getCategories(userId);
      const filteredCategories = categories.filter(cat => cat.id !== categoryId);
      this.saveCategories(filteredCategories, userId);
    } catch (error) {
      console.error('Error deleting category from localStorage:', error);
    }
  }

  // User profile management
  static saveUserProfile(user: User, userId: string): void {
    try {
      const key = `${this.PREFIX}user_profile_${userId}`;
      localStorage.setItem(key, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user profile to localStorage:', error);
    }
  }

  static getUserProfile(userId: string): User | null {
    try {
      const key = `${this.PREFIX}user_profile_${userId}`;
      const userStr = localStorage.getItem(key);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting user profile from localStorage:', error);
      return null;
    }
  }

  static updateUserProfile(userId: string, profileUpdate: Partial<User>): void {
    try {
      const currentUser = this.getUserProfile(userId);
      if (currentUser) {
        const updatedUser = { ...currentUser, ...profileUpdate };
        this.saveUserProfile(updatedUser, userId);
        
        // Also update in sessionStorage for auth context consistency
        if (typeof window !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error updating user profile in localStorage:', error);
    }
  }

  // Utility methods
  static clearUserData(userId: string): void {
    try {
      // Clear all user-specific data
      const tasksKey = `${this.PREFIX}tasks_${userId}`;
      const conversationsKey = `${this.PREFIX}conversations_${userId}`;
      const categoriesKey = `${this.PREFIX}categories_${userId}`;
      const profileKey = `${this.PREFIX}user_profile_${userId}`;
      
      localStorage.removeItem(tasksKey);
      localStorage.removeItem(conversationsKey);
      localStorage.removeItem(categoriesKey);
      localStorage.removeItem(profileKey);

      // Clear all message storages for this user
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`${this.PREFIX}messages_`) && key.includes(`_${userId}`)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing user data from localStorage:', error);
    }
  }

  static getTotalTasksCount(userId: string): number {
    return this.getTasks(userId).length;
  }

  static getTaskStats(userId: string): {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
  } {
    const tasks = this.getTasks(userId);
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
    const lowPriority = tasks.filter(t => t.priority === 'low').length;

    return {
      total,
      completed,
      pending,
      inProgress,
      highPriority,
      mediumPriority,
      lowPriority
    };
  }

  static getAllUserData(userId: string): { 
    tasks: Task[], 
    conversations: Conversation[], 
    categories: Category[],
    profile: User | null, 
    stats: any 
  } {
    return {
      tasks: this.getTasks(userId),
      conversations: this.getConversations(userId),
      categories: this.getCategories(userId),
      profile: this.getUserProfile(userId),
      stats: this.getTaskStats(userId)
    };
  }
}

export default UserDataService;