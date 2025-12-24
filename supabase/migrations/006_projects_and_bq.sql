-- ============================================
-- PROJECT MANAGEMENT & BILL OF QUANTITIES
-- Phase 3: Core project and BQ structure
-- ============================================

-- Create ENUM for breakdown structure type
CREATE TYPE breakdown_structure_type AS ENUM ('elemental', 'work_sectional');

-- Create ENUM for project status
CREATE TYPE project_status AS ENUM ('draft', 'active', 'tendered', 'archived');

-- ========================================
-- PROJECTS TABLE
-- ========================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  breakdown_structure breakdown_structure_type NOT NULL DEFAULT 'work_sectional',
  status project_status NOT NULL DEFAULT 'draft',
  client_name TEXT,
  location TEXT,
  contract_value NUMERIC(15, 2),
  tender_deadline TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_project_code_per_org UNIQUE(organization_id, code)
);

-- Index for faster queries
CREATE INDEX projects_org_id_idx ON projects(organization_id);
CREATE INDEX projects_status_idx ON projects(status);
CREATE INDEX projects_created_at_idx ON projects(created_at DESC);

-- RLS Policies for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can view projects in their organization
CREATE POLICY "Users can view own organization projects"
  ON projects FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can insert projects into their organization
CREATE POLICY "Users can create projects in own organization"
  ON projects FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update projects in their organization
CREATE POLICY "Users can update own organization projects"
  ON projects FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can delete projects in their organization
CREATE POLICY "Users can delete own organization projects"
  ON projects FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- BILL OF QUANTITIES (BQ) TABLE
-- ========================================
CREATE TABLE bill_of_quantities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  nrm_rule_id UUID NOT NULL REFERENCES nrm_rules(id),
  
  -- Description (can be customized from NRM rule)
  description_custom TEXT,
  
  -- Measurement data
  quantity NUMERIC(15, 4) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  
  -- Pricing (optional, can be filled later)
  rate NUMERIC(15, 2),
  amount NUMERIC(15, 2) GENERATED ALWAYS AS (quantity * COALESCE(rate, 0)) STORED,
  
  -- Ordering
  sort_order INTEGER,
  
  -- Reference and notes
  reference_drawing TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX bq_project_id_idx ON bill_of_quantities(project_id);
CREATE INDEX bq_nrm_rule_id_idx ON bill_of_quantities(nrm_rule_id);
CREATE INDEX bq_sort_order_idx ON bill_of_quantities(project_id, sort_order);

-- RLS Policies for bill_of_quantities
ALTER TABLE bill_of_quantities ENABLE ROW LEVEL SECURITY;

-- Users can view BQ items for projects in their organization
CREATE POLICY "Users can view BQ items in own organization projects"
  ON bill_of_quantities FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Users can insert BQ items into their organization's projects
CREATE POLICY "Users can create BQ items in own organization projects"
  ON bill_of_quantities FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Users can update BQ items in their organization's projects
CREATE POLICY "Users can update BQ items in own organization projects"
  ON bill_of_quantities FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Users can delete BQ items from their organization's projects
CREATE POLICY "Users can delete BQ items from own organization projects"
  ON bill_of_quantities FOR DELETE
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

-- Update updated_at timestamp on projects
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();

-- Update updated_at timestamp on bill_of_quantities
CREATE OR REPLACE FUNCTION update_bq_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bq_updated_at
  BEFORE UPDATE ON bill_of_quantities
  FOR EACH ROW
  EXECUTE FUNCTION update_bq_updated_at();

-- ========================================
-- HELPER VIEWS
-- ========================================

-- View for BQ items with joined NRM rule details
CREATE OR REPLACE VIEW bq_items_with_rules AS
SELECT 
  bq.*,
  nr.path as nrm_path,
  nr.level as nrm_level,
  nr.content as nrm_content,
  nr.coverage_rules,
  nr.measurement_logic,
  ns.code as section_code,
  ns.title as section_title
FROM bill_of_quantities bq
JOIN nrm_rules nr ON bq.nrm_rule_id = nr.id
JOIN nrm_sections ns ON nr.section_id = ns.id;

COMMENT ON VIEW bq_items_with_rules IS 'BQ items with full NRM2 rule context for easier querying';

