import { describe, it, expect, beforeEach } from 'vitest'
import { useDatasetStore } from './datasetStore'
import type { Dataset } from '../types'

const mockDataset: Dataset = {
  id: 'ds-1',
  name: 'test',
  original_filename: 'test.csv',
  file_type: 'csv',
  table_name: 'ds_abc123',
  schema: [],
  row_count: 10,
  storage_path: null,
  session_id: 'sess-1',
  created_at: '2024-01-01',
}

describe('datasetStore', () => {
  beforeEach(() => {
    useDatasetStore.setState({ activeDataset: null })
  })

  it('should start with no active dataset', () => {
    expect(useDatasetStore.getState().activeDataset).toBeNull()
  })

  it('should set the active dataset', () => {
    useDatasetStore.getState().setActiveDataset(mockDataset)
    expect(useDatasetStore.getState().activeDataset).toEqual(mockDataset)
  })

  it('should clear the active dataset', () => {
    useDatasetStore.getState().setActiveDataset(mockDataset)
    useDatasetStore.getState().setActiveDataset(null)
    expect(useDatasetStore.getState().activeDataset).toBeNull()
  })
})
