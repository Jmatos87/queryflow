import { describe, it, expect } from 'vitest'
import { parseCSV, parseJSON, parseSQLDump } from '../services/fileParser.js'

describe('fileParser', () => {
  describe('parseCSV', () => {
    it('should parse a valid CSV string', () => {
      const csv = 'name,age,city\nAlice,30,NYC\nBob,25,LA'
      const result = parseCSV(csv)
      expect(result.columns).toEqual(['name', 'age', 'city'])
      expect(result.rows).toHaveLength(2)
      expect(result.rows[0]).toEqual({ name: 'Alice', age: '30', city: 'NYC' })
    })

    it('should trim whitespace from values', () => {
      const csv = 'name , age \n Alice , 30 '
      const result = parseCSV(csv)
      expect(result.rows[0]).toEqual({ name: 'Alice', age: '30' })
    })

    it('should skip empty lines', () => {
      const csv = 'name,age\nAlice,30\n\nBob,25\n'
      const result = parseCSV(csv)
      expect(result.rows).toHaveLength(2)
    })

    it('should throw on empty CSV', () => {
      expect(() => parseCSV('')).toThrow('empty')
    })

    it('should throw on headers only', () => {
      expect(() => parseCSV('name,age\n')).toThrow('empty')
    })
  })

  describe('parseJSON', () => {
    it('should parse an array of objects', () => {
      const json = JSON.stringify([
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ])
      const result = parseJSON(json)
      expect(result.columns).toContain('name')
      expect(result.columns).toContain('age')
      expect(result.rows).toHaveLength(2)
    })

    it('should parse an object with a nested array', () => {
      const json = JSON.stringify({
        data: [
          { name: 'Alice' },
          { name: 'Bob' },
        ],
      })
      const result = parseJSON(json)
      expect(result.rows).toHaveLength(2)
    })

    it('should handle a single object', () => {
      const json = JSON.stringify({ name: 'Alice', age: 30 })
      const result = parseJSON(json)
      expect(result.rows).toHaveLength(1)
    })

    it('should collect all columns from heterogeneous rows', () => {
      const json = JSON.stringify([
        { name: 'Alice', age: 30 },
        { name: 'Bob', city: 'LA' },
      ])
      const result = parseJSON(json)
      expect(result.columns).toContain('name')
      expect(result.columns).toContain('age')
      expect(result.columns).toContain('city')
    })

    it('should throw on empty array', () => {
      expect(() => parseJSON('[]')).toThrow('no data')
    })

    it('should throw on invalid JSON', () => {
      expect(() => parseJSON('not json')).toThrow()
    })
  })

  describe('parseSQLDump', () => {
    it('should parse INSERT statements', () => {
      const sql = `INSERT INTO users (name, age) VALUES ('Alice', 30), ('Bob', 25);`
      const result = parseSQLDump(sql)
      expect(result.columns).toEqual(['name', 'age'])
      expect(result.rows).toHaveLength(2)
      expect(result.rows[0].name).toBe('Alice')
      expect(result.rows[0].age).toBe(30)
    })

    it('should handle NULL values', () => {
      const sql = `INSERT INTO users (name, age) VALUES ('Alice', NULL);`
      const result = parseSQLDump(sql)
      expect(result.rows[0].age).toBeNull()
    })

    it('should throw when no INSERT found', () => {
      expect(() => parseSQLDump('SELECT * FROM users;')).toThrow('No INSERT')
    })
  })
})
