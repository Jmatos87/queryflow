import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportCSV, exportJSON } from '@/utils/export'

interface ExportButtonProps {
  data: Record<string, unknown>[]
  filename?: string
}

export function ExportButton({ data, filename = 'results' }: ExportButtonProps) {
  if (data.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportCSV(data, filename)}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportJSON(data, filename)}>
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
