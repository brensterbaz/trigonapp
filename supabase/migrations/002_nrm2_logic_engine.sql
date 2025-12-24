-- ============================================
-- NRM2 LOGIC ENGINE MIGRATION
-- Creates tables for hierarchical NRM2 rules
-- ============================================

-- Step 1: Enable ltree extension for hierarchical paths
CREATE EXTENSION IF NOT EXISTS ltree;

-- Step 2: Create NRM2 Sections table (41 work sections)
CREATE TABLE IF NOT EXISTS nrm_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Step 3: Create NRM2 Rules table with ltree hierarchy
CREATE TABLE IF NOT EXISTS nrm_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES nrm_sections(id) ON DELETE CASCADE,
  path ltree NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 3),
  content TEXT NOT NULL,
  unit TEXT,
  measurement_logic JSONB DEFAULT '{}',
  coverage_rules JSONB DEFAULT '[]',
  examples TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(section_id, path)
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_nrm_rules_path ON nrm_rules USING GIST (path);
CREATE INDEX IF NOT EXISTS idx_nrm_rules_section_id ON nrm_rules (section_id);
CREATE INDEX IF NOT EXISTS idx_nrm_rules_level ON nrm_rules (level);
CREATE INDEX IF NOT EXISTS idx_nrm_sections_code ON nrm_sections (code);

-- Step 5: Enable Row Level Security
ALTER TABLE nrm_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE nrm_rules ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies (NRM2 data is read-only for all authenticated users)
CREATE POLICY "NRM2 sections are viewable by authenticated users"
  ON nrm_sections
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "NRM2 rules are viewable by authenticated users"
  ON nrm_rules
  FOR SELECT
  TO authenticated
  USING (true);

-- Step 7: Grant permissions
GRANT SELECT ON nrm_sections TO authenticated;
GRANT SELECT ON nrm_rules TO authenticated;

-- Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'NRM2 Logic Engine migration completed!';
  RAISE NOTICE 'Tables: nrm_sections, nrm_rules';
  RAISE NOTICE 'Extension: ltree enabled';
END $$;

