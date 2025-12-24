# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Supabase**
   - Create a new project at https://app.supabase.com
   - Go to Settings > API
   - Copy your Project URL and anon/public key

3. **Configure Environment**
   - Create a `.env.local` file in the root directory
   - Add the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     ```

4. **Run Database Migration**
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Open the file: `supabase/migrations/001_organizations_and_profiles.sql`
   - Copy the entire contents and paste into the SQL Editor
   - Click "Run" to execute the migration
   - Verify the migration succeeded (you should see `organizations` and `profiles` tables created)

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

6. **Test the Application**
   - Open http://localhost:3000
   - You should be redirected to `/sign-in`
   - Click "create a new account" to go to `/sign-up`
   - Fill in the form and create an account
   - You should be automatically logged in and redirected to `/dashboard`
   - A new organization should be created for you automatically

## Verification Checklist

- [ ] Dependencies installed successfully
- [ ] Environment variables configured
- [ ] Database migration executed successfully
- [ ] Can sign up for a new account
- [ ] Organization is automatically created on signup
- [ ] Can sign in with created account
- [ ] Dashboard loads with sidebar and header
- [ ] Can navigate between dashboard pages
- [ ] Sign out functionality works
- [ ] Mobile menu works on small screens

## Troubleshooting

### "Invalid API key" error
- Verify your `.env.local` file has the correct Supabase credentials
- Make sure there are no extra spaces or quotes around the values
- Restart the development server after changing environment variables

### "relation does not exist" error
- Make sure you've run the database migration
- Check that the migration completed successfully in Supabase SQL Editor
- Verify the tables `organizations` and `profiles` exist in your database

### Authentication not working
- Check that Row Level Security (RLS) is enabled on the tables
- Verify the trigger `on_auth_user_created` exists and is active
- Check Supabase Auth settings to ensure email/password authentication is enabled

### Build errors
- Make sure all dependencies are installed: `npm install`
- Check that TypeScript types are correct
- Verify Node.js version is 18 or higher

## Next Steps

Once Phase 1 is complete and verified, you can proceed to Phase 2: NRM2 Logic Engine.

