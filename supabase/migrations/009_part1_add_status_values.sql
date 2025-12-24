-- ============================================
-- PART 1: Add New Status Values
-- Run this FIRST, then run Part 2
-- ============================================

DO $$
BEGIN
    -- Add 'ready' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'ready' 
        AND enumtypid = 'project_status'::regtype
    ) THEN
        ALTER TYPE project_status ADD VALUE 'ready';
        RAISE NOTICE 'Added status: ready';
    ELSE
        RAISE NOTICE 'Status ready already exists';
    END IF;

    -- Add 'in_progress' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'in_progress' 
        AND enumtypid = 'project_status'::regtype
    ) THEN
        ALTER TYPE project_status ADD VALUE 'in_progress';
        RAISE NOTICE 'Added status: in_progress';
    ELSE
        RAISE NOTICE 'Status in_progress already exists';
    END IF;

    -- Add 'done' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'done' 
        AND enumtypid = 'project_status'::regtype
    ) THEN
        ALTER TYPE project_status ADD VALUE 'done';
        RAISE NOTICE 'Added status: done';
    ELSE
        RAISE NOTICE 'Status done already exists';
    END IF;
END $$;

-- Verify the new values were added
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'project_status'::regtype 
ORDER BY enumsortorder;

