import type { ColumnSchema, ParsedData } from '../types/index.js'

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
// Matches currency/comma-formatted numbers: $1,234.56  -$500  1,000  €50.00 etc.
const FORMATTED_NUMBER_REGEX = /^[($€£¥-]*[\d,]+\.?\d*[)%]?$/

export function analyzeSchema(data: ParsedData): ColumnSchema[] {
  return data.columns.map((name) => {
    const values = data.rows.map((row) => row[name])
    const nonNullValues = values.filter(
      (v) => v !== null && v !== undefined && v !== ''
    )
    const nullable = nonNullValues.length < values.length
    const type = inferType(nonNullValues)

    // Store coerced sample values so the LLM sees actual types
    const sample = nonNullValues.slice(0, 5).map((v) => {
      if ((type === 'integer' || type === 'real') && typeof v === 'string') {
        const cleaned = v.replace(/[$€£¥,()%\s]/g, '')
        const n = Number(cleaned)
        if (!isNaN(n)) return n
      }
      return v
    })

    return { name, type, nullable, sample }
  })
}

function inferType(
  values: unknown[]
): 'text' | 'integer' | 'real' | 'boolean' | 'timestamp' {
  if (values.length === 0) return 'text'

  let intCount = 0
  let realCount = 0
  let boolCount = 0
  let timestampCount = 0

  for (const val of values) {
    const str = String(val).trim()

    if (str.toLowerCase() === 'true' || str.toLowerCase() === 'false') {
      boolCount++
      continue
    }

    if (ISO_DATE_REGEX.test(str) || DATE_REGEX.test(str)) {
      const d = new Date(str)
      if (!isNaN(d.getTime())) {
        timestampCount++
        continue
      }
    }

    const num = Number(str)
    if (!isNaN(num) && str !== '') {
      if (Number.isInteger(num) && !str.includes('.')) {
        intCount++
      } else {
        realCount++
      }
      continue
    }

    // Detect currency/comma-formatted numbers like $1,234.56 or 1,000
    if (FORMATTED_NUMBER_REGEX.test(str)) {
      const cleaned = str.replace(/[$€£¥,()%]/g, '').trim()
      const parsed = Number(cleaned)
      if (!isNaN(parsed)) {
        if (str.includes('.')) {
          realCount++
        } else {
          intCount++
        }
        continue
      }
    }
  }

  const total = values.length
  const threshold = 0.8

  if (boolCount / total >= threshold) return 'boolean'
  if (timestampCount / total >= threshold) return 'timestamp'
  if ((intCount + realCount) / total >= threshold) {
    return realCount > 0 ? 'real' : 'integer'
  }

  return 'text'
}

export function toSqlType(
  type: ColumnSchema['type']
): string {
  switch (type) {
    case 'integer':
      return 'BIGINT'
    case 'real':
      return 'DOUBLE PRECISION'
    case 'boolean':
      return 'BOOLEAN'
    case 'timestamp':
      return 'TIMESTAMPTZ'
    default:
      return 'TEXT'
  }
}
