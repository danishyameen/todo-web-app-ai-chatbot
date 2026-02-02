// frontend/types/task.ts
// Common task interface to ensure consistency across the application

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string | null;
  category?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  user_id: string;
  category_id?: string | null;
  // Aliases for compatibility
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
  userId?: string;
  categoryId?: string | null;
  // Legacy field for compatibility
  _id?: string;
}