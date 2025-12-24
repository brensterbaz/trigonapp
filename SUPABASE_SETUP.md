# Supabase Connection Setup Guide

## Option 1: Using Supabase Web Dashboard (Recommended for Quick Setup)

### Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name**: Your project name (e.g., "NRM2 Tender App")
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to you
   - **Pricing Plan**: Free tier is fine for development
5. Click "Create new project" and wait for it to initialize (2-3 minutes)

### Step 2: Get Your API Keys

1. Once your project is ready, go to **Settings** → **API**
2. You'll see:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root of your project with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important**: Replace the placeholder values with your actual keys from Step 2.

### Step 4: Run the Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open the file `supabase/migrations/001_organizations_and_profiles.sql` from this project
4. Copy the entire contents and paste into the SQL Editor
5. Click "Run" (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

### Step 5: Verify the Migration

1. Go to **Table Editor** in your Supabase dashboard
2. You should see two new tables:
   - `organizations`
   - `profiles`
3. Check that Row Level Security (RLS) is enabled:
   - Click on each table
   - Go to the "Policies" tab
   - You should see the RLS policies we created

### Step 6: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Configure email settings if needed (for development, default settings work)

## Option 2: Using Supabase CLI (Advanced)

If you prefer using the CLI:

```bash
# Install Supabase CLI globally (optional)
npm install -g supabase

# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref your-project-ref

# Run migrations
npx supabase db push
```

## Testing the Connection

After setup, test the connection:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000
3. Try signing up for a new account
4. Check your Supabase dashboard:
   - **Authentication** → **Users** - Should see your new user
   - **Table Editor** → **organizations** - Should see a new organization
   - **Table Editor** → **profiles** - Should see a new profile linked to your user

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env.local` file has the correct values
- Make sure there are no extra spaces or quotes
- Restart your dev server after changing `.env.local`

### "relation does not exist" error
- Make sure you ran the migration in Step 4
- Check that the tables exist in Table Editor

### Authentication not working
- Verify Email provider is enabled in Authentication → Providers
- Check that the trigger `on_auth_user_created` exists (Database → Functions)

### RLS blocking queries
- Verify RLS policies are created correctly
- Check the policies tab for each table

## Next Steps

Once connected, you can:
- Test user signup and signin
- View data in Supabase dashboard
- Proceed to Phase 2: NRM2 Logic Engine

