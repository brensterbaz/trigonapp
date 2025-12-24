# Post-Migration Checklist & Fixes

## ✅ Things to Try After Migration

### 1. **Restart Your Dev Server**
The most common issue! Stop and restart:

```bash
# In your terminal, press Ctrl+C to stop the server
# Then restart:
npm run dev
```

### 2. **Hard Refresh Browser**
Clear the browser cache:
- Press **Ctrl + Shift + R** (Windows/Linux)
- Or **Cmd + Shift + R** (Mac)
- Or **Ctrl + F5** (Windows)

### 3. **Check Server Terminal for Errors**
Look at your terminal where `npm run dev` is running. Are there any:
- TypeScript errors?
- Supabase connection errors?
- Import errors?

---

## 🔍 Common Error Messages & Solutions

### Error: "relation 'project_sections' does not exist"
**Solution**: Migration didn't run completely
- Re-run the migration SQL in Supabase
- Check you're connected to the correct Supabase project

### Error: "permission denied for table project_sections"
**Solution**: RLS policies not applied correctly
Run this in Supabase SQL Editor:
```sql
GRANT ALL ON project_sections TO authenticated;
GRANT SELECT ON project_section_summaries TO authenticated;
GRANT SELECT ON project_totals_by_section TO authenticated;
```

### Error: "Cannot read properties of undefined"
**Solution**: API returning wrong data format
- Check Network tab response
- Verify API route is receiving correct project ID

### Error: "Failed to fetch"
**Solution**: Dev server not running or crashed
- Restart dev server
- Check terminal for errors

---

## 🔧 Quick Fixes

### Fix 1: Regenerate TypeScript Types
If types are out of sync:
```bash
# If you have Supabase CLI:
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

### Fix 2: Clear Next.js Cache
```bash
# Stop server, then:
rm -rf .next
npm run dev
```

### Fix 3: Check Environment Variables
Make sure `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

---

## 📋 Debug Checklist

Run through these:

- [ ] Migration completed successfully in Supabase
- [ ] `project_sections` table exists (check in Supabase Table Editor)
- [ ] Dev server restarted after migration
- [ ] Browser hard-refreshed (Ctrl+F5)
- [ ] No errors in browser console (F12)
- [ ] No errors in server terminal
- [ ] Logged in to the app
- [ ] On a valid project page

---

## 🆘 If Still Not Working

**Please provide:**
1. **Exact error message** from browser console
2. **Network tab response** from the failed API call
3. **Terminal output** from dev server
4. **Screenshot** of the error if possible

This will help me pinpoint the exact issue!

