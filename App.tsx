
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Task } from './types';
import Calendar from './components/Calendar';
import TaskForm from './components/TaskForm';
import ScheduleView from './components/ScheduleView';
import Header from './components/Header';
import EconomicReport from './components/EconomicReport';

const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export type View = 'main' | 'today' | 'report';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [monthlyGoals, setMonthlyGoals] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<View>('main');
  const [notifiedTaskIds, setNotifiedTaskIds] = useState<Set<string>>(new Set());

  // For swipe gesture
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        // Support old tasks that don't have recurring property.
        const parsedTasks: Task[] = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          time: task.time || '09:00',
          isRecurring: task.isRecurring || false, 
        }));
        setTasks(parsedTasks);
      }
      const storedGoals = localStorage.getItem('monthlyGoals');
      if (storedGoals) {
        setMonthlyGoals(JSON.parse(storedGoals));
      }
      const storedNotifiedIds = localStorage.getItem('notifiedTaskIds');
      if (storedNotifiedIds) {
        setNotifiedTaskIds(new Set(JSON.parse(storedNotifiedIds)));
      }
    } catch (error) {
      console.error("Failed to load data from local storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('monthlyGoals', JSON.stringify(monthlyGoals));
      localStorage.setItem('notifiedTaskIds', JSON.stringify(Array.from(notifiedTaskIds)));
    } catch (error) {
      console.error("Failed to save data to local storage", error);
    }
  }, [tasks, monthlyGoals, notifiedTaskIds]);

  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Notification permission granted.');
          } else {
            console.log('Notification permission denied.');
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    const checkTasksAndNotify = () => {
      if (Notification.permission !== 'granted') {
        return;
      }

      const now = new Date();
      const thirtyMinutes = 30 * 60 * 1000;
      
      tasks.forEach(task => {
        if (task.isCompleted || notifiedTaskIds.has(task.id)) {
          return;
        }

        const dueDate = new Date(`${task.dueDate}T${task.time}`);
        const timeUntilDue = dueDate.getTime() - now.getTime();

        if (timeUntilDue > 0 && timeUntilDue <= thirtyMinutes) {
          new Notification('タスクリマインダー', {
            body: `「${task.title}」の時間が30分後に迫っています。`,
            icon: '/vite.svg',
          });
          
          setNotifiedTaskIds(prevIds => new Set(prevIds).add(task.id));
        }
      });
    };

    const intervalId = setInterval(checkTasksAndNotify, 60 * 1000);
    checkTasksAndNotify();

    return () => clearInterval(intervalId);
  }, [tasks, notifiedTaskIds]);


  const handleAddTask = useCallback((taskData: Omit<Task, 'id' | 'isCompleted'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      isCompleted: false,
    };
    setTasks(prevTasks => [...prevTasks, newTask].sort((a, b) => {
      const aDateTime = `${a.dueDate}T${a.time}`;
      const bDateTime = `${b.dueDate}T${b.time}`;
      return aDateTime.localeCompare(bDateTime);
    }));
  }, []);

  const handleDeleteTask = useCallback((id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    setNotifiedTaskIds(prevIds => {
      const newIds = new Set(prevIds);
      newIds.delete(id);
      return newIds;
    });
  }, []);

  const handleToggleTask = useCallback((id:string) => {
    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      const taskIndex = newTasks.findIndex(t => t.id === id);
      if (taskIndex === -1) return prevTasks;

      const originalTask = newTasks[taskIndex];
      const updatedTask = { ...originalTask, isCompleted: !originalTask.isCompleted };
      newTasks[taskIndex] = updatedTask;

      // If a recurring task was just completed
      if (updatedTask.isRecurring && updatedTask.isCompleted) {
        const [year, month, day] = updatedTask.dueDate.split('-').map(Number);
        // JS Date constructor month is 0-indexed
        const tomorrow = new Date(year, month - 1, day + 1);
        const newDueDate = toYYYYMMDD(tomorrow);

        const recurringTask: Task = {
          id: crypto.randomUUID(),
          title: updatedTask.title,
          description: updatedTask.description,
          dueDate: newDueDate,
          time: updatedTask.time,
          isCompleted: false,
          isRecurring: true,
          // FIX: Add missing 'tag' property.
          tag: updatedTask.tag,
        };
        newTasks.push(recurringTask);
      }
      
      newTasks.sort((a, b) => {
          const aDateTime = `${a.dueDate}T${a.time}`;
          const bDateTime = `${b.dueDate}T${b.time}`;
          return aDateTime.localeCompare(bDateTime);
      });

      return newTasks;
    });
  }, []);

  const handleSetMonthlyGoal = useCallback((yearMonth: string, text: string) => {
    setMonthlyGoals(prevGoals => ({
      ...prevGoals,
      [yearMonth]: text,
    }));
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX; // Initialize endX
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    if (swipeDistance > 50) { // Swiped left
      if (view === 'main') setView('today');
      else if (view === 'today') setView('report');
    } else if (swipeDistance < -50) { // Swiped right
      if (view === 'report') setView('today');
      else if (view === 'today') setView('main');
    }
    // Reset refs
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const stampedDates = useMemo(() => {
    const tasksByDate: Record<string, { total: number; completed: number }> = {};

    tasks.filter(t => !t.isRecurring).forEach(task => {
      const date = task.dueDate;
      if (!tasksByDate[date]) {
        tasksByDate[date] = { total: 0, completed: 0 };
      }
      tasksByDate[date].total++;
      if (task.isCompleted) {
        tasksByDate[date].completed++;
      }
    });

    const completedDates = new Set<string>();
    for (const date in tasksByDate) {
      if (tasksByDate[date].total > 0 && tasksByDate[date].total === tasksByDate[date].completed) {
        completedDates.add(date);
      }
    }
    return completedDates;
  }, [tasks]);

  const getTransformValue = (currentView: View) => {
    switch (currentView) {
      case 'main':
        return '0%';
      case 'today':
        return '-33.333%';
      case 'report':
        return '-66.667%';
      default:
        return '0%';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <Header view={view} setView={setView} />
      <main 
        className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          // 変更点: transition-transformの速度
          className="flex w-[300%] h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(${getTransformValue(view)})` }}
        >
          <div className="w-1/3 px-2 lg:px-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <Calendar 
                selectedDate={selectedDate} 
                onDateChange={setSelectedDate} 
                tasks={tasks}
                monthlyGoals={monthlyGoals}
                onSetGoal={handleSetMonthlyGoal}
                stampedDates={stampedDates}
              />
              <TaskForm onAddTask={handleAddTask} selectedDate={selectedDate} />
            </div>
          </div>
          <div className="w-1/3 px-2 lg:px-4">
            <ScheduleView
              tasks={tasks}
              onDelete={handleDeleteTask}
              onToggle={handleToggleTask}
            />
          </div>
          <div className="w-1/3 px-2 lg:px-4">
            <EconomicReport />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
