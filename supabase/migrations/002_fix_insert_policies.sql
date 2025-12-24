-- Add INSERT policies for organizations and profiles
-- These are needed even though the trigger uses SECURITY DEFINER

-- Allow authenticated users to insert into organizations
-- (The trigger will handle this, but having the policy is good practice)
CREATE POLICY "Users can insert into organizations"
  ON organizations
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to insert into profiles
CREATE POLICY "Users can insert into profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (true);

