// frontend/src/types/task.ts
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string | null;
  completed_at?: string | null;
  user_id: string;
  category_id?: string | null;
  created_at: string;
  updated_at: string;
}