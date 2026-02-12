import { useState } from 'react'

function getOrCreateSessionId(): string {
  const stored = localStorage.getItem('queryflow-session-id')
  if (stored) return stored

  const id = crypto.randomUUID()
  localStorage.setItem('queryflow-session-id', id)
  return id
}

export function useSessionId(): string {
  const [sessionId] = useState(getOrCreateSessionId)
  return sessionId
}
