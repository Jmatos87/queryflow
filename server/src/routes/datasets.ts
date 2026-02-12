import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'
import { AppError } from '../middleware/errorHandler.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const sessionId = req.query.sessionId || req.headers['x-session-id']

    if (!sessionId) {
      throw new AppError(400, 'Session ID is required')
    }

    const { data, error } = await supabaseAdmin
      .from('datasets')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new AppError(500, `Failed to fetch datasets: ${error.message}`)
    }

    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const { data, error } = await supabaseAdmin
      .from('datasets')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      throw new AppError(404, 'Dataset not found')
    }

    res.json(data)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const { data: dataset, error: fetchError } = await supabaseAdmin
      .from('datasets')
      .select('table_name')
      .eq('id', id)
      .single()

    if (fetchError || !dataset) {
      throw new AppError(404, 'Dataset not found')
    }

    // Delete query history for this dataset
    await supabaseAdmin
      .from('query_history')
      .delete()
      .eq('dataset_id', id)

    // Delete the dataset metadata
    const { error: deleteError } = await supabaseAdmin
      .from('datasets')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw new AppError(500, `Failed to delete dataset: ${deleteError.message}`)
    }

    res.json({ message: 'Dataset deleted successfully' })
  } catch (err) {
    next(err)
  }
})

export { router as datasetsRouter }
