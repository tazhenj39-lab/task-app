import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { TrashIcon, CheckIcon, ClockIcon, RepeatIcon } from './IconComponents';

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const tagColors: Record<string, string> = {
  '仕事': 'bg-blue-100 text-blue-800',
  'プライベート': 'bg-green-100 text-green-800',
  '学校': 'bg-yellow-100 text-yellow-800',
  'その他': 'bg-gray-100 text-gray-800',
};


const TaskItem: React.FC<TaskItemProps> = ({ task, onDelete, onToggle }) => {
  const { id, title, description, isCompleted, time, isRecurring, tag } = task;
  const [isGlowing, setIsGlowing] = useState(false);
  const prevIsCompleted = useRef(isCompleted);

  useEffect(() => {
    if (isCompleted && !prevIsCompleted.current) {
      setIsGlowing(true);
      const timer = setTimeout(() => setIsGlowing(false), 1500); 
      return () => clearTimeout(timer);
    }
    prevIsCompleted.current = isCompleted;
  }, [isCompleted]);

  const tagClass = tagColors[tag] || tagColors['その他'];

  return (
    <li className={`flex items-start gap-4 p-4 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-200 ${isGlowing ? 'glow-on-complete' : ''}`}>
      <button
        onClick={() => onToggle(id)}
        className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          isCompleted
            ? 'bg-fuchsia-600 border-fuchsia-600'
            : 'border-slate-300 hover:border-fuchsia-500'
        }`}
        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isCompleted && <CheckIcon className="w-4 h-4 text-white" />}
      </button>
      <div className="flex-grow">
        <div className="flex items-center gap-2">
            <p className={`font-semibold text-slate-800 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
              {title}
              {isRecurring && <span title="毎日やるタスク"><RepeatIcon className="inline-block w-4 h-4 ml-2 text-fuchsia-500" /></span>}
            </p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagClass}`}>
              {tag}
            </span>
        </div>
        <div className={`flex items-center flex-wrap gap-x-3 gap-y-1 text-sm mt-1 ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
            <div className="flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4"/>
                <span>{time}</span>
            </div>
            {description && (
                <>
                    <span className="text-slate-400">•</span>
                    <p className={`${isCompleted ? 'line-through' : ''}`}>
                        {description}
                    </p>
                </>
            )}
        </div>
      </div>
      <button
        onClick={() => onDelete(id)}
        className="flex-shrink-0 p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all duration-200"
        aria-label="Delete task"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </li>
  );
};

export default TaskItem;