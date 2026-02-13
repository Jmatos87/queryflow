import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { generateSQL, generateChatResponse } from '../services/llm.js'
import { validateSQL } from '../services/sqlValidator.js'
import { executeQuery } from '../services/queryExecutor.js'
import { queryLimiter } from '../middleware/rateLimiter.js'
import { AppError } from '../middleware/errorHandler.js'

const router = Router()

// Legacy SQL-only query endpoint
router.post('/', queryLimiter, async (req, res, next) => {
  try {
    const { datasetId, question, sessionId } = req.body

    if (!datasetId) {
      throw new AppError(400, 'Dataset ID is required')
    }

    if (!question || !question.trim()) {
      throw new AppError(400, 'Question is required')
    }

    if (!sessionId) {
      throw new AppError(400, 'Session ID is required')
    }

    const { data: dataset, error: datasetError } = await supabaseAdmin
      .from('datasets')
      .select('*')
      .eq('id', datasetId)
      .single()

    if (datasetError || !dataset) {
      throw new AppError(404, 'Dataset not found')
    }

    const sql = await generateSQL(question, dataset.table_name, dataset.schema)
    const validatedSQL = validateSQL(sql, [dataset.table_name])
    const result = await executeQuery(validatedSQL)

    const { data: queryRecord, error: saveError } = await supabaseAdmin
      .from('query_history')
      .insert({
        dataset_id: datasetId,
        natural_language: question,
        generated_sql: validatedSQL,
        result: result.rows,
        row_count: result.rowCount,
        execution_time_ms: result.executionTimeMs,
        session_id: sessionId,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save query history:', saveError)
    }

    res.json({
      id: queryRecord?.id,
      sql: validatedSQL,
      results: result.rows,
      rowCount: result.rowCount,
      executionTimeMs: result.executionTimeMs,
    })
  } catch (err) {
    next(err)
  }
})

// Conversational chat endpoint
router.post('/chat', queryLimiter, async (req, res, next) => {
  try {
    const { question, sessionId, conversationHistory } = req.body

    if (!question || !question.trim()) {
      throw new AppError(400, 'Question is required')
    }

    if (!sessionId) {
      throw new AppError(400, 'Session ID is required')
    }

    // Fetch ALL datasets for this session
    const { data: datasets, error: datasetsError } = await supabaseAdmin
      .from('datasets')
      .select('*')
      .eq('session_id', sessionId)

    if (datasetsError) {
      throw new AppError(500, 'Failed to fetch datasets')
    }

    if (!datasets || datasets.length === 0) {
      throw new AppError(404, 'No datasets found for this session')
    }

    // Build multi-table context for the LLM
    const datasetInfos = datasets.map((d: Record<string, unknown>) => ({
      table_name: d.table_name as string,
      schema: d.schema as import('../types/index.js').ColumnSchema[],
      row_count: d.row_count as number,
      name: d.name as string,
    }))

    // Get LLM response with conversation context
    const chatResponse = await generateChatResponse(
      question,
      datasetInfos,
      conversationHistory ?? []
    )

    console.log('[chat] LLM response:', JSON.stringify(chatResponse).slice(0, 500))

    let results: Record<string, unknown>[] | undefined
    let rowCount: number | undefined
    let executionTimeMs: number | undefined
    let validatedSQL: string | undefined

    // If the LLM generated SQL, validate and execute it
    if (chatResponse.sql) {
      try {
        const allowedTables = datasets.map((d: Record<string, unknown>) => d.table_name as string)
        validatedSQL = validateSQL(chatResponse.sql, allowedTables)
        const result = await executeQuery(validatedSQL)
        results = result.rows
        rowCount = result.rowCount
        executionTimeMs = result.executionTimeMs
      } catch (sqlError) {
        const errorDetail = sqlError instanceof Error ? sqlError.message : String(sqlError)
        console.error('[chat] SQL execution failed:', errorDetail)
        console.error('[chat] Failed SQL:', chatResponse.sql)
        chatResponse.message += `\n\n(Query failed: ${errorDetail}. Try rephrasing your question or check that column names match exactly.)`
        chatResponse.sql = undefined
      }
    }

    // Save to query history if SQL was executed
    if (validatedSQL && results) {
      const { error: saveError } = await supabaseAdmin
        .from('query_history')
        .insert({
          dataset_id: null,
          natural_language: question,
          generated_sql: validatedSQL,
          result: results,
          row_count: rowCount ?? 0,
          execution_time_ms: executionTimeMs ?? 0,
          session_id: sessionId,
        })

      if (saveError) {
        console.error('Failed to save query history:', saveError)
      }
    }

    res.json({
      message: chatResponse.message,
      sql: validatedSQL,
      results,
      rowCount,
      executionTimeMs,
    })
  } catch (err) {
    next(err)
  }
})

export { router as queryRouter }
