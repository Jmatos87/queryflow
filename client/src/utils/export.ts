export function exportCSV(
  data: Record<string, unknown>[],
  filename: string
): void {
  if (data.length === 0) return

  const columns = Object.keys(data[0])
  const header = columns.map(escapeCSVValue).join(',')
  const rows = data.map((row) =>
    columns.map((col) => escapeCSVValue(String(row[col] ?? ''))).join(',')
  )

  const csv = [header, ...rows].join('\n')
  downloadFile(csv, `${filename}.csv`, 'text/csv')
}

export function exportJSON(
  data: Record<string, unknown>[],
  filename: string
): void {
  const json = JSON.stringify(data, null, 2)
  downloadFile(json, `${filename}.json`, 'application/json')
}

function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
