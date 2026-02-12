import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { AppError } from '../middleware/errorHandler.js'

const router = Router()

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('query_history')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      throw new AppError(404, 'Query result not found')
    }

    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.get('/history/:datasetId', async (req, res, next) => {
  try {
    const { datasetId } = req.params
    const sessionId = req.query.sessionId || req.headers['x-session-id']

    if (!sessionId) {
      throw new AppError(400, 'Session ID is required')
    }

    const { data, error } = await supabaseAdmin
      .from('query_history')
      .select('*')
      .eq('dataset_id', datasetId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new AppError(500, `Failed to fetch query history: ${error.message}`)
    }

    res.json(data)
  } catch (err) {
    next(err)
  }
})

export { router as resultsRouter }
