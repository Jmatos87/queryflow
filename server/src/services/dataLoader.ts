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
      const nullable = col.nullable ? '' : ' NOT NULL'
      return `"${col.name}" ${sqlType}${nullable}`
    })
    .join(', ')

  const sql = `CREATE TABLE IF NOT EXISTS "${tableName}" (id SERIAL PRIMARY KEY, ${columnDefs})`

  const { error } = await supabaseAdmin.rpc('execute_readonly_query', {
    query_text: sql,
  })

  if (error) {
    // Fallback: try direct SQL via admin
    const { error: createError } = await supabaseAdmin.from(tableName).select('*').limit(0)
    if (createError) {
      throw new Error(`Failed to create table: ${error.message}`)
    }
  }
}

export async function loadData(
  tableName: string,
  data: ParsedData,
  schema: ColumnSchema[]
): Promise<number> {
  let loaded = 0

  for (let i = 0; i < data.rows.length; i += BATCH_SIZE) {
    const batch = data.rows.slice(i, i + BATCH_SIZE)
    const processedBatch = batch.map((row) => {
      const processed: Record<string, unknown> = {}
      for (const col of schema) {
        const val = row[col.name]
        processed[col.name] = coerceValue(val, col.type)
      }
      return processed
    })

    const { error } = await supabaseAdmin
      .from(tableName)
      .insert(processedBatch)

    if (error) {
      throw new Error(`Failed to insert batch at row ${i}: ${error.message}`)
    }

    loaded += batch.length
  }

  return loaded
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
      const n = parseInt(str, 10)
      return isNaN(n) ? null : n
    }
    case 'real': {
      const n = parseFloat(str)
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
