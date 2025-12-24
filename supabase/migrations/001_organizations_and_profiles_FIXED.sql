-- ============================================
-- COMPLETE MIGRATION - Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Create subscription_tier enum (skip if already exists)
DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create organizations table (skip if already exists)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Step 3: Create profiles table (skip if already exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Step 4: Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Users can update their own organization" ON organizations;
DROP POLICY IF EXISTS "Users can insert into organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can insert into profiles" ON profiles;

-- Step 6: Create RLS Policies for SELECT
CREATE POLICY "Users can view their own organization"
  ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own organization"
  ON organizations
  FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Step 7: Create RLS Policies for INSERT (important for trigger)
CREATE POLICY "Users can insert into organizations"
  ON organizations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view profiles in their organization"
  ON profiles
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update profiles in their organization"
  ON profiles
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert into profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (true);

-- Step 8: Create or replace the trigger function with proper permissions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create a new organization for the user
  INSERT INTO public.organizations (name, subscription_tier)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'organization_name', 'My Organization'),
    'free'
  )
  RETURNING id INTO new_org_id;

  -- Create a profile for the user
  INSERT INTO public.profiles (user_id, organization_id, full_name, role)
  VALUES (
    NEW.id,
    new_org_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', NULL)
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 9: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 10: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 11: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON organizations TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- Step 12: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Tables: organizations, profiles';
  RAISE NOTICE 'Trigger: on_auth_user_created';
  RAISE NOTICE 'Function: handle_new_user';
END $$;

