import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

interface ScheduleViewProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ScheduleView: React.FC<ScheduleViewProps> = ({ tasks, onToggle, onDelete }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };
  
  const currentDateStr = toYYYYMMDD(currentDate);
  const tasksForDay = useMemo(() => {
    return tasks
      .filter(task => task.dueDate === currentDateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [tasks, currentDateStr]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
        <button onClick={handlePrevDay} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="前の日">
          <ChevronLeftIcon className="w-6 h-6 text-slate-500" />
        </button>
        <h3 className="text-lg font-bold text-slate-800 text-center">
          {currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
        </h3>
        <button onClick={handleNextDay} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="次の日">
          <ChevronRightIcon className="w-6 h-6 text-slate-500" />
        </button>
      </div>
      
      {tasksForDay.length > 0 ? (
        <ul className="space-y-3 mt-4">
          {tasksForDay.map(task => (
            <TaskItem key={task.id} task={task} onDelete={onDelete} onToggle={onToggle} />
          ))}
        </ul>
      ) : (
        <p className="text-slate-500 text-center py-8">この日のタスクはありません。</p>
      )}
    </div>
  );
};

export default ScheduleView;
