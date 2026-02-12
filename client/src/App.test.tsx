import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('should render the app header', () => {
    render(<App />)
    expect(screen.getByText('QueryFlow')).toBeInTheDocument()
  })

  it('should render the welcome message when no dataset is active', () => {
    render(<App />)
    expect(screen.getByText('Welcome to QueryFlow')).toBeInTheDocument()
  })

  it('should render the file upload area', () => {
    render(<App />)
    expect(
      screen.getByText(/Drop your file here/)
    ).toBeInTheDocument()
  })
})
