import { FileText, MessageSquare, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useDatasets, useDeleteDataset } from '@/hooks/useDatasets'
import { useQueryClient } from '@tanstack/react-query'
import { deleteSessionDatasets } from '@/services/datasets'
import { useChatStore } from '@/stores/chatStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useSessionId } from '@/hooks/useSessionId'
import type { Dataset } from '@/types'
import type { Session } from '@/stores/sessionStore'

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function Sidebar() {
  const { data: datasets, isLoading } = useDatasets()
  const sessionId = useSessionId()
  const clearMessages = useChatStore((s) => s.clearMessages)
  const deleteSessionMessages = useChatStore((s) => s.deleteSessionMessages)
  const deleteMutation = useDeleteDataset()

  const queryClient = useQueryClient()
  const sessions = useSessionStore((s) => s.sessions)
  const createSession = useSessionStore((s) => s.createSession)
  const setActiveSession = useSessionStore((s) => s.setActiveSession)
  const deleteSession = useSessionStore((s) => s.deleteSession)

  const handleDeleteSession = async (id: string) => {
    if (!window.confirm('Delete this session, its chat history, and all its datasets?')) return
    // Delete backend datasets + query history for this session
    try {
      await deleteSessionDatasets(id)
    } catch {
      // Continue with local cleanup even if backend call fails
    }
    deleteSessionMessages(id)
    deleteSession(id)
    queryClient.invalidateQueries({ queryKey: ['datasets'] })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Sessions Section */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Sessions
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 cursor-pointer"
            onClick={() => createSession()}
            aria-label="New session"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="max-h-[40%] px-2">
        <div className="space-y-0.5">
          {sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={session.id === sessionId}
              onSelect={() => setActiveSession(session.id)}
              onDelete={() => handleDeleteSession(session.id)}
            />
          ))}
        </div>
      </ScrollArea>

      <Separator className="my-2" />

      {/* Session Datasets Section */}
      <div className="px-4 pb-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Session Datasets
        </h2>
      </div>
      <ScrollArea className="flex-1 px-2">
        {isLoading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : datasets && datasets.length > 0 ? (
          <div className="space-y-1">
            {datasets.map((dataset) => (
              <DatasetItem
                key={dataset.id}
                dataset={dataset}
                onDelete={() => {
                  deleteMutation.mutate(dataset.id)
                  if (datasets.length === 1) {
                    clearMessages(sessionId)
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <p className="p-4 text-sm text-muted-foreground">
            No datasets yet. Upload a file to begin.
          </p>
        )}
      </ScrollArea>
    </div>
  )
}

function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
}: {
  session: Session
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect() }}
      className={`group flex w-full items-center gap-2 rounded-md p-2.5 text-left cursor-pointer transition-colors ${
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-muted/50 text-foreground'
      }`}
    >
      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{session.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatRelativeTime(session.createdAt)}
        </p>
      </div>
      <button
        className="shrink-0 text-muted-foreground/60 hover:text-destructive transition-colors cursor-pointer p-1"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        aria-label="Delete session"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function DatasetItem({
  dataset,
  onDelete,
}: {
  dataset: Dataset
  onDelete: () => void
}) {
  return (
    <div className="group w-full rounded-md p-3 text-left">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm font-medium truncate">{dataset.name}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100 cursor-pointer"
          onClick={onDelete}
          aria-label="Delete dataset"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {dataset.file_type.toUpperCase()}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {dataset.row_count.toLocaleString()} rows
        </span>
      </div>
    </div>
  )
}
