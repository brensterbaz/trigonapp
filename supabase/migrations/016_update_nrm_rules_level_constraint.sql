-- ============================================
-- UPDATE NRM RULES LEVEL CONSTRAINT
-- Allow level 4 for more detailed specifications
-- ============================================

-- Drop the existing check constraint
ALTER TABLE nrm_rules 
DROP CONSTRAINT IF EXISTS nrm_rules_level_check;

-- Add new check constraint allowing levels 1-4
ALTER TABLE nrm_rules 
ADD CONSTRAINT nrm_rules_level_check 
CHECK (level >= 1 AND level <= 4);

-- Verification
DO $$ 
BEGIN
  RAISE NOTICE '✅ NRM rules level constraint updated to allow levels 1-4';
END $$;

