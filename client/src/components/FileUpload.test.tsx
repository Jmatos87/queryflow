import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FileUpload } from './FileUpload'

vi.mock('@/hooks/useUpload', () => ({
  useUpload: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  }),
}))

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('FileUpload', () => {
  it('should render the drop zone', () => {
    renderWithProviders(<FileUpload />)
    expect(screen.getByText(/Drop your file here/)).toBeInTheDocument()
  })

  it('should show supported file types', () => {
    renderWithProviders(<FileUpload />)
    expect(screen.getByText(/CSV, JSON, or SQL/)).toBeInTheDocument()
  })

  it('should have a file input', () => {
    renderWithProviders(<FileUpload />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.accept).toBe('.csv,.json,.sql')
  })

  it('should show validation error for unsupported file type', async () => {
    renderWithProviders(<FileUpload />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['test'], 'test.xml', { type: 'text/xml' })

    // Directly set files and fire change event to bypass accept attr
    Object.defineProperty(input, 'files', { value: [file], writable: false })
    input.dispatchEvent(new Event('change', { bubbles: true }))

    expect(await screen.findByText(/Unsupported file type/)).toBeInTheDocument()
  })

  it('should show validation error for oversized file', async () => {
    const user = userEvent.setup()
    renderWithProviders(<FileUpload />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    // Create a "large" file (> 10MB)
    const content = new ArrayBuffer(11 * 1024 * 1024)
    const file = new File([content], 'big.csv', { type: 'text/csv' })

    await user.upload(input, file)

    expect(screen.getByText(/too large/i)).toBeInTheDocument()
  })
})
