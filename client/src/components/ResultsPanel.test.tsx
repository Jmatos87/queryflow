import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ResultsPanel } from './ResultsPanel'
import { useQueryStore } from '@/stores/queryStore'

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('ResultsPanel', () => {
  beforeEach(() => {
    useQueryStore.setState({ lastQuery: null, isQuerying: false })
  })

  it('should render nothing when no query result', () => {
    const { container } = renderWithProviders(<ResultsPanel />)
    expect(container.innerHTML).toBe('')
  })

  it('should show skeleton when querying', () => {
    useQueryStore.setState({ isQuerying: true })
    renderWithProviders(<ResultsPanel />)
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
  })

  it('should show results when query completes', () => {
    useQueryStore.setState({
      lastQuery: {
        id: 'q-1',
        sql: 'SELECT * FROM test',
        results: [{ name: 'Alice', age: 30 }],
        rowCount: 1,
        executionTimeMs: 42,
      },
      isQuerying: false,
    })

    renderWithProviders(<ResultsPanel />)
    expect(screen.getByText('Results')).toBeInTheDocument()
    expect(screen.getByText('1 row')).toBeInTheDocument()
    expect(screen.getByText('42ms')).toBeInTheDocument()
  })

  it('should show row count with plural', () => {
    useQueryStore.setState({
      lastQuery: {
        id: 'q-1',
        sql: 'SELECT * FROM test',
        results: [{ a: 1 }, { a: 2 }],
        rowCount: 2,
        executionTimeMs: 10,
      },
    })

    renderWithProviders(<ResultsPanel />)
    expect(screen.getByText('2 rows')).toBeInTheDocument()
  })

  it('should show View SQL details', () => {
    useQueryStore.setState({
      lastQuery: {
        id: 'q-1',
        sql: 'SELECT name FROM test',
        results: [{ name: 'Alice' }],
        rowCount: 1,
        executionTimeMs: 5,
      },
    })

    renderWithProviders(<ResultsPanel />)
    expect(screen.getByText('View SQL')).toBeInTheDocument()
    expect(screen.getByText('SELECT name FROM test')).toBeInTheDocument()
  })

  it('should show Table and Chart tabs', () => {
    useQueryStore.setState({
      lastQuery: {
        id: 'q-1',
        sql: 'SELECT * FROM test',
        results: [{ name: 'Alice' }],
        rowCount: 1,
        executionTimeMs: 5,
      },
    })

    renderWithProviders(<ResultsPanel />)
    expect(screen.getByText('Table')).toBeInTheDocument()
    expect(screen.getByText('Chart')).toBeInTheDocument()
  })
})
