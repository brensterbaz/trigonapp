/**
 * Helper script to create .env.local file
 * Run with: node setup-env.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists!');
  console.log('Please edit it manually or delete it first.');
  process.exit(1);
}

const envTemplate = `# Supabase Configuration (New API Keys Format)
# Project: mnhyqthohhklzhlopjry
# Get these from: https://supabase.com/dashboard/project/mnhyqthohhklzhlopjry/settings/api-keys/new
#
# New API Keys (Recommended - June 2025+):
# - Publishable key starts with: sb_publishable_...
# - Secret key starts with: sb_secret_...
#
# Legacy keys (anon/service_role JWT format) still work but will be deprecated by late 2026

NEXT_PUBLIC_SUPABASE_URL=https://mnhyqthohhklzhlopjry.supabase.co

# NEW FORMAT: Use publishable key (replaces anon key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY_HERE

# NEW FORMAT: Use secret key (replaces service_role key)
SUPABASE_SERVICE_ROLE_KEY=YOUR_SECRET_KEY_HERE
`;

fs.writeFileSync(envPath, envTemplate);
console.log('✅ Created .env.local file!');
console.log('\n📝 Next steps:');
console.log('1. Get your NEW API keys from Supabase dashboard:');
console.log('   https://supabase.com/dashboard/project/mnhyqthohhklzhlopjry/settings/api-keys/new');
console.log('2. Open .env.local and replace:');
console.log('   - YOUR_PUBLISHABLE_KEY_HERE with your publishable key (starts with sb_publishable_...)');
console.log('   - YOUR_SECRET_KEY_HERE with your secret key (starts with sb_secret_...)');
console.log('\n3. Then run the database migration in Supabase SQL Editor');
console.log('\nNote: Legacy JWT keys (anon/service_role) still work but will be deprecated by late 2026');

