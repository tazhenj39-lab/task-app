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
  
  const weeklyTasks = useMemo(() => {
    const weekDates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      weekDates.push(date);
    }

    const tasksByDate: Record<string, Task[]> = {};
    weekDates.forEach(date => {
      const dateStr = toYYYYMMDD(date);
      tasksByDate[dateStr] = tasks
        .filter(task => task.dueDate === dateStr)
        .sort((a, b) => a.time.localeCompare(b.time));
    });

    return {
      dates: weekDates,
      tasksByDate: tasksByDate,
    };
  }, [tasks, currentDate]);
  
  const { dates: weekDates, tasksByDate } = weeklyTasks;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 h-full flex flex-col">
      <div className="flex-shrink-0">
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
      </div>
      
      <div className="flex-grow overflow-y-auto -mr-4 pr-4">
        <div className="space-y-4 pb-4">
           {weekDates.map((date, index) => {
            const dateStr = toYYYYMMDD(date);
            const dailyTasks = tasksByDate[dateStr] || [];

            return (
              <React.Fragment key={dateStr}>
                {index === 1 && ( // Add divider before the second day
                  <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                          <div className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center">
                          <span className="bg-white px-3 text-sm font-medium text-slate-500">今後の予定</span>
                      </div>
                  </div>
                )}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <h4 className="font-semibold text-slate-700 mb-3 text-md">
                    {date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
                  </h4>
                  {dailyTasks.length > 0 ? (
                    <ul className="space-y-3">
                      {dailyTasks.map(task => (
                        <TaskItem key={task.id} task={task} onDelete={onDelete} onToggle={onToggle} />
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-4">タスクはありません。</p>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;