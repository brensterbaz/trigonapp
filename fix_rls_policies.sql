-- ============================================
-- FIX: Row Level Security Policies for project_sections
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view sections in own organization projects" ON project_sections;
DROP POLICY IF EXISTS "Users can create sections in own organization projects" ON project_sections;
DROP POLICY IF EXISTS "Users can update sections in own organization projects" ON project_sections;
DROP POLICY IF EXISTS "Users can delete sections from own organization projects" ON project_sections;

-- Recreate SELECT policy
CREATE POLICY "Users can view sections in own organization projects"
  ON project_sections FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Recreate INSERT policy (FIXED - simpler check)
CREATE POLICY "Users can create sections in own organization projects"
  ON project_sections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      INNER JOIN profiles pr ON pr.organization_id = p.organization_id
      WHERE p.id = project_sections.project_id
      AND pr.user_id = auth.uid()
    )
  );

-- Recreate UPDATE policy
CREATE POLICY "Users can update sections in own organization projects"
  ON project_sections FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Recreate DELETE policy
CREATE POLICY "Users can delete sections from own organization projects"
  ON project_sections FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename = 'project_sections';

-- Test: Check if current user can see their profile
SELECT 
    'Current user check:' as test,
    auth.uid() as user_id,
    (SELECT organization_id FROM profiles WHERE user_id = auth.uid()) as org_id;

