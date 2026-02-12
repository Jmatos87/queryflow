import { supabaseAdmin } from '../../config/supabase.js'
import type { ColumnSchema } from '../../types/index.js'

export interface DescribeDatasetInput {
  datasetId: string
}

export interface DescribeDatasetOutput {
  name: string
  fileType: string
  rowCount: number
  columns: ColumnSchema[]
  createdAt: string
}

export async function describeDataset(
  input: DescribeDatasetInput
): Promise<DescribeDatasetOutput> {
  const { data: dataset, error } = await supabaseAdmin
    .from('datasets')
    .select('*')
    .eq('id', input.datasetId)
    .single()

  if (error || !dataset) {
    throw new Error('Dataset not found')
  }

  return {
    name: dataset.name,
    fileType: dataset.file_type,
    rowCount: dataset.row_count,
    columns: dataset.schema,
    createdAt: dataset.created_at,
  }
}
