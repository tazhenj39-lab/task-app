import React from 'react';
import { View } from '../App';
import { CalendarIcon, ChartBarIcon, TrophyIcon, ListBulletIcon } from './IconComponents';

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
  const baseClasses = "p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-fuchsia-500";
  const activeClasses = "bg-fuchsia-100 text-fuchsia-700";
  const inactiveClasses = "text-slate-400 hover:bg-slate-100 hover:text-slate-700";

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
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-fuchsia-600" />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              タスク管理アプリ
            </h1>
          </div>
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            <NavButton 
              isActive={view === 'calendar'}
              onClick={() => setView('calendar')}
              ariaLabel="カレンダー"
            >
              <CalendarIcon className="w-6 h-6"/>
            </NavButton>
            <NavButton 
              isActive={view === 'tasks'}
              onClick={() => setView('tasks')}
              ariaLabel="タスクリスト"
            >
              <ListBulletIcon className="w-6 h-6"/>
            </NavButton>
             <NavButton 
              isActive={view === 'report'}
              onClick={() => setView('report')}
              ariaLabel="ニュースと経済レポート"
            >
              <ChartBarIcon className="w-6 h-6"/>
            </NavButton>
            <NavButton 
              isActive={view === 'tennis'}
              onClick={() => setView('tennis')}
              ariaLabel="テニス大会結果"
            >
              <TrophyIcon className="w-6 h-6"/>
            </NavButton>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;