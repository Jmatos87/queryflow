import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

vi.mock('../config/supabase.js', () => {
  const mockFrom = vi.fn()
  const mockRpc = vi.fn()
  return {
    supabaseAdmin: { from: mockFrom, rpc: mockRpc },
    supabasePublic: { from: vi.fn(), rpc: vi.fn() },
    __mockFrom: mockFrom,
    __mockRpc: mockRpc,
  }
})

import { app } from '../app.js'
import { supabaseAdmin } from '../config/supabase.js'

describe('POST /api/v1/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function setupSupabaseMock() {
    // Mock rpc for table creation
    vi.mocked(supabaseAdmin.rpc).mockResolvedValue({
      data: null,
      error: null,
    } as never)

    // Mock from() for insert (data loading) and metadata insert
    const mockChain = {
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'dataset-123',
              name: 'test',
              original_filename: 'test.csv',
              file_type: 'csv',
              table_name: 'ds_abc123',
              schema: [],
              row_count: 2,
              session_id: 'sess-1',
              created_at: '2024-01-01',
            },
            error: null,
          }),
        }),
      }),
      select: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }
    vi.mocked(supabaseAdmin.from).mockReturnValue(mockChain as never)
  }

  it('should upload a CSV file successfully', async () => {
    setupSupabaseMock()

    const csvContent = 'name,age\nAlice,30\nBob,25'
    const res = await request(app)
      .post('/api/v1/upload')
      .field('sessionId', 'sess-1')
      .attach('file', Buffer.from(csvContent), 'test.csv')

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.name).toBe('test')
  })

  it('should upload a JSON file successfully', async () => {
    setupSupabaseMock()

    const jsonContent = JSON.stringify([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ])
    const res = await request(app)
      .post('/api/v1/upload')
      .field('sessionId', 'sess-1')
      .attach('file', Buffer.from(jsonContent), 'test.json')

    expect(res.status).toBe(201)
  })

  it('should reject when no file is provided', async () => {
    const res = await request(app)
      .post('/api/v1/upload')
      .field('sessionId', 'sess-1')

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/No file/i)
  })

  it('should reject when sessionId is missing', async () => {
    const csvContent = 'name,age\nAlice,30'
    const res = await request(app)
      .post('/api/v1/upload')
      .attach('file', Buffer.from(csvContent), 'test.csv')

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Session ID/i)
  })

  it('should reject unsupported file extensions', async () => {
    const res = await request(app)
      .post('/api/v1/upload')
      .field('sessionId', 'sess-1')
      .attach('file', Buffer.from('hello'), 'test.xml')

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Invalid file type|Unsupported/i)
  })
})
