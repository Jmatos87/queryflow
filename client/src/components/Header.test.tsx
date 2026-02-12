import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { Header } from './Header'
import { useUIStore } from '@/stores/uiStore'

describe('Header', () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarOpen: false })
  })

  it('should render the QueryFlow title', () => {
    render(<Header />)
    expect(screen.getByText('QueryFlow')).toBeInTheDocument()
  })

  it('should render the menu button', () => {
    render(<Header />)
    expect(
      screen.getByRole('button', { name: /toggle menu/i })
    ).toBeInTheDocument()
  })

  it('should toggle sidebar when menu button clicked', async () => {
    const user = userEvent.setup()
    render(<Header />)

    expect(useUIStore.getState().sidebarOpen).toBe(false)

    await user.click(screen.getByRole('button', { name: /toggle menu/i }))

    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })
})
