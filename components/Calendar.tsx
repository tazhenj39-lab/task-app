import React, { useState, useMemo, useEffect } from 'react';
import { Task, TaskTag } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, TrophyIcon, PencilIcon, CheckIcon, StarIcon } from './IconComponents';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  tasks: Task[];
  monthlyGoals: Record<string, string>;
  onSetGoal: (yearMonth: string, text: string) => void;
  stampedDates: Set<string>;
}

const MonthlyGoal: React.FC<{
  currentMonth: Date;
  goal: string;
  onSetGoal: (yearMonth: string, text: string) => void;
}> = ({ currentMonth, goal, onSetGoal }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(goal);

  useEffect(() => {
    setInputValue(goal);
    setIsEditing(false);
  }, [goal, currentMonth]);
  
  const yearMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;

  const handleSave = () => {
    onSetGoal(yearMonth, inputValue);
    setIsEditing(false);
  };

  return (
    <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 変更点: アイコンの色をfuchsia-500に変更 */}
          <TrophyIcon className="w-5 h-5 text-fuchsia-500" />
          <h4 className="font-semibold text-slate-800">今月自分がなりたい姿</h4>
        </div>
        {isEditing ? (
          <button onClick={handleSave} className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-500 rounded-full transition-colors">
             <CheckIcon className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors">
            <PencilIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="mt-2">
        {isEditing ? (
           <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full text-sm px-2 py-1 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder:text-slate-400"
            placeholder="目標を設定しましょう"
            autoFocus
          />
        ) : (
          <p className="text-sm text-slate-600 pl-1 min-h-[26px]">
            {goal || <span className="text-slate-500 italic">目標を設定しましょう</span>}
          </p>
        )}
      </div>
    </div>
  );
};

const tagCalendarColors: Record<TaskTag, string> = {
  '仕事': 'bg-blue-100 text-blue-800',
  'プライベート': 'bg-green-100 text-green-800',
  '学校': 'bg-yellow-100 text-yellow-800',
  'その他': 'bg-gray-100 text-gray-800',
};


const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, tasks, monthlyGoals, onSetGoal, stampedDates }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const toYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const tasksByDate = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (!task.isRecurring) {
        const date = task.dueDate;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(task);
      }
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);


  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const todayStr = toYYYYMMDD(new Date());
  const selectedDateStr = toYYYYMMDD(selectedDate);

  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border-b border-r border-slate-100"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const dateStr = toYYYYMMDD(date);
      const isSelected = dateStr === selectedDateStr;
      const isToday = dateStr === todayStr;
      const isStamped = stampedDates.has(dateStr);
      const dailyTasks = tasksByDate[dateStr] || [];

      let dayClasses = "h-24 flex flex-col p-1.5 cursor-pointer relative transition-colors duration-200 border-b border-r border-slate-100";
      dayClasses += isSelected ? " bg-fuchsia-50" : " bg-white hover:bg-slate-50";

      let dayNumberClasses = "w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium";
      if (isSelected) {
        // 変更点: 選択された日付の色
        dayNumberClasses += " bg-fuchsia-600 text-white";
      } else if (isToday) {
        // 変更点: 今日の日付の色
        dayNumberClasses += " bg-fuchsia-100 text-fuchsia-600";
      } else {
        dayNumberClasses += " text-slate-600";
      }
      
      const dayOfWeek = (firstDay + day - 1) % 7;
      if (dayOfWeek === 0) dayClasses += " border-l border-slate-100"; // Sunday

      days.push(
        <div key={day} className={dayClasses} onClick={() => onDateChange(date)}>
          {isStamped && (
            // 変更点: 達成スタンプの色
            <StarIcon className="absolute top-1.5 right-1.5 w-5 h-5 text-amber-400" />
          )}
          <div className={dayNumberClasses}>{day}</div>
          <div className="mt-1 overflow-hidden flex-grow space-y-0.5">
            {dailyTasks.slice(0, 2).map(task => {
              const colorClass = tagCalendarColors[task.tag] || tagCalendarColors['その他'];
              return (
                <div key={task.id} className={`text-xs truncate px-1.5 py-0.5 rounded ${colorClass} font-medium`}>
                  {task.title}
                </div>
              );
            })}
            {dailyTasks.length > 2 && (
              <div className="text-xs text-slate-500 px-1 py-0.5 font-medium">
                ...あと{dailyTasks.length - 2}件
              </div>
            )}
          </div>
        </div>
      );
    }
    return days;
  };

  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const yearMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  const currentGoal = monthlyGoals[yearMonth] || '';


  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-slate-500" />
        </button>
        <h2 className="font-bold text-lg text-slate-800">
          {currentMonth.getFullYear()}年 {currentMonth.toLocaleString('ja-JP', { month: 'long' })}
        </h2>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronRightIcon className="w-6 h-6 text-slate-500" />
        </button>
      </div>

      <MonthlyGoal 
        currentMonth={currentMonth}
        goal={currentGoal}
        onSetGoal={onSetGoal}
      />
      
      <div className="grid grid-cols-7 text-center text-sm text-slate-500 font-semibold mb-2">
        {weekdays.map((day, i) => <div key={day} className={`${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''}`}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 bg-slate-100 border-t border-l border-slate-100 rounded-lg overflow-hidden">
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;