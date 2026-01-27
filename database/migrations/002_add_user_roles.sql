-- Migration: 002_add_user_roles
-- Description: Add role system and user status management
-- Created: 2026-01-06

-- Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'editor', 'admin'));

-- Add is_active column for banning users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add updated_at column for tracking changes
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Update existing users to have 'user' role if null
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Create a default admin user (password: admin123 - CHANGE IN PRODUCTION!)
-- Password hash for 'admin123' using bcrypt (generated with bcrypt.hash('admin123', 10))
INSERT INTO users (name, email, password, role, is_active) 
VALUES (
    'Administrador',
    'admin@animalblog.com',
    '$2b$10$INTnwMINa3v86EbAPCG0qeb.xoyvTpKjuzioYX6WUngrebtPtIFeC',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Add comment explaining the role system
COMMENT ON COLUMN users.role IS 'User role: user (default), editor (can create posts), admin (full access)';
COMMENT ON COLUMN users.is_active IS 'User status: true (active), false (banned)';
