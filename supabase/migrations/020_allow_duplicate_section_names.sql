-- Allow duplicate section names within the same project
-- Remove the unique constraint on section names

-- Drop the unique constraint on section names
ALTER TABLE project_sections 
DROP CONSTRAINT IF EXISTS unique_section_name_per_project;

-- Note: Section codes can still be unique if needed
-- The unique_section_code_per_project constraint remains

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

