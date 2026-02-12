import { describe, it, expect } from 'vitest'
import { validateSQL } from '../services/sqlValidator.js'

describe('sqlValidator', () => {
  const TABLE = 'ds_abc123'

  it('should pass a valid SELECT query', () => {
    const sql = `SELECT * FROM "${TABLE}" LIMIT 100`
    expect(validateSQL(sql, TABLE)).toBe(sql)
  })

  it('should strip trailing semicolons', () => {
    const sql = `SELECT * FROM "${TABLE}";`
    expect(validateSQL(sql, TABLE)).toBe(`SELECT * FROM "${TABLE}"`)
  })

  it('should remove SQL comments', () => {
    const sql = `SELECT * FROM "${TABLE}" -- this is a comment`
    const result = validateSQL(sql, TABLE)
    expect(result).not.toContain('--')
  })

  it('should remove block comments', () => {
    const sql = `SELECT /* comment */ * FROM "${TABLE}"`
    const result = validateSQL(sql, TABLE)
    expect(result).not.toContain('/*')
  })

  it('should reject non-SELECT queries', () => {
    expect(() => validateSQL(`INSERT INTO "${TABLE}" VALUES (1)`, TABLE)).toThrow('Only SELECT')
  })

  it('should reject DROP statements', () => {
    expect(() => validateSQL(`SELECT * FROM "${TABLE}"; DROP TABLE "${TABLE}"`, TABLE)).toThrow()
  })

  it('should reject DELETE', () => {
    expect(() => validateSQL(`DELETE FROM "${TABLE}"`, TABLE)).toThrow()
  })

  it('should reject UPDATE', () => {
    expect(() => validateSQL(`UPDATE "${TABLE}" SET name = 'x'`, TABLE)).toThrow()
  })

  it('should reject ALTER', () => {
    expect(() => validateSQL(`ALTER TABLE "${TABLE}" ADD COLUMN x TEXT`, TABLE)).toThrow()
  })

  it('should reject INSERT INTO', () => {
    expect(() => validateSQL(`INSERT INTO "${TABLE}" (name) VALUES ('x')`, TABLE)).toThrow()
  })

  it('should reject multiple statements', () => {
    expect(() =>
      validateSQL(`SELECT * FROM "${TABLE}"; SELECT * FROM "${TABLE}"`, TABLE)
    ).toThrow()
  })

  it('should reject queries that reference the wrong table', () => {
    expect(() => validateSQL('SELECT * FROM other_table', TABLE)).toThrow(
      'must reference'
    )
  })

  it('should allow SELECT with WHERE, GROUP BY, ORDER BY', () => {
    const sql = `SELECT name, COUNT(*) FROM "${TABLE}" WHERE age > 20 GROUP BY name ORDER BY name`
    expect(validateSQL(sql, TABLE)).toBe(sql)
  })
})
