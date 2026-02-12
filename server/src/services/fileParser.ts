import { parse } from 'csv-parse/sync'
import type { ParsedData } from '../types/index.js'

export function parseCSV(content: string): ParsedData {
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as Record<string, unknown>[]

  if (records.length === 0) {
    throw new Error('CSV file is empty or has no data rows')
  }

  const columns = Object.keys(records[0])
  return { columns, rows: records }
}

export function parseJSON(content: string): ParsedData {
  const parsed = JSON.parse(content)

  let rows: Record<string, unknown>[]
  if (Array.isArray(parsed)) {
    rows = parsed
  } else if (parsed && typeof parsed === 'object') {
    const arrayField = Object.values(parsed).find(Array.isArray)
    if (arrayField) {
      rows = arrayField as Record<string, unknown>[]
    } else {
      rows = [parsed]
    }
  } else {
    throw new Error('JSON must be an array or object')
  }

  if (rows.length === 0) {
    throw new Error('JSON file contains no data')
  }

  const columnSet = new Set<string>()
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      columnSet.add(key)
    }
  }

  const columns = Array.from(columnSet)
  return { columns, rows }
}

export function parseSQLDump(content: string): ParsedData {
  const insertRegex =
    /INSERT\s+INTO\s+\S+\s*\(([^)]+)\)\s*VALUES\s*([\s\S]*?)(?=;|$)/gi
  const matches = [...content.matchAll(insertRegex)]

  if (matches.length === 0) {
    throw new Error('No INSERT statements found in SQL dump')
  }

  const columns = matches[0][1].split(',').map((c) => c.trim().replace(/["`]/g, ''))
  const rows: Record<string, unknown>[] = []

  for (const match of matches) {
    const valuesStr = match[2]
    const valueGroups = [...valuesStr.matchAll(/\(([^)]+)\)/g)]

    for (const group of valueGroups) {
      const values = parseValueList(group[1])
      const row: Record<string, unknown> = {}
      columns.forEach((col, i) => {
        row[col] = values[i] ?? null
      })
      rows.push(row)
    }
  }

  if (rows.length === 0) {
    throw new Error('No data rows found in SQL dump')
  }

  return { columns, rows }
}

function parseValueList(valuesStr: string): unknown[] {
  const values: unknown[] = []
  let current = ''
  let inString = false
  let stringChar = ''

  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i]

    if (inString) {
      if (char === stringChar && valuesStr[i - 1] !== '\\') {
        inString = false
        values.push(current)
        current = ''
        const nextNonSpace = valuesStr.slice(i + 1).search(/\S/)
        if (nextNonSpace >= 0 && valuesStr[i + 1 + nextNonSpace] === ',') {
          i += nextNonSpace + 1
        }
      } else {
        current += char
      }
    } else if (char === "'" || char === '"') {
      inString = true
      stringChar = char
      current = ''
    } else if (char === ',') {
      const trimmed = current.trim()
      if (trimmed.toUpperCase() === 'NULL') {
        values.push(null)
      } else if (trimmed !== '') {
        values.push(isNaN(Number(trimmed)) ? trimmed : Number(trimmed))
      }
      current = ''
    } else {
      current += char
    }
  }

  if (current.trim()) {
    const trimmed = current.trim()
    if (trimmed.toUpperCase() === 'NULL') {
      values.push(null)
    } else {
      values.push(isNaN(Number(trimmed)) ? trimmed : Number(trimmed))
    }
  }

  return values
}
