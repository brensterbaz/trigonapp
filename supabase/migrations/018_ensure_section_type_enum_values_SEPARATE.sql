-- ============================================
-- ADD MISSING SECTION TYPE ENUM VALUES
-- ============================================
-- IMPORTANT: PostgreSQL requires enum values to be committed in separate transactions
-- Run each ALTER TYPE statement ONE AT A TIME in Supabase SQL Editor
-- Wait for each to complete before running the next
-- ============================================

-- Step 1: Add 'preliminary' (run this first, wait for success, then run next)
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'preliminary';

-- Step 2: Add 'pre_work' (run after step 1 completes)
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'pre_work';

-- Step 3: Add 'demolition' (run after step 2 completes)
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'demolition';

-- Step 4: Add 'after_care' (run after step 3 completes)
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'after_care';

-- Step 5: Verify all values exist (run this last to check)
SELECT 
    'Section type enum values' as status,
    unnest(enum_range(NULL::section_type)) as available_types;

-- Step 6: Refresh schema cache
NOTIFY pgrst, 'reload schema';

