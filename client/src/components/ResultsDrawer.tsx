import { useState } from 'react'
import { Code, Table2, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from './DataTable'
import { ChartView } from './ChartView'
import { ExportButton } from './ExportButton'
import { useUIStore } from '@/stores/uiStore'
import type { ChartType } from '@/utils/chartUtils'

export function ResultsDrawer() {
  const drawerOpen = useUIStore((s) => s.drawerOpen)
  const drawerMessage = useUIStore((s) => s.drawerMessage)
  const activeTab = useUIStore((s) => s.activeTab)
  const closeDrawer = useUIStore((s) => s.closeDrawer)
  const setActiveTab = useUIStore((s) => s.setActiveTab)
  const [chartType, setChartType] = useState<ChartType>('bar')

  const results = drawerMessage?.results ?? []

  return (
    <Sheet open={drawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 gap-0 overflow-hidden"
      >
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-base">Query Results</SheetTitle>
              {drawerMessage?.rowCount != null && (
                <Badge variant="secondary">
                  {drawerMessage.rowCount.toLocaleString()} row
                  {drawerMessage.rowCount !== 1 ? 's' : ''}
                </Badge>
              )}
              {drawerMessage?.executionTimeMs != null && (
                <Badge variant="outline" className="text-xs">
                  {drawerMessage.executionTimeMs}ms
                </Badge>
              )}
            </div>
            {results.length > 0 && <ExportButton data={results} />}
          </div>
          <SheetDescription className="sr-only">
            Query results table and chart view
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0 flex flex-col">
          {drawerMessage?.sql && (
            <details className="px-4 pt-3">
              <summary className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Code className="h-3.5 w-3.5" />
                View SQL
              </summary>
              <pre className="mt-2 rounded-md bg-muted p-3 text-xs overflow-x-auto">
                <code>{drawerMessage.sql}</code>
              </pre>
            </details>
          )}

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'table' | 'chart')}
            className="flex-1 min-h-0 flex flex-col px-4 pt-3"
          >
            <TabsList className="w-fit">
              <TabsTrigger value="table" className="gap-1.5">
                <Table2 className="h-3.5 w-3.5" />
                Table
              </TabsTrigger>
              <TabsTrigger value="chart" className="gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Chart
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 min-h-0 overflow-y-auto mt-3 pb-4">
              <TabsContent value="table" className="mt-0">
                <DataTable data={results} />
              </TabsContent>
              <TabsContent value="chart" className="mt-0">
                <div className="mb-3 flex items-center gap-1">
                  <span className="text-xs text-muted-foreground mr-1">Type:</span>
                  <Button
                    variant={chartType === 'bar' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setChartType('bar')}
                    aria-label="Bar chart"
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={chartType === 'line' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setChartType('line')}
                    aria-label="Line chart"
                  >
                    <LineChartIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant={chartType === 'pie' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setChartType('pie')}
                    aria-label="Pie chart"
                  >
                    <PieChartIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <ChartView data={results} chartType={chartType} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
