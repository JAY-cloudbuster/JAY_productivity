import { create } from 'zustand';

export const useAppStore = create((set) => ({
  activeTab: 'overview',
  sidebarCollapsed: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
