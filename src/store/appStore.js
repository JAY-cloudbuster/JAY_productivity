import { create } from 'zustand';

export const useAppStore = create((set) => ({
  activeTab: 'habits',
  darkMode: true,
  sidebarCollapsed: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
