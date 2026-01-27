-- Add featured post columns
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_at TIMESTAMP;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON posts(is_featured) WHERE is_featured = true;

-- Update existing posts to ensure they are not featured
UPDATE posts SET is_featured = false WHERE is_featured IS NULL;
