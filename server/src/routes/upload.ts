import { Router } from 'express'
import multer from 'multer'
import { parseCSV, parseJSON, parseSQLDump } from '../services/fileParser.js'
import { analyzeSchema } from '../services/schemaAnalyzer.js'
import { createTable, loadData, generateTableName } from '../services/dataLoader.js'
import { supabaseAdmin } from '../config/supabase.js'
import { uploadLimiter } from '../middleware/rateLimiter.js'
import { AppError } from '../middleware/errorHandler.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'text/csv',
      'application/json',
      'application/sql',
      'text/plain',
      'application/vnd.ms-excel',
      'application/octet-stream',
    ]
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new AppError(400, 'Invalid file type. Supported: CSV, JSON, SQL'))
    }
  },
})

const router = Router()

router.post('/', uploadLimiter, upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file
    const sessionId = req.body.sessionId || req.headers['x-session-id']

    if (!file) {
      throw new AppError(400, 'No file provided')
    }

    if (!sessionId) {
      throw new AppError(400, 'Session ID is required')
    }

    const content = file.buffer.toString('utf-8')
    const ext = file.originalname.split('.').pop()?.toLowerCase()

    let fileType: 'csv' | 'json' | 'sql'
    let parsed

    switch (ext) {
      case 'csv':
        fileType = 'csv'
        parsed = parseCSV(content)
        break
      case 'json':
        fileType = 'json'
        parsed = parseJSON(content)
        break
      case 'sql':
        fileType = 'sql'
        parsed = parseSQLDump(content)
        break
      default:
        throw new AppError(400, 'Unsupported file extension. Use .csv, .json, or .sql')
    }

    const schema = analyzeSchema(parsed)
    const tableName = generateTableName()

    console.log(`[upload] Creating table ${tableName} with ${schema.length} columns`)
    await createTable(tableName, schema)
    console.log(`[upload] Table created, loading ${parsed.rows.length} rows`)
    const rowCount = await loadData(tableName, parsed, schema)
    console.log(`[upload] Loaded ${rowCount} rows`)

    const datasetName = file.originalname.replace(/\.[^/.]+$/, '')

    const { data: dataset, error } = await supabaseAdmin
      .from('datasets')
      .insert({
        name: datasetName,
        original_filename: file.originalname,
        file_type: fileType,
        table_name: tableName,
        schema: schema,
        row_count: rowCount,
        storage_path: null,
        session_id: sessionId,
      })
      .select()
      .single()

    if (error) {
      throw new AppError(500, `Failed to save dataset metadata: ${error.message}`)
    }

    res.status(201).json(dataset)
  } catch (err) {
    next(err)
  }
})

export { router as uploadRouter }
