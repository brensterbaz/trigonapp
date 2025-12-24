-- ============================================
-- FIX: Refresh Supabase Schema Cache
-- Run this when you get "could not find column" errors
-- ============================================

-- Step 1: Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'project_sections'
ORDER BY ordinal_position;

-- Step 2: If columns are missing, add them
-- (Safe to run even if they exist - will just skip)
DO $$ 
BEGIN
    -- Add code column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'project_sections' AND column_name = 'code'
    ) THEN
        ALTER TABLE project_sections ADD COLUMN code TEXT;
    END IF;
    
    -- Add color_hex column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'project_sections' AND column_name = 'color_hex'
    ) THEN
        ALTER TABLE project_sections ADD COLUMN color_hex TEXT DEFAULT '#3B82F6';
    END IF;
    
    -- Add description column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'project_sections' AND column_name = 'description'
    ) THEN
        ALTER TABLE project_sections ADD COLUMN description TEXT;
    END IF;
    
    RAISE NOTICE '✓ Columns verified/added';
END $$;

-- Step 3: Ensure constraints exist
DO $$
BEGIN
    -- Drop old constraints if they exist
    ALTER TABLE project_sections DROP CONSTRAINT IF EXISTS unique_section_code_per_project;
    ALTER TABLE project_sections DROP CONSTRAINT IF EXISTS unique_section_name_per_project;
    
    -- Add them back
    ALTER TABLE project_sections 
        ADD CONSTRAINT unique_section_name_per_project 
        UNIQUE(project_id, name);
    
    ALTER TABLE project_sections 
        ADD CONSTRAINT unique_section_code_per_project 
        UNIQUE(project_id, code);
    
    RAISE NOTICE '✓ Constraints added';
END $$;

-- Step 4: FORCE Supabase to reload schema cache
-- This is the key command!
NOTIFY pgrst, 'reload schema';

-- Alternative: Drop and recreate the PostgREST schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Step 5: Verify it worked
SELECT 
    'project_sections table structure:' as status,
    count(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'project_sections';

-- You should see: code, color_hex, description, name, etc.

