import { create } from 'zustand';
import { api } from '../utils/api';

export const useHabitStore = create((set, get) => ({
  habits: [],
  logs: [],
  loading: false,
  error: null,

  fetchHabits: async () => {
    set({ loading: true, error: null });
    try {
      const [habits, logs] = await Promise.all([api.getHabits(), api.getAllHabitLogs()]);
      set({ habits, logs, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createHabit: async (name, frequency = 'daily') => {
    try {
      const habit = await api.createHabit(name, frequency);
      set((s) => ({ habits: [habit, ...s.habits] }));
      return habit;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteHabit: async (id) => {
    try {
      await api.deleteHabit(id);
      set((s) => ({
        habits: s.habits.filter((h) => h.id !== id),
        logs: s.logs.filter((l) => l.habit_id !== id),
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  logHabit: async (id, date) => {
    try {
      const result = await api.logHabit(id, date);
      if (result.logged) {
        set((s) => ({
          logs: [{ id: result.id, habit_id: id, date: result.date }, ...s.logs],
        }));
      } else {
        set((s) => ({
          logs: s.logs.filter((l) => !(l.habit_id === id && l.date === result.date)),
        }));
      }
      return result;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));
