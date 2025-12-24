-- ============================================
-- UPDATE PROJECT STATUS ENUM
-- Add new statuses: ready, in_progress, done
-- ============================================

-- Check current status values
SELECT DISTINCT status FROM projects;

-- PostgreSQL doesn't allow adding values if they already exist
-- So we use a DO block to check first
DO $$
BEGIN
    -- Add 'ready' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'ready' 
        AND enumtypid = 'project_status'::regtype
    ) THEN
        ALTER TYPE project_status ADD VALUE 'ready';
    END IF;

    -- Add 'in_progress' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'in_progress' 
        AND enumtypid = 'project_status'::regtype
    ) THEN
        ALTER TYPE project_status ADD VALUE 'in_progress';
    END IF;

    -- Add 'done' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'done' 
        AND enumtypid = 'project_status'::regtype
    ) THEN
        ALTER TYPE project_status ADD VALUE 'done';
    END IF;
END $$;

-- Update any existing 'active' projects to 'in_progress' for consistency
UPDATE projects SET status = 'in_progress' WHERE status = 'active';

-- Update any existing 'tendered' projects to 'done' for consistency
UPDATE projects SET status = 'done' WHERE status = 'tendered';

-- Verify the changes
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'project_status'::regtype ORDER BY enumsortorder;
