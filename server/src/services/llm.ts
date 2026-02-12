import OpenAI from 'openai'
import { env } from '../config/env.js'
import type { ColumnSchema } from '../types/index.js'

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

export async function generateSQL(
  question: string,
  tableName: string,
  schema: ColumnSchema[]
): Promise<string> {
  const schemaDescription = schema
    .map(
      (col) =>
        `  - "${col.name}" (${col.type}${col.nullable ? ', nullable' : ''}) — sample values: ${col.sample.slice(0, 3).join(', ')}`
    )
    .join('\n')

  const prompt = `You are a SQL expert. Given the following table and schema, translate the user's natural language question into a PostgreSQL SELECT query.

Table name: "${tableName}"
Columns:
${schemaDescription}

Rules:
- Only generate SELECT statements
- Use the exact table name "${tableName}" with double quotes
- Use double quotes around column names
- Do not use DROP, DELETE, INSERT, UPDATE, ALTER, or any destructive operations
- Limit results to 1000 rows maximum using LIMIT
- Return ONLY the SQL query, no explanations or markdown

User question: ${question}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    max_tokens: 500,
  })

  const sql = completion.choices[0]?.message?.content?.trim()

  if (!sql) {
    throw new Error('Failed to generate SQL from the question')
  }

  // Strip markdown code fences if present
  return sql.replace(/^```(?:sql)?\n?/i, '').replace(/\n?```$/i, '').trim()
}
