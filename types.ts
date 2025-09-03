
export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  time: string; // HH:MM
  isCompleted: boolean;
  isRecurring: boolean;
}