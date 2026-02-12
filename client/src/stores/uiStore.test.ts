import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from './uiStore'

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarOpen: false, activeTab: 'table' })
  })

  it('should start with sidebar closed', () => {
    expect(useUIStore.getState().sidebarOpen).toBe(false)
  })

  it('should start with table tab active', () => {
    expect(useUIStore.getState().activeTab).toBe('table')
  })

  it('should toggle sidebar', () => {
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(true)
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(false)
  })

  it('should set sidebar open state', () => {
    useUIStore.getState().setSidebarOpen(true)
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })

  it('should set active tab', () => {
    useUIStore.getState().setActiveTab('chart')
    expect(useUIStore.getState().activeTab).toBe('chart')
  })
})
