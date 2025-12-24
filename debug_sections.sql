-- ============================================
-- DEBUG: Check Migration Status
-- Run this in Supabase SQL Editor to verify everything is set up correctly
-- ============================================

-- Test 1: Check if project_sections table exists and has correct structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'project_sections'
ORDER BY ordinal_position;

-- Test 2: Check if section_id column exists in bill_of_quantities
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bill_of_quantities'
AND column_name = 'section_id';

-- Test 3: Check RLS policies on project_sections
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename = 'project_sections';

-- Test 4: Try to manually insert a test section (replace PROJECT_ID with your actual project ID)
-- Uncomment and modify this if you want to test direct insertion:
-- INSERT INTO project_sections (project_id, name, code, color_hex, sort_order)
-- VALUES ('YOUR_PROJECT_ID_HERE', 'Test Section', 'TEST', '#3B82F6', 1)
-- RETURNING *;

-- Test 5: Check if views were created
SELECT 
    table_schema,
    table_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('project_section_summaries', 'project_totals_by_section');

