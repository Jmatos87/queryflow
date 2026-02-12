import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

vi.mock('../config/supabase.js', () => ({
  supabaseAdmin: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
  supabasePublic: { from: vi.fn(), rpc: vi.fn() },
}))

vi.mock('../services/llm.js', () => ({
  generateSQL: vi.fn(),
}))

import { app } from '../app.js'
import { supabaseAdmin } from '../config/supabase.js'
import { generateSQL } from '../services/llm.js'

describe('POST /api/v1/query', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function setupMocks() {
    // Mock dataset lookup
    const datasetResult = {
      data: {
        id: 'ds-1',
        table_name: 'ds_abc123',
        schema: [
          { name: 'name', type: 'text', nullable: false, sample: ['Alice'] },
          { name: 'age', type: 'integer', nullable: false, sample: [30] },
        ],
      },
      error: null,
    }

    vi.mocked(supabaseAdmin.from).mockImplementation((table: string) => {
      if (table === 'datasets') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(datasetResult),
            }),
          }),
        } as never
      }
      // query_history insert
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'q-1' },
              error: null,
            }),
          }),
        }),
      } as never
    })

    // Mock LLM
    vi.mocked(generateSQL).mockResolvedValue(
      'SELECT * FROM "ds_abc123" LIMIT 100'
    )

    // Mock query execution
    vi.mocked(supabaseAdmin.rpc).mockResolvedValue({
      data: [{ name: 'Alice', age: 30 }],
      error: null,
    } as never)
  }

  it('should execute a query successfully', async () => {
    setupMocks()

    const res = await request(app)
      .post('/api/v1/query')
      .send({
        datasetId: 'ds-1',
        question: 'Show all records',
        sessionId: 'sess-1',
      })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('sql')
    expect(res.body).toHaveProperty('results')
    expect(res.body).toHaveProperty('rowCount')
    expect(res.body).toHaveProperty('executionTimeMs')
  })

  it('should require datasetId', async () => {
    const res = await request(app)
      .post('/api/v1/query')
      .send({ question: 'test', sessionId: 'sess-1' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Dataset ID/i)
  })

  it('should require question', async () => {
    const res = await request(app)
      .post('/api/v1/query')
      .send({ datasetId: 'ds-1', sessionId: 'sess-1' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Question/i)
  })

  it('should reject empty question', async () => {
    const res = await request(app)
      .post('/api/v1/query')
      .send({ datasetId: 'ds-1', question: '   ', sessionId: 'sess-1' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Question/i)
  })

  it('should require sessionId', async () => {
    const res = await request(app)
      .post('/api/v1/query')
      .send({ datasetId: 'ds-1', question: 'test' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Session ID/i)
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

    const res = await request(app)
      .post('/api/v1/query')
      .send({
        datasetId: 'unknown',
        question: 'test',
        sessionId: 'sess-1',
      })

    expect(res.status).toBe(404)
  })
})
