import { FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useDatasets, useDeleteDataset } from '@/hooks/useDatasets'
import { useChatStore } from '@/stores/chatStore'
import { useSessionId } from '@/hooks/useSessionId'
import type { Dataset } from '@/types'

export function Sidebar() {
  const { data: datasets, isLoading } = useDatasets()
  const sessionId = useSessionId()
  const clearMessages = useChatStore((s) => s.clearMessages)
  const deleteMutation = useDeleteDataset()

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
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
                  // If this was the last dataset, clear session messages
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
          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
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
