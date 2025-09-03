import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';
import TaskProgress from './TaskProgress';

interface TaskListProps {
  title: string;
  tasks: Task[];
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  emptyMessage?: string;
  completedTasksCount: number;
  totalTasksCount: number;
}

const TaskList: React.FC<TaskListProps> = ({ title, tasks, onDelete, onToggle, emptyMessage = "タスクはありません。", completedTasksCount, totalTasksCount }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">{title}</h3>
      
      {totalTasksCount > 0 && (
         <TaskProgress completed={completedTasksCount} total={totalTasksCount} />
      )}

      {tasks.length > 0 ? (
        <ul className="space-y-3 mt-4">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onDelete={onDelete}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : (
        <p className="text-slate-500 text-center py-4">{emptyMessage}</p>
      )}
    </div>
  );
};

export default TaskList;