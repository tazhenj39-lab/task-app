
export type TaskTag = '仕事' | 'プライベート' | '学校' | 'その他';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  time: string; // HH:MM
  isCompleted: boolean;
  isRecurring: boolean;
  tag: TaskTag;
}