import { describe, it, expect, vi } from 'vitest'
import { mcpTools, invokeTool } from '../mcp/server.js'

vi.mock('../config/supabase.js', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: '1',
              name: 'test',
              file_type: 'csv',
              table_name: 'ds_test',
              schema: [{ name: 'col', type: 'text', nullable: false, sample: [] }],
              row_count: 10,
              created_at: '2024-01-01',
            },
            error: null,
          }),
        })),
      })),
    })),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
}))

vi.mock('../services/llm.js', () => ({
  generateSQL: vi.fn().mockResolvedValue('SELECT * FROM "ds_test" LIMIT 100'),
}))

describe('MCP Server', () => {
  it('should have query_dataset tool registered', () => {
    const tool = mcpTools.find((t) => t.name === 'query_dataset')
    expect(tool).toBeDefined()
    expect(tool?.inputSchema).toBeDefined()
  })

  it('should have describe_dataset tool registered', () => {
    const tool = mcpTools.find((t) => t.name === 'describe_dataset')
    expect(tool).toBeDefined()
    expect(tool?.inputSchema).toBeDefined()
  })

  it('should invoke query_dataset tool', async () => {
    const result = await invokeTool('query_dataset', {
      datasetId: '1',
      question: 'show all',
    })
    expect(result).toHaveProperty('sql')
    expect(result).toHaveProperty('results')
  })

  it('should invoke describe_dataset tool', async () => {
    const result = await invokeTool('describe_dataset', {
      datasetId: '1',
    }) as Record<string, unknown>
    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('columns')
  })

  it('should throw for unknown tool', async () => {
    await expect(invokeTool('unknown_tool', {})).rejects.toThrow('Unknown tool')
  })
})
