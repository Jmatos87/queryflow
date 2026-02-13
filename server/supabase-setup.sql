-- Run these in the Supabase SQL Editor

-- Datasets table
CREATE TABLE IF NOT EXISTS datasets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('csv', 'json', 'sql', 'xlsx')),
  table_name TEXT NOT NULL UNIQUE,
  schema JSONB NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  storage_path TEXT,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_datasets_session ON datasets(session_id);

-- Query history table
CREATE TABLE IF NOT EXISTS query_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  natural_language TEXT NOT NULL,
  generated_sql TEXT NOT NULL,
  result JSONB,
  row_count INTEGER NOT NULL DEFAULT 0,
  execution_time_ms INTEGER,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_query_history_dataset ON query_history(dataset_id);
CREATE INDEX idx_query_history_session ON query_history(session_id);

-- Read-only query execution function (for SELECT queries)
CREATE OR REPLACE FUNCTION execute_readonly_query(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT (UPPER(TRIM(query_text)) LIKE 'SELECT%') THEN
    RAISE EXCEPTION 'Only SELECT statements are allowed';
  END IF;

  EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || query_text || ') t'
    INTO result;

  RETURN result;
END;
$$;

-- DDL/DML execution function (for CREATE TABLE and INSERT during dataset upload)
CREATE OR REPLACE FUNCTION execute_sql(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  upper_trimmed TEXT := UPPER(TRIM(query_text));
BEGIN
  -- Allow CREATE TABLE and INSERT INTO ds_ tables only
  IF upper_trimmed LIKE 'CREATE TABLE%' THEN
    EXECUTE query_text;
  ELSIF upper_trimmed LIKE 'INSERT INTO%' AND query_text LIKE '%"ds_%' THEN
    EXECUTE query_text;
  ELSE
    RAISE EXCEPTION 'Only CREATE TABLE and INSERT INTO dataset tables are allowed';
  END IF;

  RETURN '{"success": true}'::jsonb;
END;
$$;

-- INSERT execution function (for loading data during dataset upload)
CREATE OR REPLACE FUNCTION execute_insert(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow INSERT INTO statements for ds_ tables
  IF NOT (UPPER(TRIM(query_text)) LIKE 'INSERT INTO%') THEN
    RAISE EXCEPTION 'Only INSERT statements are allowed';
  END IF;

  IF NOT (query_text LIKE '%"ds_%') THEN
    RAISE EXCEPTION 'Can only insert into dataset tables (ds_*)';
  END IF;

  EXECUTE query_text;

  RETURN '{"success": true}'::jsonb;
END;
$$;

-- Storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('datasets', 'datasets', false)
ON CONFLICT DO NOTHING;
