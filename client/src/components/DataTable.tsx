import { useState, useMemo } from 'react'
import { ArrowUpDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface DataTableProps {
  data: Record<string, unknown>[]
  maxRows?: number
}

export function DataTable({ data, maxRows = 100 }: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const columns = useMemo(() => {
    if (data.length === 0) return []
    return Object.keys(data[0])
  }, [data])

  const sortedData = useMemo(() => {
    const sliced = data.slice(0, maxRows)
    if (!sortColumn) return sliced

    return [...sliced].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]

      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      const aStr = String(aVal)
      const bStr = String(bVal)

      const aNum = Number(aStr)
      const bNum = Number(bStr)

      let cmp: number
      if (!isNaN(aNum) && !isNaN(bNum)) {
        cmp = aNum - bNum
      } else {
        cmp = aStr.localeCompare(bStr)
      }

      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [data, sortColumn, sortDirection, maxRows])

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(col)
      setSortDirection('asc')
    }
  }

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No results to display.
      </p>
    )
  }

  return (
    <div>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="whitespace-nowrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-medium"
                    onClick={() => handleSort(col)}
                  >
                    {col}
                    <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell
                    key={col}
                    className="max-w-[300px] truncate whitespace-nowrap"
                    title={String(row[col] ?? '')}
                  >
                    {row[col] == null ? (
                      <span className="text-muted-foreground italic">null</span>
                    ) : (
                      String(row[col])
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {data.length > maxRows && (
        <p className="mt-2 text-xs text-muted-foreground text-center">
          Showing {maxRows} of {data.length.toLocaleString()} rows
        </p>
      )}
    </div>
  )
}
