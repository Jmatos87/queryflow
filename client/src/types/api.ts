export interface UploadRequest {
  file: File
  sessionId: string
}

export interface QueryRequest {
  datasetId: string
  question: string
  sessionId: string
}

export interface ApiError {
  error: string
}
