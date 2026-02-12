import { Router } from 'express'
import { healthRouter } from './health.js'
import { uploadRouter } from './upload.js'
import { queryRouter } from './query.js'
import { datasetsRouter } from './datasets.js'
import { resultsRouter } from './results.js'

const router = Router()

router.use('/health', healthRouter)
router.use('/upload', uploadRouter)
router.use('/query', queryRouter)
router.use('/datasets', datasetsRouter)
router.use('/results', resultsRouter)

export { router as apiRouter }
