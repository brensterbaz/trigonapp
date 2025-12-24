-- ============================================
-- ADD SECTION TYPES FOR PRELIMINARIES
-- This allows sections to be marked as "Preliminaries", "Main Work", etc.
-- ============================================

-- Create enum for section types
CREATE TYPE section_type AS ENUM ('preliminary', 'main_work', 'summary');

-- Add section_type column to project_sections
ALTER TABLE project_sections 
  ADD COLUMN section_type section_type DEFAULT 'main_work';

-- Add is_pre_cost boolean for backwards compatibility
ALTER TABLE project_sections 
  ADD COLUMN is_pre_cost BOOLEAN DEFAULT FALSE;

-- Update existing sections to be 'main_work'
UPDATE project_sections 
SET section_type = 'main_work', is_pre_cost = FALSE
WHERE section_type IS NULL;

-- Create index for filtering by type
CREATE INDEX project_sections_type_idx ON project_sections(section_type);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify
SELECT 
    'Section types added' as status,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'project_sections'
AND column_name IN ('section_type', 'is_pre_cost');

