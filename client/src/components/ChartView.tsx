import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { autoDetectChartConfig, getChartColor } from '@/utils/chartUtils'
import { formatChartLabel } from '@/utils/formatters'
import type { ChartType } from '@/utils/chartUtils'

interface ChartViewProps {
  data: Record<string, unknown>[]
  chartType?: ChartType
}

export function ChartView({ data, chartType }: ChartViewProps) {
  const config = useMemo(() => autoDetectChartConfig(data), [data])

  if (!config) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Unable to generate a chart for this data.
      </p>
    )
  }

  const type = chartType || config.type
  const chartData = data.map((row) => {
    const item: Record<string, unknown> = {
      [config.labelKey]: formatChartLabel(row[config.labelKey]),
    }
    for (const key of config.valueKeys) {
      item[key] = Number(row[key]) || 0
    }
    return item
  })

  return (
    <div className="w-full h-[300px] sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'pie' ? (
          <PieChart>
            <Pie
              data={chartData}
              dataKey={config.valueKeys[0]}
              nameKey={config.labelKey}
              cx="50%"
              cy="50%"
              outerRadius="70%"
              label={({ name }) => name}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={getChartColor(i)} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : type === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={config.labelKey}
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {config.valueKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={getChartColor(i)}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={config.labelKey}
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            {config.valueKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={getChartColor(i)} />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
