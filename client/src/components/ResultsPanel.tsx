import { Code, Table2, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable } from './DataTable'
import { ChartView } from './ChartView'
import { ExportButton } from './ExportButton'
import { useQueryStore } from '@/stores/queryStore'

export function ResultsPanel() {
  const lastQuery = useQueryStore((s) => s.lastQuery)
  const isQuerying = useQueryStore((s) => s.isQuerying)

  if (isQuerying) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analyzing...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!lastQuery) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Results</CardTitle>
            <Badge variant="secondary">
              {lastQuery.rowCount.toLocaleString()} row{lastQuery.rowCount !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {lastQuery.executionTimeMs}ms
            </Badge>
          </div>
          <ExportButton data={lastQuery.results} />
        </div>
      </CardHeader>
      <CardContent>
        <details className="mb-4">
          <summary className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <Code className="h-3.5 w-3.5" />
            View SQL
          </summary>
          <pre className="mt-2 rounded-md bg-muted p-3 text-xs overflow-x-auto">
            <code>{lastQuery.sql}</code>
          </pre>
        </details>

        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table" className="gap-1.5">
              <Table2 className="h-3.5 w-3.5" />
              Table
            </TabsTrigger>
            <TabsTrigger value="chart" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              Chart
            </TabsTrigger>
          </TabsList>
          <TabsContent value="table" className="mt-3">
            <DataTable data={lastQuery.results} />
          </TabsContent>
          <TabsContent value="chart" className="mt-3">
            <ChartView data={lastQuery.results} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
