export type ChartType = 'bar' | 'line' | 'pie'

export interface ChartConfig {
  type: ChartType
  labelKey: string
  valueKeys: string[]
}

export function autoDetectChartConfig(
  data: Record<string, unknown>[]
): ChartConfig | null {
  if (data.length === 0) return null

  const columns = Object.keys(data[0])
  if (columns.length < 2) return null

  const numericCols: string[] = []
  const textCols: string[] = []

  for (const col of columns) {
    const nonNull = data
      .map((r) => r[col])
      .filter((v) => v != null && v !== '')
    const numCount = nonNull.filter((v) => !isNaN(Number(v))).length

    if (nonNull.length > 0 && numCount / nonNull.length >= 0.8) {
      numericCols.push(col)
    } else {
      textCols.push(col)
    }
  }

  if (numericCols.length === 0) return null

  const labelKey = textCols[0] || columns[0]
  const valueKeys = numericCols.filter((c) => c !== labelKey)

  if (valueKeys.length === 0) return null

  // Pie chart for single numeric + few categories
  if (valueKeys.length === 1 && data.length <= 10) {
    return { type: 'pie', labelKey, valueKeys }
  }

  // Line chart for time-like labels or many data points
  const isTimeLike = data.some((r) => {
    const v = String(r[labelKey] ?? '')
    return /\d{4}[-/]/.test(v)
  })

  if (isTimeLike || data.length > 20) {
    return { type: 'line', labelKey, valueKeys }
  }

  return { type: 'bar', labelKey, valueKeys }
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}
