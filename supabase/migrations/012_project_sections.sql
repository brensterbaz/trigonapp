-- ============================================
-- PROJECT SECTIONS MIGRATION
-- Allows projects to be broken down into sections
-- e.g., House project with Bathroom, Bedroom, Kitchen sections
-- ============================================

-- ========================================
-- PROJECT SECTIONS TABLE
-- ========================================
CREATE TABLE project_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT, -- Optional code like "BTH-01" for Bathroom
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Color coding for visual distinction in UI
  color_hex TEXT DEFAULT '#3B82F6',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure section names are unique within a project
  CONSTRAINT unique_section_name_per_project UNIQUE(project_id, name),
  CONSTRAINT unique_section_code_per_project UNIQUE(project_id, code)
);

-- Indexes for performance
CREATE INDEX project_sections_project_id_idx ON project_sections(project_id);
CREATE INDEX project_sections_sort_order_idx ON project_sections(project_id, sort_order);

-- ========================================
-- ADD SECTION_ID TO BILL OF QUANTITIES
-- ========================================
ALTER TABLE bill_of_quantities 
  ADD COLUMN section_id UUID REFERENCES project_sections(id) ON DELETE SET NULL;

-- Index for filtering BQ items by section
CREATE INDEX bq_section_id_idx ON bill_of_quantities(section_id);
CREATE INDEX bq_project_section_idx ON bill_of_quantities(project_id, section_id);

-- ========================================
-- RLS POLICIES FOR PROJECT SECTIONS
-- ========================================
ALTER TABLE project_sections ENABLE ROW LEVEL SECURITY;

-- Users can view sections for projects in their organization
CREATE POLICY "Users can view sections in own organization projects"
  ON project_sections FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Users can insert sections into their organization's projects
CREATE POLICY "Users can create sections in own organization projects"
  ON project_sections FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Users can update sections in their organization's projects
CREATE POLICY "Users can update sections in own organization projects"
  ON project_sections FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Users can delete sections from their organization's projects
CREATE POLICY "Users can delete sections from own organization projects"
  ON project_sections FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at timestamp on project_sections
CREATE OR REPLACE FUNCTION update_project_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_sections_updated_at
  BEFORE UPDATE ON project_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_project_sections_updated_at();

-- ========================================
-- HELPER VIEWS
-- ========================================

-- View for section summaries with totals
CREATE OR REPLACE VIEW project_section_summaries AS
SELECT 
  ps.id as section_id,
  ps.project_id,
  ps.name as section_name,
  ps.code as section_code,
  ps.description,
  ps.color_hex,
  ps.sort_order,
  COUNT(bq.id) as item_count,
  COALESCE(SUM(bq.amount), 0) as section_total,
  ps.created_at,
  ps.updated_at
FROM project_sections ps
LEFT JOIN bill_of_quantities bq ON ps.id = bq.section_id
GROUP BY ps.id, ps.project_id, ps.name, ps.code, ps.description, 
         ps.color_hex, ps.sort_order, ps.created_at, ps.updated_at;

COMMENT ON VIEW project_section_summaries IS 'Section totals with item counts for quick reporting';

-- View for project totals aggregated from sections
CREATE OR REPLACE VIEW project_totals_by_section AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  p.code as project_code,
  COUNT(DISTINCT ps.id) as section_count,
  COUNT(bq.id) as total_items,
  COALESCE(SUM(bq.amount), 0) as project_total,
  -- Items without section assignment
  COUNT(bq.id) FILTER (WHERE bq.section_id IS NULL) as unsectioned_items,
  COALESCE(SUM(bq.amount) FILTER (WHERE bq.section_id IS NULL), 0) as unsectioned_total
FROM projects p
LEFT JOIN project_sections ps ON p.id = ps.project_id
LEFT JOIN bill_of_quantities bq ON p.id = bq.project_id
GROUP BY p.id, p.name, p.code;

COMMENT ON VIEW project_totals_by_section IS 'Project-level summaries showing totals from all sections';

-- ========================================
-- GRANT PERMISSIONS
-- ========================================
GRANT ALL ON project_sections TO authenticated;
GRANT SELECT ON project_section_summaries TO authenticated;
GRANT SELECT ON project_totals_by_section TO authenticated;

-- ========================================
-- VERIFICATION
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✓ Project Sections migration completed!';
  RAISE NOTICE '  - project_sections table created';
  RAISE NOTICE '  - section_id column added to bill_of_quantities';
  RAISE NOTICE '  - RLS policies configured';
  RAISE NOTICE '  - Summary views created';
END $$;
