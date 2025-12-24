# Troubleshooting: Sign Up Not Creating Tables

## Common Issues and Solutions

### Issue 1: Email Confirmation Required

**Problem**: Supabase may require email confirmation before the user is fully created.

**Solution**:
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/mnhyqthohhklzhlopjry/auth/providers
2. Click on **Email** provider
3. **Disable "Confirm email"** for development (or check your email and confirm)
4. Try signing up again

### Issue 2: Migration Not Run

**Problem**: The tables don't exist yet.

**Solution**:
1. Go to SQL Editor: https://supabase.com/dashboard/project/mnhyqthohhklzhlopjry/sql/new
2. Run the migration from `supabase/migrations/001_organizations_and_profiles.sql`
3. Also run `supabase/migrations/002_fix_insert_policies.sql` (adds INSERT policies)

### Issue 3: Trigger Not Firing

**Problem**: The trigger function might not exist or have errors.

**Solution**:
1. Go to Database → Functions in Supabase
2. Check if `handle_new_user` function exists
3. Check Database → Triggers for `on_auth_user_created`
4. If missing, run the migration again

### Issue 4: Check What's Actually Happening

**Steps to diagnose**:

1. **Check if user was created**:
   - Go to Authentication → Users
   - Do you see the new user? Is it confirmed?

2. **Check Supabase Logs**:
   - Go to Logs → Postgres Logs
   - Look for any errors when you sign up

3. **Run diagnostic script**:
   ```bash
   npx tsx scripts/check-database.ts
   ```

4. **Manually test the trigger**:
   - If a user exists but no org/profile, the trigger might have failed
   - Check the Postgres logs for errors

## Quick Fix: Run Additional Migration

Run this SQL in Supabase SQL Editor to add INSERT policies:

```sql
-- Add INSERT policies
CREATE POLICY "Users can insert into organizations"
  ON organizations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can insert into profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (true);
```

## Manual Test

If signup still doesn't work, try this manual test:

1. Sign up for a new account
2. Check Authentication → Users (user should exist)
3. Go to SQL Editor and run:
   ```sql
   SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 1;
   ```
4. Check if the trigger created the org/profile:
   ```sql
   SELECT * FROM organizations ORDER BY created_at DESC LIMIT 1;
   SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
   ```

If the user exists but org/profile don't, the trigger isn't firing. Check the function and trigger in Database → Functions and Database → Triggers.

