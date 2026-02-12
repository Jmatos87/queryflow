const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export class ApiClientError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}/api/v1${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new ApiClientError(res.status, body.error || 'Request failed')
  }

  return res.json()
}

export async function apiUpload<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const url = `${API_URL}/api/v1${path}`

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Upload failed' }))
    throw new ApiClientError(res.status, body.error || 'Upload failed')
  }

  return res.json()
}
