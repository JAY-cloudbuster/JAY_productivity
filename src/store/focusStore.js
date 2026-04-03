import { create } from 'zustand';
import { api } from '../utils/api';

export const useFocusStore = create((set) => ({
  sessions: [],
  loading: false,

  fetchSessions: async () => {
    set({ loading: true });
    try {
      const sessions = await api.getFocusSessions();
      set({ sessions, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  saveSession: async (durationMinutes) => {
    try {
      const session = await api.createFocusSession(durationMinutes);
      set((s) => ({ sessions: [session, ...s.sessions] }));
      return session;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
}));
