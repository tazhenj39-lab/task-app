import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { TrashIcon, CheckIcon, ClockIcon, RepeatIcon } from './IconComponents';

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDelete, onToggle }) => {
  const { id, title, description, isCompleted, time, isRecurring } = task;
  const [isGlowing, setIsGlowing] = useState(false);
  const prevIsCompleted = useRef(isCompleted);

  useEffect(() => {
    // Check if the task was just completed (i.e., changed from false to true)
    if (isCompleted && !prevIsCompleted.current) {
      setIsGlowing(true);
      const timer = setTimeout(() => setIsGlowing(false), 1500); // Duration matches animation
      
      // Cleanup timer on component unmount or if isCompleted changes again
      return () => clearTimeout(timer);
    }
    // Update the ref to the current isCompleted value for the next render
    prevIsCompleted.current = isCompleted;
  }, [isCompleted]);


  return (
    <li className={`flex items-start gap-4 p-4 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-200 ${isGlowing ? 'glow-on-complete' : ''}`}>
      <button
        onClick={() => onToggle(id)}
        className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          isCompleted
            // 変更点: 完了時のボタンの色
            ? 'bg-fuchsia-600 border-fuchsia-600'
            : 'border-slate-300 hover:border-fuchsia-500'
        }`}
        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isCompleted && <CheckIcon className="w-4 h-4 text-white" />}
      </button>
      <div className="flex-grow">
        <p className={`font-semibold text-slate-800 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
          {title}
          {/* Fix: Wrap RepeatIcon in a span with a title attribute to fix a TypeScript error and provide a tooltip for accessibility. */}
          {/* 変更点: 繰り返しアイコンの色 */}
          {isRecurring && <span title="毎日やるタスク"><RepeatIcon className="inline-block w-4 h-4 ml-2 text-fuchsia-500" /></span>}
        </p>
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