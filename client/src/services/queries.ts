import { apiFetch } from './api'
import type { QueryResponse, QueryResult } from '../types'

export interface ChatApiResponse {
  message: string
  sql?: string
  results?: Record<string, unknown>[]
  rowCount?: number
  executionTimeMs?: number
}

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

export function submitChat(
  sessionId: string,
  question: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<ChatApiResponse> {
  return apiFetch('/query/chat', {
    method: 'POST',
    body: JSON.stringify({ sessionId, question, conversationHistory }),
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
