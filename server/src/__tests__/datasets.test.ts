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

describe('Datasets API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/v1/datasets', () => {
    it('should return datasets for a session', async () => {
      const datasets = [
        { id: '1', name: 'test', session_id: 'sess-1' },
        { id: '2', name: 'test2', session_id: 'sess-1' },
      ]

      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: datasets, error: null }),
          }),
        }),
      } as never)

      const res = await request(app)
        .get('/api/v1/datasets')
        .query({ sessionId: 'sess-1' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
    })

    it('should return empty array when no datasets', async () => {
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as never)

      const res = await request(app)
        .get('/api/v1/datasets')
        .query({ sessionId: 'sess-1' })

      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('should require sessionId', async () => {
      const res = await request(app).get('/api/v1/datasets')

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/Session ID/i)
    })
  })

  describe('GET /api/v1/datasets/:id', () => {
    it('should return a single dataset', async () => {
      const dataset = { id: '1', name: 'test' }

      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: dataset, error: null }),
          }),
        }),
      } as never)

      const res = await request(app).get('/api/v1/datasets/1')

      expect(res.status).toBe(200)
      expect(res.body.id).toBe('1')
    })

    it('should return 404 for unknown dataset', async () => {
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

      const res = await request(app).get('/api/v1/datasets/unknown')

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/v1/datasets/:id', () => {
    it('should delete a dataset', async () => {
      vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
        if (table === 'datasets') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { table_name: 'ds_abc' },
                  error: null,
                }),
              }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          } as never
        }
        // query_history
        return {
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        } as never
      })

      const res = await request(app).delete('/api/v1/datasets/1')

      expect(res.status).toBe(200)
      expect(res.body.message).toMatch(/deleted/i)
    })

    it('should return 404 when deleting non-existent dataset', async () => {
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

      const res = await request(app).delete('/api/v1/datasets/unknown')

      expect(res.status).toBe(404)
    })
  })
})
