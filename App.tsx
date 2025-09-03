import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Task } from './types';
import Calendar from './components/Calendar';
import TaskForm from './components/TaskForm';
import ScheduleView from './components/ScheduleView';
import Header from './components/Header';
import EconomicReport from './components/EconomicReport';
import TennisResults from './components/TennisResults';
import TaskList from './components/TaskList';

const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export type View = 'main' | 'today' | 'report' | 'tennis';

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
        const parsedTasks: Task[] = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          time: task.time || '09:00',
          isRecurring: task.isRecurring || false, 
          tag: task.tag || 'その他',
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
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    const checkTasks = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (!task.isCompleted && !notifiedTaskIds.has(task.id)) {
          const taskDateTime = new Date(`${task.dueDate}T${task.time}`);
          const diff = taskDateTime.getTime() - now.getTime();
          const thirtyMinutes = 30 * 60 * 1000;

          if (diff > 0 && diff <= thirtyMinutes) {
            new Notification('タスクリマインダー', {
              body: `「${task.title}」の時間が30分後に迫っています。`,
            });
            setNotifiedTaskIds(prev => new Set(prev).add(task.id));
          }
        }
      });
    };

    const intervalId = setInterval(checkTasks, 60 * 1000); // Check every minute
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
     setNotifiedTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
    });
  }, []);

  const handleToggleTask = useCallback((id:string) => {
    setTasks(prevTasks => {
      const newTasks = [...prevTasks];
      const taskIndex = newTasks.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        const task = { ...newTasks[taskIndex] };
        task.isCompleted = !task.isCompleted;

        if (task.isCompleted && task.isRecurring) {
          const tomorrow = new Date(task.dueDate);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const nextDueDate = toYYYYMMDD(tomorrow);
          
          const nextRecurringTask: Task = {
            ...task,
            id: crypto.randomUUID(),
            dueDate: nextDueDate,
            isCompleted: false,
          };
          newTasks.push(nextRecurringTask);
        }
        
        newTasks[taskIndex] = task;

        return newTasks.sort((a, b) => {
          const aDateTime = `${a.dueDate}T${a.time}`;
          const bDateTime = `${b.dueDate}T${b.time}`;
          return aDateTime.localeCompare(bDateTime);
        });
      }
      return prevTasks;
    });
  }, []);

  const handleSetGoal = useCallback((yearMonth: string, text: string) => {
    setMonthlyGoals(prev => ({...prev, [yearMonth]: text}));
  }, []);

  const selectedDateStr = toYYYYMMDD(selectedDate);
  const todaysTasks = useMemo(() => tasks.filter(task => task.dueDate === selectedDateStr && !task.isCompleted), [tasks, selectedDateStr]);
  const completedTasks = useMemo(() => tasks.filter(task => task.dueDate === selectedDateStr && task.isCompleted), [tasks, selectedDateStr]);
  const allTodaysTasksCount = todaysTasks.length + completedTasks.length;

  const viewOrder: View[] = ['main', 'today', 'report', 'tennis'];
  const currentViewIndex = viewOrder.indexOf(view);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 75) { // Swiped left
      const nextIndex = Math.min(viewOrder.length - 1, currentViewIndex + 1);
      setView(viewOrder[nextIndex]);
    }
  
    if (touchStartX.current - touchEndX.current < -75) { // Swiped right
      const prevIndex = Math.max(0, currentViewIndex - 1);
      setView(viewOrder[prevIndex]);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const stampedDates = useMemo(() => {
    const dates = new Set<string>();
    tasks.forEach(task => {
        if (task.isCompleted) {
            dates.add(task.dueDate);
        }
    });
    return dates;
  }, [tasks]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header view={view} setView={setView} />
      <main 
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentViewIndex * 100}%)`, width: '400%' }}
        >
          <div className="w-1/4 px-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <Calendar 
                  selectedDate={selectedDate} 
                  onDateChange={setSelectedDate} 
                  tasks={tasks}
                  monthlyGoals={monthlyGoals}
                  onSetGoal={handleSetGoal}
                  stampedDates={stampedDates}
                />
              </div>
              <div className="space-y-8">
                <TaskForm onAddTask={handleAddTask} selectedDate={selectedDate} />
                <TaskList
                  title={`${selectedDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })} のタスク`}
                  tasks={[...todaysTasks, ...completedTasks]}
                  onDelete={handleDeleteTask}
                  onToggle={handleToggleTask}
                  completedTasksCount={completedTasks.length}
                  totalTasksCount={allTodaysTasksCount}
                />
              </div>
            </div>
          </div>

          <div className="w-1/4 px-2 h-[calc(100vh-120px)]">
            <ScheduleView tasks={tasks} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
          </div>

          <div className="w-1/4 px-2">
            <EconomicReport />
          </div>

          <div className="w-1/4 px-2">
            <TennisResults />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
