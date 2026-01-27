-- Migration: 003_add_admin_logs
-- Description: Create admin activity logs table for audit trail
-- Created: 2026-01-06

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target ON admin_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- Add comments
COMMENT ON TABLE admin_logs IS 'Tracks all administrative actions for audit trail';
COMMENT ON COLUMN admin_logs.action IS 'Action performed (e.g., promote_user, delete_post, ban_user)';
COMMENT ON COLUMN admin_logs.target_type IS 'Type of target (user, post, comment)';
COMMENT ON COLUMN admin_logs.target_id IS 'ID of the target entity';
COMMENT ON COLUMN admin_logs.details IS 'Additional details about the action in JSON format';
