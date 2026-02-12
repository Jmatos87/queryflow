import { apiFetch, apiUpload } from './api'
import type { Dataset } from '../types'

export function fetchDatasets(sessionId: string): Promise<Dataset[]> {
  return apiFetch(`/datasets?sessionId=${encodeURIComponent(sessionId)}`)
}

export function fetchDataset(id: string): Promise<Dataset> {
  return apiFetch(`/datasets/${id}`)
}

export function deleteDataset(id: string): Promise<{ message: string }> {
  return apiFetch(`/datasets/${id}`, { method: 'DELETE' })
}

export function uploadFile(
  file: File,
  sessionId: string
): Promise<Dataset> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('sessionId', sessionId)
  return apiUpload('/upload', formData)
}
