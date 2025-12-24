-- ============================================
-- ADD CUSTOM SECTION TYPES
-- Adds pre-work, demolition, and after care section types
-- ============================================
-- NOTE: In Supabase SQL Editor, run each ALTER TYPE statement separately
-- or run them one at a time to avoid transaction issues

-- Step 1: Add 'pre_work' (run this first, then commit/run next)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'pre_work' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'section_type')
    ) THEN
        ALTER TYPE section_type ADD VALUE 'pre_work';
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Value might already exist, ignore error
    NULL;
END $$;

-- Step 2: Add 'demolition' (run after step 1 completes)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'demolition' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'section_type')
    ) THEN
        ALTER TYPE section_type ADD VALUE 'demolition';
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Step 3: Add 'after_care' (run after step 2 completes)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'after_care' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'section_type')
    ) THEN
        ALTER TYPE section_type ADD VALUE 'after_care';
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Create index for filtering by type (if not exists)
CREATE INDEX IF NOT EXISTS project_sections_type_idx ON project_sections(section_type);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify
SELECT 
    'Custom section types added' as status,
    unnest(enum_range(NULL::section_type)) as available_types;

