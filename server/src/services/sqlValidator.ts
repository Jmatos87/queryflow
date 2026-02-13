const DANGEROUS_KEYWORDS = [
  'DROP',
  'DELETE',
  'INSERT',
  'UPDATE',
  'ALTER',
  'CREATE',
  'TRUNCATE',
  'GRANT',
  'REVOKE',
  'EXEC',
  'EXECUTE',
  'INTO',
]

export function validateSQL(sql: string, allowedTables: string[]): string {
  let cleaned = sql.trim()

  // Remove SQL comments
  cleaned = cleaned.replace(/--.*$/gm, '')
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '')
  cleaned = cleaned.trim()

  // Remove trailing semicolons
  cleaned = cleaned.replace(/;\s*$/, '')

  // Must start with SELECT
  if (!/^SELECT\b/i.test(cleaned)) {
    throw new Error('Only SELECT queries are allowed')
  }

  // Check for dangerous keywords (as standalone words)
  const upperSQL = cleaned.toUpperCase()
  for (const keyword of DANGEROUS_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`)
    // Allow INTO only in context of SELECT ... INTO (which we block via the SELECT-only check)
    // But block INSERT INTO specifically
    if (keyword === 'INTO' && /\bSELECT\b/i.test(cleaned) && !/\bINSERT\s+INTO\b/i.test(upperSQL)) {
      continue
    }
    if (regex.test(upperSQL)) {
      throw new Error(`Dangerous SQL keyword detected: ${keyword}`)
    }
  }

  // Check for multiple statements
  if (cleaned.includes(';')) {
    throw new Error('Multiple SQL statements are not allowed')
  }

  // Verify the query references at least one of the allowed tables
  const referencesAllowedTable = allowedTables.some((table) => cleaned.includes(table))
  if (!referencesAllowedTable) {
    throw new Error(`Query must reference one of the allowed tables: ${allowedTables.map((t) => `"${t}"`).join(', ')}`)
  }

  return cleaned
}
