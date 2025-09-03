
import React from 'react';
import { View } from '../App';
import { CalendarIcon, ListBulletIcon, ChartBarIcon } from './IconComponents';

interface HeaderProps {
  view: View;
  setView: (view: View) => void;
}

const NavButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}> = ({ isActive, onClick, ariaLabel, children }) => {
  const baseClasses = "p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500";
  const activeClasses = "bg-indigo-100 text-indigo-600";
  const inactiveClasses = "text-slate-500 hover:bg-slate-200 hover:text-slate-800";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};


const Header: React.FC<HeaderProps> = ({ view, setView }) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 border-b border-slate-200/70">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-indigo-500" />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              タスク管理アプリ

            </h1>
          </div>
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            <NavButton 
              isActive={view === 'main'}
              onClick={() => setView('main')}
              ariaLabel="カレンダーとタスク入力画面"
            >
              <CalendarIcon className="w-6 h-6"/>
            </NavButton>
            <NavButton 
              isActive={view === 'today'}
              onClick={() => setView('today')}
              ariaLabel="スケジュール画面"
            >
              <ListBulletIcon className="w-6 h-6"/>
            </NavButton>
             <NavButton 
              isActive={view === 'report'}
              onClick={() => setView('report')}
              ariaLabel="経済レポート画面"
            >
              <ChartBarIcon className="w-6 h-6"/>
            </NavButton>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
