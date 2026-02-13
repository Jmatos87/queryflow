import { create } from 'zustand'
import type { ChatMessage } from '../types'

interface ChatState {
  /** Messages keyed by dataset ID */
  messagesByDataset: Record<string, ChatMessage[]>
  getMessages: (datasetId: string) => ChatMessage[]
  addMessage: (datasetId: string, message: ChatMessage) => void
  clearMessages: (datasetId: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messagesByDataset: {},
  getMessages: (datasetId) => get().messagesByDataset[datasetId] ?? [],
  addMessage: (datasetId, message) =>
    set((state) => ({
      messagesByDataset: {
        ...state.messagesByDataset,
        [datasetId]: [
          ...(state.messagesByDataset[datasetId] ?? []),
          message,
        ],
      },
    })),
  clearMessages: (datasetId) =>
    set((state) => ({
      messagesByDataset: {
        ...state.messagesByDataset,
        [datasetId]: [],
      },
    })),
}))
