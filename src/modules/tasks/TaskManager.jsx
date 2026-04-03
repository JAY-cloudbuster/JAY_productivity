import { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { formatDate, isOverdue, getTodayISO } from '../../utils/helpers';
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineClipboardList,
} from 'react-icons/hi';

const PRIORITY_CONFIG = {
  high: { class: 'badge-high', label: 'High' },
  medium: { class: 'badge-medium', label: 'Medium' },
  low: { class: 'badge-low', label: 'Low' },
};

export default function TaskManager() {
  const { tasks, loading, fetchTasks, createTask, toggleTask, deleteTask } = useTaskStore();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask(title.trim(), priority, dueDate || null);
    setTitle('');
    setDueDate('');
  };

  const today = getTodayISO();

  const filteredTasks = tasks.filter((task) => {
    switch (filter) {
      case 'today':
        return task.due_date === today && task.status !== 'completed';
      case 'upcoming':
        return task.due_date && task.due_date > today && task.status !== 'completed';
      case 'completed':
        return task.status === 'completed';
      default:
        return true;
    }
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Task Manager</h2>
          <p className="text-surface-500 mt-1 text-sm">
            {pendingCount} pending · {completedCount} completed
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="glass-card p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-surface-400 mb-1.5 block">Task Title</label>
            <input
              id="task-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="input-field"
            />
          </div>
          <div className="w-32">
            <label className="text-xs font-medium text-surface-400 mb-1.5 block">Priority</label>
            <select
              id="task-priority-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="input-field"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="w-44">
            <label className="text-xs font-medium text-surface-400 mb-1.5 block">Due Date</label>
            <input
              id="task-due-date-input"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-field"
            />
          </div>
          <button id="task-create-btn" type="submit" className="btn-primary flex items-center gap-2">
            <HiOutlinePlus className="w-4 h-4" />
            Add
          </button>
        </div>
      </form>

      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'today', label: 'Today' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Completed' },
        ].map((f) => (
          <button
            key={f.id}
            id={`task-filter-${f.id}`}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${filter === f.id
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                : 'text-surface-500 hover:text-white hover:bg-white/[0.06]'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
            <HiOutlineClipboardList className="w-8 h-8 text-brand-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No tasks found</h3>
          <p className="text-surface-500 text-sm">
            {filter === 'all' ? 'Add your first task above' : `No ${filter} tasks`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const overdue = task.status !== 'completed' && isOverdue(task.due_date);
            const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

            return (
              <div
                key={task.id}
                className={`glass-card-hover p-4 flex items-center gap-4 group
                  ${task.status === 'completed' ? 'opacity-60' : ''}
                  ${overdue ? 'border-red-500/20' : ''}`}
              >
                <button
                  id={`task-toggle-${task.id}`}
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200
                    ${task.status === 'completed'
                      ? 'bg-emerald-500 text-white'
                      : 'border-2 border-surface-600 hover:border-brand-400'
                    }`}
                >
                  {task.status === 'completed' && <HiOutlineCheck className="w-3.5 h-3.5" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-surface-500' : 'text-white'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={prio.class}>{prio.label}</span>
                    {task.due_date && (
                      <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-400' : 'text-surface-500'}`}>
                        <HiOutlineClock className="w-3 h-3" />
                        {formatDate(task.due_date)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  id={`task-delete-${task.id}`}
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 rounded-lg text-surface-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
