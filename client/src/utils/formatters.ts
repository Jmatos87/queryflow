const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

/** Format a value for display in tables and charts */
export function formatCellValue(value: unknown): string {
  if (value == null) return ''
  const str = String(value)

  // Format ISO dates as MM-DD-YYYY
  if (ISO_DATE_REGEX.test(str)) {
    return formatDate(str)
  }

  return str
}

/** Format an ISO date string to MM-DD-YYYY */
export function formatDate(isoString: string): string {
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return isoString

  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const yyyy = d.getUTCFullYear()
  return `${mm}-${dd}-${yyyy}`
}

/** Format a value for chart axis labels — shorter format */
export function formatChartLabel(value: unknown): string {
  if (value == null) return ''
  const str = String(value)

  if (ISO_DATE_REGEX.test(str)) {
    const d = new Date(str)
    if (isNaN(d.getTime())) return str
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(d.getUTCDate()).padStart(2, '0')
    return `${mm}-${dd}`
  }

  return str
}
