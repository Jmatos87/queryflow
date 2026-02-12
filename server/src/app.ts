import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { apiRouter } from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import { generalLimiter } from './middleware/rateLimiter.js'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(generalLimiter)

app.use('/api/v1', apiRouter)

app.use(errorHandler)

export { app }
