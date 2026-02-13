import { supabaseAdmin } from '../config/supabase.js'
import type { ColumnSchema, ParsedData } from '../types/index.js'
import { toSqlType } from './schemaAnalyzer.js'

const BATCH_SIZE = 500

export async function createTable(
  tableName: string,
  schema: ColumnSchema[]
): Promise<void> {
  const columnDefs = schema
    .map((col) => {
      const sqlType = toSqlType(col.type)
      // Always allow NULLs — schema analysis samples data and can miss nulls
      // that appear after coercion or in rows beyond the sample window
      return `"${col.name}" ${sqlType}`
    })
    .join(', ')

  const sql = `CREATE TABLE IF NOT EXISTS "${tableName}" (id SERIAL PRIMARY KEY, ${columnDefs})`

  const { error } = await supabaseAdmin.rpc('execute_sql', {
    query_text: sql,
  })

  if (error) {
    throw new Error(`Failed to create table: ${error.message}`)
  }
}

export async function loadData(
  tableName: string,
  data: ParsedData,
  schema: ColumnSchema[]
): Promise<number> {
  let loaded = 0
  const columnNames = schema.map((col) => `"${col.name}"`).join(', ')

  for (let i = 0; i < data.rows.length; i += BATCH_SIZE) {
    const batch = data.rows.slice(i, i + BATCH_SIZE)
    const valueClauses: string[] = []

    for (const row of batch) {
      const values = schema.map((col) => {
        const coerced = coerceValue(row[col.name], col.type)
        if (coerced === null) return 'NULL'
        if (typeof coerced === 'number') return String(coerced)
        if (typeof coerced === 'boolean') return coerced ? 'TRUE' : 'FALSE'
        // Escape single quotes for SQL string literals
        return `'${String(coerced).replace(/'/g, "''")}'`
      })
      valueClauses.push(`(${values.join(', ')})`)
    }

    const sql = `INSERT INTO "${tableName}" (${columnNames}) VALUES ${valueClauses.join(', ')}`

    const { error } = await supabaseAdmin.rpc('execute_sql', {
      query_text: sql,
    })

    if (error) {
      throw new Error(`Failed to insert batch at row ${i}: ${error.message}`)
    }

    loaded += batch.length
  }

  return loaded
}

/** Strip currency symbols, commas, and parens from a string for numeric parsing */
function stripNumericFormatting(str: string): string {
  // Handle accounting-style negatives: ($1,234.56) → -1234.56
  const isNegative = str.startsWith('(') && str.endsWith(')') || str.startsWith('-')
  const cleaned = str.replace(/[$€£¥,()%\s]/g, '').replace(/^-/, '')
  return isNegative ? `-${cleaned}` : cleaned
}

function coerceValue(
  val: unknown,
  type: ColumnSchema['type']
): unknown {
  if (val === null || val === undefined || val === '') {
    return null
  }

  const str = String(val).trim()

  switch (type) {
    case 'integer': {
      const cleaned = stripNumericFormatting(str)
      const n = parseInt(cleaned, 10)
      return isNaN(n) ? null : n
    }
    case 'real': {
      const cleaned = stripNumericFormatting(str)
      const n = parseFloat(cleaned)
      return isNaN(n) ? null : n
    }
    case 'boolean':
      return str.toLowerCase() === 'true'
    case 'timestamp':
      return new Date(str).toISOString()
    default:
      return str
  }
}

export function generateTableName(): string {
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  return `ds_${id}`
}
