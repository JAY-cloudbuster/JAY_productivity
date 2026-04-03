import { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { formatDate, isOverdue, getTodayISO } from '../../utils/helpers';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineCheck, HiOutlineClock, HiOutlineClipboardList } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

const PRIORITY_CONFIG = {
  high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'High Priority' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Medium Priority' },
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Low Priority' },
};

export default function TaskManager() {
  const { tasks, loading, fetchTasks, createTask, toggleTask, deleteTask } = useTaskStore();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

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
      case 'today': return task.due_date === today && task.status !== 'completed';
      case 'upcoming': return task.due_date && task.due_date > today && task.status !== 'completed';
      case 'completed': return task.status === 'completed';
      default: return true;
    }
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-5">
          <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-1">To Do</p>
          <p className="text-4xl font-display font-bold text-white">{pendingCount}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-5 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-500/10 rounded-full blur-xl"></div>
          <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-1">Done</p>
          <p className="text-4xl font-display font-bold text-brand-400">{completedCount}</p>
        </motion.div>
      </div>

      {/* Input Form */}
      <motion.form 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        onSubmit={handleCreate} className="glass-panel p-2 flex flex-wrap md:flex-nowrap gap-2 items-center"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be accomplished?"
          className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none focus:ring-0 placeholder:text-surface-500 font-medium"
        />
        <div className="h-8 w-px bg-white/10 hidden md:block"></div>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-transparent text-sm font-medium text-surface-300 border-none focus:ring-0 cursor-pointer px-4 outline-none appearance-none"
        >
          <option value="high" className="bg-surface-900">High</option>
          <option value="medium" className="bg-surface-900">Medium</option>
          <option value="low" className="bg-surface-900">Low</option>
        </select>
        <div className="h-8 w-px bg-white/10 hidden md:block"></div>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-transparent text-sm font-medium text-surface-300 border-none focus:ring-0 cursor-pointer px-4 outline-none"
        />
        <button type="submit" disabled={!title.trim()} className="btn-neo-primary ml-auto md:ml-2">
          <HiOutlinePlus className="w-5 h-5" />
        </button>
      </motion.form>

      {/* Filters & List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
        <div className="flex gap-2 bg-surface-900/40 p-1.5 rounded-2xl w-fit backdrop-blur-xl border border-white/5">
          {['all', 'today', 'upcoming', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-300 relative
                ${filter === f ? 'text-white shadow-lg' : 'text-surface-400 hover:text-white'}`}
            >
              {filter === f && (
                <motion.div layoutId="taskTab" className="absolute inset-0 bg-white/10 rounded-xl border border-white/10" />
              )}
              <span className="relative z-10">{f}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>
        ) : filteredTasks.length === 0 ? (
          <div className="glass-panel p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center mb-5 shadow-glow-brand/20">
              <HiOutlineClipboardList className="w-10 h-10 text-brand-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2">You're all caught up!</h3>
            <p className="text-surface-400">No tasks found in this view. Enjoy your free time or add a new goal.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredTasks.map((task, idx) => {
                const overdue = task.status !== 'completed' && isOverdue(task.due_date);
                const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                const isCompleted = task.status === 'completed';

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0, margin: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`group interactive-card p-4 flex items-center gap-4
                      ${isCompleted ? 'opacity-50 hover:opacity-100 grayscale-[0.5]' : ''}
                      ${overdue ? '!border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : ''}`}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`relative w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                        ${isCompleted ? 'bg-brand-500 text-surface-950 scale-110 shadow-glow-brand' : 'border-2 border-surface-600 hover:border-brand-400'}`}
                    >
                      {isCompleted && <HiOutlineCheck className="w-4 h-4 font-bold" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-[15px] truncate transition-colors duration-300
                        ${isCompleted ? 'line-through text-surface-400' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 opacity-80">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border ${prio.bg} ${prio.text} ${prio.border}`}>
                          {task.priority}
                        </span>
                        {task.due_date && (
                          <span className={`flex items-center gap-1.5 text-xs font-semibold ${overdue ? 'text-red-400' : 'text-surface-400'}`}>
                            <HiOutlineClock className="w-3.5 h-3.5" />
                            {formatDate(task.due_date)} {overdue && '(Overdue)'}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 rounded-xl text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
