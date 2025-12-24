# 🔴 IMPORTANT: Supabase Migration Required

## ⚠️ Before the App Will Work

You **MUST** run the database migration in Supabase to add:
- `is_admin` column to profiles table
- Admin RLS policies for NRM2 rules
- Hierarchy view for the CMS

---

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Migration
Copy and paste the **ENTIRE** contents of this file:
```
supabase/migrations/015_nrm2_cms.sql
```

Then click **Run** (or press Ctrl+Enter)

### Step 3: Verify It Worked
You should see a success message:
```
✅ NRM2 CMS migration complete
- Admin column added to profiles
- Admin RLS policies created
- Hierarchy view created
```

### Step 4: Make Yourself Admin
Run this query to give yourself admin access:

```sql
-- First, find your user ID:
SELECT user_id, email FROM profiles;

-- Then make yourself admin (replace YOUR_USER_ID):
UPDATE profiles 
SET is_admin = TRUE 
WHERE user_id = 'YOUR_USER_ID';
```

### Step 5: Refresh Schema Cache
Run this to make sure Supabase recognizes the new column:

```sql
NOTIFY pgrst, 'reload schema';
```

---

## 🎯 What This Migration Does

1. **Adds `is_admin` column** to profiles table (defaults to FALSE)
2. **Creates RLS policies** so only admins can:
   - Create new NRM2 rules
   - Edit existing rules
   - Delete rules
3. **Creates hierarchy view** for easier browsing in the CMS
4. **Grants permissions** for admin operations

---

## ✅ After Migration

Once the migration is complete:
1. ✅ The build will work (TypeScript will recognize `is_admin`)
2. ✅ The app will run without errors
3. ✅ You can access the CMS at `/dashboard/admin/nrm2`
4. ✅ You can add/edit NRM2 rules

---

## 🚨 Without This Migration

If you skip this step:
- ❌ Build might work but app will crash
- ❌ Database queries will fail
- ❌ Can't create sections (missing columns)
- ❌ CMS won't work (missing RLS policies)

---

## 📁 Migration File Location

```
d:\Cursor Apps\Trigon App\supabase\migrations\015_nrm2_cms.sql
```

**Open this file, copy ALL contents, paste in Supabase SQL Editor, and run it!**

---

## ⏱️ This Takes 2 Minutes

Don't skip this step - it's required for the app to work properly!
