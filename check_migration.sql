-- Quick Check: Do I need to run the migration?
-- Run this in Supabase SQL Editor

-- Test 1: Check if project_sections table exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'project_sections'
    ) THEN
        RAISE NOTICE '✅ project_sections table EXISTS';
    ELSE
        RAISE NOTICE '❌ project_sections table DOES NOT EXIST - You need to run the migration!';
    END IF;
END $$;

-- Test 2: Check if section_id column exists in bill_of_quantities
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bill_of_quantities'
        AND column_name = 'section_id'
    ) THEN
        RAISE NOTICE '✅ section_id column EXISTS in bill_of_quantities';
    ELSE
        RAISE NOTICE '❌ section_id column DOES NOT EXIST - You need to run the migration!';
    END IF;
END $$;

-- Test 3: Check if views exist
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'project_section_summaries'
    ) THEN
        RAISE NOTICE '✅ project_section_summaries view EXISTS';
    ELSE
        RAISE NOTICE '❌ project_section_summaries view DOES NOT EXIST - You need to run the migration!';
    END IF;
END $$;

-- If you see ❌ for any of the above, run the migration:
-- 1. Open: supabase/migrations/012_project_sections.sql
-- 2. Copy ALL contents
-- 3. Paste and run in SQL Editor

