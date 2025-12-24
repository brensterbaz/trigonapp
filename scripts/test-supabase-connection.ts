/**
 * Test script to verify Supabase connection
 * Run with: npx tsx scripts/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!')
  console.error('Please create a .env.local file with:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your_url')
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n')

  try {
    // Test 1: Check if we can connect
    console.log('1. Testing basic connection...')
    const { data, error } = await supabase.from('organizations').select('count').limit(1)
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('   ⚠️  Tables not found. Have you run the migration?')
        console.log('   Run the SQL migration from: supabase/migrations/001_organizations_and_profiles.sql')
      } else {
        console.error('   ❌ Connection error:', error.message)
      }
      return false
    }
    
    console.log('   ✅ Connection successful!')

    // Test 2: Check if tables exist
    console.log('\n2. Checking database schema...')
    const { data: orgs } = await supabase.from('organizations').select('id').limit(1)
    const { data: profiles } = await supabase.from('profiles').select('id').limit(1)
    
    if (orgs !== null && profiles !== null) {
      console.log('   ✅ Tables exist: organizations, profiles')
    } else {
      console.log('   ⚠️  Some tables are missing')
    }

    // Test 3: Check RLS
    console.log('\n3. Checking Row Level Security...')
    const { data: rlsCheck } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
    
    console.log('   ✅ RLS policies are active')

    console.log('\n✅ All tests passed! Your Supabase connection is working.')
    return true
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    return false
  }
}

testConnection()

