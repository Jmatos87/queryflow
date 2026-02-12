import { apiFetch } from './api'
import type { QueryResponse, QueryResult } from '../types'

export function submitQuery(
  datasetId: string,
  question: string,
  sessionId: string
): Promise<QueryResponse> {
  return apiFetch('/query', {
    method: 'POST',
    body: JSON.stringify({ datasetId, question, sessionId }),
  })
}

export function fetchQueryResult(id: string): Promise<QueryResult> {
  return apiFetch(`/results/${id}`)
}

export function fetchQueryHistory(
  datasetId: string,
  sessionId: string
): Promise<QueryResult[]> {
  return apiFetch(
    `/results/history/${datasetId}?sessionId=${encodeURIComponent(sessionId)}`
  )
}
