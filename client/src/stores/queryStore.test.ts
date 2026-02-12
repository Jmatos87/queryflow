import { describe, it, expect, beforeEach } from 'vitest'
import { useQueryStore } from './queryStore'
import type { QueryResponse } from '../types'

const mockQuery: QueryResponse = {
  id: 'q-1',
  sql: 'SELECT * FROM test',
  results: [{ name: 'Alice' }],
  rowCount: 1,
  executionTimeMs: 42,
}

describe('queryStore', () => {
  beforeEach(() => {
    useQueryStore.setState({ lastQuery: null, isQuerying: false })
  })

  it('should start with no last query', () => {
    expect(useQueryStore.getState().lastQuery).toBeNull()
  })

  it('should start with isQuerying false', () => {
    expect(useQueryStore.getState().isQuerying).toBe(false)
  })

  it('should set the last query', () => {
    useQueryStore.getState().setLastQuery(mockQuery)
    expect(useQueryStore.getState().lastQuery).toEqual(mockQuery)
  })

  it('should set isQuerying', () => {
    useQueryStore.getState().setIsQuerying(true)
    expect(useQueryStore.getState().isQuerying).toBe(true)
  })

  it('should clear the last query', () => {
    useQueryStore.getState().setLastQuery(mockQuery)
    useQueryStore.getState().setLastQuery(null)
    expect(useQueryStore.getState().lastQuery).toBeNull()
  })
})
