import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('should render the title', () => {
    render(<EmptyState title="No data" />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('should render the description', () => {
    render(<EmptyState title="No data" description="Upload a file" />)
    expect(screen.getByText('Upload a file')).toBeInTheDocument()
  })

  it('should render an action', () => {
    render(
      <EmptyState
        title="No data"
        action={<button>Upload</button>}
      />
    )
    expect(screen.getByText('Upload')).toBeInTheDocument()
  })

  it('should render without description or action', () => {
    render(<EmptyState title="Empty" />)
    expect(screen.getByText('Empty')).toBeInTheDocument()
  })
})
