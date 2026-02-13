import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage } from '../types'

interface ChatState {
  /** Messages keyed by session ID */
  messagesBySession: Record<string, ChatMessage[]>
  getMessages: (sessionId: string) => ChatMessage[]
  addMessage: (sessionId: string, message: ChatMessage) => void
  clearMessages: (sessionId: string) => void
  deleteSessionMessages: (sessionId: string) => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messagesBySession: {},
      getMessages: (sessionId) => get().messagesBySession[sessionId] ?? [],
      addMessage: (sessionId, message) =>
        set((state) => ({
          messagesBySession: {
            ...state.messagesBySession,
            [sessionId]: [
              ...(state.messagesBySession[sessionId] ?? []),
              message,
            ],
          },
        })),
      clearMessages: (sessionId) =>
        set((state) => ({
          messagesBySession: {
            ...state.messagesBySession,
            [sessionId]: [],
          },
        })),
      deleteSessionMessages: (sessionId) =>
        set((state) => {
          const { [sessionId]: _, ...rest } = state.messagesBySession
          return { messagesBySession: rest }
        }),
    }),
    {
      name: 'queryflow-chat-messages',
      partialize: (state) => ({
        messagesBySession: state.messagesBySession,
      }),
    }
  )
)
