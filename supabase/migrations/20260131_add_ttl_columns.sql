-- Migration: Add TTL columns for post visibility
-- Date: 2026-01-31

-- Add new columns for TTL management
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS visible_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS image_thumb_path TEXT,
ADD COLUMN IF NOT EXISTS image_expires_at TIMESTAMP WITH TIME ZONE;

-- Backfill: set visible_until = created_at + 60 days for existing posts
UPDATE posts
SET visible_until = created_at + INTERVAL '60 days'
WHERE visible_until IS NULL;

-- Create index for efficient TTL queries
CREATE INDEX IF NOT EXISTS idx_posts_visible_until ON posts (visible_until);
CREATE INDEX IF NOT EXISTS idx_posts_archived_at ON posts (archived_at);

-- Add comment for documentation
COMMENT ON COLUMN posts.visible_until IS 'Post visible until this date (created_at + 60 days)';
COMMENT ON COLUMN posts.archived_at IS 'When the post was archived (set by cleanup job)';
COMMENT ON COLUMN posts.image_thumb_path IS 'Path to thumbnail in storage (deleted after TTL)';
COMMENT ON COLUMN posts.image_expires_at IS 'When the image should be deleted (same as visible_until)';
