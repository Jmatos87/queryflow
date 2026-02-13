export interface ColumnSchema {
  name: string
  type: 'text' | 'integer' | 'real' | 'boolean' | 'timestamp'
  nullable: boolean
  sample: unknown[]
}

export interface DatasetMetadata {
  id: string
  name: string
  originalFilename: string
  fileType: 'csv' | 'json' | 'sql' | 'xlsx'
  tableName: string
  schema: ColumnSchema[]
  rowCount: number
  storagePath: string | null
  sessionId: string
  createdAt: string
}

export interface ParsedData {
  columns: string[]
  rows: Record<string, unknown>[]
}

export interface QueryResult {
  id: string
  datasetId: string
  naturalLanguage: string
  generatedSql: string
  result: Record<string, unknown>[]
  rowCount: number
  executionTimeMs: number
  sessionId: string
  createdAt: string
}

export interface ApiError {
  error: string
}
