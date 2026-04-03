import { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useHabitStore } from '../../store/habitStore';
import { getTodayISO, calculateStreak } from '../../utils/helpers';
import { HiOutlineArrowRight, HiOutlineSun, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';

export default function OverviewDashboard() {
  const { tasks, fetchTasks } = useTaskStore();
  const { habits, logs, fetchHabits } = useHabitStore();
  const setActiveTab = useAppStore(s => s.setActiveTab);

  useEffect(() => {
    fetchTasks();
    fetchHabits();
  }, [fetchTasks, fetchHabits]);

  const today = getTodayISO();
  
  // Calculate today's stats
  const todayTasks = tasks.filter(t => t.due_date === today);
  const pendingToday = todayTasks.filter(t => t.status === 'pending');
  const overdueTasks = tasks.filter(t => t.due_date && t.due_date < today && t.status === 'pending');
  
  const habitsToComplete = habits.filter(h => h.frequency === 'daily' && !logs.some(l => l.habit_id === h.id && l.date === today));
  const completedHabits = habits.filter(h => logs.some(l => l.habit_id === h.id && l.date === today));

  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="glass-panel p-8 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-brand-500/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <HiOutlineSun className="w-6 h-6 text-yellow-400" />
              <h2 className="text-3xl font-display font-bold text-white">{greeting}!</h2>
            </div>
            <p className="text-surface-300 max-w-lg leading-relaxed">
              You have <strong className="text-white">{pendingToday.length}</strong> tasks due today and <strong className="text-white">{habitsToComplete.length}</strong> daily habits remaining. Let's make it a great day.
            </p>
          </div>
          
          <button 
            onClick={() => setActiveTab('focus')}
            className="btn-neo-primary shrink-0 flex items-center gap-2 group"
          >
            Start Focus Session
            <HiOutlineArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Urgent/Today Tasks block */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-400" />
              Priority Tasks
            </h3>
            <button onClick={() => setActiveTab('tasks')} className="text-xs font-semibold text-brand-400 hover:text-brand-300">View All</button>
          </div>
          
          <div className="space-y-3">
            {[...overdueTasks, ...pendingToday].slice(0, 5).map(task => {
              const isOverdue = task.due_date < today;
              return (
                <div key={task.id} className="interactive-card p-4 flex flex-col gap-2 border-l-4" style={{ borderLeftColor: isOverdue ? '#ef4444' : '#14b8a6' }}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white truncate max-w-[80%]">{task.title}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${isOverdue ? 'bg-red-500/20 text-red-400' : 'bg-surface-800 text-surface-300'}`}>
                      {isOverdue ? 'Overdue' : 'Today'}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {[...overdueTasks, ...pendingToday].length === 0 && (
              <div className="glass-panel p-8 text-center flex flex-col items-center justify-center border-dashed">
                <HiOutlineCheckCircle className="w-10 h-10 text-brand-500/50 mb-3" />
                <p className="text-sm font-semibold text-surface-200">No pressing tasks!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Habit Quick View */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Daily Habits
            </h3>
            <button onClick={() => setActiveTab('habits')} className="text-xs font-semibold text-purple-400 hover:text-purple-300">Manage</button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Split habits into to-do and done for better psychology */}
            {habitsToComplete.map(habit => (
              <div key={habit.id} onClick={() => setActiveTab('habits')} className="glass-panel p-4 cursor-pointer hover:border-brand-500/50 hover:bg-brand-500/5 transition-all group">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-white">{habit.name}</span>
                  <span className="text-[10px] text-surface-400 font-medium">To complete</span>
                </div>
              </div>
            ))}
            
            {completedHabits.map(habit => {
              const streak = calculateStreak(logs, habit.id);
              return (
                <div key={habit.id} className="glass-panel p-4 bg-emerald-500/5 border-emerald-500/20 opacity-80">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-semibold text-emerald-100 line-through">{habit.name}</span>
                      <HiOutlineCheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    {streak > 0 && <span className="text-[10px] text-orange-400 font-bold">{streak} day streak! 🔥</span>}
                  </div>
                </div>
              );
            })}

            {habits.length === 0 && (
              <div className="col-span-2 glass-panel p-6 text-center border-dashed">
                <p className="text-sm text-surface-400">No habits tracked yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
