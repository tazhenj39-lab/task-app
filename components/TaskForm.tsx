import React, { useState, useEffect } from 'react';
import { Task, TaskTag } from '../types';
import { PlusIcon } from './IconComponents';

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
  selectedDate: Date;
}

const toYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask, selectedDate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(toYYYYMMDD(selectedDate));
  const [time, setTime] = useState('09:00');
  const [isRecurring, setIsRecurring] = useState(false);
  const [tag, setTag] = useState<TaskTag>('その他');

  useEffect(() => {
    setDueDate(toYYYYMMDD(selectedDate));
  }, [selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('タイトルを入力してください。');
      return;
    }
    onAddTask({ title, description, dueDate, time, isRecurring, tag });
    setTitle('');
    setDescription('');
    setTag('その他');
    setIsRecurring(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-4">タスクを追加</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-600 mb-1">
            タイトル
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition placeholder:text-slate-400"
            placeholder="例: プロジェクトのレポートを提出"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-1">
            詳細 (任意)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition placeholder:text-slate-400"
            placeholder="例: 最終稿を確認し、添付ファイルを準備"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-600 mb-1">
              期日
            </label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition"
              required
            />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-slate-600 mb-1">
              時間
            </label>
            <input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="tag" className="block text-sm font-medium text-slate-600 mb-1">
            タグ
          </label>
          <select
            id="tag"
            value={tag}
            onChange={(e) => setTag(e.target.value as TaskTag)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition"
          >
            <option value="その他">その他</option>
            <option value="仕事">仕事</option>
            <option value="プライベート">プライベート</option>
            <option value="学校">学校</option>
          </select>
        </div>
         <div className="flex items-center">
            <input
              id="isRecurring"
              name="isRecurring"
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-fuchsia-600 focus:ring-fuchsia-500"
            />
            <label htmlFor="isRecurring" className="ml-2 block text-sm text-slate-600">
              毎日やるタスク
            </label>
          </div>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-fuchsia-600 text-white font-semibold py-2.5 px-4 rounded-md hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-fuchsia-500 transition-transform transform active:scale-95"
        >
          <PlusIcon className="w-5 h-5" />
          <span>タスクを追加</span>
        </button>
      </form>
    </div>
  );
};

export default TaskForm;