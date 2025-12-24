# Connecting to Your Supabase Project

Your project reference: `mnhyqthohhklzhlopjry`

## 🆕 New API Keys (Recommended as of June 2025)

Supabase has introduced new API keys with improved security features:
- **Publishable keys** (format: `sb_publishable_...`) replace the legacy `anon` JWT keys
- **Secret keys** (format: `sb_secret_...`) replace the legacy `service_role` JWT keys
- Better security: instant revocation, zero-downtime rotation, forbidden use in browsers
- Legacy JWT keys still work but will be deprecated by late 2026

## Step 1: Get Your NEW API Keys

1. Go to your project dashboard: https://supabase.com/dashboard/project/mnhyqthohhklzhlopjry
2. Click on **Settings** (gear icon in the left sidebar)
3. Click on **API Keys** in the settings menu
4. Click **"Generate new API keys"** or use the new keys section
5. You'll see:
   - **Project URL**: `https://mnhyqthohhklzhlopjry.supabase.co`
   - **Publishable key**: (starts with `sb_publishable_...`) - safe to expose in frontend
   - **Secret key**: (starts with `sb_secret_...`) - keep this secret! Never expose in frontend

**Note:** If you don't see the new keys, you can still use the legacy keys:
   - **anon public** key: (starts with `eyJ...`)
   - **service_role** key: (starts with `eyJ...`)

## Step 2: Create .env.local File

Create a file named `.env.local` in the root of your project with the **NEW format**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mnhyqthohhklzhlopjry.supabase.co

# NEW FORMAT (Recommended):
# Use publishable key (replaces anon key) - starts with sb_publishable_...
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_publishable_key_here

# Use secret key (replaces service_role key) - starts with sb_secret_...
SUPABASE_SERVICE_ROLE_KEY=paste_your_secret_key_here
```

**Important**: 
- Replace `paste_your_publishable_key_here` with your actual publishable key from Step 1
- Replace `paste_your_secret_key_here` with your actual secret key from Step 1
- The new keys work exactly like the old ones in your code - no code changes needed!

## Step 3: Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor** (in the left sidebar)
2. Click **"New query"**
3. Copy the entire contents of `supabase/migrations/001_organizations_and_profiles.sql`
4. Paste into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)
6. You should see: "Success. No rows returned"

## Step 4: Verify the Migration

1. Go to **Table Editor** in your Supabase dashboard
2. You should see two new tables:
   - `organizations`
   - `profiles`
3. Check that Row Level Security is enabled (you'll see a shield icon on the tables)

## Step 5: Enable Email Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Make sure **Email** is enabled (it should be by default)
3. For development, the default settings work fine

## Step 6: Test the Connection

1. In your project root, run:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000 in your browser
3. You should be redirected to the sign-in page
4. Click "create a new account" and try signing up
5. Check your Supabase dashboard:
   - **Authentication** → **Users**: Should see your new user
   - **Table Editor** → **organizations**: Should see a new organization
   - **Table Editor** → **profiles**: Should see a new profile

## Quick Checklist

- [ ] Got API keys from Settings → API
- [ ] Created `.env.local` file with correct values
- [ ] Ran the SQL migration in SQL Editor
- [ ] Verified tables exist in Table Editor
- [ ] Enabled Email authentication
- [ ] Tested signup flow

## Need Help?

If you encounter any errors:
- Check that `.env.local` has no extra spaces or quotes
- Restart your dev server after creating `.env.local`
- Verify the migration ran successfully
- Check that Email provider is enabled in Authentication settings

