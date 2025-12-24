-- Add 'preliminary' to section_type enum
-- Run this in Supabase SQL Editor
-- PostgreSQL requires this to be committed before the value can be used

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'preliminary' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'section_type')
    ) THEN
        ALTER TYPE section_type ADD VALUE 'preliminary';
        RAISE NOTICE 'Added preliminary to section_type enum';
    ELSE
        RAISE NOTICE 'preliminary already exists in section_type enum';
    END IF;
EXCEPTION 
    WHEN duplicate_object THEN
        RAISE NOTICE 'preliminary already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

