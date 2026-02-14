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

  // Helper method to get date-based key
  private static getDateKey(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  // Tasks management
  static saveTasks(tasks: Task[], userId: string): void {
    try {
      const dateKey = this.getDateKey();
      const key = `${this.PREFIX}tasks_${userId}_date_${dateKey}`;
      localStorage.setItem(key, JSON.stringify(tasks));

      // Also maintain a master list of all dates with tasks
      this.updateDateTracking(userId, 'tasks');

      // Dispatch a custom event to notify other components of the change
      window.dispatchEvent(new CustomEvent('userTaskUpdate', { detail: { userId, action: 'save' } }));
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  static getTasks(userId: string): Task[] {
    try {
      // Get all dates with tasks for this user
      const datesWithTasks = this.getDatesForUser(userId, 'tasks');
      
      // Retrieve tasks from all dates and combine them
      let allTasks: Task[] = [];
      for (const date of datesWithTasks) {
        const key = `${this.PREFIX}tasks_${userId}_date_${date}`;
        const tasksStr = localStorage.getItem(key);
        if (tasksStr) {
          const tasks = JSON.parse(tasksStr);
          allTasks = allTasks.concat(tasks);
        }
      }
      return allTasks;
    } catch (error) {
      console.error('Error getting tasks from localStorage:', error);
      return [];
    }
  }

  static addTask(task: Task, userId: string): void {
    try {
      const dateKey = this.getDateKey();
      const key = `${this.PREFIX}tasks_${userId}_date_${dateKey}`;
      
      // Get existing tasks for today
      let tasks: Task[] = [];
      const tasksStr = localStorage.getItem(key);
      if (tasksStr) {
        tasks = JSON.parse(tasksStr);
      }

      // Ensure the task has the correct user_id
      const taskWithCorrectUserId = {
        ...task,
        user_id: userId,
        userId: userId
      };

      tasks.push(taskWithCorrectUserId);
      localStorage.setItem(key, JSON.stringify(tasks));

      // Update date tracking
      this.updateDateTracking(userId, 'tasks');

      // Dispatch a custom event to notify other components of the change
      window.dispatchEvent(new CustomEvent('userTaskUpdate', { detail: { userId, action: 'add', taskId: task.id } }));
    } catch (error) {
      console.error('Error adding task to localStorage:', error);
    }
  }

  static updateTask(taskId: string, updatedTask: Partial<Task>, userId: string): void {
    try {
      // Find the task across all dates
      const datesWithTasks = this.getDatesForUser(userId, 'tasks');
      
      for (const date of datesWithTasks) {
        const key = `${this.PREFIX}tasks_${userId}_date_${date}`;
        const tasksStr = localStorage.getItem(key);
        
        if (tasksStr) {
          let tasks: Task[] = JSON.parse(tasksStr);
          const taskIndex = tasks.findIndex(task => task.id === taskId);
          
          if (taskIndex !== -1) {
            tasks[taskIndex] = {
              ...tasks[taskIndex],
              ...updatedTask,
              user_id: userId,
              userId: userId,
              updated_at: new Date().toISOString()
            };
            localStorage.setItem(key, JSON.stringify(tasks));

            // Dispatch a custom event to notify other components of the change
            window.dispatchEvent(new CustomEvent('userTaskUpdate', { detail: { userId, action: 'update', taskId } }));
            return; // Exit after updating
          }
        }
      }
    } catch (error) {
      console.error('Error updating task in localStorage:', error);
    }
  }

  static deleteTask(taskId: string, userId: string): void {
    try {
      // Find the task across all dates
      const datesWithTasks = this.getDatesForUser(userId, 'tasks');
      
      for (const date of datesWithTasks) {
        const key = `${this.PREFIX}tasks_${userId}_date_${date}`;
        const tasksStr = localStorage.getItem(key);
        
        if (tasksStr) {
          let tasks: Task[] = JSON.parse(tasksStr);
          const filteredTasks = tasks.filter(task => task.id !== taskId);
          
          if (filteredTasks.length !== tasks.length) {
            // Task was found and removed
            localStorage.setItem(key, JSON.stringify(filteredTasks));

            // Dispatch a custom event to notify other components of the change
            window.dispatchEvent(new CustomEvent('userTaskUpdate', { detail: { userId, action: 'delete', taskId } }));
            return; // Exit after deleting
          }
        }
      }
    } catch (error) {
      console.error('Error deleting task from localStorage:', error);
    }
  }

  static deleteAllTasks(userId: string): void {
    try {
      // Get all dates with tasks for this user and clear them
      const datesWithTasks = this.getDatesForUser(userId, 'tasks');
      
      for (const date of datesWithTasks) {
        const key = `${this.PREFIX}tasks_${userId}_date_${date}`;
        localStorage.removeItem(key);
      }

      // Clear date tracking for tasks
      localStorage.removeItem(`${this.PREFIX}dates_tasks_${userId}`);

      // Dispatch a custom event to notify other components of the change
      window.dispatchEvent(new CustomEvent('userTaskUpdate', { detail: { userId, action: 'deleteAll' } }));
    } catch (error) {
      console.error('Error deleting all tasks from localStorage:', error);
    }
  }

  // Conversations management
  static saveConversations(conversations: Conversation[], userId: string): void {
    try {
      const dateKey = this.getDateKey();
      const key = `${this.PREFIX}conversations_${userId}_date_${dateKey}`;
      localStorage.setItem(key, JSON.stringify(conversations));

      // Also maintain a master list of all dates with conversations
      this.updateDateTracking(userId, 'conversations');
    } catch (error) {
      console.error('Error saving conversations to localStorage:', error);
    }
  }

  static getConversations(userId: string): Conversation[] {
    try {
      // Get all dates with conversations for this user
      const datesWithConvs = this.getDatesForUser(userId, 'conversations');
      
      // Retrieve conversations from all dates and combine them
      let allConversations: Conversation[] = [];
      for (const date of datesWithConvs) {
        const key = `${this.PREFIX}conversations_${userId}_date_${date}`;
        const convsStr = localStorage.getItem(key);
        if (convsStr) {
          const conversations = JSON.parse(convsStr);
          allConversations = allConversations.concat(conversations);
        }
      }
      return allConversations;
    } catch (error) {
      console.error('Error getting conversations from localStorage:', error);
      return [];
    }
  }

  static addConversation(conversation: Conversation, userId: string): void {
    try {
      const dateKey = this.getDateKey();
      const key = `${this.PREFIX}conversations_${userId}_date_${dateKey}`;
      
      // Get existing conversations for today
      let conversations: Conversation[] = [];
      const convsStr = localStorage.getItem(key);
      if (convsStr) {
        conversations = JSON.parse(convsStr);
      }

      // Ensure the conversation has the correct user_id
      const conversationWithCorrectUserId = {
        ...conversation,
        userId: userId
      };

      conversations.push(conversationWithCorrectUserId);
      localStorage.setItem(key, JSON.stringify(conversations));

      // Update date tracking
      this.updateDateTracking(userId, 'conversations');
    } catch (error) {
      console.error('Error adding conversation to localStorage:', error);
    }
  }

  static updateConversation(conversationId: string, updatedConversation: Partial<Conversation>, userId: string): void {
    try {
      // Find the conversation across all dates
      const datesWithConvs = this.getDatesForUser(userId, 'conversations');
      
      for (const date of datesWithConvs) {
        const key = `${this.PREFIX}conversations_${userId}_date_${date}`;
        const convsStr = localStorage.getItem(key);
        
        if (convsStr) {
          let conversations: Conversation[] = JSON.parse(convsStr);
          const convIndex = conversations.findIndex(conv => conv.id === conversationId);
          
          if (convIndex !== -1) {
            conversations[convIndex] = {
              ...conversations[convIndex],
              ...updatedConversation,
              userId: userId
            };
            localStorage.setItem(key, JSON.stringify(conversations));
            return; // Exit after updating
          }
        }
      }
    } catch (error) {
      console.error('Error updating conversation in localStorage:', error);
    }
  }

  static deleteConversation(conversationId: string, userId: string): void {
    try {
      // Find the conversation across all dates
      const datesWithConvs = this.getDatesForUser(userId, 'conversations');
      
      for (const date of datesWithConvs) {
        const key = `${this.PREFIX}conversations_${userId}_date_${date}`;
        const convsStr = localStorage.getItem(key);
        
        if (convsStr) {
          let conversations: Conversation[] = JSON.parse(convsStr);
          const filteredConversations = conversations.filter(conv => conv.id !== conversationId);
          
          if (filteredConversations.length !== conversations.length) {
            // Conversation was found and removed
            localStorage.setItem(key, JSON.stringify(filteredConversations));
            return; // Exit after deleting
          }
        }
      }
    } catch (error) {
      console.error('Error deleting conversation from localStorage:', error);
    }
  }

  // Messages management
  static saveMessages(messages: Message[], conversationId: string, userId: string): void {
    try {
      const dateKey = this.getDateKey();
      const key = `${this.PREFIX}messages_${conversationId}_${userId}_date_${dateKey}`;
      localStorage.setItem(key, JSON.stringify(messages));

      // Also maintain a master list of all dates with messages for this conversation
      this.updateDateTracking(userId, `messages_${conversationId}`);
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  }

  static getMessages(conversationId: string, userId: string): Message[] {
    try {
      // Get all dates with messages for this conversation
      const datesWithMsgs = this.getDatesForUser(userId, `messages_${conversationId}`);
      
      // Retrieve messages from all dates and combine them
      let allMessages: Message[] = [];
      for (const date of datesWithMsgs) {
        const key = `${this.PREFIX}messages_${conversationId}_${userId}_date_${date}`;
        const messagesStr = localStorage.getItem(key);
        if (messagesStr) {
          const messages = JSON.parse(messagesStr);
          allMessages = allMessages.concat(messages);
        }
      }
      return allMessages;
    } catch (error) {
      console.error('Error getting messages from localStorage:', error);
      return [];
    }
  }

  static addMessage(message: Message, conversationId: string, userId: string): void {
    try {
      const dateKey = this.getDateKey();
      const key = `${this.PREFIX}messages_${conversationId}_${userId}_date_${dateKey}`;
      
      // Get existing messages for today
      let messages: Message[] = [];
      const messagesStr = localStorage.getItem(key);
      if (messagesStr) {
        messages = JSON.parse(messagesStr);
      }

      // Ensure the message has the correct user_id and conversation_id
      const messageWithCorrectIds = {
        ...message,
        userId: userId,
        conversationId: conversationId
      };

      messages.push(messageWithCorrectIds);
      localStorage.setItem(key, JSON.stringify(messages));

      // Update date tracking
      this.updateDateTracking(userId, `messages_${conversationId}`);
    } catch (error) {
      console.error('Error adding message to localStorage:', error);
    }
  }

  static updateMessage(messageId: string, updatedMessage: Partial<Message>, conversationId: string, userId: string): void {
    try {
      // Find the message across all dates
      const datesWithMsgs = this.getDatesForUser(userId, `messages_${conversationId}`);
      
      for (const date of datesWithMsgs) {
        const key = `${this.PREFIX}messages_${conversationId}_${userId}_date_${date}`;
        const messagesStr = localStorage.getItem(key);
        
        if (messagesStr) {
          let messages: Message[] = JSON.parse(messagesStr);
          const msgIndex = messages.findIndex(msg => msg.id === messageId);
          
          if (msgIndex !== -1) {
            messages[msgIndex] = {
              ...messages[msgIndex],
              ...updatedMessage
            };
            localStorage.setItem(key, JSON.stringify(messages));
            return; // Exit after updating
          }
        }
      }
    } catch (error) {
      console.error('Error updating message in localStorage:', error);
    }
  }

  static deleteMessage(messageId: string, conversationId: string, userId: string): void {
    try {
      // Find the message across all dates
      const datesWithMsgs = this.getDatesForUser(userId, `messages_${conversationId}`);
      
      for (const date of datesWithMsgs) {
        const key = `${this.PREFIX}messages_${conversationId}_${userId}_date_${date}`;
        const messagesStr = localStorage.getItem(key);
        
        if (messagesStr) {
          let messages: Message[] = JSON.parse(messagesStr);
          const filteredMessages = messages.filter(msg => msg.id !== messageId);
          
          if (filteredMessages.length !== messages.length) {
            // Message was found and removed
            localStorage.setItem(key, JSON.stringify(filteredMessages));
            return; // Exit after deleting
          }
        }
      }
    } catch (error) {
      console.error('Error deleting message from localStorage:', error);
    }
  }

  // Categories management
  static saveCategories(categories: Category[], userId: string): void {
    try {
      const dateKey = this.getDateKey();
      const key = `${this.PREFIX}categories_${userId}_date_${dateKey}`;
      localStorage.setItem(key, JSON.stringify(categories));

      // Also maintain a master list of all dates with categories
      this.updateDateTracking(userId, 'categories');
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  }

  static getCategories(userId: string): Category[] {
    try {
      // Get all dates with categories for this user
      const datesWithCats = this.getDatesForUser(userId, 'categories');
      
      // Retrieve categories from all dates and combine them
      let allCategories: Category[] = [];
      for (const date of datesWithCats) {
        const key = `${this.PREFIX}categories_${userId}_date_${date}`;
        const catsStr = localStorage.getItem(key);
        if (catsStr) {
          const categories = JSON.parse(catsStr);
          allCategories = allCategories.concat(categories);
        }
      }
      return allCategories;
    } catch (error) {
      console.error('Error getting categories from localStorage:', error);
      return [];
    }
  }

  static addCategory(category: Category, userId: string): void {
    try {
      const dateKey = this.getDateKey();
      const key = `${this.PREFIX}categories_${userId}_date_${dateKey}`;
      
      // Get existing categories for today
      let categories: Category[] = [];
      const catsStr = localStorage.getItem(key);
      if (catsStr) {
        categories = JSON.parse(catsStr);
      }

      // Ensure the category has the correct user_id
      const categoryWithCorrectUserId = {
        ...category,
        userId: userId
      };

      categories.push(categoryWithCorrectUserId);
      localStorage.setItem(key, JSON.stringify(categories));

      // Update date tracking
      this.updateDateTracking(userId, 'categories');
    } catch (error) {
      console.error('Error adding category to localStorage:', error);
    }
  }

  static updateCategory(categoryId: string, updatedCategory: Partial<Category>, userId: string): void {
    try {
      // Find the category across all dates
      const datesWithCats = this.getDatesForUser(userId, 'categories');
      
      for (const date of datesWithCats) {
        const key = `${this.PREFIX}categories_${userId}_date_${date}`;
        const catsStr = localStorage.getItem(key);
        
        if (catsStr) {
          let categories: Category[] = JSON.parse(catsStr);
          const catIndex = categories.findIndex(cat => cat.id === categoryId);
          
          if (catIndex !== -1) {
            categories[catIndex] = {
              ...categories[catIndex],
              ...updatedCategory,
              userId: userId
            };
            localStorage.setItem(key, JSON.stringify(categories));
            return; // Exit after updating
          }
        }
      }
    } catch (error) {
      console.error('Error updating category in localStorage:', error);
    }
  }

  static deleteCategory(categoryId: string, userId: string): void {
    try {
      // Find the category across all dates
      const datesWithCats = this.getDatesForUser(userId, 'categories');
      
      for (const date of datesWithCats) {
        const key = `${this.PREFIX}categories_${userId}_date_${date}`;
        const catsStr = localStorage.getItem(key);
        
        if (catsStr) {
          let categories: Category[] = JSON.parse(catsStr);
          const filteredCategories = categories.filter(cat => cat.id !== categoryId);
          
          if (filteredCategories.length !== categories.length) {
            // Category was found and removed
            localStorage.setItem(key, JSON.stringify(filteredCategories));
            return; // Exit after deleting
          }
        }
      }
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

  // Date tracking utilities
  private static updateDateTracking(userId: string, dataType: string): void {
    try {
      const dateKey = this.getDateKey();
      const trackingKey = `${this.PREFIX}dates_${dataType}_${userId}`;
      
      let dates: string[] = [];
      const datesStr = localStorage.getItem(trackingKey);
      if (datesStr) {
        dates = JSON.parse(datesStr);
      }
      
      // Add the current date if it's not already in the list
      if (!dates.includes(dateKey)) {
        dates.push(dateKey);
        localStorage.setItem(trackingKey, JSON.stringify(dates));
      }
    } catch (error) {
      console.error('Error updating date tracking:', error);
    }
  }

  private static getDatesForUser(userId: string, dataType: string): string[] {
    try {
      const trackingKey = `${this.PREFIX}dates_${dataType}_${userId}`;
      const datesStr = localStorage.getItem(trackingKey);
      return datesStr ? JSON.parse(datesStr) : [];
    } catch (error) {
      console.error('Error getting dates for user:', error);
      return [];
    }
  }

  // Utility methods
  static clearUserData(userId: string): void {
    try {
      // Get all date tracking keys for this user
      const dateTypes = ['tasks', 'conversations', 'categories'];
      for (const type of dateTypes) {
        const dates = this.getDatesForUser(userId, type);
        for (const date of dates) {
          const key = `${this.PREFIX}${type}_${userId}_date_${date}`;
          localStorage.removeItem(key);
        }
        // Remove the date tracking key itself
        localStorage.removeItem(`${this.PREFIX}dates_${type}_${userId}`);
      }

      // Handle messages separately (they have conversation IDs)
      const allConversations = this.getConversations(userId);
      for (const conversation of allConversations) {
        const msgDates = this.getDatesForUser(userId, `messages_${conversation.id}`);
        for (const date of msgDates) {
          const key = `${this.PREFIX}messages_${conversation.id}_${userId}_date_${date}`;
          localStorage.removeItem(key);
        }
        // Remove the date tracking key for this conversation
        localStorage.removeItem(`${this.PREFIX}dates_messages_${conversation.id}_${userId}`);
      }

      // Clear profile data
      const profileKey = `${this.PREFIX}user_profile_${userId}`;
      localStorage.removeItem(profileKey);
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