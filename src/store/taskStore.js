import { create } from 'zustand';
import { api } from '../utils/api';

export const useTaskStore = create((set) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasks = await api.getTasks();
      set({ tasks, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createTask: async (title, priority = 'medium', due_date = null) => {
    try {
      const task = await api.createTask(title, priority, due_date);
      set((s) => ({ tasks: [task, ...s.tasks] }));
      return task;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateTask: async (id, updates) => {
    try {
      const task = await api.updateTask(id, updates);
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? task : t)),
      }));
      return task;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteTask: async (id) => {
    try {
      await api.deleteTask(id);
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  toggleTask: async (id) => {
    const task = useTaskStore.getState().tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    return useTaskStore.getState().updateTask(id, { status: newStatus });
  },
}));
