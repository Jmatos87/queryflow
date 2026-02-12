import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../config/supabase.js', () => ({
  supabaseAdmin: {
    rpc: vi.fn(),
  },
}))

import { executeQuery } from '../services/queryExecutor.js'
import { supabaseAdmin } from '../config/supabase.js'

describe('queryExecutor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return rows and timing', async () => {
    const mockData = [{ name: 'Alice', age: 30 }]
    vi.mocked(supabaseAdmin.rpc).mockResolvedValue({
      data: mockData,
      error: null,
    } as never)

    const result = await executeQuery('SELECT * FROM test')
    expect(result.rows).toEqual(mockData)
    expect(result.rowCount).toBe(1)
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0)
  })

  it('should handle empty results', async () => {
    vi.mocked(supabaseAdmin.rpc).mockResolvedValue({
      data: [],
      error: null,
    } as never)

    const result = await executeQuery('SELECT * FROM test WHERE 1=0')
    expect(result.rows).toEqual([])
    expect(result.rowCount).toBe(0)
  })

  it('should throw on execution error', async () => {
    vi.mocked(supabaseAdmin.rpc).mockResolvedValue({
      data: null,
      error: { message: 'syntax error' },
    } as never)

    await expect(executeQuery('BAD SQL')).rejects.toThrow('Query execution failed')
  })
})
