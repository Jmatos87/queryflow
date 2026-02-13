import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, Table2, Bot, User, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useChatStore } from '@/stores/chatStore'
import { useUIStore } from '@/stores/uiStore'
import { useChat } from '@/hooks/useChat'
import { useDatasets } from '@/hooks/useDatasets'
import { useSessionId } from '@/hooks/useSessionId'
import { useUpload } from '@/hooks/useUpload'
import type { ChatMessage } from '@/types'

function MessageBubble({ message }: { message: ChatMessage }) {
  const openDrawer = useUIStore((s) => s.openDrawer)
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[80%] space-y-2 rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        {message.results && message.results.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant={isUser ? 'secondary' : 'outline'}
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => openDrawer(message)}
            >
              <Table2 className="h-3.5 w-3.5" />
              View Results
              {message.rowCount != null && (
                <Badge variant="secondary" className="ml-1 h-5 text-[10px]">
                  {message.rowCount} rows
                </Badge>
              )}
            </Button>
            {message.executionTimeMs != null && (
              <span className="text-[10px] text-muted-foreground">
                {message.executionTimeMs}ms
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
      </div>
    </div>
  )
}

function InlineFileUploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const upload = useUpload()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) upload.mutate(file)
      // Reset input so the same file can be re-selected
      e.target.value = ''
    },
    [upload]
  )

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1 text-xs cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        disabled={upload.isPending}
      >
        {upload.isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Plus className="h-3 w-3" />
        )}
        Add Dataset
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".csv,.json,.sql,.xlsx"
        onChange={handleChange}
        disabled={upload.isPending}
      />
    </>
  )
}

const EMPTY_MESSAGES: ChatMessage[] = []

export function ChatPanel() {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const sessionId = useSessionId()
  const { data: datasets } = useDatasets()
  const messages = useChatStore((s) =>
    s.messagesBySession[sessionId] ?? EMPTY_MESSAGES
  )
  const { sendMessage, isLoading } = useChat()

  const hasDatasets = datasets && datasets.length > 0

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isLoading])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading || !hasDatasets) return
    sendMessage(trimmed)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Dataset header */}
      <div className="flex items-center gap-2 border-b px-4 py-3 flex-wrap">
        {hasDatasets ? (
          <>
            <span className="text-sm font-semibold text-muted-foreground">
              {datasets.length} {datasets.length === 1 ? 'dataset' : 'datasets'}
            </span>
            {datasets.map((ds) => (
              <Badge key={ds.id} variant="secondary" className="text-[10px]">
                {ds.name}
              </Badge>
            ))}
          </>
        ) : (
          <span className="text-sm text-muted-foreground">No datasets uploaded</span>
        )}
        <div className="ml-auto">
          <InlineFileUploadButton />
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {/* Welcome / empty state message */}
          {messages.length === 0 && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bot className="h-4 w-4" />
              </div>
              <div className="max-w-[80%] rounded-2xl bg-muted px-4 py-2.5 text-sm">
                {!hasDatasets ? (
                  <>
                    <p className="leading-relaxed">
                      Welcome to <strong>QueryFlow</strong>! Upload a dataset to get started.
                    </p>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      Click the <strong>Add Dataset</strong> button above or drag a file onto the sidebar.
                      Supported formats: CSV, JSON, SQL, and Excel (XLSX).
                    </p>
                  </>
                ) : datasets.length === 1 ? (
                  <>
                    <p className="leading-relaxed">
                      Hi! I'm ready to help you explore{' '}
                      <strong>{datasets[0].name}</strong>. This dataset has{' '}
                      {datasets[0].row_count.toLocaleString()} rows and{' '}
                      {datasets[0].schema.length} columns.
                    </p>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      You can ask me things like:
                    </p>
                    <ul className="mt-1 list-inside list-disc text-muted-foreground">
                      <li>What patterns do you see in this data?</li>
                      <li>Show me the top 10 rows by revenue</li>
                      <li>What does the {datasets[0].schema[0]?.name} column represent?</li>
                    </ul>
                    <p className="mt-3 text-xs text-muted-foreground/70">
                      Tip: When uploading multiple files, use consistent column names and formats for accurate cross-file analysis.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="leading-relaxed">
                      Hi! You have <strong>{datasets.length} datasets</strong> loaded:{' '}
                      {datasets.map((ds) => ds.name).join(', ')}.
                    </p>
                    <p className="mt-2 leading-relaxed text-muted-foreground">
                      I can query each dataset individually or <strong>JOIN them together</strong>{' '}
                      when they share common columns. Try asking:
                    </p>
                    <ul className="mt-1 list-inside list-disc text-muted-foreground">
                      <li>Show me the first 10 rows of {datasets[0].name}</li>
                      <li>Join these datasets on a common column</li>
                      <li>Compare totals across both files</li>
                    </ul>
                    <p className="mt-3 text-xs text-muted-foreground/70">
                      Tip: For best results, upload files with consistent column names and formats across datasets.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t bg-background p-4">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasDatasets
                ? 'Ask about your data...'
                : 'Upload a dataset to start...'
            }
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
            disabled={isLoading || !hasDatasets}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading || !hasDatasets}
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
