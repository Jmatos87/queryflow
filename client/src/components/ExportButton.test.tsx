import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ExportButton } from './ExportButton'

vi.mock('@/utils/export', () => ({
  exportCSV: vi.fn(),
  exportJSON: vi.fn(),
}))

import { exportCSV, exportJSON } from '@/utils/export'

describe('ExportButton', () => {
  it('should not render when data is empty', () => {
    const { container } = render(<ExportButton data={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('should render the export button', () => {
    render(<ExportButton data={[{ name: 'Alice' }]} />)
    expect(screen.getByText('Export')).toBeInTheDocument()
  })

  it('should show dropdown on click', async () => {
    const user = userEvent.setup()
    render(<ExportButton data={[{ name: 'Alice' }]} />)

    await user.click(screen.getByText('Export'))

    expect(screen.getByText('Export as CSV')).toBeInTheDocument()
    expect(screen.getByText('Export as JSON')).toBeInTheDocument()
  })

  it('should call exportCSV when CSV option clicked', async () => {
    const user = userEvent.setup()
    render(<ExportButton data={[{ name: 'Alice' }]} filename="test" />)

    await user.click(screen.getByText('Export'))
    await user.click(screen.getByText('Export as CSV'))

    expect(exportCSV).toHaveBeenCalledWith([{ name: 'Alice' }], 'test')
  })

  it('should call exportJSON when JSON option clicked', async () => {
    const user = userEvent.setup()
    render(<ExportButton data={[{ name: 'Alice' }]} filename="test" />)

    await user.click(screen.getByText('Export'))
    await user.click(screen.getByText('Export as JSON'))

    expect(exportJSON).toHaveBeenCalledWith([{ name: 'Alice' }], 'test')
  })
})
