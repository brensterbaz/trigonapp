-- Quick Check: Test if migration is needed
-- Copy and paste this entire file into Supabase SQL Editor

DO $$
BEGIN
    -- Test 1: Check if project_sections table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'project_sections'
    ) THEN
        RAISE NOTICE '✅ project_sections table EXISTS';
    ELSE
        RAISE NOTICE '❌ project_sections table DOES NOT EXIST - Run migration!';
    END IF;

    -- Test 2: Check if section_id column exists
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bill_of_quantities'
        AND column_name = 'section_id'
    ) THEN
        RAISE NOTICE '✅ section_id column EXISTS in bill_of_quantities';
    ELSE
        RAISE NOTICE '❌ section_id column MISSING - Run migration!';
    END IF;

    -- Test 3: Check if views exist
    IF EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'project_section_summaries'
    ) THEN
        RAISE NOTICE '✅ project_section_summaries view EXISTS';
    ELSE
        RAISE NOTICE '❌ view MISSING - Run migration!';
    END IF;
END $$;

