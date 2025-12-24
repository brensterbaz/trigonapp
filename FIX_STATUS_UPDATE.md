# 🔧 Fix Status Update - 2-Step Process

PostgreSQL requires enum values to be **committed** before they can be used. So we need to run this in **2 separate steps**.

---

## ⚡ Step 1: Add New Status Values

### Go to Supabase SQL Editor:
https://supabase.com/dashboard/project/mnhyqthohhklzhlopjry/sql/new

### Copy and paste this SQL:

```sql
DO $$
BEGIN
    -- Add 'ready' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'ready' 
        AND enumtypid = 'project_status'::regtype
    ) THEN
        ALTER TYPE project_status ADD VALUE 'ready';
        RAISE NOTICE 'Added status: ready';
    ELSE
        RAISE NOTICE 'Status ready already exists';
    END IF;

    -- Add 'in_progress' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'in_progress' 
        AND enumtypid = 'project_status'::regtype
    ) THEN
        ALTER TYPE project_status ADD VALUE 'in_progress';
        RAISE NOTICE 'Added status: in_progress';
    ELSE
        RAISE NOTICE 'Status in_progress already exists';
    END IF;

    -- Add 'done' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'done' 
        AND enumtypid = 'project_status'::regtype
    ) THEN
        ALTER TYPE project_status ADD VALUE 'done';
        RAISE NOTICE 'Added status: done';
    ELSE
        RAISE NOTICE 'Status done already exists';
    END IF;
END $$;

-- Verify the new values were added
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'project_status'::regtype 
ORDER BY enumsortorder;
```

### Click "Run" ✅

You should see the new statuses in the result: `ready`, `in_progress`, `done`

---

## ⚡ Step 2: Update Existing Projects

### In the SAME SQL Editor (or a new tab), paste this:

```sql
-- Update any existing 'active' projects to 'in_progress' for consistency
UPDATE projects SET status = 'in_progress' WHERE status = 'active';

-- Update any existing 'tendered' projects to 'done' for consistency
UPDATE projects SET status = 'done' WHERE status = 'tendered';

-- Show what statuses are now in use
SELECT status, COUNT(*) as count
FROM projects
GROUP BY status
ORDER BY status;
```

### Click "Run" ✅

This will migrate your existing projects to use the new status names.

---

## 🎉 Done!

**Now refresh your browser** and the status updater should work perfectly!

Try changing a project status - you should see:
- 📝 Draft
- ✅ Ready
- 🚧 In Progress
- ✔️ Done

All working! 🚀

---

## 📁 Files Reference

- Part 1: `supabase/migrations/009_part1_add_status_values.sql`
- Part 2: `supabase/migrations/009_part2_update_projects.sql`
