-- Ensure all required section_type enum values exist
-- Run this in Supabase SQL Editor

-- Add preliminary if missing
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
        RAISE NOTICE 'preliminary already exists';
    END IF;
EXCEPTION 
    WHEN duplicate_object THEN
        RAISE NOTICE 'preliminary already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding preliminary: %', SQLERRM;
END $$;

-- Add pre_work if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'pre_work' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'section_type')
    ) THEN
        ALTER TYPE section_type ADD VALUE 'pre_work';
        RAISE NOTICE 'Added pre_work to section_type enum';
    ELSE
        RAISE NOTICE 'pre_work already exists';
    END IF;
EXCEPTION 
    WHEN duplicate_object THEN
        RAISE NOTICE 'pre_work already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding pre_work: %', SQLERRM;
END $$;

-- Add demolition if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'demolition' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'section_type')
    ) THEN
        ALTER TYPE section_type ADD VALUE 'demolition';
        RAISE NOTICE 'Added demolition to section_type enum';
    ELSE
        RAISE NOTICE 'demolition already exists';
    END IF;
EXCEPTION 
    WHEN duplicate_object THEN
        RAISE NOTICE 'demolition already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding demolition: %', SQLERRM;
END $$;

-- Add after_care if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'after_care' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'section_type')
    ) THEN
        ALTER TYPE section_type ADD VALUE 'after_care';
        RAISE NOTICE 'Added after_care to section_type enum';
    ELSE
        RAISE NOTICE 'after_care already exists';
    END IF;
EXCEPTION 
    WHEN duplicate_object THEN
        RAISE NOTICE 'after_care already exists';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding after_care: %', SQLERRM;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
