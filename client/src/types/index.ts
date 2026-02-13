export interface ColumnSchema {
  name: string
  type: 'text' | 'integer' | 'real' | 'boolean' | 'timestamp'
  nullable: boolean
  sample: unknown[]
}

export interface Dataset {
  id: string
  name: string
  original_filename: string
  file_type: 'csv' | 'json' | 'sql'
  table_name: string
  schema: ColumnSchema[]
  row_count: number
  storage_path: string | null
  session_id: string
  created_at: string
}

export interface QueryResult {
  id: string
  dataset_id: string
  natural_language: string
  generated_sql: string
  result: Record<string, unknown>[]
  row_count: number
  execution_time_ms: number
  session_id: string
  created_at: string
}

export interface QueryResponse {
  id: string
  sql: string
  results: Record<string, unknown>[]
  rowCount: number
  executionTimeMs: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sql?: string
  results?: Record<string, unknown>[]
  rowCount?: number
  executionTimeMs?: number
  timestamp: number
}
