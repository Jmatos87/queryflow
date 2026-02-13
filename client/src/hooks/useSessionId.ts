import { useSessionStore } from '../stores/sessionStore'

export function useSessionId(): string {
  return useSessionStore((s) => s.activeSessionId)
}
