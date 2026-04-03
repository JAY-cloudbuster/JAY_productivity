import { useState, useEffect } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { calculateStreak, getTodayISO, getLastNDaysISO } from '../../utils/helpers';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineFire, HiOutlineCheck } from 'react-icons/hi';

export default function HabitTracker() {
  const { habits, logs, loading, fetchHabits, createHabit, deleteHabit, logHabit } = useHabitStore();
  const [newHabit, setNewHabit] = useState('');
  const [frequency, setFrequency] = useState('daily');

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    await createHabit(newHabit.trim(), frequency);
    setNewHabit('');
  };

  const today = getTodayISO();
  const last7Days = getLastNDaysISO(7);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Habit Tracker</h2>
        <p className="text-surface-500 mt-1 text-sm">Build lasting routines with daily tracking</p>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="glass-card p-4 flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-xs font-medium text-surface-400 mb-1.5 block">Habit Name</label>
          <input
            id="habit-name-input"
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="e.g. Morning Meditation"
            className="input-field"
          />
        </div>
        <div className="w-36">
          <label className="text-xs font-medium text-surface-400 mb-1.5 block">Frequency</label>
          <select
            id="habit-frequency-select"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="input-field"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <button id="habit-create-btn" type="submit" className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" />
          Add
        </button>
      </form>

      {/* Habit list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : habits.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
            <HiOutlineCheck className="w-8 h-8 text-brand-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No habits yet</h3>
          <p className="text-surface-500 text-sm">Create your first habit to start tracking</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const streak = calculateStreak(logs, habit.id);
            const todayLogged = logs.some((l) => l.habit_id === habit.id && l.date === today);

            return (
              <div
                key={habit.id}
                className="glass-card-hover p-4 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      id={`habit-log-${habit.id}`}
                      onClick={() => logHabit(habit.id, today)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                        ${todayLogged
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                          : 'bg-white/[0.06] text-surface-500 hover:bg-white/[0.1] hover:text-white'
                        }`}
                    >
                      <HiOutlineCheck className="w-4 h-4" />
                    </button>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{habit.name}</h3>
                      <span className="text-[11px] text-surface-500 capitalize">{habit.frequency}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {streak > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <HiOutlineFire className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-xs font-bold text-orange-400">{streak}</span>
                      </div>
                    )}
                    <button
                      id={`habit-delete-${habit.id}`}
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1.5 rounded-lg text-surface-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 7-day grid */}
                <div className="flex gap-1.5 mt-2">
                  {last7Days.map((date) => {
                    const logged = logs.some((l) => l.habit_id === habit.id && l.date === date);
                    const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' }).charAt(0);
                    return (
                      <button
                        key={date}
                        onClick={() => logHabit(habit.id, date)}
                        className={`flex-1 h-8 rounded-lg flex items-center justify-center text-[10px] font-semibold transition-all duration-200
                          ${logged
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/[0.03] text-surface-600 border border-white/[0.04] hover:bg-white/[0.06]'
                          }`}
                        title={date}
                      >
                        {dayLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
