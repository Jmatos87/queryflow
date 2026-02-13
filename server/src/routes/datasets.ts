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

router.delete('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params

    // Find all datasets for this session
    const { data: datasets, error: fetchError } = await supabaseAdmin
      .from('datasets')
      .select('id, table_name')
      .eq('session_id', sessionId)

    if (fetchError) {
      throw new AppError(500, `Failed to fetch session datasets: ${fetchError.message}`)
    }

    if (datasets && datasets.length > 0) {
      const datasetIds = datasets.map((d) => d.id)

      // Drop the actual data tables
      for (const dataset of datasets) {
        const { error: dropError } = await supabaseAdmin.rpc('execute_sql', {
          query_text: `DROP TABLE IF EXISTS "${dataset.table_name}" CASCADE`,
        })
        if (dropError) {
          console.error(`Failed to drop table ${dataset.table_name}:`, dropError.message)
        }
      }

      // Delete query history for all datasets in this session
      await supabaseAdmin
        .from('query_history')
        .delete()
        .in('dataset_id', datasetIds)

      // Delete all dataset metadata for this session
      const { error: deleteError } = await supabaseAdmin
        .from('datasets')
        .delete()
        .eq('session_id', sessionId)

      if (deleteError) {
        throw new AppError(500, `Failed to delete session datasets: ${deleteError.message}`)
      }
    }

    res.json({ message: 'Session datasets deleted successfully' })
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

    // Drop the actual data table
    const { error: dropError } = await supabaseAdmin.rpc('execute_sql', {
      query_text: `DROP TABLE IF EXISTS "${dataset.table_name}" CASCADE`,
    })
    if (dropError) {
      console.error(`Failed to drop table ${dataset.table_name}:`, dropError.message)
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
