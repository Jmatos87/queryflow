import { supabaseAdmin } from '../config/supabase.js'

export interface ExecutionResult {
  rows: Record<string, unknown>[]
  rowCount: number
  executionTimeMs: number
}

export async function executeQuery(sql: string): Promise<ExecutionResult> {
  const start = performance.now()

  const { data, error } = await supabaseAdmin.rpc('execute_readonly_query', {
    query_text: sql,
  })

  const executionTimeMs = Math.round(performance.now() - start)

  if (error) {
    throw new Error(`Query execution failed: ${error.message}`)
  }

  const rows = Array.isArray(data) ? data : []

  return {
    rows,
    rowCount: rows.length,
    executionTimeMs,
  }
}
