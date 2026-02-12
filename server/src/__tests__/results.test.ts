import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

vi.mock('../config/supabase.js', () => ({
  supabaseAdmin: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
  supabasePublic: { from: vi.fn(), rpc: vi.fn() },
}))

import { app } from '../app.js'
import { supabaseAdmin } from '../config/supabase.js'

describe('Results API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/v1/results/:id', () => {
    it('should return a query result', async () => {
      const queryResult = {
        id: 'q-1',
        dataset_id: 'ds-1',
        natural_language: 'show all',
        generated_sql: 'SELECT * FROM ds_abc',
        result: [{ name: 'Alice' }],
        row_count: 1,
        execution_time_ms: 50,
      }

      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: queryResult,
              error: null,
            }),
          }),
        }),
      } as never)

      const res = await request(app).get('/api/v1/results/q-1')

      expect(res.status).toBe(200)
      expect(res.body.id).toBe('q-1')
      expect(res.body.natural_language).toBe('show all')
    })

    it('should return 404 for unknown result', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'not found' },
            }),
          }),
        }),
      } as never)

      const res = await request(app).get('/api/v1/results/unknown')

      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/v1/results/history/:datasetId', () => {
    it('should return query history for a dataset', async () => {
      const history = [
        { id: 'q-1', natural_language: 'show all' },
        { id: 'q-2', natural_language: 'count rows' },
      ]

      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: history,
                error: null,
              }),
            }),
          }),
        }),
      } as never)

      const res = await request(app)
        .get('/api/v1/results/history/ds-1')
        .query({ sessionId: 'sess-1' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
    })

    it('should require sessionId', async () => {
      const res = await request(app).get('/api/v1/results/history/ds-1')

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/Session ID/i)
    })

    it('should return empty array when no history', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      } as never)

      const res = await request(app)
        .get('/api/v1/results/history/ds-1')
        .query({ sessionId: 'sess-1' })

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })
  })
})
