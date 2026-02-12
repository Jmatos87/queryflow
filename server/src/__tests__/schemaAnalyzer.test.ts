import { describe, it, expect } from 'vitest'
import { analyzeSchema } from '../services/schemaAnalyzer.js'
import type { ParsedData } from '../types/index.js'

describe('schemaAnalyzer', () => {
  it('should detect integer columns', () => {
    const data: ParsedData = {
      columns: ['count'],
      rows: [{ count: '1' }, { count: '2' }, { count: '3' }, { count: '4' }, { count: '5' }],
    }
    const schema = analyzeSchema(data)
    expect(schema[0].type).toBe('integer')
  })

  it('should detect real/float columns', () => {
    const data: ParsedData = {
      columns: ['price'],
      rows: [{ price: '1.5' }, { price: '2.99' }, { price: '3.14' }, { price: '4.0' }, { price: '5.5' }],
    }
    const schema = analyzeSchema(data)
    expect(schema[0].type).toBe('real')
  })

  it('should detect boolean columns', () => {
    const data: ParsedData = {
      columns: ['active'],
      rows: [{ active: 'true' }, { active: 'false' }, { active: 'true' }, { active: 'false' }, { active: 'true' }],
    }
    const schema = analyzeSchema(data)
    expect(schema[0].type).toBe('boolean')
  })

  it('should detect timestamp columns', () => {
    const data: ParsedData = {
      columns: ['created'],
      rows: [
        { created: '2024-01-01T00:00:00Z' },
        { created: '2024-02-15T12:30:00Z' },
        { created: '2024-03-20T08:00:00Z' },
        { created: '2024-04-10T16:45:00Z' },
        { created: '2024-05-05T23:59:59Z' },
      ],
    }
    const schema = analyzeSchema(data)
    expect(schema[0].type).toBe('timestamp')
  })

  it('should detect text columns', () => {
    const data: ParsedData = {
      columns: ['name'],
      rows: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }],
    }
    const schema = analyzeSchema(data)
    expect(schema[0].type).toBe('text')
  })

  it('should detect nullable columns', () => {
    const data: ParsedData = {
      columns: ['value'],
      rows: [{ value: '1' }, { value: '' }, { value: '3' }],
    }
    const schema = analyzeSchema(data)
    expect(schema[0].nullable).toBe(true)
  })

  it('should detect non-nullable columns', () => {
    const data: ParsedData = {
      columns: ['value'],
      rows: [{ value: '1' }, { value: '2' }, { value: '3' }],
    }
    const schema = analyzeSchema(data)
    expect(schema[0].nullable).toBe(false)
  })

  it('should include sample values', () => {
    const data: ParsedData = {
      columns: ['name'],
      rows: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }, { name: 'Diana' }, { name: 'Eve' }, { name: 'Frank' }],
    }
    const schema = analyzeSchema(data)
    expect(schema[0].sample).toHaveLength(5)
  })

  it('should default to text for empty columns', () => {
    const data: ParsedData = {
      columns: ['empty'],
      rows: [{ empty: '' }, { empty: null }, { empty: undefined }],
    }
    const schema = analyzeSchema(data)
    expect(schema[0].type).toBe('text')
  })

  it('should handle mixed numeric with mostly integers', () => {
    const data: ParsedData = {
      columns: ['val'],
      rows: [
        { val: '1' }, { val: '2' }, { val: '3' }, { val: '4' },
        { val: '5' }, { val: '6' }, { val: '7' }, { val: '8' },
        { val: '9' }, { val: 'hello' },
      ],
    }
    const schema = analyzeSchema(data)
    expect(schema[0].type).toBe('integer')
  })
})
