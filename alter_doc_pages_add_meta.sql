-- Add meta_title and meta_description columns to doc_pages table
ALTER TABLE doc_pages 
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT;
