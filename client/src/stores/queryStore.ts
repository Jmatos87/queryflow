import { create } from 'zustand'
import type { QueryResponse } from '../types'

interface QueryState {
  lastQuery: QueryResponse | null
  isQuerying: boolean
  setLastQuery: (query: QueryResponse | null) => void
  setIsQuerying: (querying: boolean) => void
}

export const useQueryStore = create<QueryState>((set) => ({
  lastQuery: null,
  isQuerying: false,
  setLastQuery: (query) => set({ lastQuery: query }),
  setIsQuerying: (querying) => set({ isQuerying: querying }),
}))
