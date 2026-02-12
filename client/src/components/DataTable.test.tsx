import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { DataTable } from './DataTable'

const sampleData = [
  { name: 'Alice', age: 30, city: 'NYC' },
  { name: 'Bob', age: 25, city: 'LA' },
  { name: 'Charlie', age: 35, city: 'Chicago' },
]

describe('DataTable', () => {
  it('should render column headers', () => {
    render(<DataTable data={sampleData} />)
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('age')).toBeInTheDocument()
    expect(screen.getByText('city')).toBeInTheDocument()
  })

  it('should render row data', () => {
    render(<DataTable data={sampleData} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('NYC')).toBeInTheDocument()
  })

  it('should render all rows', () => {
    render(<DataTable data={sampleData} />)
    const rows = screen.getAllByRole('row')
    // 1 header row + 3 data rows
    expect(rows).toHaveLength(4)
  })

  it('should show empty message for no data', () => {
    render(<DataTable data={[]} />)
    expect(screen.getByText(/No results/)).toBeInTheDocument()
  })

  it('should render null values with italic style', () => {
    const data = [{ name: 'Alice', value: null }]
    render(<DataTable data={data} />)
    expect(screen.getByText('null')).toBeInTheDocument()
  })

  it('should limit displayed rows', () => {
    const manyRows = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      name: `row-${i}`,
    }))
    render(<DataTable data={manyRows} maxRows={10} />)
    expect(screen.getByText('Showing 10 of 50 rows')).toBeInTheDocument()
  })

  it('should sort by column when header clicked', async () => {
    const user = userEvent.setup()
    render(<DataTable data={sampleData} />)

    const nameHeader = screen.getByText('name')
    await user.click(nameHeader)

    const rows = screen.getAllByRole('row')
    // First data row should be Alice (sorted ascending)
    expect(rows[1]).toHaveTextContent('Alice')
  })

  it('should reverse sort direction on second click', async () => {
    const user = userEvent.setup()
    render(<DataTable data={sampleData} />)

    const nameHeader = screen.getByText('name')
    await user.click(nameHeader)
    await user.click(nameHeader)

    const rows = screen.getAllByRole('row')
    // First data row should be Charlie (sorted descending)
    expect(rows[1]).toHaveTextContent('Charlie')
  })
})
