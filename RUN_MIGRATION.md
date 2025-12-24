# How to Run the Database Migration

## Quick Steps:

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/mnhyqthohhklzhlopjry/sql/new
   - Or: Dashboard → SQL Editor → New query

2. **Copy the Migration SQL**
   - Open the file: `supabase/migrations/001_organizations_and_profiles.sql`
   - Copy ALL the SQL code (the entire file)

3. **Paste and Run**
   - Paste the SQL into the Supabase SQL Editor
   - Click the "Run" button (or press Ctrl+Enter / Cmd+Enter)
   - Wait for "Success. No rows returned" message

4. **Verify Tables Were Created**
   - Go to: Table Editor in your Supabase dashboard
   - You should see two new tables:
     - `organizations`
     - `profiles`
   - Both should have a shield icon (🔒) indicating RLS is enabled

## What the Migration Creates:

- ✅ `subscription_tier` enum type
- ✅ `organizations` table
- ✅ `profiles` table
- ✅ Row Level Security (RLS) policies
- ✅ Automatic trigger to create org/profile on user signup

## Troubleshooting:

**If you get an error about "already exists":**
- The tables might already exist. Check Table Editor first.
- If they exist but are empty, that's fine - the migration already ran.

**If you get a permission error:**
- Make sure you're logged into Supabase
- Try running the migration in smaller chunks

**After running the migration:**
- Try signing up for a new account in your app
- Check Supabase → Authentication → Users (should see new user)
- Check Supabase → Table Editor → organizations (should see new org)
- Check Supabase → Table Editor → profiles (should see new profile)

