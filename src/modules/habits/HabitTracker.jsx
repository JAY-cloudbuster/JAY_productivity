import { useState, useEffect } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { calculateStreak, getTodayISO, getLastNDaysISO } from '../../utils/helpers';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineFire, HiOutlineCheck } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

export default function HabitTracker() {
  const { habits, logs, loading, fetchHabits, createHabit, deleteHabit, logHabit } = useHabitStore();
  const [newHabit, setNewHabit] = useState('');
  const [frequency, setFrequency] = useState('daily');

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    await createHabit(newHabit.trim(), frequency);
    setNewHabit('');
  };

  const today = getTodayISO();
  const last7Days = getLastNDaysISO(7);

  return (
    <div className="space-y-8">
      {/* Create form */}
      <motion.form 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
        onSubmit={handleCreate} className="glass-panel p-2 flex flex-wrap md:flex-nowrap gap-2 items-center"
      >
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Enter a new habit to build..."
          className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none focus:ring-0 placeholder:text-surface-500 font-medium"
        />
        <div className="h-8 w-px bg-white/10 hidden md:block"></div>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="bg-transparent text-sm font-medium text-surface-300 border-none focus:ring-0 cursor-pointer px-4 outline-none appearance-none"
        >
          <option value="daily" className="bg-surface-900">Daily</option>
          <option value="weekly" className="bg-surface-900">Weekly</option>
        </select>
        <button type="submit" disabled={!newHabit.trim()} className="btn-neo-primary ml-auto md:ml-2">
          <HiOutlinePlus className="w-5 h-5" />
        </button>
      </motion.form>

      {/* Habit list */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : habits.length === 0 ? (
          <div className="glass-panel p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center mb-5 shadow-glow-brand/20">
              <HiOutlineFire className="w-10 h-10 text-brand-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2">Build Better Habits</h3>
            <p className="text-surface-400">Add a habit above to start tracking your daily progress.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {habits.map((habit) => {
                const streak = calculateStreak(logs, habit.id);
                const todayLogged = logs.some((l) => l.habit_id === habit.id && l.date === today);

                return (
                  <motion.div
                    key={habit.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="interactive-card p-5 group flex flex-col relative overflow-hidden"
                  >
                    {todayLogged && (
                      <div className="absolute inset-0 bg-brand-500/5 mix-blend-screen pointer-events-none" />
                    )}

                    <div className="flex items-start justify-between mb-4 z-10">
                      <div className="flex-1 pr-4">
                        <h3 className="font-display font-bold text-white text-lg truncate">{habit.name}</h3>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-brand-400">{habit.frequency}</span>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="p-1.5 rounded-lg text-surface-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex-1"></div>

                    {/* Streak Info */}
                    <div className="flex items-center justify-between mb-4 z-10">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-surface-500 uppercase font-bold tracking-wider">Current Streak</span>
                        <div className="flex items-center gap-1.5">
                          <HiOutlineFire className={`w-4 h-4 ${streak > 0 ? 'text-orange-400' : 'text-surface-600'}`} />
                          <span className={`text-xl font-display font-bold ${streak > 0 ? 'text-white' : 'text-surface-600'}`}>{streak}</span>
                        </div>
                      </div>
                      
                      {/* Big today log button */}
                      <button
                        onClick={() => logHabit(habit.id, today)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl
                          ${todayLogged
                            ? 'bg-brand-500 text-surface-950 shadow-glow-brand scale-105'
                            : 'bg-surface-800 border border-white/10 text-surface-400 hover:bg-brand-500/20 hover:text-brand-300 hover:border-brand-500/30'
                          }`}
                      >
                        <HiOutlineCheck className={`w-6 h-6 ${todayLogged ? 'font-bold' : ''}`} />
                      </button>
                    </div>

                    {/* 7-day Mini Grid */}
                    <div className="flex gap-1 z-10">
                      {last7Days.map((date) => {
                        const logged = logs.some((l) => l.habit_id === habit.id && l.date === date);
                        const isTodayGrid = date === today;
                        return (
                          <div
                            key={date}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500
                              ${logged ? 'bg-brand-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]' : 'bg-surface-800'}
                              ${isTodayGrid && !logged ? 'bg-surface-700/50 outline outline-1 outline-surface-500/30' : ''}
                            `}
                            title={date}
                          />
                        );
                      })}
                    </div>
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
