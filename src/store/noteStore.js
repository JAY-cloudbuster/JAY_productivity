import { create } from 'zustand';
import { api } from '../utils/api';

export const useNoteStore = create((set) => ({
  notes: [],
  loading: false,
  error: null,

  fetchNotes: async () => {
    set({ loading: true, error: null });
    try {
      const notes = await api.getNotes();
      set({ notes, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  createNote: async (content) => {
    try {
      const note = await api.createNote(content);
      set((s) => ({ notes: [note, ...s.notes] }));
      return note;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateNote: async (id, content) => {
    try {
      const note = await api.updateNote(id, content);
      set((s) => ({
        notes: s.notes.map((n) => (n.id === id ? note : n)),
      }));
      return note;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteNote: async (id) => {
    try {
      await api.deleteNote(id);
      set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));
