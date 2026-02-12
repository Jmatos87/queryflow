import dotenv from 'dotenv'

dotenv.config()

export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
  MCP_SERVER_URL: process.env.MCP_SERVER_URL || 'http://localhost:3002',
} as const
