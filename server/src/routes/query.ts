import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { generateSQL } from '../services/llm.js'
import { validateSQL } from '../services/sqlValidator.js'
import { executeQuery } from '../services/queryExecutor.js'
import { queryLimiter } from '../middleware/rateLimiter.js'
import { AppError } from '../middleware/errorHandler.js'

const router = Router()

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
    const validatedSQL = validateSQL(sql, dataset.table_name)
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

export { router as queryRouter }
