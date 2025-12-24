# Update Project Statuses - Migration 009

This migration updates the project status enum to use the new workflow: **draft → ready → in_progress → done**

## Run the Migration

1. **Go to your Supabase dashboard:**
   https://supabase.com/dashboard/project/mnhyqthohhklzhlopjry/sql/new

2. **Copy and paste the SQL from:**
   `supabase/migrations/009_update_project_statuses.sql`

3. **Click "Run" to execute**

## What This Does

- Adds 3 new status values: `ready`, `in_progress`, `done`
- Migrates existing `active` projects to `in_progress`
- Migrates existing `tendered` projects to `done`
- Keeps legacy values for backwards compatibility

## After Running

✅ **New Project Form** - You can now select initial status when creating projects

✅ **Status Updater** - Projects have a dropdown to change status in real-time

✅ **Dashboard** - Stats show "In Progress" and "Ready to Start" counts

## New Status Colors

- 📝 **Draft** (Gray) - Just started
- ✅ **Ready** (Blue) - Prepared for work
- 🚧 **In Progress** (Orange) - Actively working
- ✔️ **Done** (Green) - Completed

