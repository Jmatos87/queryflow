import OpenAI from 'openai'
import { env } from '../config/env.js'
import type { ColumnSchema } from '../types/index.js'

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  message: string
  sql?: string
}

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

/** Strip SQL, JSON artifacts, and code fences from a user-facing message */
function sanitizeMessage(msg: string): string {
  return msg
    // Remove everything from {"sql" or {\"sql\" to end of line or string
    .replace(/\{["\s]*sql[\s":\\].*$/gim, '')
    // Remove ```sql...``` blocks
    .replace(/```(?:sql)?[\s\S]*?```/gi, '')
    // Remove standalone SELECT...FROM statements
    .replace(/\bSELECT\s+[\s\S]*?\bFROM\s+[\s\S]*?(?:;|$)/gi, '')
    // Remove markdown code fences
    .replace(/```[\s\S]*?```/g, '')
    // Collapse excess newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function generateChatResponse(
  question: string,
  tableName: string,
  schema: ColumnSchema[],
  rowCount: number,
  conversationHistory: ConversationMessage[] = []
): Promise<ChatResponse> {
  const schemaDescription = schema
    .map(
      (col) =>
        `  - "${col.name}" (${col.type}${col.nullable ? ', nullable' : ''}) — sample values: ${col.sample.slice(0, 3).join(', ')}`
    )
    .join('\n')

  const systemPrompt = `You are a senior business analyst. You think in terms of revenue, growth, margins, performance, and actionable insights — not raw SQL or statistics. You have FULL access to a PostgreSQL database. When you include a "sql" field in your JSON response, the system executes it automatically and displays results to the user as a table or chart.

You NEVER say "I'm a text-based AI", "I can't analyze data", or "I can't perform operations". You CAN do all of these by writing SQL. You NEVER suggest the user run a query — YOU run it by including the sql field.

Dataset: "${tableName}" (${rowCount} rows)
Columns:
${schemaDescription}

RESPONSE FORMAT — respond with ONLY valid JSON, nothing else:
{"message": "Your business-oriented explanation and insight here", "sql": "SELECT ..."}

The message field MUST contain two parts separated by a blank line:
1. A data preview that summarizes the ACTUAL numbers from the query — reference specific values, dates, highs, lows, totals, or averages. For example: "Your best week was Oct 6–12 with $14,200 in net sales, while the weakest was Nov 3–9 at $8,400." NEVER write generic filler like "this can help identify trends" — cite the real data.
2. A separate insight paragraph calling out specific patterns, anomalies, or concerns in the data — e.g. "Sales dropped 22% in the last two weeks, which could signal seasonal slowdown or a problem worth investigating." Be specific and actionable, not generic.

Omit the "sql" field ONLY for simple meta questions (e.g. "what columns exist?").
For ALL analytical questions (trends, patterns, comparisons, aggregations, distributions, filtering, grouping) — ALWAYS include sql.

SQL GUIDELINES:
- PostgreSQL syntax. SELECT only.
- Table: "${tableName}" (double-quoted). Columns: double-quoted.
- Numeric columns are already stored as numbers — do NOT use CAST, REPLACE, or any string manipulation on them. Just use them directly (e.g. SUM("Total net sales")).
- Text dates like "01/15/2025" or "2025-01-15": use TO_DATE("col", 'MM/DD/YYYY') or appropriate format, then use DATE_TRUNC for grouping by week/month/year.
- Preserve the natural granularity of the data. If data is at a daily level, query at the daily level. Only group by week, month, or year when the user explicitly asks to (e.g. "monthly sales", "by week", "yearly totals"). Do NOT auto-aggregate to a coarser time period.
- LIMIT 1000 max.
- No destructive operations (DROP, DELETE, INSERT, UPDATE, ALTER).
- Your audience is non-technical. Avoid raw statistical functions (CORR, STDDEV, VARIANCE, REGR_*) that produce single cryptic numbers. Prefer readable tables — grouped totals, averages, side-by-side comparisons, top/bottom N, or breakdowns that chart well. If asked about relationships between metrics, show a grouped comparison table rather than a correlation coefficient.

NEVER put SQL inside the message field. NEVER use markdown code fences.`

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ]

  // Add conversation history
  for (const msg of conversationHistory) {
    messages.push({ role: msg.role, content: msg.content })
  }

  // Add current question
  messages.push({ role: 'user', content: question })

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content?.trim()

  if (!raw) {
    throw new Error('Failed to generate a response')
  }

  // Parse JSON response
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
    const parsed = JSON.parse(cleaned) as ChatResponse

    if (!parsed.message) {
      throw new Error('Response missing message field')
    }

    // Clean SQL if present
    if (parsed.sql) {
      parsed.sql = parsed.sql.replace(/^```(?:sql)?\n?/i, '').replace(/\n?```$/i, '').trim()
    }

    // Sanitize the message: strip any SQL or JSON the LLM may have leaked
    parsed.message = sanitizeMessage(parsed.message)

    if (!parsed.message) {
      parsed.message = 'Here are the results.'
    }

    return parsed
  } catch {
    // If full JSON parse fails, try to extract fields with regex
    const sqlMatch = raw.match(/"sql"\s*:\s*"((?:[^"\\]|\\.)*)/)
    const messageMatch = raw.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)/)

    const sql = sqlMatch ? sqlMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : undefined
    const message = sanitizeMessage(
      messageMatch
        ? messageMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
        : raw
    )

    return { message: message || 'Here are the results.', sql }
  }
}
