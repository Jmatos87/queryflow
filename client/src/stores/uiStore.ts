import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  activeTab: 'table' | 'chart'
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setActiveTab: (tab: 'table' | 'chart') => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  activeTab: 'table',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
