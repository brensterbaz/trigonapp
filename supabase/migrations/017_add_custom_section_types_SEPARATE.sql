-- ============================================
-- ADD CUSTOM SECTION TYPES (SEPARATE STATEMENTS)
-- Run each statement separately in Supabase SQL Editor
-- ============================================

-- Run these ONE AT A TIME in Supabase SQL Editor:

-- 1. First, run this:
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'pre_work';

-- 2. Then run this (after the first completes):
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'demolition';

-- 3. Then run this (after the second completes):
ALTER TYPE section_type ADD VALUE IF NOT EXISTS 'after_care';

-- 4. Finally, run this to create the index:
CREATE INDEX IF NOT EXISTS project_sections_type_idx ON project_sections(section_type);

-- 5. Refresh schema:
NOTIFY pgrst, 'reload schema';

-- Verify all types exist:
SELECT unnest(enum_range(NULL::section_type)) as available_types;


