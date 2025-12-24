# Supabase API Keys Migration Guide

## What Changed?

As of June 2025, Supabase introduced new API keys with improved security:

### Old Format (Legacy JWT Keys)
- **anon key**: JWT format starting with `eyJ...` (10-year expiry, self-referential)
- **service_role key**: JWT format starting with `eyJ...` (high privileges)

### New Format (Recommended)
- **Publishable key**: Format `sb_publishable_...` (replaces anon key)
- **Secret key**: Format `sb_secret_...` (replaces service_role key)

## Why Migrate?

✅ **Better Security:**
- Instant revocation (delete a key, it's immediately revoked)
- Zero-downtime rotation
- Secret keys forbidden in browsers (always fails with HTTP 401)
- Each key reveal is logged in your organization's Audit Log

✅ **Improved Features:**
- Multiple secret keys for different services
- Better control over permissions
- Solid foundation for future Auth features

## Migration Steps

### 1. Generate New API Keys

Go to your Supabase dashboard:
```
https://supabase.com/dashboard/project/mnhyqthohhklzhlopjry/settings/api-keys/new
```

Click **"Generate new API keys"** to create:
- One **publishable key** (starts with `sb_publishable_...`)
- One **secret key** (starts with `sb_secret_...`)

### 2. Update Your `.env.local` File

Replace your environment variables with the new keys:

```env
# Keep your project URL the same
NEXT_PUBLIC_SUPABASE_URL=https://mnhyqthohhklzhlopjry.supabase.co

# Replace with your NEW publishable key
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_YOUR_KEY_HERE

# Replace with your NEW secret key
SUPABASE_SERVICE_ROLE_KEY=sb_secret_YOUR_KEY_HERE
```

### 3. No Code Changes Needed!

The Supabase client libraries work with both old and new keys. Your existing code like:

```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

...continues to work without any changes!

### 4. Test Your Application

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- Authentication works
- Database queries work
- All features function normally

### 5. (Optional) Disable Legacy Keys

Once everything works with the new keys:
1. Go to Settings → API Keys
2. Disable the old `anon` and `service_role` JWT keys
3. This prevents them from being used

## Key Differences to Be Aware Of

### Permissions
- **Secret keys** are hidden by default and need to be individually "revealed"
- Each reveal is logged in your Audit Log

### Realtime Limitations
- Connections last 24 hours when there's no signed-in user
- Sign users in to extend connections indefinitely

### Edge Functions
- Use `--no-verify-jwt` flag for functions that don't require authentication
- Secret keys should be passed in headers, not Authorization header

### Browser Security
- Using a secret key in a browser will ALWAYS fail with HTTP 401 Unauthorized
- Only use publishable keys in frontend code

## Timeline

- **June 2025**: New API keys available (early access)
- **July 2025**: Full feature launch
- **November 2025**: Monthly reminders to migrate, new projects won't have legacy keys
- **Late 2026**: Legacy JWT keys will be removed

## Backward Compatibility

✅ **Your app will continue to work with legacy keys until late 2026**
✅ **New keys work exactly like old keys in terms of permissions**
✅ **No code changes required when switching**

## Need Help?

- Check the official discussion: https://github.com/orgs/supabase/discussions/29260
- Contact Supabase Support: https://supabase.help/
- See main setup guide: `CONNECT_SUPABASE.md`

## Quick Reference

| Old Key Type | New Key Type | Format | Use Case |
|-------------|-------------|---------|----------|
| anon | Publishable | `sb_publishable_...` | Frontend, safe to expose |
| service_role | Secret | `sb_secret_...` | Backend, keep secret |
