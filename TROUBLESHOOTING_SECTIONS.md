# 🔧 Troubleshooting: Section Feature Not Working

## Issue: Can't create sections / 500 errors

### Root Cause
The database migration hasn't been run yet, so the `project_sections` table doesn't exist.

---

## ✅ Solution: Run the Database Migration

### Option 1: Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Select your project
   
2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy Migration SQL**
   - Open: `d:\Cursor Apps\Trigon App\supabase\migrations\012_project_sections.sql`
   - Copy ALL the contents (172 lines)

4. **Paste and Run**
   - Paste into the SQL Editor
   - Click "Run" or press Ctrl+Enter

5. **Verify Success**
   - You should see messages like:
     ```
     ✓ Project Sections migration completed!
     - project_sections table created
     - section_id column added to bill_of_quantities
     ```

### Option 2: Via Supabase CLI

```bash
# If you have Supabase CLI installed
cd "d:\Cursor Apps\Trigon App"
supabase db push
```

---

## 🔍 Verify Migration Worked

### Check in Supabase Dashboard

1. Go to "Table Editor"
2. Look for these tables:
   - ✅ `project_sections` (should exist)
   
3. Click on `bill_of_quantities` table
4. Check columns - should include:
   - ✅ `section_id` column (UUID, nullable)

### Check in SQL Editor

Run this query:
```sql
-- Check if table exists
SELECT * FROM project_sections LIMIT 1;

-- Check if column exists
SELECT section_id FROM bill_of_quantities LIMIT 1;

-- Check views
SELECT * FROM project_section_summaries LIMIT 1;
```

If these queries work without errors, migration is successful!

---

## 🐛 Common Issues After Migration

### Issue: Still getting 500 errors

**Check 1: Clear browser cache and hard refresh**
```
Ctrl + F5 (Windows)
Cmd + Shift + R (Mac)
```

**Check 2: Restart dev server**
```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

**Check 3: Check browser console**
- Open DevTools (F12)
- Look for specific error messages
- Check Network tab for failed requests

### Issue: Color selector not working

The color selector has been updated to show visual feedback when selected. Make sure:
- You can see the border highlight when clicking colors
- The Blue color should be selected by default

### Issue: "Cannot read property 'organization_id'"

This means authentication might be failing. Check:
- You're logged in
- Your session hasn't expired
- Profile exists in database

---

## 📋 Quick Test Steps

After running migration:

1. ✅ Refresh the project page
2. ✅ Click "Add Section"
3. ✅ Fill in:
   - Name: "Test Section"
   - Code: "TEST-01"
   - Select a color (should show ring border when selected)
4. ✅ Click "Create Section"
5. ✅ Should see success toast message
6. ✅ Section appears in the list

---

## 🆘 Still Not Working?

### Check Supabase Connection

1. **Verify environment variables**
   - Check `.env.local` file exists
   - Has `NEXT_PUBLIC_SUPABASE_URL`
   - Has `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Test connection in browser console**
   ```javascript
   // Open browser console (F12)
   fetch('/api/sections?projectId=YOUR_PROJECT_ID')
     .then(r => r.json())
     .then(console.log)
   ```

3. **Check Supabase Dashboard > Logs**
   - Go to "Database" > "Logs"
   - Look for SQL errors
   - Check for RLS policy violations

### Check TypeScript Compilation

```bash
# Check for type errors
npm run build
```

If you see errors about `project_sections` not existing in types, regenerate types:

```bash
# If using Supabase CLI
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

---

## ✅ Success Checklist

- [ ] Migration SQL ran without errors
- [ ] `project_sections` table exists in Supabase
- [ ] `section_id` column exists in `bill_of_quantities`
- [ ] Browser cache cleared / hard refresh
- [ ] Dev server restarted
- [ ] Can see "Create New Section" dialog
- [ ] Color selector shows visual feedback
- [ ] Form submits without errors
- [ ] Section appears in the list

---

## 📞 Need More Help?

**Check these files for detailed info:**
- `SECTIONS_FEATURE.md` - Full feature documentation
- `SECTIONS_QUICK_START.md` - Setup guide
- `SECTIONS_ARCHITECTURE.md` - Technical details

**Debug mode:**
Add console logs to see what's happening:
```typescript
// In components/projects/section-manager.tsx
console.log('Form data:', data)
console.log('Response:', await response.json())
```

