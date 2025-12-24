-- Ensure all section_type enum values exist
-- IMPORTANT: PostgreSQL requires enum values to be committed before use
-- Run each ALTER TYPE statement separately in Supabase SQL Editor
-- Or run this entire file, then refresh/restart your connection

-- Step 1: Add 'preliminary' if it doesn't exist
-- Run this first, then commit/refresh before using
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'preliminary' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'section_type')
    ) THEN
        ALTER TYPE section_type ADD VALUE 'preliminary';
    END IF;
EXCEPTION 
    WHEN duplicate_object THEN
        RAISE NOTICE 'preliminary already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding preliminary: %', SQLERRM;
END $$;

-- Step 2: Add 'pre_work' if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'pre_work' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'section_type')
    ) THEN
        ALTER TYPE section_type ADD VALUE 'pre_work';
    END IF;
EXCEPTION 
    WHEN duplicate_object THEN
        RAISE NOTICE 'pre_work already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding pre_work: %', SQLERRM;
END $$;

-- Step 3: Add 'demolition' if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'demolition' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'section_type')
    ) THEN
        ALTER TYPE section_type ADD VALUE 'demolition';
    END IF;
EXCEPTION 
    WHEN duplicate_object THEN
        RAISE NOTICE 'demolition already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding demolition: %', SQLERRM;
END $$;

-- Step 4: Add 'after_care' if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'after_care' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'section_type')
    ) THEN
        ALTER TYPE section_type ADD VALUE 'after_care';
    END IF;
EXCEPTION 
    WHEN duplicate_object THEN
        RAISE NOTICE 'after_care already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding after_care: %', SQLERRM;
END $$;

-- NOTE: Do not query the enum immediately after adding values
-- PostgreSQL requires enum values to be committed before use
-- To verify values, run this query separately after committing:
-- SELECT unnest(enum_range(NULL::section_type)) as available_types;

-- Refresh schema cache (this is safe to run)
NOTIFY pgrst, 'reload schema';

