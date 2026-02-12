import { create } from 'zustand'
import type { Dataset } from '../types'

interface DatasetState {
  activeDataset: Dataset | null
  setActiveDataset: (dataset: Dataset | null) => void
}

export const useDatasetStore = create<DatasetState>((set) => ({
  activeDataset: null,
  setActiveDataset: (dataset) => set({ activeDataset: dataset }),
}))
