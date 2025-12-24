# Deployment Notes

## Deprecation Warnings

The following deprecation warnings may appear during deployment but **do not prevent the build from succeeding**:

### Expected Warnings (from transitive dependencies):
- `rimraf@3.0.2` - Used by build tools, will be updated when dependencies update
- `lodash.isequal@4.5.0` - Used by ESLint plugins
- `inflight@1.0.6` - Used by older npm packages
- `fstream@1.0.12` - Used by build tools
- `glob@7.2.3` - Used by ESLint and other tools
- `@humanwhocodes/config-array@0.13.0` - ESLint internal dependency
- `@humanwhocodes/object-schema@2.0.3` - ESLint internal dependency

### ESLint 8 Deprecation
- `eslint@8.57.1` - Next.js 14.2.x requires ESLint 8
- This is expected and will be resolved when upgrading to Next.js 15
- ESLint 9 uses a different config format (flat config) which Next.js 14 doesn't fully support yet

## Package Updates Applied

All packages have been updated to their latest compatible versions:
- Next.js: 14.2.35 (latest 14.x)
- ESLint: 8.57.1 (latest 8.x, required by Next.js 14)
- eslint-config-next: 14.2.35
- Supabase packages updated
- Other dependencies updated to latest compatible versions

## Build Status

These warnings are **non-blocking** and the build will complete successfully. The warnings come from transitive dependencies and will be resolved as those packages update their dependencies.

## Future Upgrades

To fully resolve these warnings:
1. Upgrade to Next.js 15+ (when ready) - supports ESLint 9
2. Wait for transitive dependencies to update their dependencies
3. Consider using `npm audit fix` periodically to update vulnerable packages

