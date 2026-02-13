import { create } from 'zustand'
import type { ChatMessage } from '../types'

interface UIState {
  sidebarOpen: boolean
  activeTab: 'table' | 'chart'
  drawerOpen: boolean
  drawerMessage: ChatMessage | null
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setActiveTab: (tab: 'table' | 'chart') => void
  openDrawer: (message: ChatMessage) => void
  closeDrawer: () => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  activeTab: 'table',
  drawerOpen: false,
  drawerMessage: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  openDrawer: (message) => set({ drawerOpen: true, drawerMessage: message, activeTab: 'table' }),
  closeDrawer: () => set({ drawerOpen: false }),
}))
