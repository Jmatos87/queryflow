import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ColumnSchema } from '../types/index.js'

// Mock OpenAI before importing the module
vi.mock('openai', () => {
  const mockCreate = vi.fn()
  return {
    default: class {
      chat = {
        completions: {
          create: mockCreate,
        },
      }
    },
    __mockCreate: mockCreate,
  }
})

import { generateSQL } from '../services/llm.js'

describe('llm', () => {
  let mockCreate: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    const openaiModule = await import('openai')
    mockCreate = (openaiModule as unknown as { __mockCreate: ReturnType<typeof vi.fn> }).__mockCreate
    mockCreate.mockReset()
  })

  const schema: ColumnSchema[] = [
    { name: 'name', type: 'text', nullable: false, sample: ['Alice', 'Bob'] },
    { name: 'age', type: 'integer', nullable: false, sample: [30, 25] },
  ]

  it('should return the generated SQL', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'SELECT * FROM "ds_test" LIMIT 100' } }],
    })

    const result = await generateSQL('Show all records', 'ds_test', schema)
    expect(result).toBe('SELECT * FROM "ds_test" LIMIT 100')
  })

  it('should strip markdown code fences', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '```sql\nSELECT * FROM "ds_test"\n```' } }],
    })

    const result = await generateSQL('Show all records', 'ds_test', schema)
    expect(result).toBe('SELECT * FROM "ds_test"')
  })

  it('should throw when no response', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: null } }],
    })

    await expect(generateSQL('question', 'ds_test', schema)).rejects.toThrow(
      'Failed to generate SQL'
    )
  })

  it('should call OpenAI with the correct parameters', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'SELECT * FROM "ds_test"' } }],
    })

    await generateSQL('How many users?', 'ds_test', schema)

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4',
        temperature: 0,
      })
    )
  })
})
