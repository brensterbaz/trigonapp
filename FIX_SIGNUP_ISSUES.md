# Fix Sign Up Issues - Step by Step

## Problem
Sign up is not creating records in the `organizations` and `profiles` tables.

## Solution

### Step 1: Run the Fixed Migration

1. **Open Supabase SQL Editor**:
   - Go to: https://supabase.com/dashboard/project/mnhyqthohhklzhlopjry/sql/new

2. **Copy the Fixed Migration**:
   - Open: `supabase/migrations/001_organizations_and_profiles_FIXED.sql`
   - Copy **ALL** the SQL code

3. **Paste and Run**:
   - Paste into SQL Editor
   - Click **"Run"** (or Ctrl+Enter)
   - You should see: "Success. No rows returned" and a notice about migration completion

### Step 2: Disable Email Confirmation (for Development)

Email confirmation can prevent the trigger from firing immediately.

1. Go to: https://supabase.com/dashboard/project/mnhyqthohhklzhlopjry/auth/providers
2. Click on **Email** provider
3. **Toggle OFF** "Confirm email" (or leave it on and check your email)
4. Save changes

### Step 3: Verify the Setup

1. **Check Tables Exist**:
   - Go to Table Editor
   - You should see: `organizations` and `profiles`

2. **Check Trigger Exists**:
   - Go to Database → Triggers
   - You should see: `on_auth_user_created` on `auth.users`

3. **Check Function Exists**:
   - Go to Database → Functions
   - You should see: `handle_new_user`

### Step 4: Test Sign Up

1. Go to your app: http://localhost:3001/sign-up
2. Fill in the form and sign up
3. Check Supabase:
   - **Authentication → Users**: Should see your new user
   - **Table Editor → organizations**: Should see a new organization
   - **Table Editor → profiles**: Should see a new profile

### Step 5: If It Still Doesn't Work

Check the logs:

1. **Check Postgres Logs**:
   - Go to Logs → Postgres Logs
   - Look for errors when you sign up
   - Check for any warnings from `handle_new_user`

2. **Manually Test the Trigger**:
   - If a user exists but no org/profile, run this in SQL Editor:
   ```sql
   -- Check if user exists
   SELECT id, email, raw_user_meta_data FROM auth.users ORDER BY created_at DESC LIMIT 1;
   
   -- Manually trigger the function (replace USER_ID with actual user ID)
   -- This is just for testing - don't use in production
   ```

3. **Check RLS Policies**:
   - Go to Table Editor → organizations → Policies tab
   - Make sure INSERT policy exists
   - Same for profiles table

## What the Fixed Migration Does

1. ✅ Creates tables with `IF NOT EXISTS` (safe to run multiple times)
2. ✅ Adds INSERT policies (required for trigger to work)
3. ✅ Sets proper function permissions with `SECURITY DEFINER`
4. ✅ Adds error handling in the trigger function
5. ✅ Grants all necessary permissions

## Common Errors

**"relation already exists"**: Tables already exist - that's fine, the migration handles it.

**"policy already exists"**: Policies already exist - the migration drops and recreates them.

**"function already exists"**: Function already exists - the migration replaces it.

All of these are handled by the fixed migration!

