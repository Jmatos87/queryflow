import { FileText, Trash2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useDatasets, useDeleteDataset } from '@/hooks/useDatasets'
import { useDatasetStore } from '@/stores/datasetStore'
import { useChatStore } from '@/stores/chatStore'
import { useQueryHistory } from '@/hooks/useQueryHistory'
import type { Dataset } from '@/types'

export function Sidebar() {
  const { data: datasets, isLoading } = useDatasets()
  const activeDataset = useDatasetStore((s) => s.activeDataset)
  const setActiveDataset = useDatasetStore((s) => s.setActiveDataset)
  const clearMessages = useChatStore((s) => s.clearMessages)
  const deleteMutation = useDeleteDataset()

  return (
    <div className="flex h-full flex-col">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Datasets
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
                isActive={activeDataset?.id === dataset.id}
                onSelect={() => setActiveDataset(dataset)}
                onDelete={() => {
                  deleteMutation.mutate(dataset.id)
                  clearMessages(dataset.id)
                  if (activeDataset?.id === dataset.id) {
                    setActiveDataset(null)
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
      {activeDataset && (
        <>
          <Separator />
          <QueryHistorySection datasetId={activeDataset.id} />
        </>
      )}
    </div>
  )
}

function DatasetItem({
  dataset,
  isActive,
  onSelect,
  onDelete,
}: {
  dataset: Dataset
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`group w-full rounded-md p-3 text-left transition-colors hover:bg-accent ${
        isActive ? 'bg-accent' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm font-medium truncate">{dataset.name}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
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
    </button>
  )
}

function QueryHistorySection({ datasetId }: { datasetId: string }) {
  const { data: history } = useQueryHistory(datasetId)

  if (!history || history.length === 0) return null

  return (
    <div className="p-4">
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        Recent Queries
      </h3>
      <ScrollArea className="max-h-40">
        <div className="space-y-1">
          {history.slice(0, 10).map((q) => (
            <p
              key={q.id}
              className="truncate text-xs text-muted-foreground"
              title={q.natural_language}
            >
              {q.natural_language}
            </p>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
