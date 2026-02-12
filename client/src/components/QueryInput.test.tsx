import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { QueryInput } from './QueryInput'
import { useDatasetStore } from '@/stores/datasetStore'

const mockMutate = vi.fn()

vi.mock('@/hooks/useNLQuery', () => ({
  useNLQuery: () => ({
    mutate: mockMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
}))

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('QueryInput', () => {
  beforeEach(() => {
    mockMutate.mockClear()
    useDatasetStore.setState({
      activeDataset: {
        id: 'ds-1',
        name: 'test',
        original_filename: 'test.csv',
        file_type: 'csv',
        table_name: 'ds_abc',
        schema: [],
        row_count: 10,
        storage_path: null,
        session_id: 'sess-1',
        created_at: '2024-01-01',
      },
    })
  })

  it('should render textarea with placeholder', () => {
    renderWithProviders(<QueryInput />)
    expect(
      screen.getByPlaceholderText(/Ask a question/)
    ).toBeInTheDocument()
  })

  it('should render submit button', () => {
    renderWithProviders(<QueryInput />)
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('should disable submit when textarea is empty', () => {
    renderWithProviders(<QueryInput />)
    const button = screen.getByRole('button', { name: /submit/i })
    expect(button).toBeDisabled()
  })

  it('should enable submit when text is entered', async () => {
    const user = userEvent.setup()
    renderWithProviders(<QueryInput />)

    const textarea = screen.getByPlaceholderText(/Ask a question/)
    await user.type(textarea, 'How many rows?')

    const button = screen.getByRole('button', { name: /submit/i })
    expect(button).not.toBeDisabled()
  })

  it('should submit on Enter key', async () => {
    const user = userEvent.setup()
    renderWithProviders(<QueryInput />)

    const textarea = screen.getByPlaceholderText(/Ask a question/)
    await user.type(textarea, 'How many rows?{Enter}')

    expect(mockMutate).toHaveBeenCalledWith('How many rows?')
  })

  it('should not submit on Shift+Enter', async () => {
    const user = userEvent.setup()
    renderWithProviders(<QueryInput />)

    const textarea = screen.getByPlaceholderText(/Ask a question/)
    await user.type(textarea, 'How many{Shift>}{Enter}{/Shift} rows?')

    expect(mockMutate).not.toHaveBeenCalled()
  })

  it('should clear input after submission', async () => {
    const user = userEvent.setup()
    renderWithProviders(<QueryInput />)

    const textarea = screen.getByPlaceholderText(/Ask a question/) as HTMLTextAreaElement
    await user.type(textarea, 'How many rows?{Enter}')

    expect(textarea.value).toBe('')
  })
})
