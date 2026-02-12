import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'

vi.mock('../config/supabase.js', () => ({
  supabaseAdmin: { from: vi.fn(), rpc: vi.fn() },
  supabasePublic: { from: vi.fn(), rpc: vi.fn() },
}))

import { app } from '../app.js'

describe('GET /api/v1/health', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/api/v1/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.timestamp).toBeDefined()
  })
})
