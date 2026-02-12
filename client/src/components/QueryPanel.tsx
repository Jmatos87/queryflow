import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { QueryInput } from './QueryInput'
import { ResultsPanel } from './ResultsPanel'
import { useDatasetStore } from '@/stores/datasetStore'
import { useNLQuery } from '@/hooks/useNLQuery'

export function QueryPanel() {
  const activeDataset = useDatasetStore((s) => s.activeDataset)
  const query = useNLQuery()

  if (!activeDataset) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold">{activeDataset.name}</h2>
        <Badge variant="secondary">
          {activeDataset.file_type.toUpperCase()}
        </Badge>
        <Badge variant="outline">
          {activeDataset.row_count.toLocaleString()} rows
        </Badge>
        <Badge variant="outline">
          {activeDataset.schema.length} columns
        </Badge>
      </div>

      <QueryInput />

      {query.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {query.error instanceof Error
              ? query.error.message
              : 'Query failed. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      <ResultsPanel />
    </div>
  )
}
