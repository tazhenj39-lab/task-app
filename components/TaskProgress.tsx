
import React from 'react';

interface TaskProgressProps {
  completed: number;
  total: number;
}

const TaskProgress: React.FC<TaskProgressProps> = ({ completed, total }) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const allTasksCompleted = total > 0 && completed === total;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-sm font-semibold text-slate-600">今日の進捗</h4>
        <span className="text-sm font-medium text-slate-500">{completed} / {total}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
            allTasksCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {allTasksCompleted && (
        <p className="text-center text-sm text-emerald-600 font-semibold mt-3">
          素晴らしい！今日のタスクはすべて完了です！🎉
        </p>
      )}
    </div>
  );
};

export default TaskProgress;
