-- Add post moderation columns
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reviewed_by INTEGER REFERENCES users(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- Update existing posts to approved status
UPDATE posts SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- Add constraint for valid status values
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;
ALTER TABLE posts ADD CONSTRAINT posts_status_check CHECK (status IN ('pending', 'approved', 'rejected'));
