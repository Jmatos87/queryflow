import { supabaseAdmin } from '../../config/supabase.js'
import { generateSQL } from '../../services/llm.js'
import { validateSQL } from '../../services/sqlValidator.js'
import { executeQuery } from '../../services/queryExecutor.js'

export interface QueryDatasetInput {
  datasetId: string
  question: string
}

export interface QueryDatasetOutput {
  sql: string
  results: Record<string, unknown>[]
  rowCount: number
  executionTimeMs: number
}

export async function queryDataset(
  input: QueryDatasetInput
): Promise<QueryDatasetOutput> {
  const { data: dataset, error } = await supabaseAdmin
    .from('datasets')
    .select('*')
    .eq('id', input.datasetId)
    .single()

  if (error || !dataset) {
    throw new Error('Dataset not found')
  }

  const sql = await generateSQL(input.question, dataset.table_name, dataset.schema)
  const validatedSQL = validateSQL(sql, dataset.table_name)
  const result = await executeQuery(validatedSQL)

  return {
    sql: validatedSQL,
    results: result.rows,
    rowCount: result.rowCount,
    executionTimeMs: result.executionTimeMs,
  }
}
