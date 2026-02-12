import { describe, it, expect } from 'vitest'
import { autoDetectChartConfig, getChartColor } from './chartUtils'

describe('chartUtils', () => {
  describe('autoDetectChartConfig', () => {
    it('should return null for empty data', () => {
      expect(autoDetectChartConfig([])).toBeNull()
    })

    it('should return null for single-column data', () => {
      const data = [{ name: 'Alice' }, { name: 'Bob' }]
      expect(autoDetectChartConfig(data)).toBeNull()
    })

    it('should return null when no numeric columns', () => {
      const data = [
        { name: 'Alice', city: 'NYC' },
        { name: 'Bob', city: 'LA' },
      ]
      expect(autoDetectChartConfig(data)).toBeNull()
    })

    it('should detect bar chart for medium datasets', () => {
      // More than 10 items without time-like labels → bar
      const data = Array.from({ length: 15 }, (_, i) => ({
        name: `item-${i}`,
        score: 80 + i,
      }))
      const config = autoDetectChartConfig(data)
      expect(config).not.toBeNull()
      expect(config!.type).toBe('bar')
      expect(config!.labelKey).toBe('name')
      expect(config!.valueKeys).toContain('score')
    })

    it('should detect pie chart for single numeric with few categories', () => {
      const data = [
        { category: 'A', count: 10 },
        { category: 'B', count: 20 },
        { category: 'C', count: 30 },
      ]
      const config = autoDetectChartConfig(data)
      expect(config).not.toBeNull()
      expect(config!.type).toBe('pie')
    })

    it('should detect line chart for time-like data with many points', () => {
      // Time-like labels with more than 10 items → line
      const data = Array.from({ length: 12 }, (_, i) => ({
        date: `2024-${String(i + 1).padStart(2, '0')}-01`,
        value: 100 + i * 10,
      }))
      const config = autoDetectChartConfig(data)
      expect(config).not.toBeNull()
      expect(config!.type).toBe('line')
    })

    it('should detect line chart for large datasets', () => {
      const data = Array.from({ length: 25 }, (_, i) => ({
        index: `item-${i}`,
        value: i * 10,
      }))
      const config = autoDetectChartConfig(data)
      expect(config).not.toBeNull()
      expect(config!.type).toBe('line')
    })

    it('should support multiple value keys', () => {
      const data = [
        { name: 'Q1', revenue: 100, cost: 50 },
        { name: 'Q2', revenue: 150, cost: 60 },
      ]
      const config = autoDetectChartConfig(data)
      expect(config).not.toBeNull()
      expect(config!.valueKeys).toContain('revenue')
      expect(config!.valueKeys).toContain('cost')
    })
  })

  describe('getChartColor', () => {
    it('should return a color string', () => {
      expect(getChartColor(0)).toMatch(/^hsl/)
    })

    it('should cycle through colors', () => {
      const color0 = getChartColor(0)
      const color5 = getChartColor(5)
      expect(color0).toBe(color5)
    })

    it('should return different colors for different indices', () => {
      expect(getChartColor(0)).not.toBe(getChartColor(1))
    })
  })
})
