import { useState, useCallback } from 'react'
import { submitChat } from '../services/queries'
import { useSessionId } from './useSessionId'
import { useChatStore } from '../stores/chatStore'
import { useDatasets } from './useDatasets'
import type { ChatMessage } from '../types'

export function useChat() {
  const sessionId = useSessionId()
  const { data: datasets } = useDatasets()
  const addMessage = useChatStore((s) => s.addMessage)
  const getMessages = useChatStore((s) => s.getMessages)
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(
    async (question: string) => {
      if (!datasets || datasets.length === 0) return

      // Add user message
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: question,
        timestamp: Date.now(),
      }
      addMessage(sessionId, userMessage)

      setIsLoading(true)

      try {
        // Build conversation history from existing messages (limit to last 20 for context window)
        const existing = getMessages(sessionId)
        const history = existing.slice(-20).map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const response = await submitChat(
          sessionId,
          question,
          history
        )

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.message,
          sql: response.sql,
          results: response.results,
          rowCount: response.rowCount,
          executionTimeMs: response.executionTimeMs,
          timestamp: Date.now(),
        }
        addMessage(sessionId, assistantMessage)
      } catch (error) {
        // Add error as assistant message
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            error instanceof Error
              ? `Sorry, something went wrong: ${error.message}`
              : 'Sorry, something went wrong. Please try again.',
          timestamp: Date.now(),
        }
        addMessage(sessionId, errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [datasets, sessionId, addMessage, getMessages]
  )

  return { sendMessage, isLoading }
}
