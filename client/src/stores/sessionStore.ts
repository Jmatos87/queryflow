import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Session {
  id: string
  name: string
  createdAt: number
}

interface SessionState {
  sessions: Session[]
  activeSessionId: string
  createSession: () => string
  setActiveSession: (id: string) => void
  renameSession: (id: string, name: string) => void
  deleteSession: (id: string) => void
}

function migrateExistingSession(): { sessions: Session[]; activeSessionId: string } {
  const existing = localStorage.getItem('queryflow-session-id')
  if (existing) {
    return {
      sessions: [{ id: existing, name: 'New Session', createdAt: Date.now() }],
      activeSessionId: existing,
    }
  }
  const id = crypto.randomUUID()
  return {
    sessions: [{ id, name: 'New Session', createdAt: Date.now() }],
    activeSessionId: id,
  }
}

const initial = migrateExistingSession()

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: initial.sessions,
      activeSessionId: initial.activeSessionId,

      createSession: () => {
        const id = crypto.randomUUID()
        const session: Session = { id, name: 'New Session', createdAt: Date.now() }
        set((state) => ({
          sessions: [session, ...state.sessions],
          activeSessionId: id,
        }))
        return id
      },

      setActiveSession: (id) => {
        const exists = get().sessions.some((s) => s.id === id)
        if (exists) set({ activeSessionId: id })
      },

      renameSession: (id, name) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, name } : s
          ),
        }))
      },

      deleteSession: (id) => {
        const { sessions, activeSessionId } = get()
        const remaining = sessions.filter((s) => s.id !== id)
        if (remaining.length === 0) {
          // Deleting the last session — create a fresh one
          const newId = crypto.randomUUID()
          const fresh: Session = { id: newId, name: 'New Session', createdAt: Date.now() }
          set({ sessions: [fresh], activeSessionId: newId })
        } else {
          const newActive =
            activeSessionId === id ? remaining[0].id : activeSessionId
          set({ sessions: remaining, activeSessionId: newActive })
        }
      },
    }),
    {
      name: 'queryflow-sessions',
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
    }
  )
)
