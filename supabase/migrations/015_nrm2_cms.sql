-- ============================================
-- NRM2 CMS - Admin Management System
-- Allows admin users to add/edit NRM2 rules
-- ============================================

-- 1. Add is_admin column to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Update RLS policies to allow admins to INSERT/UPDATE/DELETE NRM2 rules
CREATE POLICY "Admins can insert NRM2 rules"
  ON nrm_rules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update NRM2 rules"
  ON nrm_rules
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can delete NRM2 rules"
  ON nrm_rules
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- 3. Same for nrm_sections
CREATE POLICY "Admins can insert NRM2 sections"
  ON nrm_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update NRM2 sections"
  ON nrm_sections
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can delete NRM2 sections"
  ON nrm_sections
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.is_admin = TRUE
    )
  );

-- 4. Grant necessary permissions
GRANT INSERT, UPDATE, DELETE ON nrm_sections TO authenticated;
GRANT INSERT, UPDATE, DELETE ON nrm_rules TO authenticated;

-- 5. Create helper view for NRM2 hierarchy
CREATE OR REPLACE VIEW nrm_rules_hierarchy AS
SELECT 
  r.id,
  r.section_id,
  s.code as section_code,
  s.title as section_title,
  r.path,
  r.level,
  r.content,
  r.unit,
  r.measurement_logic,
  r.coverage_rules,
  r.examples,
  r.notes,
  nlevel(r.path) as depth,
  subpath(r.path, 0, nlevel(r.path) - 1) as parent_path,
  (SELECT COUNT(*) FROM nrm_rules WHERE path <@ r.path AND path != r.path) as child_count
FROM nrm_rules r
JOIN nrm_sections s ON r.section_id = s.id
ORDER BY s.sort_order, r.path;

-- 6. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verification
DO $$ 
BEGIN
  RAISE NOTICE '✅ NRM2 CMS migration complete';
  RAISE NOTICE '- Admin column added to profiles';
  RAISE NOTICE '- Admin RLS policies created';
  RAISE NOTICE '- Hierarchy view created';
END $$;
