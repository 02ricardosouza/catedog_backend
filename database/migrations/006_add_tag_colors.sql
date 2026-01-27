-- Add color column to tags table
ALTER TABLE tags ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3b82f6';
